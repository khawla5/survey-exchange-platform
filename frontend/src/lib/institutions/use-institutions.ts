"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInstitution, fetchInstitutionMembers, fetchInstitutions } from "@/lib/institutions/api";

export function useInstitutions(page = 1) {
  return useQuery({
    queryKey: ["institutions", page],
    queryFn: () => fetchInstitutions(page),
  });
}

export function useInstitution(id: string) {
  return useQuery({
    queryKey: ["institutions", id],
    queryFn: () => fetchInstitution(id),
    enabled: !!id,
  });
}

export function useInstitutionMembers(id: string, page = 1) {
  return useQuery({
    queryKey: ["institutions", id, "members", page],
    queryFn: () => fetchInstitutionMembers(id, page),
    enabled: !!id,
  });
}
