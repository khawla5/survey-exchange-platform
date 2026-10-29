"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Repeat, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useMe } from "@/lib/auth/use-auth";

export default function Home() {
  const { t } = useTranslation();
  const { data: user } = useMe();

  const features = [
    {
      icon: Repeat,
      title: t("home.features.exchangeTitle"),
      description: t("home.features.exchangeBody"),
    },
    {
      icon: Users,
      title: t("home.features.academiaTitle"),
      description: t("home.features.academiaBody"),
    },
    {
      icon: Sparkles,
      title: t("home.features.gamifiedTitle"),
      description: t("home.features.gamifiedBody"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="size-6 text-primary" />
          {t("common.appName")}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{t("home.dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("home.signIn")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t("home.createAccount")}</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-16 px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl space-y-6"
        >
          <h1 className="font-hero text-4xl leading-tight font-bold text-balance sm:text-5xl">
            {t("home.heroTitle")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("home.heroSubtitle")}</p>
          <Button asChild size="lg" className="gap-2">
            <Link href={user ? "/dashboard" : "/register"}>
              {t("home.getStarted")} <ArrowRight className="icon-flip size-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-3 rounded-2xl border border-border bg-card p-6 text-start shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
