import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { CreatePollPayload, Poll } from "@/types/poll";

export interface PollListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: "newest" | "reward" | "deadline" | "popular" | "time";
  mine?: boolean;
  status?: string;
  bookmarked?: boolean;
}

export async function fetchPolls(params: PollListParams) {
  const { data } = await apiClient.get<ApiEnvelope<Poll[]>>("/polls", { params });
  return data;
}

export async function fetchPoll(id: string) {
  const { data } = await apiClient.get<ApiEnvelope<Poll>>(`/polls/${id}`);
  return data.data;
}

export async function createPoll(payload: CreatePollPayload) {
  const { data } = await apiClient.post<ApiEnvelope<Poll>>("/polls", payload);
  return data.data;
}

export async function toggleBookmark(id: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ bookmarked: boolean }>>(
    `/polls/${id}/bookmark`
  );
  return data.data;
}

export async function completePoll(id: string, completionCode?: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ pointsAwarded: number }>>(
    `/polls/${id}/complete`,
    { completionCode }
  );
  return data.data;
}

export async function deletePoll(id: string) {
  const { data } = await apiClient.delete<ApiEnvelope<{ deleted: boolean; refundAmount: number }>>(
    `/polls/${id}`
  );
  return data.data;
}

export async function reportPoll(id: string, reason: string, description?: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ reported: boolean }>>(
    `/polls/${id}/report`,
    { reason, description }
  );
  return data.data;
}
