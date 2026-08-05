"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { useLogin, useMe } from "@/lib/auth/use-auth";
import { getApiErrorMessage } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().trim().email("auth.validation.email"),
  password: z.string().min(1, "auth.validation.required"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = useLogin();
  const { data: currentUser } = useMe();

  React.useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const passwordValue = watch("password");

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-start">
        <h2 className="text-2xl font-semibold">{t("auth.login.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("auth.login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.login.email")}</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{t(errors.email.message as string)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={passwordValue}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{t(errors.password.message as string)}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={watch("rememberMe")}
            onCheckedChange={(v) => setValue("rememberMe", v === true)}
          />
          <span>{t("auth.login.rememberMe")}</span>
        </label>

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
          {t("auth.login.submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("auth.login.signUp")}
        </Link>
      </p>
    </div>
  );
}
