import { prisma } from "@/database/prisma";
import { ApiError } from "@/shared/ApiError";
import { pointsService } from "@/modules/points/points.service";
import { surveysRepository } from "@/modules/surveys/surveys.repository";
import { achievementsService } from "@/modules/achievements/achievements.service";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { hashToken } from "@/utils/crypto";
import type {
  CompleteSurveyInput,
  CreateSurveyInput,
  ListSurveysQuery,
  ReportSurveyInput,
  UpdateSurveyInput,
} from "@/modules/surveys/surveys.validation";

const LOCKED_FIELDS_AFTER_RESPONSES = [
  "reward",
  "targetResponses",
  "deadline",
  "surveyUrl",
] as const;

function toDbInput(input: CreateSurveyInput) {
  return {
    title: input.title,
    description: input.description,
    categoryId: input.categoryId,
    thumbnail: input.thumbnail || null,
    surveyUrl: input.surveyUrl,
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

export const surveysService = {
  async create(creatorId: string, input: CreateSurveyInput) {
    const publishingCost = input.publish ? input.targetResponses * input.reward : 0;

    return prisma.$transaction(async (tx) => {
      if (input.publish) {
        await pointsService.debit(tx, {
          userId: creatorId,
          type: "SPEND_PUBLISH",
          amount: publishingCost,
          description: `Published survey: ${input.title}`,
        });
      }

      const user = await tx.user.findUniqueOrThrow({ where: { id: creatorId } });

      const survey = await tx.survey.create({
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
          data: { referenceType: "survey", referenceId: survey.id },
        });
      }

      return survey;
    }).then(async (survey) => {
      if (input.publish) {
        await achievementsService.checkAndUnlock(creatorId, "surveys_published");
      }
      return survey;
    });
  },

  async getById(id: string, viewerId: string | undefined) {
    const survey = await surveysRepository.findById(id);
    if (!survey) throw ApiError.notFound("Survey not found");

    if (viewerId !== survey.creatorId) {
      await surveysRepository.incrementViews(id);
    }

    let viewerState: { bookmarked: boolean; completed: boolean } | undefined;
    if (viewerId) {
      const [bookmark, response] = await Promise.all([
        surveysRepository.findBookmark(id, viewerId),
        surveysRepository.findResponse(id, viewerId),
      ]);
      viewerState = { bookmarked: !!bookmark, completed: !!response };
    }

    return { ...survey, viewerState };
  },

  async list(query: ListSurveysQuery, viewerId: string | undefined) {
    const { items, total } = await surveysRepository.list(query, viewerId);
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

  async update(id: string, userId: string, input: UpdateSurveyInput) {
    const survey = await surveysRepository.findById(id);
    if (!survey) throw ApiError.notFound("Survey not found");
    if (survey.creatorId !== userId) throw ApiError.forbidden("You do not own this survey");

    if (survey.currentResponses > 0) {
      for (const field of LOCKED_FIELDS_AFTER_RESPONSES) {
        if (input[field] !== undefined) {
          throw ApiError.badRequest(
            `${field} cannot be changed after a survey has received responses`
          );
        }
      }
    }

    const { tags, ...rest } = input;
    return surveysRepository.updateSurvey(id, {
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
    const survey = await surveysRepository.findById(id);
    if (!survey) throw ApiError.notFound("Survey not found");
    if (survey.creatorId !== userId) throw ApiError.forbidden("You do not own this survey");
    if (survey.status !== "DRAFT") throw ApiError.badRequest("Only draft surveys can be published");

    const cost = survey.targetResponses * survey.reward;

    return prisma.$transaction(async (tx) => {
      await pointsService.debit(tx, {
        userId,
        type: "SPEND_PUBLISH",
        amount: cost,
        description: `Published survey: ${survey.title}`,
        referenceType: "survey",
        referenceId: survey.id,
      });
      return tx.survey.update({
        where: { id },
        data: { status: "LIVE", publishedAt: new Date(), publishingCost: cost },
      });
    }).then(async (updated) => {
      await achievementsService.checkAndUnlock(userId, "surveys_published");
      return updated;
    });
  },

  async remove(id: string, userId: string) {
    const survey = await surveysRepository.findById(id);
    if (!survey) throw ApiError.notFound("Survey not found");
    if (survey.creatorId !== userId) throw ApiError.forbidden("You do not own this survey");

    const remainingSlots = survey.targetResponses - survey.currentResponses;
    const refundAmount = survey.status === "LIVE" && remainingSlots > 0 ? remainingSlots * survey.reward : 0;

    await prisma.$transaction(async (tx) => {
      if (refundAmount > 0) {
        await pointsService.credit(tx, {
          userId,
          type: "EARN_REFUND",
          amount: refundAmount,
          description: `Refund for closing survey: ${survey.title}`,
          referenceType: "survey",
          referenceId: survey.id,
        });
      }
      await tx.survey.update({
        where: { id },
        data: { deletedAt: new Date(), status: "DELETED" },
      });
    });

    return { deleted: true, refundAmount };
  },

  async toggleBookmark(surveyId: string, userId: string) {
    const survey = await surveysRepository.findById(surveyId);
    if (!survey) throw ApiError.notFound("Survey not found");

    const existing = await surveysRepository.findBookmark(surveyId, userId);
    if (existing) {
      await surveysRepository.deleteBookmark(surveyId, userId);
      return { bookmarked: false };
    }
    await surveysRepository.createBookmark(surveyId, userId);
    return { bookmarked: true };
  },

  async report(surveyId: string, userId: string, input: ReportSurveyInput) {
    const survey = await surveysRepository.findById(surveyId);
    if (!survey) throw ApiError.notFound("Survey not found");
    await surveysRepository.createReport(surveyId, userId, input.reason, input.description);
    return { reported: true };
  },

  async complete(surveyId: string, userId: string, input: CompleteSurveyInput) {
    const survey = await surveysRepository.findById(surveyId);
    if (!survey) throw ApiError.notFound("Survey not found");

    if (survey.creatorId === userId) {
      throw ApiError.badRequest("You cannot complete your own survey");
    }
    if (survey.status !== "LIVE") {
      throw ApiError.badRequest("This survey is not currently accepting responses");
    }
    if (survey.deadline < new Date()) {
      throw ApiError.badRequest("This survey has expired");
    }
    if (survey.currentResponses >= survey.targetResponses) {
      throw ApiError.badRequest("This survey has already reached its target responses");
    }

    const existing = await surveysRepository.findResponse(surveyId, userId);
    if (existing) {
      throw ApiError.conflict("You have already completed this survey");
    }

    if (survey.completionCode && input.completionCode) {
      if (hashToken(input.completionCode) !== hashToken(survey.completionCode)) {
        throw ApiError.badRequest("Incorrect completion code");
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.surveyResponse.create({
        data: {
          surveyId,
          userId,
          completedAt: new Date(),
          completionCode: input.completionCode,
          pointsAwarded: survey.reward,
        },
      });

      const updatedSurvey = await tx.survey.update({
        where: { id: surveyId },
        data: {
          currentResponses: { increment: 1 },
          status:
            survey.currentResponses + 1 >= survey.targetResponses ? "COMPLETED" : undefined,
        },
      });

      await pointsService.credit(tx, {
        userId,
        type: "EARN_COMPLETION",
        amount: survey.reward,
        description: `Completed survey: ${survey.title}`,
        referenceType: "survey",
        referenceId: surveyId,
      });

      return { pointsAwarded: survey.reward, surveyStatus: updatedSurvey.status };
    }).then(async (result) => {
      await notificationsService.notify({
        userId: survey.creatorId,
        title: "New response on your survey",
        message: `Someone completed "${survey.title}" (${survey.currentResponses + 1}/${survey.targetResponses})`,
        type: "SURVEY_COMPLETED",
        actionUrl: `/surveys/${surveyId}`,
      });
      await notificationsService.notify({
        userId,
        title: "Points earned",
        message: `You earned ${survey.reward} points for completing "${survey.title}"`,
        type: "POINTS_EARNED",
        actionUrl: "/points",
      });
      await achievementsService.checkAndUnlock(userId, "surveys_completed");
      return result;
    });
  },
};
