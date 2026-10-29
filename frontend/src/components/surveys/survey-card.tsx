"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Bookmark, BookmarkCheck, Building2, Clock, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Survey } from "@/types/survey";
import { useToggleBookmark } from "@/lib/surveys/use-surveys";
import { cn } from "@/lib/utils";
import { daysUntil } from "@/lib/date-utils";
import { localizedCategoryName } from "@/lib/categories/localized-name";

export function SurveyCard({ survey }: { survey: Survey }) {
  const { t, i18n } = useTranslation();
  const bookmarkMutation = useToggleBookmark();
  const progress = Math.min(100, (survey.currentResponses / survey.targetResponses) * 100);
  const daysLeft = daysUntil(survey.deadline);
  const initials = `${survey.creator.firstName[0]}${survey.creator.lastName[0]}`.toUpperCase();

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="flex h-full flex-col gap-3 overflow-hidden border-border p-0">
        <div
          className="flex h-28 items-center justify-center bg-gradient-to-br from-[#F08080] via-[#F4978E] to-[#FBC4AB] text-white"
          style={survey.category.color ? { background: survey.category.color } : undefined}
        >
          <span className="text-sm font-medium opacity-90">
            {localizedCategoryName(survey.category, i18n.language)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/surveys/${survey.id}`} className="line-clamp-2 font-semibold hover:underline">
              {survey.title}
            </Link>
            <button
              onClick={() => bookmarkMutation.mutate(survey.id)}
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label={t("surveys.card.bookmark")}
            >
              {survey.viewerState?.bookmarked ? (
                <BookmarkCheck className="size-5 text-primary" />
              ) : (
                <Bookmark className="size-5" />
              )}
            </button>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{survey.description}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {survey.estimatedTimeMinutes} {t("surveys.card.minutes")}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> {survey.reward} {t("surveys.card.pts")}
            </span>
            <span className={cn("flex items-center gap-1", daysLeft <= 2 && "text-warning")}>
              {t("surveys.card.daysLeft", { count: daysLeft })}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {survey.currentResponses}/{survey.targetResponses}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {survey.creator.firstName} {survey.creator.lastName}
              </span>
              {survey.institution?.verified && <Building2 className="size-3.5 text-info" />}
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/surveys/${survey.id}`}>
                {survey.viewerState?.completed
                  ? t("surveys.card.completed")
                  : t("surveys.card.participate")}
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
