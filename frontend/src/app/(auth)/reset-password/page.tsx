"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { useResetPassword } from "@/lib/auth/use-auth";
import { getApiErrorMessage } from "@/lib/api/client";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "auth.validation.passwordMin")
      .regex(/[a-z]/, "auth.validation.passwordLowercase")
      .regex(/[A-Z]/, "auth.validation.passwordUppercase")
      .regex(/[0-9]/, "auth.validation.passwordNumber"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.validation.passwordsMatch",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");
  const confirmValue = watch("confirmPassword");

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <AlertTriangle className="mx-auto size-12 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("auth.resetPassword.invalidToken")}</p>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          {t("auth.forgotPassword.title")}
        </Link>
      </div>
    );
  }

  function onSubmit(values: FormValues) {
    resetPasswordMutation.mutate(
      { token: token as string, password: values.password, confirmPassword: values.confirmPassword },
      {
        onSuccess: () => {
          toast.success(t("auth.resetPassword.success"));
          router.push("/login");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-start">
        <h2 className="text-2xl font-semibold">{t("auth.resetPassword.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("auth.resetPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("auth.resetPassword.password")}</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            showStrength
            value={passwordValue}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{t(errors.password.message as string)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("auth.resetPassword.confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmValue}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{t(errors.confirmPassword.message as string)}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
          {resetPasswordMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
          {t("auth.resetPassword.submit")}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
