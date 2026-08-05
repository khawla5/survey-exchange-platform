import { z } from "zod";
import { AcademicLevel, Gender, Language, SurveyReportReason } from "@prisma/client";

export const createSurveySchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  categoryId: z.string().uuid("Choose a category"),
  thumbnail: z.string().trim().url().optional().or(z.literal("")),
  surveyUrl: z.string().trim().url("Enter a valid survey link"),
  completionCode: z.string().trim().max(50).optional().or(z.literal("")),
  estimatedTimeMinutes: z.coerce.number().int().min(1).max(180),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().default([]),

  targetAcademicLevel: z.nativeEnum(AcademicLevel).optional(),
  targetCountry: z.string().trim().max(100).optional(),
  targetLanguage: z.nativeEnum(Language).optional(),
  targetGender: z.nativeEnum(Gender).optional(),
  targetAgeMin: z.coerce.number().int().min(13).max(100).optional(),
  targetAgeMax: z.coerce.number().int().min(13).max(100).optional(),

  targetResponses: z.coerce.number().int().min(1).max(100000),
  reward: z.coerce.number().int().min(1).max(1000),
  deadline: z.coerce.date().refine((d) => d.getTime() > Date.now(), "Deadline must be in the future"),

  publish: z.boolean().default(false),
});

export const updateSurveySchema = createSurveySchema.partial().omit({ publish: true });

export const listSurveysQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().optional(),
  category: z.string().uuid().optional(),
  country: z.string().trim().optional(),
  language: z.nativeEnum(Language).optional(),
  academicLevel: z.nativeEnum(AcademicLevel).optional(),
  status: z.string().optional(),
  mine: z.coerce.boolean().optional(),
  bookmarked: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "reward", "deadline", "popular", "time"]).default("newest"),
});

export const completeSurveySchema = z.object({
  completionCode: z.string().trim().max(50).optional(),
});

export const reportSurveySchema = z.object({
  reason: z.nativeEnum(SurveyReportReason),
  description: z.string().trim().max(1000).optional(),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
export type ListSurveysQuery = z.infer<typeof listSurveysQuerySchema>;
export type CompleteSurveyInput = z.infer<typeof completeSurveySchema>;
export type ReportSurveyInput = z.infer<typeof reportSurveySchema>;
