"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/lib/auth/use-auth";
import { getApiErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().trim().email("auth.validation.email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = React.useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    forgotPasswordMutation.mutate(values.email, {
      onSuccess: () => setSent(true),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h2 className="text-xl font-semibold">{t("auth.forgotPassword.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("auth.forgotPassword.success")}</p>
        <Link href="/login" className="inline-block text-sm font-medium text-primary hover:underline">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-start">
        <h2 className="text-2xl font-semibold">{t("auth.forgotPassword.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("auth.forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.forgotPassword.email")}</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{t(errors.email.message as string)}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
          {forgotPasswordMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
          {t("auth.forgotPassword.submit")}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </p>
    </div>
  );
}
