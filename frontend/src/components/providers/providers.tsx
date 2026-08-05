"use client";

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--card-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#22C55E", secondary: "#ffffff" } },
              error: { iconTheme: { primary: "#EF4444", secondary: "#ffffff" } },
            }}
          />
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
