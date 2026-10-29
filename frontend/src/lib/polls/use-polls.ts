"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completePoll,
  createPoll,
  deletePoll,
  fetchPoll,
  fetchPolls,
  reportPoll,
  PollListParams,
  toggleBookmark,
} from "@/lib/polls/api";
import { ME_QUERY_KEY } from "@/lib/auth/use-auth";

export function usePolls(params: PollListParams) {
  return useQuery({
    queryKey: ["polls", params],
    queryFn: () => fetchPolls(params),
  });
}

export function usePoll(id: string) {
  return useQuery({
    queryKey: ["polls", id],
    queryFn: () => fetchPoll(id),
    enabled: !!id,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
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
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function useCompletePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completionCode }: { id: string; completionCode?: string }) =>
      completePoll(id, completionCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useReportPoll() {
  return useMutation({
    mutationFn: ({ id, reason, description }: { id: string; reason: string; description?: string }) =>
      reportPoll(id, reason, description),
  });
}
