"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Building2, CheckCircle2, FileCheck2, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInstitution, useInstitutionMembers } from "@/lib/institutions/use-institutions";

function StatBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function InstitutionDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: institution, isLoading } = useInstitution(params.id);
  const { data: membersData } = useInstitutionMembers(params.id);

  return (
    <AppShell>
      {() => {
        if (isLoading || !institution) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          );
        }

        return (
          <>
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F08080] to-[#FFDAB9] text-white">
                <Building2 className="size-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold">{institution.name}</h1>
                  {institution.verified && (
                    <Badge className="gap-1 bg-info text-info-foreground">
                      <CheckCircle2 className="size-3.5" /> {t("institutions.verified")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {[institution.city, institution.country].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatBlock icon={Users} label={t("institutions.members")} value={institution.stats.memberCount} />
              <StatBlock
                icon={FileCheck2}
                label={t("institutions.liveSurveys")}
                value={institution.stats.liveSurveyCount}
              />
              <StatBlock
                icon={CheckCircle2}
                label={t("institutions.completedSurveys")}
                value={institution.stats.completedSurveyCount}
              />
              <StatBlock
                icon={Sparkles}
                label={t("institutions.totalPoints")}
                value={institution.stats.totalPoints}
              />
            </div>

            <Card>
              <CardContent className="p-5">
                <p className="mb-3 text-sm font-semibold">{t("institutions.topContributors")}</p>
                <div className="space-y-3">
                  {institution.topContributors.map((member) => {
                    const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <p className="flex-1 text-sm">
                          {member.firstName} {member.lastName}
                        </p>
                        <span className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Sparkles className="size-3.5" /> {member.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="mb-3 text-sm font-semibold">
                  {t("institutions.allMembers", { count: membersData?.pagination?.total ?? 0 })}
                </p>
                <div className="divide-y divide-border">
                  {membersData?.data.map((member) => {
                    const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
                    return (
                      <div key={member.id} className="flex items-center gap-3 py-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {member.points} {t("surveys.card.pts")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        );
      }}
    </AppShell>
  );
}
