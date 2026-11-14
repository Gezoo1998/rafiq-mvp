"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
  Check,
  ShieldAlert,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface ImportErrorItem {
  sheet: string;
  row: number;
  column: string;
  message: string;
}

interface CredentialItem {
  name: string;
  role: "Student" | "Teacher";
  class: string;
  grade: string;
  code: string;
}

export default function ImportWizardPage() {
  const [step, setStep] = React.useState<Step>(1);

  // File upload state
  const [file, setFile] = React.useState<File | null>(null);
  const [previewing, setPreviewing] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any>(null);

  // Commit state
  const [committing, setCommitting] = React.useState(false);
  const [credentials, setCredentials] = React.useState<CredentialItem[]>([]);
  const [commitSummary, setCommitSummary] = React.useState<any>(null);

  const handleDownloadTemplate = () => {
    window.location.href = "/api/school/import/template";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndPreview = async () => {
    if (!file) return;

    setPreviewing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/school/import/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Failed to preview file");
        return;
      }

      setPreviewData(data);
      setStep(3); // Go to review step
    } catch {
      alert("Network error processing spreadsheet");
    } finally {
      setPreviewing(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData?.batchId) return;

    setCommitting(true);
    try {
      const res = await fetch(`/api/school/import/${previewData.batchId}/commit`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Failed to commit import");
        return;
      }

      setCredentials(data.credentials || []);
      setCommitSummary({
        students: data.createdStudents,
        teachers: data.createdTeachers,
        classes: data.createdClasses,
      });
      setStep(4); // Go to Done / Credentials step
    } catch {
      alert("Error committing import");
    } finally {
      setCommitting(false);
    }
  };

  const handleExportCredentials = async (format: "xlsx" | "pdf") => {
    try {
      const res = await fetch("/api/school/credentials/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          credentials,
        }),
      });

      if (format === "xlsx") {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rafiq-credentials.xlsx";
        a.click();
      } else {
        // Open printable cards window
        const html = await res.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 300);
        }
      }
    } catch {
      alert("Error exporting credentials");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-indigo-700" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Spreadsheet Import Wizard
          </h1>
        </div>
        <p className="text-sm text-neutral-500 ml-3">
          Onboard school cohorts in bulk, configure curriculum standards, and generate secure login cards
        </p>
      </div>

      {/* Modern Stepper Header */}
      <div className="grid grid-cols-4 gap-2 p-1.5 bg-neutral-100/80 rounded-2xl border border-neutral-200/80">
        {[
          { num: 1, label: "Template" },
          { num: 2, label: "Upload" },
          { num: 3, label: "Validate" },
          { num: 4, label: "Credentials" },
        ].map((s) => {
          const isCurrent = step === s.num;
          const isPast = step > s.num;

          return (
            <div
              key={s.num}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                isCurrent
                  ? "bg-white shadow-xs border border-neutral-200 text-navy-900 font-bold"
                  : isPast
                  ? "text-emerald-700 font-semibold"
                  : "text-neutral-400 font-medium"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrent
                    ? "bg-primary-600 text-white"
                    : isPast
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {isPast ? <Check className="h-3.5 w-3.5" /> : s.num}
              </span>
              <span className="text-xs truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Download Template */}
      {step === 1 && (
        <Card className="rounded-3xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary-500 to-indigo-600" />
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-navy-900">
                  Step 1: Download Official Excel Template
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500 mt-0.5">
                  Pre-formatted workbook with validation rules and example entries
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
            <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-primary-50/60 rounded-2xl border border-primary-200/60 text-xs text-navy-900 space-y-3">
              <h4 className="font-extrabold text-primary-900 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                Template Specifications & Guidelines:
              </h4>
              <ul className="space-y-1.5 text-neutral-700 list-disc pl-5">
                <li>
                  <strong className="text-navy-900">Students Sheet:</strong> Enter full student names, grade (6, 7, 8), curriculum (<code className="bg-white px-1 py-0.5 rounded border border-neutral-200">american</code> or <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">cambridge</code>), and class section code (e.g. <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">6A</code>).
                </li>
                <li>
                  <strong className="text-navy-900">Teachers Sheet:</strong> Enter educator full names, subjects (<code className="bg-white px-1 py-0.5 rounded border border-neutral-200">math</code>, <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">science</code>, <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">english</code>), and assigned class sections.
                </li>
                <li>
                  Class sections specified in your roster will be created automatically in your school hierarchy if not already present.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleDownloadTemplate}
                className="gap-2 rounded-xl text-xs font-bold shadow-md shadow-primary-500/25 h-12 px-6"
              >
                <Download className="h-4 w-4" />
                <span>Download rafiq-import-template.xlsx</span>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStep(2)}
                className="rounded-xl text-xs font-semibold h-12 px-6"
              >
                <span>Already filled out? Continue to Upload</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload */}
      {step === 2 && (
        <Card className="rounded-3xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-sky-600" />
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-navy-900">
                  Step 2: Upload Completed Spreadsheet
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500 mt-0.5">
                  Select your updated roster workbook (.xlsx, max 5 MB)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
            <div className="border-2 border-dashed border-neutral-300 hover:border-primary-500 rounded-3xl p-10 text-center bg-neutral-50/60 hover:bg-primary-50/20 transition-all cursor-pointer">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-navy-900">
                    {file ? file.name : "Click to select or drag and drop your completed file"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {file ? `${(file.size / 1024).toFixed(1)} KB uploaded` : "Standard Microsoft Excel format (.xlsx)"}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl text-xs">
                Back to Template
              </Button>
              <Button
                variant="primary"
                disabled={!file}
                isLoading={previewing}
                onClick={handleUploadAndPreview}
                className="gap-2 rounded-xl text-xs font-bold px-6 h-11 shadow-md shadow-primary-500/20"
              >
                <span>Upload & Validate Roster</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Commit */}
      {step === 3 && previewData && (
        <Card className="rounded-3xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-sky-500 to-emerald-600" />
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-navy-900">
                  Step 3: Verification & Batch Summary
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500 mt-0.5">
                  Confirm row counts and resolve any schema validation errors before database commit
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
            {/* Counts breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
                <span className="text-2xs uppercase font-bold text-neutral-500">Students Parsed</span>
                <p className="text-2xl font-black text-navy-900 mt-1">{previewData.summary.totalStudents}</p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
                <span className="text-2xs uppercase font-bold text-neutral-500">Teachers Parsed</span>
                <p className="text-2xl font-black text-navy-900 mt-1">{previewData.summary.totalTeachers}</p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
                <span className="text-2xs uppercase font-bold text-neutral-500">Classes Mapped</span>
                <p className="text-2xl font-black text-navy-900 mt-1">{previewData.summary.totalClasses}</p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
                <span className="text-2xs uppercase font-bold text-neutral-500">Validation Errors</span>
                <p className={`text-2xl font-black mt-1 ${previewData.errors.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {previewData.errors.length}
                </p>
              </div>
            </div>

            {/* Errors Table if any */}
            {previewData.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4" />
                  <span>Validation Issues Detected ({previewData.errors.length})</span>
                </div>
                <div className="max-h-60 overflow-y-auto border border-rose-200 rounded-2xl divide-y divide-rose-100 bg-rose-50/50 text-xs">
                  {previewData.errors.map((err: ImportErrorItem, idx: number) => (
                    <div key={idx} className="p-3 flex items-start gap-2">
                      <span className="font-bold text-rose-950 shrink-0">
                        Row {err.row} ({err.sheet}):
                      </span>
                      <span className="text-rose-800">
                        <strong className="underline">{err.column}</strong> — {err.message}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-500">
                  Please fix these items in your original spreadsheet file and upload again.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl text-xs">
                Upload Different File
              </Button>
              <Button
                variant="primary"
                disabled={previewData.errors.length > 0}
                isLoading={committing}
                onClick={handleCommit}
                className="gap-2 rounded-xl text-xs font-bold px-6 h-11 shadow-md shadow-primary-500/20"
              >
                <span>Commit & Generate Access Codes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done & Download Credentials */}
      {step === 4 && (
        <Card className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-white to-emerald-50/20 shadow-xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardHeader className="text-center p-8 pb-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Roster Import Completed Successfully!
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-neutral-600 mt-1">
              Created {commitSummary?.students} students, {commitSummary?.teachers} teachers, and {commitSummary?.classes} class sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3.5">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold text-amber-950">Crucial: Export and save credentials immediately</p>
                <p className="leading-relaxed">
                  For privacy and cryptographic security, personal access codes are displayed <strong>only during this session</strong>. They are encrypted with a salted HMAC pepper and cannot be retrieved in plaintext from the database later.
                </p>
              </div>
            </div>

            {/* Download Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleExportCredentials("xlsx")}
                className="gap-3 h-16 rounded-2xl shadow-md shadow-primary-500/20"
              >
                <FileSpreadsheet className="h-6 w-6 text-white" />
                <div className="text-start">
                  <div className="font-bold text-sm">Download Excel Credentials</div>
                  <div className="text-2xs opacity-80 font-normal">All account names and login codes</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleExportCredentials("pdf")}
                className="gap-3 h-16 rounded-2xl border-primary-200 hover:bg-primary-50"
              >
                <Printer className="h-6 w-6 text-primary-600" />
                <div className="text-start">
                  <div className="font-bold text-sm text-navy-900">Print Student Cards (PDF)</div>
                  <div className="text-2xs text-neutral-500 font-normal">8 ready-to-cut login slips per A4 sheet</div>
                </div>
              </Button>
            </div>

            {/* Table of created credentials preview */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Generated Accounts Preview ({credentials.length})
                </h4>
                <Badge variant="primary" className="text-2xs font-semibold">
                  Showing First 30
                </Badge>
              </div>
              <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-2xl divide-y divide-neutral-100 text-xs bg-white">
                {credentials.slice(0, 30).map((c, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <span className="font-bold text-navy-900">{c.name}</span>
                      <span className="text-neutral-400 ml-2">({c.role} • {c.class})</span>
                    </div>
                    <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                      {c.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
