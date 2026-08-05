"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import { useResendCode, useVerifyEmail } from "@/lib/auth/use-auth";
import { getApiErrorMessage } from "@/lib/api/client";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = React.useState("");
  const [cooldown, setCooldown] = React.useState(0);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendCode();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;

    verifyMutation.mutate(
      { email, code },
      {
        onSuccess: () => {
          toast.success(t("auth.verifyEmail.success"));
          router.push("/login");
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  }

  function handleResend() {
    resendMutation.mutate(email, {
      onSuccess: () => {
        toast.success(t("auth.forgotPassword.success"));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-start">
        <h2 className="text-2xl font-semibold">{t("auth.verifyEmail.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.verifyEmail.subtitle", { email })}
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
            Dev mode: use code <span className="font-mono font-semibold">000000</span> to skip
            checking the Ethereal inbox.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpInput value={code} onChange={setCode} disabled={verifyMutation.isPending} />

        <Button type="submit" className="w-full" disabled={code.length !== 6 || verifyMutation.isPending}>
          {verifyMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
          {t("auth.verifyEmail.submit")}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Button
          type="button"
          variant="link"
          disabled={cooldown > 0 || resendMutation.isPending}
          onClick={handleResend}
        >
          {cooldown > 0 ? t("auth.verifyEmail.resendIn", { seconds: cooldown }) : t("auth.verifyEmail.resend")}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
