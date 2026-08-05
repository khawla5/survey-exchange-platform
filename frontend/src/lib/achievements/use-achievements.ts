"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAchievements } from "@/lib/achievements/api";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });
}
