"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useMe } from "@/lib/auth/use-auth";
import { AuthUser } from "@/types/auth";

export function AppShell({
  children,
}: {
  children: (user: AuthUser) => React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();

  React.useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--light-bg)]/30 to-transparent">
      <DashboardHeader user={user} />
      <main className="mx-auto max-w-6xl space-y-6 p-6">{children(user)}</main>
    </div>
  );
}
