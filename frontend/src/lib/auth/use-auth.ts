"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  fetchMe,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resendVerificationCode,
  resetPassword,
  verifyEmail,
} from "@/lib/auth/api";

export const ME_QUERY_KEY = ["auth", "me"];

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    throwOnError: false,
    staleTime: 30 * 1000,
  });
}

export function useRegister() {
  return useMutation({ mutationFn: registerUser });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, data.user);
    },
  });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: verifyEmail });
}

export function useResendCode() {
  return useMutation({ mutationFn: resendVerificationCode });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}
