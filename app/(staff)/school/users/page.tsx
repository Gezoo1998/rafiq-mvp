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
  Edit,
  GraduationCap,
  Filter,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">People & Access Codes</h1>
          <p className="text-sm text-neutral-600">
            Search students and teachers, create individual accounts, or regenerate login codes
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Person</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, student ID, or last 4 digits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-neutral-200 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button type="submit" variant="secondary" size="md">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-600">Loading directory...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-600">
              No matching people found. Try adjusting your search or filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase border-y border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-start">Name</th>
                    <th className="px-6 py-3 text-start">Role / Details</th>
                    <th className="px-6 py-3 text-start">Code Last 4</th>
                    <th className="px-6 py-3 text-start">Status</th>
                    <th className="px-6 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-navy-900">
                        {u.fullName}
                        {u.externalId && (
                          <span className="block text-xs font-mono font-normal text-neutral-600">
                            ID: {u.externalId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="primary" className="text-2xs capitalize">
                            {u.role}
                          </Badge>
                          {u.grade && (
                            <span className="text-xs text-neutral-600">
                              Grade {u.grade} ({u.curriculum})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-700">
                          ••••-••••-{u.codeLast4}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.status === "active" ? "success" : "danger"}>
                          {u.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateCode(u)}
                            isLoading={regeneratingId === u.id}
                            title="Regenerate Code"
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            <KeyRound className="h-3.5 w-3.5 mr-1" />
                            <span>New Code</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(u)}
                            className={u.status === "active" ? "text-neutral-400 hover:text-semantic-danger" : "text-semantic-success"}
                            title={u.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {u.status === "active" ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Create Person */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>
              Create an individual student or teacher and generate their personal access code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5 text-start">
              <label className="text-sm font-medium text-neutral-900">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateRole("student")}
                  className={`py-2 text-sm font-semibold rounded-md border text-center transition-colors ${
                    createRole === "student"
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-surface text-neutral-600"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setCreateRole("teacher")}
                  className={`py-2 text-sm font-semibold rounded-md border text-center transition-colors ${
                    createRole === "teacher"
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-surface text-neutral-600"
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Sara Al-Otaibi"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              required
            />

            <Input
              label="External ID (Optional)"
              placeholder="School's student/staff ID"
              value={createExtId}
              onChange={(e) => setCreateExtId(e.target.value)}
            />

            {createRole === "student" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-start">
                    <label className="text-sm font-medium text-neutral-900">Grade</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900"
                      value={createGrade}
                      onChange={(e) => setCreateGrade(e.target.value)}
                    >
                      <option value="6">Grade 6</option>
                      <option value="7">Grade 7</option>
                      <option value="8">Grade 8</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-start">
                    <label className="text-sm font-medium text-neutral-900">Curriculum</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900"
                      value={createCurriculum}
                      onChange={(e) => setCreateCurriculum(e.target.value as any)}
                    >
                      <option value="american">American</option>
                      <option value="cambridge">Cambridge</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-start">
                  <label className="text-sm font-medium text-neutral-900">Tutoring Language</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900"
                    value={createLang}
                    onChange={(e) => setCreateLang(e.target.value as any)}
                  >
                    <option value="mixed">Mixed (Arabic explanations + English terms)</option>
                    <option value="en">English only</option>
                    <option value="ar">Arabic only</option>
                  </select>
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creating}>
                Create & Generate Code
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

