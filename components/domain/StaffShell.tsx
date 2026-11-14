"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  BookOpen,
  Users,
  Building2,
  BarChart3,
  Upload,
  Cpu,
  LogOut,
  GraduationCap,
  Layers,
  Activity,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge } from "@/components/ui/level-chip";

interface StaffShellProps {
  user: {
    id: string;
    fullName: string;
    role: "teacher" | "school_admin" | "system_admin";
    schoolId?: string | null;
    schoolName?: string | null;
  };
  isMockAi: boolean;
  children: React.ReactNode;
}

export function StaffShell({ user, isMockAi, children }: StaffShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const navItems = React.useMemo(() => {
    if (user.role === "teacher") {
      return [
        { label: "Missions", href: "/teacher", icon: BookOpen },
        { label: "My Classes", href: "/teacher/classes", icon: GraduationCap },
      ];
    }
    if (user.role === "school_admin") {
      return [
        { label: "School Overview", href: "/school", icon: BarChart3 },
        { label: "People & Codes", href: "/school/users", icon: Users },
        { label: "Classes", href: "/school/classes", icon: Layers },
        { label: "Import Spreadsheet", href: "/school/import", icon: Upload },
      ];
    }
    // system_admin
    return [
      { label: "Schools Directory", href: "/system", icon: Building2 },
      { label: "AI Usage & Billing", href: "/system/usage", icon: BarChart3 },
      { label: "AI Diagnostics", href: "/system/ai-test", icon: Activity },
    ];
  }, [user.role]);

  const roleConfig = {
    teacher: {
      label: "Teacher",
      gradient: "from-emerald-500 to-teal-500",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    school_admin: {
      label: "School Admin",
      gradient: "from-purple-500 to-pink-500",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    },
    system_admin: {
      label: "System Admin",
      gradient: "from-amber-500 to-orange-500",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
  }[user.role];

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-primary-600 text-white shadow-xs">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="font-black text-navy-900 dark:text-white">Rafiq • رفيق</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop 256px, Mobile drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200/90 dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-[256px] shrink-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-navy-900 dark:text-white text-lg tracking-tight">Rafiq</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-xs" dir="rtl">رفيق</span>
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block -mt-0.5">
                Portal Workspace
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* School context tag */}
        <div className="px-5 py-3.5 bg-neutral-50/80 dark:bg-neutral-850/60 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="font-bold text-navy-900 dark:text-white truncate">
            {user.schoolName || (user.role === "system_admin" ? "Platform Control" : "School Workspace")}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${roleConfig.badgeClass}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              Boolean(pathname) &&
              (pathname === item.href ||
                (item.href !== "/teacher" &&
                  item.href !== "/school" &&
                  item.href !== "/system" &&
                  pathname?.startsWith(item.href)));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-primary-600 text-white shadow-md shadow-indigo-500/20 font-extrabold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-neutral-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer with user info & logout */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800 space-y-3 bg-white dark:bg-neutral-900">
          {isMockAi && <DemoBadge className="w-full justify-center" />}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-neutral-500 capitalize">{user.role.replace("_", " ")}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              isLoading={loggingOut}
              aria-label="Log out"
              className="text-neutral-400 hover:text-rose-600 h-8 w-8 p-0"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top desktop bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-navy-900 dark:text-white">
              {user.schoolName || (user.role === "system_admin" ? "System Administration" : "Rafiq Workspace")}
            </h2>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${roleConfig.badgeClass}`}>
              {roleConfig.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isMockAi && <DemoBadge />}
            <span className="text-xs text-neutral-500">
              Signed in as <strong className="text-neutral-900 dark:text-white font-bold">{user.fullName}</strong>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1240px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
