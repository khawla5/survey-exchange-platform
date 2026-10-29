import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Survey } from "@/types/survey";

export interface DashboardStatistics {
  points: number;
  reputation: number;
  completedSurveys: number;
  publishedSurveys: number;
  bookmarks: number;
  achievements: number;
}

export async function fetchDashboardStatistics() {
  const { data } = await apiClient.get<ApiEnvelope<DashboardStatistics>>(
    "/dashboard/statistics"
  );
  return data.data;
}

export async function fetchRecommendations() {
  const { data } = await apiClient.get<ApiEnvelope<Survey[]>>("/dashboard/recommendations");
  return data.data;
}
