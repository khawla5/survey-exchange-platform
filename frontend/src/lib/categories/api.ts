import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Category } from "@/types/survey";

export async function fetchCategories() {
  const { data } = await apiClient.get<ApiEnvelope<Category[]>>("/categories");
  return data.data;
}
