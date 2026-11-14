"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  Building2,
  Plus,
  UserPlus,
  Power,
  PowerOff,
  CheckCircle2,
  AlertCircle,
  Globe,
  Coins,
} from "lucide-react";

interface School {
  id: string;
  name: string;
  city: string;
  defaultLanguageMode: "en" | "ar" | "mixed";
  aiDailyTokenCap: number;
  isActive: boolean;
  createdAt: string;
}

export default function SystemSchoolsPage() {
  const [schools, setSchools] = React.useState<School[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create school dialog
  const [createSchoolOpen, setCreateSchoolOpen] = React.useState(false);
  const [newSchoolName, setNewSchoolName] = React.useState("");
  const [newSchoolCity, setNewSchoolCity] = React.useState("");
  const [newSchoolLang, setNewSchoolLang] = React.useState<"en" | "ar" | "mixed">("mixed");
  const [newSchoolCap, setNewSchoolCap] = React.useState("2000000");
  const [creatingSchool, setCreatingSchool] = React.useState(false);

  // Create admin dialog
  const [createAdminOpen, setCreateAdminOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);
  const [adminFullName, setAdminFullName] = React.useState("");
  const [creatingAdmin, setCreatingAdmin] = React.useState(false);

  // Credential once dialog
  const [credDialogOpen, setCredDialogOpen] = React.useState(false);
  const [createdAdminCreds, setCreatedAdminCreds] = React.useState<{ name: string; code: string } | null>(null);

  const fetchSchools = async () => {
    try {
      const res = await fetch("/api/system/schools");
      const data = await res.json();
      if (res.ok) {
        setSchools(data.schools || []);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSchools();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolCity.trim()) return;

    setCreatingSchool(true);
    try {
      const res = await fetch("/api/system/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSchoolName.trim(),
          city: newSchoolCity.trim(),
          defaultLanguageMode: newSchoolLang,
          aiDailyTokenCap: parseInt(newSchoolCap, 10) || 2000000,
        }),
      });

      if (res.ok) {
        setCreateSchoolOpen(false);
        setNewSchoolName("");
        setNewSchoolCity("");
        fetchSchools();
      }
    } finally {
      setCreatingSchool(false);
    }
  };

  const handleToggleSchoolStatus = async (school: School) => {
    try {
      const res = await fetch(`/api/system/schools/${school.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !school.isActive }),
      });
      if (res.ok) {
        fetchSchools();
      }
    } catch {
      // ignore
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool || !adminFullName.trim()) return;

    setCreatingAdmin(true);
    try {
      const res = await fetch(`/api/system/schools/${selectedSchool.id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: adminFullName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreateAdminOpen(false);
        setCreatedAdminCreds({
          name: data.user.fullName,
          code: data.code,
        });
        setCredDialogOpen(true);
        setAdminFullName("");
      }
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Schools Management</h1>
          <p className="text-sm text-neutral-600">
            Create and configure schools, manage daily AI limits, and provision school administrators
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateSchoolOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New School</span>
        </Button>
      </div>

      {/* School Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-lg bg-neutral-200/50 animate-pulse" />
          <div className="h-44 rounded-lg bg-neutral-200/50 animate-pulse" />
        </div>
      ) : schools.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy-900">No schools yet</h3>
          <p className="text-sm text-neutral-600 mb-4 max-w-sm mx-auto">
            Get started by adding your first school and provisioning its administrator.
          </p>
          <Button variant="primary" onClick={() => setCreateSchoolOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add School
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((school) => (
            <Card key={school.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold">{school.name}</CardTitle>
                    <CardDescription>{school.city}, Saudi Arabia</CardDescription>
                  </div>
                  <Badge variant={school.isActive ? "success" : "danger"}>
                    {school.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-neutral-50 rounded-md border border-neutral-100">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Globe className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Language: <strong className="text-neutral-900 uppercase">{school.defaultLanguageMode}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Coins className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Daily Cap: <strong className="text-neutral-900">{(school.aiDailyTokenCap / 1000).toLocaleString()}k</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedSchool(school);
                      setCreateAdminOpen(true);
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary-600" />
                    <span>Create Admin</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleSchoolStatus(school)}
                    className={school.isActive ? "text-neutral-600 hover:text-semantic-danger text-xs" : "text-semantic-success text-xs"}
                  >
                    {school.isActive ? (
                      <>
                        <PowerOff className="h-3.5 w-3.5 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="h-3.5 w-3.5 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Create School */}
      <Dialog open={createSchoolOpen} onOpenChange={setCreateSchoolOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>
              Register an educational institution on Rafiq platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSchool} className="space-y-4 py-2">
            <Input
              label="School Name"
              placeholder="e.g. Riyadh International Academy"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              required
            />
            <Input
              label="City"
              placeholder="e.g. Riyadh, Jeddah, Dammam"
              value={newSchoolCity}
              onChange={(e) => setNewSchoolCity(e.target.value)}
              required
            />
            <div className="space-y-1.5 text-start">
              <label className="text-sm font-medium text-neutral-900">Default Language Mode</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={newSchoolLang}
                onChange={(e) => setNewSchoolLang(e.target.value as any)}
              >
                <option value="mixed">Mixed (Arabic explanations + English terms)</option>
                <option value="en">English only</option>
                <option value="ar">Arabic only</option>
              </select>
            </div>
            <Input
              label="Daily Token Cap"
              type="number"
              value={newSchoolCap}
              onChange={(e) => setNewSchoolCap(e.target.value)}
              helperText="Default: 2,000,000 tokens per day"
              required
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateSchoolOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creatingSchool}>
                Create School
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Create School Admin */}
      <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provision School Administrator</DialogTitle>
            <DialogDescription>
              Create an administrative account for <span className="font-semibold">{selectedSchool?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4 py-2">
            <Input
              label="Administrator Full Name"
              placeholder="e.g. Dr. Khalid Al-Mansoor"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              required
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateAdminOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creatingAdmin}>
                Generate Admin Code
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: One-Time Credential Display */}
      {createdAdminCreds && (
        <CredentialOnceDialog
          open={credDialogOpen}
          onOpenChange={setCredDialogOpen}
          userName={createdAdminCreds.name}
          userRole="School Administrator"
          code={createdAdminCreds.code}
        />
      )}
    </div>
  );
}
