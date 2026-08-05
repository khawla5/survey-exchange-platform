import { apiClient, ApiEnvelope } from "@/lib/api/client";
import {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/types/auth";

export async function registerUser(payload: RegisterPayload) {
  const { data } = await apiClient.post<ApiEnvelope<{ email: string }>>("/auth/register", payload);
  return data.data;
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiEnvelope<{ user: AuthUser; accessToken: string }>>(
    "/auth/login",
    payload
  );
  return data.data;
}

export async function logoutUser() {
  await apiClient.post("/auth/logout");
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const { data } = await apiClient.post<ApiEnvelope<{ verified: boolean }>>(
    "/auth/verify-email",
    payload
  );
  return data.data;
}

export async function resendVerificationCode(email: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ sent: boolean }>>("/auth/resend-code", {
    email,
  });
  return data.data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ sent: boolean }>>("/auth/forgot-password", {
    email,
  });
  return data.data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await apiClient.post<ApiEnvelope<{ reset: boolean }>>(
    "/auth/reset-password",
    payload
  );
  return data.data;
}

export async function fetchMe() {
  const { data } = await apiClient.get<ApiEnvelope<AuthUser>>("/users/me");
  return data.data;
}
