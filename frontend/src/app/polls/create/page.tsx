"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/categories/use-categories";
import { localizedCategoryName } from "@/lib/categories/localized-name";
import { useCreatePoll } from "@/lib/polls/use-polls";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(3, "polls.create.errors.titleMin").max(200),
  description: z.string().trim().min(10, "polls.create.errors.descriptionMin").max(5000),
  categoryId: z.string().uuid("polls.create.errors.categoryRequired"),
  pollUrl: z.string().trim().url("polls.create.errors.urlInvalid"),
  completionCode: z.string().trim().optional(),
  estimatedTimeMinutes: z.number().int().min(1).max(180),
  tags: z.string().optional(),
  targetCountry: z.string().trim().optional(),
  targetResponses: z.number().int().min(1).max(100000),
  reward: z.number().int().min(1).max(1000),
  deadline: z.string().min(1, "polls.create.errors.deadlineRequired"),
});

type FormValues = z.infer<typeof schema>;

const stepKeys = ["details", "targeting", "budget", "review"] as const;

export default function CreatePollPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const { data: categories } = useCategories();
  const createPollMutation = useCreatePoll();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      pollUrl: "",
      completionCode: "",
      estimatedTimeMinutes: 5,
      tags: "",
      targetCountry: "",
      targetResponses: 20,
      reward: 10,
      deadline: "",
    },
  });

  const values = watch();
  const publishingCost = (values.targetResponses || 0) * (values.reward || 0);

  const stepFields: Record<number, (keyof FormValues)[]> = {
    0: ["title", "description", "categoryId", "pollUrl", "estimatedTimeMinutes"],
    1: [],
    2: ["targetResponses", "reward", "deadline"],
    3: [],
  };

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, stepKeys.length - 1));
  }

  function submit(publish: boolean) {
    handleSubmit((formValues) => {
      createPollMutation.mutate(
        {
          title: formValues.title,
          description: formValues.description,
          categoryId: formValues.categoryId,
          pollUrl: formValues.pollUrl,
          completionCode: formValues.completionCode || undefined,
          estimatedTimeMinutes: formValues.estimatedTimeMinutes,
          tags: formValues.tags
            ? formValues.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
            : [],
          targetCountry: formValues.targetCountry || undefined,
          targetResponses: formValues.targetResponses,
          reward: formValues.reward,
          deadline: new Date(formValues.deadline).toISOString(),
          publish,
        },
        {
          onSuccess: (poll) => {
            toast.success(publish ? t("polls.create.published") : t("polls.create.draftSaved"));
            router.push(`/polls/${poll.id}`);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    })();
  }

  return (
    <AppShell>
      {(user) => (
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold">{t("polls.create.title")}</h1>

          <div className="flex items-center gap-2">
            {stepKeys.map((key, i) => (
              <div key={key} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                    i < step
                      ? "bg-success text-white"
                      : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </div>
                <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>
                  {t(`polls.create.steps.${key}`)}
                </span>
                {i < stepKeys.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="title">{t("polls.create.fields.title")}</Label>
                      <Input id="title" {...register("title")} />
                      {errors.title && (
                        <p className="text-xs text-destructive">{t(errors.title.message as string)}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description">{t("polls.create.fields.description")}</Label>
                      <textarea
                        id="description"
                        rows={4}
                        className="w-full rounded-[14px] border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-xs text-destructive">
                          {t(errors.description.message as string)}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>{t("polls.create.fields.category")}</Label>
                        <Select onValueChange={(v) => setValue("categoryId", v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("polls.create.fields.categoryPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {localizedCategoryName(c, i18n.language)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && (
                          <p className="text-xs text-destructive">
                            {t(errors.categoryId.message as string)}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="estimatedTimeMinutes">
                          {t("polls.create.fields.estimatedTime")}
                        </Label>
                        <Input
                          id="estimatedTimeMinutes"
                          type="number"
                          {...register("estimatedTimeMinutes", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pollUrl">{t("polls.create.fields.pollUrl")}</Label>
                      <Input id="pollUrl" placeholder="https://" {...register("pollUrl")} />
                      {errors.pollUrl && (
                        <p className="text-xs text-destructive">
                          {t(errors.pollUrl.message as string)}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="completionCode">
                          {t("polls.create.fields.completionCode")}
                        </Label>
                        <Input id="completionCode" {...register("completionCode")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tags">{t("polls.create.fields.tags")}</Label>
                        <Input
                          id="tags"
                          placeholder={t("polls.create.fields.tagsPlaceholder")}
                          {...register("tags")}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t("polls.create.fields.targetingHint")}
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="targetCountry">{t("polls.create.fields.targetCountry")}</Label>
                      <Input id="targetCountry" {...register("targetCountry")} />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="targetResponses">
                          {t("polls.create.fields.targetResponses")}
                        </Label>
                        <Input
                          id="targetResponses"
                          type="number"
                          {...register("targetResponses", { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reward">{t("polls.create.fields.reward")}</Label>
                        <Input
                          id="reward"
                          type="number"
                          {...register("reward", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="deadline">{t("polls.create.fields.deadline")}</Label>
                      <Input id="deadline" type="date" {...register("deadline")} />
                      {errors.deadline && (
                        <p className="text-xs text-destructive">
                          {t(errors.deadline.message as string)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 rounded-2xl bg-muted/60 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("polls.create.publishingCost")}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Sparkles className="size-4 text-primary" /> {publishingCost}{" "}
                          {t("polls.card.pts")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("polls.create.yourBalance")}</span>
                        <span className="font-medium">
                          {user.points} {t("polls.card.pts")}
                        </span>
                      </div>
                      {publishingCost > user.points && (
                        <p className="text-xs text-destructive">
                          {t("polls.create.insufficientFunds")}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("polls.create.review.title")}</span>
                      <span className="font-medium">{values.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("polls.create.review.responsesReward")}
                      </span>
                      <span className="font-medium">
                        {values.targetResponses} × {values.reward} {t("polls.card.pts")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("polls.create.review.deadline")}
                      </span>
                      <span className="font-medium">{values.deadline}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="text-muted-foreground">
                        {t("polls.create.review.totalCost")}
                      </span>
                      <span className="font-semibold text-primary">
                        {publishingCost} {t("polls.card.pts")}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="icon-flip size-4" /> {t("common.back")}
            </Button>

            {step < stepKeys.length - 1 ? (
              <Button onClick={goNext} className="gap-1">
                {t("common.next")} <ChevronRight className="icon-flip size-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => submit(false)}
                  disabled={createPollMutation.isPending}
                >
                  {t("polls.create.saveDraft")}
                </Button>
                <Button
                  onClick={() => submit(true)}
                  disabled={createPollMutation.isPending || publishingCost > user.points}
                >
                  {createPollMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
                  {t("polls.create.publishNow")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
