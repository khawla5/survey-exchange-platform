"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#F08080] via-[#F4978E] to-[#FFDAB9] p-12 text-white lg:flex">
        <div className="absolute -top-24 -end-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -start-16 size-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="size-6" />
          {t("common.appName")}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative space-y-4"
        >
          <h1 className="font-hero text-4xl leading-tight font-bold xl:text-5xl">
            {t("auth.heroTitle")}
          </h1>
          <p className="max-w-md text-white/90">{t("auth.heroSubtitle")}</p>
        </motion.div>

        <div className="relative text-sm text-white/80">
          © {new Date().getFullYear()} {t("common.appName")}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-end gap-1 p-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
