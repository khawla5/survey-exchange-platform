import { Prisma, PollStatus } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { ListPollsQuery } from "@/modules/polls/polls.validation";

const publicPollInclude = {
  category: true,
  creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  institution: { select: { id: true, name: true, verified: true, logo: true } },
  tags: { include: { tag: true } },
  _count: { select: { bookmarks: true, reports: true } },
} satisfies Prisma.PollInclude;

export const pollsRepository = {
  async createPoll(
    data: Omit<Prisma.PollUncheckedCreateInput, "tags"> & { tagNames: string[] }
  ) {
    const { tagNames, ...pollData } = data;
    return prisma.poll.create({
      data: {
        ...pollData,
        tags: tagNames.length
          ? {
              create: tagNames.map((name) => ({
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
      include: publicPollInclude,
    });
  },

  findById(id: string) {
    return prisma.poll.findFirst({
      where: { id, deletedAt: null },
      include: publicPollInclude,
    });
  },

  updatePoll(id: string, data: Prisma.PollUpdateInput) {
    return prisma.poll.update({ where: { id }, data, include: publicPollInclude });
  },

  softDelete(id: string) {
    return prisma.poll.update({
      where: { id },
      data: { deletedAt: new Date(), status: "DELETED" },
    });
  },

  async list(query: ListPollsQuery, viewerId: string | undefined) {
    const where: Prisma.PollWhereInput = { deletedAt: null };

    if (query.mine && viewerId) {
      where.creatorId = viewerId;
      if (query.status) where.status = query.status as PollStatus;
    } else if (query.bookmarked && viewerId) {
      where.bookmarks = { some: { userId: viewerId } };
    } else {
      where.status = "LIVE";
      where.deadline = { gt: new Date() };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.category) where.categoryId = query.category;
    if (query.country) where.targetCountry = query.country;
    if (query.language) where.targetLanguage = query.language;
    if (query.academicLevel) where.targetAcademicLevel = query.academicLevel;

    const orderBy: Prisma.PollOrderByWithRelationInput =
      query.sort === "reward"
        ? { reward: "desc" }
        : query.sort === "deadline"
          ? { deadline: "asc" }
          : query.sort === "time"
            ? { estimatedTimeMinutes: "asc" }
            : query.sort === "popular"
              ? { views: "desc" }
              : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        include: publicPollInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.poll.count({ where }),
    ]);

    return { items, total };
  },

  incrementViews(id: string) {
    return prisma.poll.update({ where: { id }, data: { views: { increment: 1 } } });
  },

  findResponse(pollId: string, userId: string) {
    return prisma.pollResponse.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
  },

  findBookmark(pollId: string, userId: string) {
    return prisma.pollBookmark.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
  },

  createBookmark(pollId: string, userId: string) {
    return prisma.pollBookmark.create({ data: { pollId, userId } });
  },

  deleteBookmark(pollId: string, userId: string) {
    return prisma.pollBookmark.delete({
      where: { pollId_userId: { pollId, userId } },
    });
  },

  createReport(pollId: string, reporterId: string, reason: string, description?: string) {
    return prisma.pollReport.create({
      data: {
        pollId,
        reporterId,
        reason: reason as Prisma.PollReportCreateInput["reason"],
        description,
      },
    });
  },
};

export type PublicPoll = Prisma.PollGetPayload<{ include: typeof publicPollInclude }>;
