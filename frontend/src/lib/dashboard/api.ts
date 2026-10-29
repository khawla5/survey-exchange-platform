import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Poll } from "@/types/poll";

export interface DashboardStatistics {
  points: number;
  reputation: number;
  completedPolls: number;
  publishedPolls: number;
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
  const { data } = await apiClient.get<ApiEnvelope<Poll[]>>("/dashboard/recommendations");
  return data.data;
}
