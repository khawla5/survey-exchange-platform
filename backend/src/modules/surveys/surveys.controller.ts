import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { surveysService } from "@/modules/surveys/surveys.service";
import {
  completeSurveySchema,
  createSurveySchema,
  listSurveysQuerySchema,
  reportSurveySchema,
  updateSurveySchema,
} from "@/modules/surveys/surveys.validation";

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user.id;
}

export const surveysController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = createSurveySchema.parse(req.body);
    const survey = await surveysService.create(requireUserId(req), input);
    return sendSuccess(res, { statusCode: 201, message: "Survey created", data: survey });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = listSurveysQuerySchema.parse(req.query);
    const result = await surveysService.list(query, req.user?.id);
    return sendSuccess(res, {
      data: result.items,
      pagination: result.pagination,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const survey = await surveysService.getById(req.params.id, req.user?.id);
    return sendSuccess(res, { data: survey });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = updateSurveySchema.parse(req.body);
    const survey = await surveysService.update(req.params.id, requireUserId(req), input);
    return sendSuccess(res, { message: "Survey updated", data: survey });
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const survey = await surveysService.publishDraft(req.params.id, requireUserId(req));
    return sendSuccess(res, { message: "Survey published", data: survey });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await surveysService.remove(req.params.id, requireUserId(req));
    return sendSuccess(res, { message: "Survey removed", data: result });
  }),

  bookmark: asyncHandler(async (req: Request, res: Response) => {
    const result = await surveysService.toggleBookmark(req.params.id, requireUserId(req));
    return sendSuccess(res, { message: "Bookmark updated", data: result });
  }),

  report: asyncHandler(async (req: Request, res: Response) => {
    const input = reportSurveySchema.parse(req.body);
    const result = await surveysService.report(req.params.id, requireUserId(req), input);
    return sendSuccess(res, { statusCode: 201, message: "Report submitted", data: result });
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const input = completeSurveySchema.parse(req.body);
    const result = await surveysService.complete(req.params.id, requireUserId(req), input);
    return sendSuccess(res, { message: "Survey completed — points awarded", data: result });
  }),
};
