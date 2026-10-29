"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeSurvey,
  createSurvey,
  deleteSurvey,
  fetchSurvey,
  fetchSurveys,
  reportSurvey,
  SurveyListParams,
  toggleBookmark,
} from "@/lib/surveys/api";
import { ME_QUERY_KEY } from "@/lib/auth/use-auth";

export function useSurveys(params: SurveyListParams) {
  return useQuery({
    queryKey: ["surveys", params],
    queryFn: () => fetchSurveys(params),
  });
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: ["surveys", id],
    queryFn: () => fetchSurvey(id),
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
}

export function useCompleteSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completionCode }: { id: string; completionCode?: string }) =>
      completeSurvey(id, completionCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useReportSurvey() {
  return useMutation({
    mutationFn: ({ id, reason, description }: { id: string; reason: string; description?: string }) =>
      reportSurvey(id, reason, description),
  });
}
