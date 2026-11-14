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
        { label: "Overview", href: "/school", icon: BarChart3 },
        { label: "People & Codes", href: "/school/users", icon: Users },
        { label: "Classes", href: "/school/classes", icon: Layers },
        { label: "Import Spreadsheet", href: "/school/import", icon: Upload },
      ];
    }
    // system_admin
    return [
      { label: "Schools", href: "/system", icon: Building2 },
      { label: "AI Usage & Cost", href: "/system/usage", icon: BarChart3 },
      { label: "AI Diagnostics", href: "/system/ai-test", icon: Activity },
    ];
  }, [user.role]);

  const roleLabel = {
    teacher: "Teacher",
    school_admin: "School Admin",
    system_admin: "System Admin",
  }[user.role];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 text-neutral-900">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-surface border-b border-neutral-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary-600 text-white">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="font-bold text-navy-900">Rafiq</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop 248px, Mobile drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-[248px] shrink-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary-600 text-white shadow-xs">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-navy-900 text-lg tracking-tight">Rafiq</span>
                <span className="font-semibold text-primary-600 text-sm" dir="rtl">رفيق</span>
              </div>
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
        <div className="px-5 py-3 bg-neutral-50/80 border-b border-neutral-100 text-xs text-neutral-600">
          <div className="font-medium text-navy-900 truncate">
            {user.schoolName || (user.role === "system_admin" ? "Platform Control" : "School Workspace")}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-600" />
            <span>{roleLabel}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/teacher" && item.href !== "/school" && item.href !== "/system" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-600" : "text-neutral-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer with user info & logout */}
        <div className="p-4 border-t border-neutral-200/80 space-y-3 bg-surface">
          {isMockAi && <DemoBadge className="w-full justify-center" />}

          <div className="flex items-center justify-between pt-1">
            <div className="truncate">
              <p className="text-xs font-semibold text-neutral-900 truncate">{user.fullName}</p>
              <p className="text-2xs text-neutral-600 capitalize">{user.role.replace("_", " ")}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              isLoading={loggingOut}
              aria-label="Log out"
              className="text-neutral-600 hover:text-semantic-danger h-8 w-8 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top desktop bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 border-b border-neutral-200 bg-surface">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-navy-900">
              {user.schoolName || (user.role === "system_admin" ? "System Administration" : "Rafiq Workspace")}
            </h2>
            <Badge variant="primary" className="text-2xs">
              {roleLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {isMockAi && <DemoBadge />}
            <span className="text-xs text-neutral-600">
              Signed in as <strong className="text-neutral-900">{user.fullName}</strong>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

