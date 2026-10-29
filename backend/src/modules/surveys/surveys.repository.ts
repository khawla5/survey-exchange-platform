import { Prisma, SurveyStatus } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { ListSurveysQuery } from "@/modules/surveys/surveys.validation";

const publicSurveyInclude = {
  category: true,
  creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  institution: { select: { id: true, name: true, verified: true, logo: true } },
  tags: { include: { tag: true } },
  _count: { select: { bookmarks: true, reports: true } },
} satisfies Prisma.SurveyInclude;

export const surveysRepository = {
  async createSurvey(
    data: Omit<Prisma.SurveyUncheckedCreateInput, "tags"> & { tagNames: string[] }
  ) {
    const { tagNames, ...surveyData } = data;
    return prisma.survey.create({
      data: {
        ...surveyData,
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
      include: publicSurveyInclude,
    });
  },

  findById(id: string) {
    return prisma.survey.findFirst({
      where: { id, deletedAt: null },
      include: publicSurveyInclude,
    });
  },

  updateSurvey(id: string, data: Prisma.SurveyUpdateInput) {
    return prisma.survey.update({ where: { id }, data, include: publicSurveyInclude });
  },

  softDelete(id: string) {
    return prisma.survey.update({
      where: { id },
      data: { deletedAt: new Date(), status: "DELETED" },
    });
  },

  async list(query: ListSurveysQuery, viewerId: string | undefined) {
    const where: Prisma.SurveyWhereInput = { deletedAt: null };

    if (query.mine && viewerId) {
      where.creatorId = viewerId;
      if (query.status) where.status = query.status as SurveyStatus;
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

    const orderBy: Prisma.SurveyOrderByWithRelationInput =
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
      prisma.survey.findMany({
        where,
        include: publicSurveyInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.survey.count({ where }),
    ]);

    return { items, total };
  },

  incrementViews(id: string) {
    return prisma.survey.update({ where: { id }, data: { views: { increment: 1 } } });
  },

  findResponse(surveyId: string, userId: string) {
    return prisma.surveyResponse.findUnique({
      where: { surveyId_userId: { surveyId, userId } },
    });
  },

  findBookmark(surveyId: string, userId: string) {
    return prisma.surveyBookmark.findUnique({
      where: { surveyId_userId: { surveyId, userId } },
    });
  },

  createBookmark(surveyId: string, userId: string) {
    return prisma.surveyBookmark.create({ data: { surveyId, userId } });
  },

  deleteBookmark(surveyId: string, userId: string) {
    return prisma.surveyBookmark.delete({
      where: { surveyId_userId: { surveyId, userId } },
    });
  },

  createReport(surveyId: string, reporterId: string, reason: string, description?: string) {
    return prisma.surveyReport.create({
      data: {
        surveyId,
        reporterId,
        reason: reason as Prisma.SurveyReportCreateInput["reason"],
        description,
      },
    });
  },
};

export type PublicSurvey = Prisma.SurveyGetPayload<{ include: typeof publicSurveyInclude }>;
