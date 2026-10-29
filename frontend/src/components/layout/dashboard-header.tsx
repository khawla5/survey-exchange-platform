"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { GraduationCap, LogOut, PlusCircle, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useLogout } from "@/lib/auth/use-auth";
import { AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/surveys", key: "nav.browse" },
  { href: "/my-surveys", key: "nav.mySurveys" },
  { href: "/points", key: "nav.points" },
  { href: "/leaderboard", key: "nav.leaderboard" },
  { href: "/achievements", key: "nav.achievements" },
] as const;

export function DashboardHeader({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const logoutMutation = useLogout();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="size-5 text-primary" />
            {t("common.appName")}
          </div>
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname === link.href && "bg-primary/10 text-primary"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button asChild size="sm" className="hidden gap-1.5 md:flex">
            <Link href="/surveys/create">
              <PlusCircle className="size-4" />
              <span className="hidden lg:inline">{t("nav.create")}</span>
            </Link>
          </Button>

          <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 whitespace-nowrap">
            <Sparkles className="size-3.5" />
            {user.points}
          </Badge>

          <NotificationBell />
          <LanguageToggle />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ms-1">
                <Avatar className="size-9">
                  <AvatarImage src={user.avatar ?? undefined} alt={user.firstName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="size-4" />
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
