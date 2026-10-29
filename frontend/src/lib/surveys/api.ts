import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { CreateSurveyPayload, Survey } from "@/types/survey";

export interface SurveyListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: "newest" | "reward" | "deadline" | "popular" | "time";
  mine?: boolean;
  status?: string;
  bookmarked?: boolean;
}

export async function fetchSurveys(params: SurveyListParams) {
  const { data } = await apiClient.get<ApiEnvelope<Survey[]>>("/surveys", { params });
  return data;
}

export async function fetchSurvey(id: string) {
  const { data } = await apiClient.get<ApiEnvelope<Survey>>(`/surveys/${id}`);
  return data.data;
}

export async function createSurvey(payload: CreateSurveyPayload) {
  const { data } = await apiClient.post<ApiEnvelope<Survey>>("/surveys", payload);
  return data.data;
}

export async function toggleBookmark(id: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ bookmarked: boolean }>>(
    `/surveys/${id}/bookmark`
  );
  return data.data;
}

export async function completeSurvey(id: string, completionCode?: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ pointsAwarded: number }>>(
    `/surveys/${id}/complete`,
    { completionCode }
  );
  return data.data;
}

export async function deleteSurvey(id: string) {
  const { data } = await apiClient.delete<ApiEnvelope<{ deleted: boolean; refundAmount: number }>>(
    `/surveys/${id}`
  );
  return data.data;
}

export async function reportSurvey(id: string, reason: string, description?: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ reported: boolean }>>(
    `/surveys/${id}/report`,
    { reason, description }
  );
  return data.data;
}
