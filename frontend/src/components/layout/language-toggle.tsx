"use client";

import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLanguage } from "@/lib/i18n/config";

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(isArabic ? "en" : "ar")}
      aria-label={t("common.toggleLanguage")}
      className="gap-1.5"
    >
      <Languages className="size-4" />
      {isArabic ? "EN" : "AR"}
    </Button>
  );
}
