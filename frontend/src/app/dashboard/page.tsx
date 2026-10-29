"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Award, BookMarked, FileCheck2, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { PollCard } from "@/components/polls/poll-card";
import { useDashboardStatistics, useRecommendations } from "@/lib/dashboard/use-dashboard";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useDashboardStatistics();
  const { data: recommendations, isLoading: recsLoading } = useRecommendations();

  return (
    <AppShell>
      {(user) => (
        <>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold"
          >
            {t("dashboard.greeting", { name: user.firstName })}
          </motion.h1>

          {statsLoading || !stats ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Sparkles} label={t("dashboard.pointsBalance")} value={stats.points} />
              <StatCard icon={TrendingUp} label={t("dashboard.reputation")} value={stats.reputation} />
              <StatCard
                icon={FileCheck2}
                label={t("dashboard.completedPolls")}
                value={stats.completedPolls}
              />
              <StatCard icon={BookMarked} label={t("dashboard.bookmarks")} value={stats.bookmarks} />
            </div>
          )}

          <Card className="overflow-hidden border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  {t("dashboard.recommended")}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/polls">{t("common.browseAll")}</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-2xl" />
                  ))}
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((poll) => (
                    <PollCard key={poll.id} poll={poll} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {t("dashboard.noRecommendations")}
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <Link href="/polls/create">{t("dashboard.createPollCta")}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}
