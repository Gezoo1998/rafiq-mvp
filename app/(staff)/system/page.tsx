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
  Globe,
  Coins,
  MapPin,
  ShieldCheck,
  Server,
  Sparkles,
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
      setLoading(true);
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-indigo-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              System Operations
            </h1>
          </div>
          <p className="text-sm text-neutral-500 ml-3">
            Register educational networks, provision tenant administrators, and regulate AI quotas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
            {schools.length} Tenant School{schools.length === 1 ? "" : "s"}
          </Badge>
          <Button
            variant="primary"
            onClick={() => setCreateSchoolOpen(true)}
            className="gap-2 shrink-0 rounded-xl font-bold text-xs shadow-md shadow-primary-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Register School</span>
          </Button>
        </div>
      </div>

      {/* School Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          <div className="h-48 rounded-3xl bg-neutral-200/60" />
          <div className="h-48 rounded-3xl bg-neutral-200/60" />
        </div>
      ) : schools.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border border-neutral-200 shadow-sm bg-white p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">No schools registered yet</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            Get started by adding your first educational institution and provisioning its initial administrator.
          </p>
          <Button variant="primary" onClick={() => setCreateSchoolOpen(true)} className="rounded-xl font-bold">
            <Plus className="h-4 w-4 mr-1.5" />
            Add First School
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {schools.map((school, idx) => {
            const accents = [
              "from-indigo-500 to-primary-600",
              "from-emerald-500 to-teal-600",
              "from-sky-500 to-blue-600",
              "from-amber-500 to-orange-600",
            ];
            const accent = accents[idx % accents.length];

            return (
              <Card
                key={school.id}
                className="rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden bg-white hover:border-primary-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-2 w-full bg-gradient-to-r ${accent}`} />
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl font-extrabold text-navy-900 tracking-tight">
                          {school.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary-600" />
                          <span>{school.city}, Saudi Arabia</span>
                        </CardDescription>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                          school.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            school.isActive ? "bg-emerald-500" : "bg-neutral-400"
                          }`}
                        />
                        {school.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Globe className="h-4 w-4 text-primary-600 shrink-0" />
                        <div>
                          <span className="text-2xs text-neutral-400 block font-medium">Default Mode</span>
                          <span className="font-bold text-navy-900 uppercase">{school.defaultLanguageMode}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-2xs text-neutral-400 block font-medium">Daily AI Limit</span>
                          <span className="font-bold text-navy-900">{(school.aiDailyTokenCap / 1000).toLocaleString()}k</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedSchool(school);
                      setCreateAdminOpen(true);
                    }}
                    className="gap-1.5 text-xs rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 font-bold"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary-600" />
                    <span>Provision Admin</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleSchoolStatus(school)}
                    className={`h-8 px-2.5 text-xs rounded-lg ${
                      school.isActive
                        ? "text-neutral-500 hover:text-rose-600 hover:bg-rose-50"
                        : "text-emerald-600 hover:bg-emerald-50"
                    }`}
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
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog: Create School */}
      <Dialog open={createSchoolOpen} onOpenChange={setCreateSchoolOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy-900">Register Educational Institution</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Provision a new school tenant on the Rafiq Socratic platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSchool} className="space-y-4 py-3">
            <Input
              label="School Name"
              placeholder="e.g. Riyadh International Academy"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              className="rounded-xl h-10 text-xs"
              required
            />
            <Input
              label="City"
              placeholder="e.g. Riyadh, Jeddah, Dammam"
              value={newSchoolCity}
              onChange={(e) => setNewSchoolCity(e.target.value)}
              className="rounded-xl h-10 text-xs"
              required
            />
            <div className="space-y-1 text-start">
              <label className="text-xs font-bold text-navy-900">Default Language Mode</label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                value={newSchoolLang}
                onChange={(e) => setNewSchoolLang(e.target.value as any)}
              >
                <option value="mixed">Mixed (Arabic explanations + English terms)</option>
                <option value="en">English Only</option>
                <option value="ar">Arabic Only (العربية)</option>
              </select>
            </div>
            <Input
              label="Daily AI Token Cap"
              type="number"
              value={newSchoolCap}
              onChange={(e) => setNewSchoolCap(e.target.value)}
              helperText="Default: 2,000,000 tokens per day"
              className="rounded-xl h-10 text-xs font-mono"
              required
            />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateSchoolOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creatingSchool} className="rounded-xl text-xs font-bold">
                Register School
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Create School Admin */}
      <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy-900">Provision Administrator</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Create an administrative account for <span className="font-bold text-navy-900">{selectedSchool?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4 py-3">
            <Input
              label="Administrator Full Name"
              placeholder="e.g. Dr. Khalid Al-Mansoor"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              className="rounded-xl h-10 text-xs"
              required
            />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateAdminOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creatingAdmin} className="rounded-xl text-xs font-bold">
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
