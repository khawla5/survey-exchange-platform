import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Transaction } from "@/types/survey";

export async function fetchPointsBalance() {
  const { data } = await apiClient.get<ApiEnvelope<{ points: number; reputation: number }>>(
    "/points"
  );
  return data.data;
}

export async function fetchPointsHistory(page: number, limit: number) {
  const { data } = await apiClient.get<ApiEnvelope<Transaction[]>>("/points/history", {
    params: { page, limit },
  });
  return data;
}
