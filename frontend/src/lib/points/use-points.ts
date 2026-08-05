"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPointsBalance, fetchPointsHistory } from "@/lib/points/api";

export function usePointsHistory(page: number, limit = 20) {
  return useQuery({
    queryKey: ["points", "history", page, limit],
    queryFn: () => fetchPointsHistory(page, limit),
  });
}

export function usePointsBalance() {
  return useQuery({
    queryKey: ["points", "balance"],
    queryFn: fetchPointsBalance,
  });
}
