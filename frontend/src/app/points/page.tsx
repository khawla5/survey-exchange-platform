"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePointsHistory } from "@/lib/points/use-points";
import { cn } from "@/lib/utils";

export default function PointsHistoryPage() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = usePointsHistory(page);

  return (
    <AppShell>
      {(user) => (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Points history</h1>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
              <Sparkles className="size-4" />
              <span className="font-semibold">{user.points} pts</span>
            </div>
          </div>

          <Card>
            <CardContent className="divide-y divide-border p-0">
              {isLoading ? (
                <div className="space-y-2 p-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : data && data.data.length > 0 ? (
                data.data.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full",
                          tx.amount >= 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {tx.amount >= 0 ? (
                          <ArrowDownLeft className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p
                        className={cn(
                          "font-semibold",
                          tx.amount >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">Balance: {tx.balanceAfter}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No transactions yet.
                </div>
              )}
            </CardContent>
          </Card>

          {data && data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
