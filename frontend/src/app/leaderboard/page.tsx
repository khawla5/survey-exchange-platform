"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Building2, Crown, Medal, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard } from "@/lib/leaderboard/use-leaderboard";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/types/auth";

const rankColors = ["text-[#F59E0B]", "text-[#9CA3AF]", "text-[#B45309]"];

function LeaderboardContent({ user }: { user: AuthUser }) {
  const [period, setPeriod] = React.useState<"weekly" | "monthly" | "alltime">("alltime");
  const { data, isLoading } = useLeaderboard(period);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {data.map((entry, i) => {
              const initials = `${entry.firstName[0]}${entry.lastName[0]}`.toUpperCase();
              const isMe = entry.id === user.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className={cn("flex items-center gap-4 p-4", isMe && "bg-primary/5")}
                >
                  <div className="flex w-8 items-center justify-center">
                    {entry.rank <= 3 ? (
                      <Medal className={cn("size-5", rankColors[entry.rank - 1])} />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      {entry.firstName} {entry.lastName}
                      {isMe && <span className="text-xs text-primary">(you)</span>}
                      {entry.institution?.verified && <Building2 className="size-3.5 text-info" />}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.institution?.name ?? entry.country ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <Sparkles className="size-4" /> {entry.periodPoints}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Crown className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="font-medium">No activity in this period yet</p>
        </div>
      )}
    </>
  );
}

export default function LeaderboardPage() {
  return <AppShell>{(user) => <LeaderboardContent user={user} />}</AppShell>;
}
