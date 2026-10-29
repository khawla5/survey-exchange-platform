"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SurveyCard } from "@/components/surveys/survey-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSurveys } from "@/lib/surveys/use-surveys";

const tabKeys = [
  { value: "", key: "all" },
  { value: "DRAFT", key: "draft" },
  { value: "LIVE", key: "live" },
  { value: "COMPLETED", key: "completed" },
  { value: "DELETED", key: "archived" },
] as const;

export default function MySurveysPage() {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState("");
  const { data, isLoading } = useSurveys({ mine: true, status: status || undefined, limit: 24 });

  return (
    <AppShell>
      {() => (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{t("surveys.mine.title")}</h1>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/surveys/create">
                <PlusCircle className="size-4" /> {t("surveys.mine.createSurvey")}
              </Link>
            </Button>
          </div>

          <Tabs value={status} onValueChange={setStatus}>
            <TabsList>
              {tabKeys.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {t(`surveys.mine.tabs.${tab.key}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-medium">{t("surveys.mine.emptyTitle")}</p>
              <p className="mb-4 text-sm text-muted-foreground">{t("surveys.mine.emptyBody")}</p>
              <Button asChild>
                <Link href="/surveys/create">{t("surveys.mine.createSurvey")}</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
