import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Achievement } from "@/types/gamification";

export async function fetchAchievements() {
  const { data } = await apiClient.get<ApiEnvelope<Achievement[]>>("/achievements");
  return data.data;
}
