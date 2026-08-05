import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { LeaderboardEntry } from "@/types/gamification";

export async function fetchLeaderboard(period: "weekly" | "monthly" | "alltime") {
  const { data } = await apiClient.get<ApiEnvelope<LeaderboardEntry[]>>("/leaderboard", {
    params: { period },
  });
  return data.data;
}
