"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PollCard } from "@/components/polls/poll-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePolls } from "@/lib/polls/use-polls";
import { useCategories } from "@/lib/categories/use-categories";
import { localizedCategoryName } from "@/lib/categories/localized-name";
import { PollListParams } from "@/lib/polls/api";

export default function BrowsePollsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string | undefined>(undefined);
  const [sort, setSort] = React.useState<PollListParams["sort"]>("newest");
  const [page, setPage] = React.useState(1);

  const { data: categories } = useCategories();
  const { data, isLoading } = usePolls({ page, limit: 12, search, category, sort });

  return (
    <AppShell>
      {() => (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">{t("polls.browse.title")}</h1>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("polls.browse.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="ps-9"
              />
            </div>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("polls.browse.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("polls.browse.allCategories")}</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {localizedCategoryName(c, i18n.language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as PollListParams["sort"])}>
              <SelectTrigger className="w-full sm:w-44">
                <SlidersHorizontal className="size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("polls.browse.sortNewest")}</SelectItem>
                <SelectItem value="reward">{t("polls.browse.sortReward")}</SelectItem>
                <SelectItem value="deadline">{t("polls.browse.sortDeadline")}</SelectItem>
                <SelectItem value="time">{t("polls.browse.sortTime")}</SelectItem>
                <SelectItem value="popular">{t("polls.browse.sortPopular")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.data.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
              {data.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t("common.previous")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("common.pageOf", { page, total: data.pagination.totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-medium">{t("polls.browse.noResultsTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("polls.browse.noResultsBody")}</p>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
