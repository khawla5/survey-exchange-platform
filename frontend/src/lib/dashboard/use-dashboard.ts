"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatistics, fetchRecommendations } from "@/lib/dashboard/api";

export function useDashboardStatistics() {
  return useQuery({
    queryKey: ["dashboard", "statistics"],
    queryFn: fetchDashboardStatistics,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["dashboard", "recommendations"],
    queryFn: fetchRecommendations,
  });
}
