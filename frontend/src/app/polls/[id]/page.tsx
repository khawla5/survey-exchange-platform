"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePoll, useCompletePoll, useToggleBookmark, useReportPoll } from "@/lib/polls/use-polls";
import { getApiErrorMessage } from "@/lib/api/client";
import { isPast } from "@/lib/date-utils";
import { localizedCategoryName } from "@/lib/categories/localized-name";

const reportReasons = ["SPAM", "BROKEN_LINK", "FRAUD", "OFFENSIVE", "DUPLICATE", "OTHER"] as const;

export default function PollDetailsPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: poll, isLoading } = usePoll(params.id);
  const completeMutation = useCompletePoll();
  const bookmarkMutation = useToggleBookmark();
  const reportMutation = useReportPoll();

  const [completionCode, setCompletionCode] = React.useState("");
  const [reportReason, setReportReason] = React.useState<(typeof reportReasons)[number]>("SPAM");
  const [reportDescription, setReportDescription] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  function handleComplete() {
    completeMutation.mutate(
      { id: params.id, completionCode: completionCode || undefined },
      {
        onSuccess: (data) => {
          toast.success(t("polls.details.completedToast", { points: data.pointsAwarded }));
          setConfirmOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  function handleReport() {
    reportMutation.mutate(
      { id: params.id, reason: reportReason, description: reportDescription || undefined },
      {
        onSuccess: () => {
          toast.success(t("polls.details.reportSubmittedToast"));
          setReportOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  return (
    <AppShell>
      {(user) => {
        if (isLoading || !poll) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          );
        }

        const progress = Math.min(100, (poll.currentResponses / poll.targetResponses) * 100);
        const isOwner = poll.creatorId === user.id;
        const isExpired = isPast(poll.deadline);
        const canParticipate =
          !isOwner && !poll.viewerState?.completed && poll.status === "LIVE" && !isExpired;
        const initials = `${poll.creator.firstName[0]}${poll.creator.lastName[0]}`.toUpperCase();

        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {localizedCategoryName(poll.category, i18n.language)}
                  </Badge>
                  <h1 className="text-2xl font-semibold">{poll.title}</h1>
                </div>
                <button
                  onClick={() => bookmarkMutation.mutate(poll.id)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label={t("polls.card.bookmark")}
                >
                  {poll.viewerState?.bookmarked ? (
                    <BookmarkCheck className="size-6 text-primary" />
                  ) : (
                    <Bookmark className="size-6" />
                  )}
                </button>
              </div>

              <Card>
                <CardContent className="space-y-4 p-5">
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {poll.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {poll.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="outline">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> {t("polls.details.time")}
                      </p>
                      <p className="font-medium">
                        {poll.estimatedTimeMinutes} {t("polls.card.minutes")}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="size-3.5" /> {t("polls.details.reward")}
                      </p>
                      <p className="font-medium">
                        {poll.reward} {t("polls.card.pts")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("polls.details.deadline")}</p>
                      <p className="font-medium">
                        {new Date(poll.deadline).toLocaleDateString(
                          i18n.language === "ar" ? "ar-SA" : "en-US"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("polls.details.views")}</p>
                      <p className="font-medium">{poll.views}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-4" />
                        {t("polls.details.responsesCount", {
                          current: poll.currentResponses,
                          target: poll.targetResponses,
                        })}
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span>
                  {poll.creator.firstName} {poll.creator.lastName}
                </span>
                {poll.institution && (
                  <span className="flex items-center gap-1">
                    · <Building2 className="size-3.5" /> {poll.institution.name}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardContent className="space-y-3 p-5">
                  {isOwner ? (
                    <Button asChild className="w-full">
                      <Link href="/my-polls">{t("polls.details.managePoll")}</Link>
                    </Button>
                  ) : poll.viewerState?.completed ? (
                    <Button disabled className="w-full gap-2">
                      <CheckCircle2 className="size-4" /> {t("polls.details.alreadyCompleted")}
                    </Button>
                  ) : (
                    <Button asChild className="w-full gap-2">
                      <a href={poll.pollUrl} target="_blank" rel="noreferrer">
                        {t("polls.details.openPoll")} <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}

                  {canParticipate && (
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full">
                          {t("polls.details.iCompletedIt")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("polls.details.confirmCompletion")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {t("polls.details.confirmCompletionBody", { points: poll.reward })}
                          </p>
                          {poll.completionCode !== null && (
                            <div className="space-y-1.5">
                              <Label htmlFor="completionCode">
                                {t("polls.details.completionCode")}
                              </Label>
                              <Input
                                id="completionCode"
                                value={completionCode}
                                onChange={(e) => setCompletionCode(e.target.value)}
                                placeholder={t("polls.details.completionCodePlaceholder")}
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleComplete}
                            disabled={completeMutation.isPending}
                            className="w-full"
                          >
                            {t("polls.details.confirmEarnPoints")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {!isOwner && (
                    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full gap-1.5 text-muted-foreground">
                          <Flag className="size-3.5" /> {t("polls.details.reportPoll")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("polls.details.reportThisPoll")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Select
                            value={reportReason}
                            onValueChange={(v) => setReportReason(v as typeof reportReason)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {reportReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {t(`polls.details.reportReasons.${reason}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder={t("polls.details.additionalDetails")}
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleReport} disabled={reportMutation.isPending} className="w-full">
                            {t("polls.details.submitReport")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
                <ArrowLeft className="icon-flip size-4" /> {t("polls.details.back")}
              </Button>
            </div>
          </div>
        );
      }}
    </AppShell>
  );
}
