"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/notifications/use-notifications";
import { useNotificationSocket } from "@/lib/socket/use-notification-socket";
import { cn } from "@/lib/utils";
import type { TFunction } from "i18next";

function timeAgo(dateString: string, t: TFunction): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return t("notifications.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.hoursAgo", { count: hours });
  return t("notifications.daysAgo", { count: Math.floor(hours / 24) });
}

export function NotificationBell() {
  const { t } = useTranslation();
  useNotificationSocket(true);
  const { data } = useNotifications(1);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label={t("notifications.title")}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <p className="text-sm font-semibold">{t("notifications.title")}</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 p-1 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="size-3.5" /> {t("notifications.markAllRead")}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
          ) : (
            items.map((notification) => (
              <Link
                key={notification.id}
                href={notification.actionUrl ?? "#"}
                onClick={() => !notification.readAt && markRead.mutate(notification.id)}
                className={cn(
                  "block border-b border-border p-3 text-sm hover:bg-muted",
                  !notification.readAt && "bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{notification.title}</p>
                  {!notification.readAt && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {timeAgo(notification.createdAt, t)}
                </p>
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
