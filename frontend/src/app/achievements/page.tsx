"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import * as Icons from "lucide-react";
import { Lock, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/lib/achievements/use-achievements";
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/gamification";

function AchievementIcon({ icon }: { icon: string }) {
  const pascalCase = icon
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[pascalCase];
  return IconComponent ? <IconComponent className="size-6" /> : <Sparkles className="size-6" />;
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card className={cn("h-full border-border transition-opacity", !achievement.unlocked && "opacity-60")}>
        <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: achievement.unlocked ? `${achievement.color}20` : "var(--muted)",
              color: achievement.unlocked ? achievement.color : "var(--muted-foreground)",
            }}
          >
            {achievement.unlocked ? <AchievementIcon icon={achievement.icon} /> : <Lock className="size-6" />}
          </div>
          <div>
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> +{achievement.pointsReward} {t("polls.card.pts")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const { t } = useTranslation();
  const { data: achievements, isLoading } = useAchievements();
  const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;

  return (
    <AppShell>
      {() => (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{t("achievements.title")}</h1>
            {achievements && (
              <p className="text-sm text-muted-foreground">
                {t("achievements.unlockedCount", {
                  unlocked: unlockedCount,
                  total: achievements.length,
                })}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements?.map((achievement, i) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
