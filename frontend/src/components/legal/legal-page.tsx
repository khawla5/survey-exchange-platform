"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { LegalDoc } from "@/lib/legal/content";

export function LegalPage({ content }: { content: Record<"en" | "ar", LegalDoc> }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const doc = content[lang];
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="size-6 text-primary" />
          {t("common.appName")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <BackIcon className="size-4" />
          {lang === "ar" ? "العودة للرئيسية" : "Back to home"}
        </Link>

        <h1 className="text-3xl font-semibold">{doc.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{doc.updated}</p>
        <p className="mt-6 leading-relaxed text-foreground/90">{doc.intro}</p>

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <div className="mt-2 space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-foreground/80">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
