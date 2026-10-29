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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/auth/password-input";
import { useRegister } from "@/lib/auth/use-auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { AcademicLevel } from "@/types/auth";

const academicLevels: AcademicLevel[] = [
  "UNDERGRADUATE",
  "GRADUATE",
  "MASTERS",
  "PHD",
  "POSTDOC",
  "FACULTY",
  "OTHER",
];

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "auth.validation.required"),
    lastName: z.string().trim().min(1, "auth.validation.required"),
    email: z.string().trim().email("auth.validation.email"),
    password: z
      .string()
      .min(8, "auth.validation.passwordMin")
      .regex(/[a-z]/, "auth.validation.passwordLowercase")
      .regex(/[A-Z]/, "auth.validation.passwordUppercase")
      .regex(/[0-9]/, "auth.validation.passwordNumber"),
    confirmPassword: z.string(),
    academicRole: z.string().optional(),
    institutionName: z.string().trim().optional(),
    acceptTerms: z.boolean().refine((v) => v === true, "auth.validation.acceptRequired"),
    acceptPrivacy: z.boolean().refine((v) => v === true, "auth.validation.acceptRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.validation.passwordsMatch",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      institutionName: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const passwordValue = watch("password");

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(
      { ...values, academicRole: values.academicRole as AcademicLevel | undefined },
      {
        onSuccess: (data) => {
          toast.success(t("auth.register.success"));
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-start">
        <h2 className="text-2xl font-semibold">{t("auth.register.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("auth.register.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t("auth.register.firstName")}</Label>
            <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-destructive">{t(errors.firstName.message as string)}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">{t("auth.register.lastName")}</Label>
            <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-destructive">{t(errors.lastName.message as string)}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.register.email")}</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{t(errors.email.message as string)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("auth.register.password")}</Label>
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
          <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{t(errors.confirmPassword.message as string)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t("auth.register.academicRole")}</Label>
          <Select onValueChange={(v) => setValue("academicRole", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {academicLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {t(`academicRoles.${level}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="institutionName">{t("auth.register.institutionName")}</Label>
          <Input id="institutionName" {...register("institutionName")} />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-start gap-2 text-sm">
            <Checkbox
              id="acceptTerms"
              checked={watch("acceptTerms")}
              onCheckedChange={(v) => setValue("acceptTerms", v === true)}
            />
            <label htmlFor="acceptTerms" className="cursor-pointer">
              {t("auth.register.acceptTerms")}{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline"
                onClick={(e) => e.stopPropagation()}
              >
                {lang === "ar" ? "(عرض)" : "(view)"}
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive">{t(errors.acceptTerms.message as string)}</p>
          )}
          <div className="flex items-start gap-2 text-sm">
            <Checkbox
              id="acceptPrivacy"
              checked={watch("acceptPrivacy")}
              onCheckedChange={(v) => setValue("acceptPrivacy", v === true)}
            />
            <label htmlFor="acceptPrivacy" className="cursor-pointer">
              {t("auth.register.acceptPrivacy")}{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline"
                onClick={(e) => e.stopPropagation()}
              >
                {lang === "ar" ? "(عرض)" : "(view)"}
              </Link>
            </label>
          </div>
          {errors.acceptPrivacy && (
            <p className="text-xs text-destructive">{t(errors.acceptPrivacy.message as string)}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
          {t("auth.register.submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.register.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.register.signIn")}
        </Link>
      </p>
    </div>
  );
}
