"use client";

import * as React from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { Direction } from "radix-ui";
import i18n from "@/lib/i18n/config";

function DirectionSync({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const dir = i18nInstance.language === "ar" ? "rtl" : "ltr";

  React.useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = i18nInstance.language;
  }, [dir, i18nInstance.language]);

  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <DirectionSync>{children}</DirectionSync>
    </I18nextProvider>
  );
}
