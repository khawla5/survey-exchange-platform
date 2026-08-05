"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
import { useCreateSurvey } from "@/lib/surveys/use-surveys";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  categoryId: z.string().uuid("Choose a category"),
  surveyUrl: z.string().trim().url("Enter a valid survey link"),
  completionCode: z.string().trim().optional(),
  estimatedTimeMinutes: z.number().int().min(1).max(180),
  tags: z.string().optional(),
  targetCountry: z.string().trim().optional(),
  targetResponses: z.number().int().min(1).max(100000),
  reward: z.number().int().min(1).max(1000),
  deadline: z.string().min(1, "Choose a deadline"),
});

type FormValues = z.infer<typeof schema>;

const steps = ["Details", "Targeting", "Budget", "Review"] as const;

export default function CreateSurveyPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const { data: categories } = useCategories();
  const createSurveyMutation = useCreateSurvey();

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
      surveyUrl: "",
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
    0: ["title", "description", "categoryId", "surveyUrl", "estimatedTimeMinutes"],
    1: [],
    2: ["targetResponses", "reward", "deadline"],
    3: [],
  };

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function submit(publish: boolean) {
    handleSubmit((formValues) => {
      createSurveyMutation.mutate(
        {
          title: formValues.title,
          description: formValues.description,
          categoryId: formValues.categoryId,
          surveyUrl: formValues.surveyUrl,
          completionCode: formValues.completionCode || undefined,
          estimatedTimeMinutes: formValues.estimatedTimeMinutes,
          tags: formValues.tags
            ? formValues.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          targetCountry: formValues.targetCountry || undefined,
          targetResponses: formValues.targetResponses,
          reward: formValues.reward,
          deadline: new Date(formValues.deadline).toISOString(),
          publish,
        },
        {
          onSuccess: (survey) => {
            toast.success(publish ? "Survey published!" : "Draft saved");
            router.push(`/surveys/${survey.id}`);
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
          <h1 className="text-2xl font-semibold">Create a survey</h1>

          <div className="flex items-center gap-2">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
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
                  {label}
                </span>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
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
                      <Label htmlFor="title">Survey title</Label>
                      <Input id="title" {...register("title")} />
                      {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        rows={4}
                        className="w-full rounded-[14px] border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-xs text-destructive">{errors.description.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Select onValueChange={(v) => setValue("categoryId", v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && (
                          <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="estimatedTimeMinutes">Est. time (min)</Label>
                        <Input
                          id="estimatedTimeMinutes"
                          type="number"
                          {...register("estimatedTimeMinutes", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="surveyUrl">Survey link (external form)</Label>
                      <Input id="surveyUrl" placeholder="https://" {...register("surveyUrl")} />
                      {errors.surveyUrl && (
                        <p className="text-xs text-destructive">{errors.surveyUrl.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="completionCode">Completion code (optional)</Label>
                        <Input id="completionCode" {...register("completionCode")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input id="tags" placeholder="ux, research" {...register("tags")} />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Optionally narrow who this survey is recommended to. Leave blank to reach
                      everyone.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="targetCountry">Target country</Label>
                      <Input id="targetCountry" {...register("targetCountry")} />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="targetResponses">Target responses</Label>
                        <Input id="targetResponses" type="number" {...register("targetResponses", { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reward">Reward per response (pts)</Label>
                        <Input id="reward" type="number" {...register("reward", { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input id="deadline" type="date" {...register("deadline")} />
                      {errors.deadline && (
                        <p className="text-xs text-destructive">{errors.deadline.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 rounded-2xl bg-muted/60 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Publishing cost</span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Sparkles className="size-4 text-primary" /> {publishingCost} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your balance</span>
                        <span className="font-medium">{user.points} pts</span>
                      </div>
                      {publishingCost > user.points && (
                        <p className="text-xs text-destructive">
                          You don&apos;t have enough points to publish this survey yet — you can
                          save it as a draft.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium">{values.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Responses × Reward</span>
                      <span className="font-medium">
                        {values.targetResponses} × {values.reward} pts
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">{values.deadline}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="text-muted-foreground">Total cost</span>
                      <span className="font-semibold text-primary">{publishingCost} pts</span>
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
              <ChevronLeft className="size-4" /> Back
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={goNext} className="gap-1">
                Next <ChevronRight className="size-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => submit(false)}
                  disabled={createSurveyMutation.isPending}
                >
                  Save draft
                </Button>
                <Button
                  onClick={() => submit(true)}
                  disabled={createSurveyMutation.isPending || publishingCost > user.points}
                >
                  {createSurveyMutation.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
                  Publish now
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
