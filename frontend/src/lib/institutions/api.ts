import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Institution, InstitutionDetail, InstitutionMember } from "@/types/institution";

export async function fetchInstitutions(page = 1, limit = 20) {
  const { data } = await apiClient.get<ApiEnvelope<Institution[]>>("/institutions", {
    params: { page, limit },
  });
  return data;
}

export async function fetchInstitution(id: string) {
  const { data } = await apiClient.get<ApiEnvelope<InstitutionDetail>>(`/institutions/${id}`);
  return data.data;
}

export async function fetchInstitutionMembers(id: string, page = 1, limit = 20) {
  const { data } = await apiClient.get<ApiEnvelope<InstitutionMember[]>>(
    `/institutions/${id}/members`,
    { params: { page, limit } }
  );
  return data;
}
