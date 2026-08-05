"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
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
import { useSurvey, useCompleteSurvey, useToggleBookmark, useReportSurvey } from "@/lib/surveys/use-surveys";
import { getApiErrorMessage } from "@/lib/api/client";
import { isPast } from "@/lib/date-utils";

const reportReasons = ["SPAM", "BROKEN_LINK", "FRAUD", "OFFENSIVE", "DUPLICATE", "OTHER"];

export default function SurveyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: survey, isLoading } = useSurvey(params.id);
  const completeMutation = useCompleteSurvey();
  const bookmarkMutation = useToggleBookmark();
  const reportMutation = useReportSurvey();

  const [completionCode, setCompletionCode] = React.useState("");
  const [reportReason, setReportReason] = React.useState("SPAM");
  const [reportDescription, setReportDescription] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  function handleComplete() {
    completeMutation.mutate(
      { id: params.id, completionCode: completionCode || undefined },
      {
        onSuccess: (data) => {
          toast.success(`Completed! You earned ${data.pointsAwarded} points 🎉`);
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
          toast.success("Report submitted. Thanks for helping keep the platform trustworthy.");
          setReportOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  }

  return (
    <AppShell>
      {(user) => {
        if (isLoading || !survey) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          );
        }

        const progress = Math.min(100, (survey.currentResponses / survey.targetResponses) * 100);
        const isOwner = survey.creatorId === user.id;
        const isExpired = isPast(survey.deadline);
        const canParticipate =
          !isOwner && !survey.viewerState?.completed && survey.status === "LIVE" && !isExpired;
        const initials = `${survey.creator.firstName[0]}${survey.creator.lastName[0]}`.toUpperCase();

        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {survey.category.name}
                  </Badge>
                  <h1 className="text-2xl font-semibold">{survey.title}</h1>
                </div>
                <button
                  onClick={() => bookmarkMutation.mutate(survey.id)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Bookmark"
                >
                  {survey.viewerState?.bookmarked ? (
                    <BookmarkCheck className="size-6 text-primary" />
                  ) : (
                    <Bookmark className="size-6" />
                  )}
                </button>
              </div>

              <Card>
                <CardContent className="space-y-4 p-5">
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {survey.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {survey.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="outline">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> Time
                      </p>
                      <p className="font-medium">{survey.estimatedTimeMinutes} min</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="size-3.5" /> Reward
                      </p>
                      <p className="font-medium">{survey.reward} pts</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-medium">
                        {new Date(survey.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="font-medium">{survey.views}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-4" /> {survey.currentResponses} /{" "}
                        {survey.targetResponses} responses
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
                  {survey.creator.firstName} {survey.creator.lastName}
                </span>
                {survey.institution && (
                  <span className="flex items-center gap-1">
                    · <Building2 className="size-3.5" /> {survey.institution.name}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardContent className="space-y-3 p-5">
                  {isOwner ? (
                    <Button asChild className="w-full">
                      <Link href="/my-surveys">Manage this survey</Link>
                    </Button>
                  ) : survey.viewerState?.completed ? (
                    <Button disabled className="w-full gap-2">
                      <CheckCircle2 className="size-4" /> Already completed
                    </Button>
                  ) : (
                    <Button asChild className="w-full gap-2">
                      <a href={survey.surveyUrl} target="_blank" rel="noreferrer">
                        Open survey <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}

                  {canParticipate && (
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full">
                          I&apos;ve completed it
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm completion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Confirm you completed this survey to earn {survey.reward} points.
                          </p>
                          {survey.completionCode !== null && (
                            <div className="space-y-1.5">
                              <Label htmlFor="completionCode">Completion code</Label>
                              <Input
                                id="completionCode"
                                value={completionCode}
                                onChange={(e) => setCompletionCode(e.target.value)}
                                placeholder="Shown at the end of the survey"
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
                            Confirm & earn points
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {!isOwner && (
                    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full gap-1.5 text-muted-foreground">
                          <Flag className="size-3.5" /> Report survey
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report this survey</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Select value={reportReason} onValueChange={setReportReason}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {reportReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {reason.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Additional details (optional)"
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleReport} disabled={reportMutation.isPending} className="w-full">
                            Submit report
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                ← Back
              </Button>
            </div>
          </div>
        );
      }}
    </AppShell>
  );
}
