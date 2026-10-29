import { prisma } from "@/database/prisma";
import { ApiError } from "@/shared/ApiError";
import { pointsService } from "@/modules/points/points.service";
import { pollsRepository } from "@/modules/polls/polls.repository";
import { achievementsService } from "@/modules/achievements/achievements.service";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { hashToken } from "@/utils/crypto";
import type {
  CompletePollInput,
  CreatePollInput,
  ListPollsQuery,
  ReportPollInput,
  UpdatePollInput,
} from "@/modules/polls/polls.validation";

const LOCKED_FIELDS_AFTER_RESPONSES = [
  "reward",
  "targetResponses",
  "deadline",
  "pollUrl",
] as const;

function toDbInput(input: CreatePollInput) {
  return {
    title: input.title,
    description: input.description,
    categoryId: input.categoryId,
    thumbnail: input.thumbnail || null,
    pollUrl: input.pollUrl,
    completionCode: input.completionCode || null,
    estimatedTimeMinutes: input.estimatedTimeMinutes,
    targetAcademicLevel: input.targetAcademicLevel,
    targetCountry: input.targetCountry,
    targetLanguage: input.targetLanguage,
    targetGender: input.targetGender,
    targetAgeMin: input.targetAgeMin,
    targetAgeMax: input.targetAgeMax,
    targetResponses: input.targetResponses,
    reward: input.reward,
    deadline: input.deadline,
  };
}

export const pollsService = {
  async create(creatorId: string, input: CreatePollInput) {
    const publishingCost = input.publish ? input.targetResponses * input.reward : 0;

    return prisma.$transaction(async (tx) => {
      if (input.publish) {
        await pointsService.debit(tx, {
          userId: creatorId,
          type: "SPEND_PUBLISH",
          amount: publishingCost,
          description: `Published poll: ${input.title}`,
        });
      }

      const user = await tx.user.findUniqueOrThrow({ where: { id: creatorId } });

      const poll = await tx.poll.create({
        data: {
          ...toDbInput(input),
          creatorId,
          institutionId: user.institutionId,
          publishingCost,
          status: input.publish ? "LIVE" : "DRAFT",
          publishedAt: input.publish ? new Date() : null,
          tags: input.tags.length
            ? {
                create: input.tags.map((name) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name },
                      create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
                    },
                  },
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          institution: { select: { id: true, name: true, verified: true, logo: true } },
          tags: { include: { tag: true } },
        },
      });

      if (input.publish) {
        await tx.transaction.updateMany({
          where: { userId: creatorId, referenceId: null, type: "SPEND_PUBLISH" },
          data: { referenceType: "poll", referenceId: poll.id },
        });
      }

      return poll;
    }).then(async (poll) => {
      if (input.publish) {
        await achievementsService.checkAndUnlock(creatorId, "polls_published");
      }
      return poll;
    });
  },

  async getById(id: string, viewerId: string | undefined) {
    const poll = await pollsRepository.findById(id);
    if (!poll) throw ApiError.notFound("Poll not found");

    if (viewerId !== poll.creatorId) {
      await pollsRepository.incrementViews(id);
    }

    let viewerState: { bookmarked: boolean; completed: boolean } | undefined;
    if (viewerId) {
      const [bookmark, response] = await Promise.all([
        pollsRepository.findBookmark(id, viewerId),
        pollsRepository.findResponse(id, viewerId),
      ]);
      viewerState = { bookmarked: !!bookmark, completed: !!response };
    }

    return { ...poll, viewerState };
  },

  async list(query: ListPollsQuery, viewerId: string | undefined) {
    const { items, total } = await pollsRepository.list(query, viewerId);
    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async update(id: string, userId: string, input: UpdatePollInput) {
    const poll = await pollsRepository.findById(id);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== userId) throw ApiError.forbidden("You do not own this poll");

    if (poll.currentResponses > 0) {
      for (const field of LOCKED_FIELDS_AFTER_RESPONSES) {
        if (input[field] !== undefined) {
          throw ApiError.badRequest(
            `${field} cannot be changed after a poll has received responses`
          );
        }
      }
    }

    const { tags, ...rest } = input;
    return pollsRepository.updatePoll(id, {
      ...rest,
      ...(tags
        ? {
            tags: {
              deleteMany: {},
              create: tags.map((name) => ({
                tag: {
                  connectOrCreate: {
                    where: { name },
                    create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
                  },
                },
              })),
            },
          }
        : {}),
    });
  },

  async publishDraft(id: string, userId: string) {
    const poll = await pollsRepository.findById(id);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== userId) throw ApiError.forbidden("You do not own this poll");
    if (poll.status !== "DRAFT") throw ApiError.badRequest("Only draft polls can be published");

    const cost = poll.targetResponses * poll.reward;

    return prisma.$transaction(async (tx) => {
      await pointsService.debit(tx, {
        userId,
        type: "SPEND_PUBLISH",
        amount: cost,
        description: `Published poll: ${poll.title}`,
        referenceType: "poll",
        referenceId: poll.id,
      });
      return tx.poll.update({
        where: { id },
        data: { status: "LIVE", publishedAt: new Date(), publishingCost: cost },
      });
    }).then(async (updated) => {
      await achievementsService.checkAndUnlock(userId, "polls_published");
      return updated;
    });
  },

  async remove(id: string, userId: string) {
    const poll = await pollsRepository.findById(id);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== userId) throw ApiError.forbidden("You do not own this poll");

    const remainingSlots = poll.targetResponses - poll.currentResponses;
    const refundAmount = poll.status === "LIVE" && remainingSlots > 0 ? remainingSlots * poll.reward : 0;

    await prisma.$transaction(async (tx) => {
      if (refundAmount > 0) {
        await pointsService.credit(tx, {
          userId,
          type: "EARN_REFUND",
          amount: refundAmount,
          description: `Refund for closing poll: ${poll.title}`,
          referenceType: "poll",
          referenceId: poll.id,
        });
      }
      await tx.poll.update({
        where: { id },
        data: { deletedAt: new Date(), status: "DELETED" },
      });
    });

    return { deleted: true, refundAmount };
  },

  async toggleBookmark(pollId: string, userId: string) {
    const poll = await pollsRepository.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    const existing = await pollsRepository.findBookmark(pollId, userId);
    if (existing) {
      await pollsRepository.deleteBookmark(pollId, userId);
      return { bookmarked: false };
    }
    await pollsRepository.createBookmark(pollId, userId);
    return { bookmarked: true };
  },

  async report(pollId: string, userId: string, input: ReportPollInput) {
    const poll = await pollsRepository.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");
    await pollsRepository.createReport(pollId, userId, input.reason, input.description);
    return { reported: true };
  },

  async complete(pollId: string, userId: string, input: CompletePollInput) {
    const poll = await pollsRepository.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    if (poll.creatorId === userId) {
      throw ApiError.badRequest("You cannot complete your own poll");
    }
    if (poll.status !== "LIVE") {
      throw ApiError.badRequest("This poll is not currently accepting responses");
    }
    if (poll.deadline < new Date()) {
      throw ApiError.badRequest("This poll has expired");
    }
    if (poll.currentResponses >= poll.targetResponses) {
      throw ApiError.badRequest("This poll has already reached its target responses");
    }

    const existing = await pollsRepository.findResponse(pollId, userId);
    if (existing) {
      throw ApiError.conflict("You have already completed this poll");
    }

    if (poll.completionCode && input.completionCode) {
      if (hashToken(input.completionCode) !== hashToken(poll.completionCode)) {
        throw ApiError.badRequest("Incorrect completion code");
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.pollResponse.create({
        data: {
          pollId,
          userId,
          completedAt: new Date(),
          completionCode: input.completionCode,
          pointsAwarded: poll.reward,
        },
      });

      const updatedPoll = await tx.poll.update({
        where: { id: pollId },
        data: {
          currentResponses: { increment: 1 },
          status:
            poll.currentResponses + 1 >= poll.targetResponses ? "COMPLETED" : undefined,
        },
      });

      await pointsService.credit(tx, {
        userId,
        type: "EARN_COMPLETION",
        amount: poll.reward,
        description: `Completed poll: ${poll.title}`,
        referenceType: "poll",
        referenceId: pollId,
      });

      return { pointsAwarded: poll.reward, pollStatus: updatedPoll.status };
    }).then(async (result) => {
      await notificationsService.notify({
        userId: poll.creatorId,
        title: "New response on your poll",
        message: `Someone completed "${poll.title}" (${poll.currentResponses + 1}/${poll.targetResponses})`,
        type: "POLL_COMPLETED",
        actionUrl: `/polls/${pollId}`,
      });
      await notificationsService.notify({
        userId,
        title: "Points earned",
        message: `You earned ${poll.reward} points for completing "${poll.title}"`,
        type: "POINTS_EARNED",
        actionUrl: "/points",
      });
      await achievementsService.checkAndUnlock(userId, "polls_completed");
      return result;
    });
  },
};
