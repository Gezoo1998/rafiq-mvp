"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CredentialOnceDialog } from "@/components/ui/credential-once-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  KeyRound,
  PowerOff,
  Power,
  GraduationCap,
  Sparkles,
  School,
  CheckCircle,
  Copy,
} from "lucide-react";

interface UserItem {
  id: string;
  fullName: string;
  role: "student" | "teacher" | "school_admin";
  externalId: string | null;
  grade: number | null;
  curriculum: string | null;
  preferredLanguage: string | null;
  codeLast4: string;
  status: "active" | "inactive";
  lastLoginAt: string | null;
  createdAt: string;
}

export default function SchoolUsersPage() {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Create User modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createRole, setCreateRole] = React.useState<"student" | "teacher">("student");
  const [createName, setCreateName] = React.useState("");
  const [createExtId, setCreateExtId] = React.useState("");
  const [createGrade, setCreateGrade] = React.useState("6");
  const [createCurriculum, setCreateCurriculum] = React.useState<"american" | "cambridge">("american");
  const [createLang, setCreateLang] = React.useState<"en" | "ar" | "mixed">("mixed");
  const [creating, setCreating] = React.useState(false);

  // Credential once dialog
  const [credDialogOpen, setCredDialogOpen] = React.useState(false);
  const [createdCreds, setCreatedCreds] = React.useState<{ name: string; role: string; code: string } | null>(null);

  // Regenerating
  const [regeneratingId, setRegeneratingId] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/school/users?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setCreating(true);
    try {
      const payload: any = {
        fullName: createName.trim(),
        role: createRole,
        externalId: createExtId.trim() || null,
      };

      if (createRole === "student") {
        payload.grade = parseInt(createGrade, 10);
        payload.curriculum = createCurriculum;
        payload.preferredLanguage = createLang;
      }

      const res = await fetch("/api/school/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        setCreatedCreds({
          name: data.user.fullName,
          role: data.user.role === "student" ? "Student" : "Teacher",
          code: data.code,
        });
        setCredDialogOpen(true);
        setCreateName("");
        setCreateExtId("");
        fetchUsers();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateCode = async (user: UserItem) => {
    if (!confirm(`Are you sure you want to regenerate the access code for ${user.fullName}? Their previous code will immediately stop working.`)) {
      return;
    }

    setRegeneratingId(user.id);
    try {
      const res = await fetch(`/api/school/users/${user.id}/regenerate-code`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedCreds({
          name: user.fullName,
          role: user.role === "student" ? "Student" : "Teacher",
          code: data.code,
        });
        setCredDialogOpen(true);
        fetchUsers();
      }
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    const action = user.status === "active" ? "deactivate" : "activate";
    try {
      const res = await fetch(`/api/school/users/${user.id}/${action}`, {
        method: "POST",
      });
      if (res.ok) fetchUsers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-indigo-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              People & Access Codes
            </h1>
          </div>
          <p className="text-sm text-neutral-500 ml-3">
            Search school accounts, generate secure codes, and manage role assignments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
            {users.length} Registered User{users.length === 1 ? "" : "s"}
          </Badge>
          <Button
            variant="primary"
            onClick={() => setCreateOpen(true)}
            className="gap-2 shrink-0 rounded-xl font-bold text-xs shadow-md shadow-primary-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Person</span>
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="rounded-3xl border border-neutral-200/80 shadow-sm bg-white overflow-hidden p-2">
        <CardContent className="p-2 sm:p-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by student name, ID number, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs sm:text-sm text-navy-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <Button type="submit" variant="secondary" size="md" className="h-11 px-5 rounded-xl text-xs font-bold">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-neutral-500 space-y-2">
              <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded mx-auto" />
              <p>Loading user directory...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-sm text-neutral-500 space-y-3">
              <Users className="h-10 w-10 text-neutral-300 mx-auto" />
              <p className="font-bold text-navy-900">No matching people found</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Try adjusting your search query, selecting different role filters, or add a new person above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-neutral-100/60 text-2xs font-bold text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="px-6 sm:px-8 py-3.5 text-start">Person</th>
                    <th className="px-6 py-3.5 text-start">Role / Grade</th>
                    <th className="px-6 py-3.5 text-start">Security Code</th>
                    <th className="px-6 py-3.5 text-start">Status</th>
                    <th className="px-6 sm:px-8 py-3.5 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/70">
                  {users.map((u) => {
                    const initials = u.fullName
                      ? u.fullName
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "US";

                    const roleColor =
                      u.role === "student"
                        ? "from-indigo-500 to-primary-600"
                        : u.role === "teacher"
                        ? "from-emerald-500 to-teal-600"
                        : "from-amber-500 to-orange-600";

                    return (
                      <tr key={u.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 sm:px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${roleColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-navy-900 text-sm">{u.fullName}</div>
                              {u.externalId && (
                                <span className="text-2xs font-mono text-neutral-400">
                                  ID: {u.externalId}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                u.role === "student"
                                  ? "primary"
                                  : u.role === "teacher"
                                  ? "success"
                                  : "warning"
                              }
                              className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            >
                              {u.role === "student" ? (
                                <GraduationCap className="h-3 w-3 mr-1" />
                              ) : (
                                <Users className="h-3 w-3 mr-1" />
                              )}
                              {u.role}
                            </Badge>
                            {u.grade && (
                              <span className="text-xs text-neutral-500 font-medium">
                                Grade {u.grade} • {u.curriculum}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold bg-neutral-100/80 border border-neutral-200/80 px-2.5 py-1 rounded-lg text-neutral-700 tracking-wider">
                            ••••-••••-{u.codeLast4}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              u.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.status === "active" ? "bg-emerald-500" : "bg-neutral-400"
                              }`}
                            />
                            {u.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 sm:px-8 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRegenerateCode(u)}
                              isLoading={regeneratingId === u.id}
                              title="Regenerate Login Code"
                              className="text-xs h-8 px-3 rounded-lg border-primary-200 text-primary-700 hover:bg-primary-50 font-bold"
                            >
                              <KeyRound className="h-3.5 w-3.5 mr-1" />
                              <span>Reset Code</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(u)}
                              className={`h-8 w-8 p-0 rounded-lg ${
                                u.status === "active"
                                  ? "text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={u.status === "active" ? "Deactivate User" : "Activate User"}
                            >
                              {u.status === "active" ? (
                                <PowerOff className="h-3.5 w-3.5" />
                              ) : (
                                <Power className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Create Person */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy-900">Add School User</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Create an individual student or teacher and generate their personal Crockford access code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-3">
            <div className="space-y-1.5 text-start">
              <label className="text-xs font-bold text-navy-900">User Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateRole("student")}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border-2 text-center transition-all ${
                    createRole === "student"
                      ? "border-primary-600 bg-primary-50 text-primary-700 shadow-xs"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <GraduationCap className="h-4 w-4 mx-auto mb-1" />
                  Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setCreateRole("teacher")}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border-2 text-center transition-all ${
                    createRole === "teacher"
                      ? "border-primary-600 bg-primary-50 text-primary-700 shadow-xs"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <Users className="h-4 w-4 mx-auto mb-1" />
                  Teacher Account
                </button>
              </div>
            </div>

            <Input
              label="Full Legal Name"
              placeholder="e.g., Omar Al-Harbi"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="rounded-xl h-10 text-xs"
              required
            />

            <Input
              label="Student / Staff ID (Optional)"
              placeholder="School internal reference code"
              value={createExtId}
              onChange={(e) => setCreateExtId(e.target.value)}
              className="rounded-xl h-10 text-xs"
            />

            {createRole === "student" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-start">
                    <label className="text-xs font-bold text-navy-900">Grade</label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                      value={createGrade}
                      onChange={(e) => setCreateGrade(e.target.value)}
                    >
                      <option value="6">Grade 6</option>
                      <option value="7">Grade 7</option>
                      <option value="8">Grade 8</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-start">
                    <label className="text-xs font-bold text-navy-900">Curriculum</label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                      value={createCurriculum}
                      onChange={(e) => setCreateCurriculum(e.target.value as any)}
                    >
                      <option value="american">American</option>
                      <option value="cambridge">Cambridge</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-start">
                  <label className="text-xs font-bold text-navy-900">Tutor Language Preference</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                    value={createLang}
                    onChange={(e) => setCreateLang(e.target.value as any)}
                  >
                    <option value="mixed">Mixed (Arabic explanations + English terms)</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Only (العربية)</option>
                  </select>
                </div>
              </>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creating} className="rounded-xl text-xs font-bold">
                Generate Access Code
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Display Credentials */}
      {createdCreds && (
        <CredentialOnceDialog
          open={credDialogOpen}
          onOpenChange={setCredDialogOpen}
          userName={createdCreds.name}
          userRole={createdCreds.role}
          code={createdCreds.code}
        />
      )}
    </div>
  );
}
