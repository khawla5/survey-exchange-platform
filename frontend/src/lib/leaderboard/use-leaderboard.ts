"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "@/lib/leaderboard/api";

export function useLeaderboard(period: "weekly" | "monthly" | "alltime") {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
  });
}
