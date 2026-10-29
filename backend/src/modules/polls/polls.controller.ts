import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { pollsService } from "@/modules/polls/polls.service";
import {
  completePollSchema,
  createPollSchema,
  listPollsQuerySchema,
  reportPollSchema,
  updatePollSchema,
} from "@/modules/polls/polls.validation";

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user.id;
}

export const pollsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = createPollSchema.parse(req.body);
    const poll = await pollsService.create(requireUserId(req), input);
    return sendSuccess(res, { statusCode: 201, message: "Poll created", data: poll });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = listPollsQuerySchema.parse(req.query);
    const result = await pollsService.list(query, req.user?.id);
    return sendSuccess(res, {
      data: result.items,
      pagination: result.pagination,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const poll = await pollsService.getById(req.params.id, req.user?.id);
    return sendSuccess(res, { data: poll });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = updatePollSchema.parse(req.body);
    const poll = await pollsService.update(req.params.id, requireUserId(req), input);
    return sendSuccess(res, { message: "Poll updated", data: poll });
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const poll = await pollsService.publishDraft(req.params.id, requireUserId(req));
    return sendSuccess(res, { message: "Poll published", data: poll });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await pollsService.remove(req.params.id, requireUserId(req));
    return sendSuccess(res, { message: "Poll removed", data: result });
  }),

  bookmark: asyncHandler(async (req: Request, res: Response) => {
    const result = await pollsService.toggleBookmark(req.params.id, requireUserId(req));
    return sendSuccess(res, { message: "Bookmark updated", data: result });
  }),

  report: asyncHandler(async (req: Request, res: Response) => {
    const input = reportPollSchema.parse(req.body);
    const result = await pollsService.report(req.params.id, requireUserId(req), input);
    return sendSuccess(res, { statusCode: 201, message: "Report submitted", data: result });
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const input = completePollSchema.parse(req.body);
    const result = await pollsService.complete(req.params.id, requireUserId(req), input);
    return sendSuccess(res, { message: "Poll completed — points awarded", data: result });
  }),
};
