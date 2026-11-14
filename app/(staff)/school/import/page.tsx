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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Spreadsheet Import Wizard</h1>
        <p className="text-sm text-neutral-600">
          Add students, teachers, and classes in bulk, then export personal login cards
        </p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 border-b border-neutral-200 pb-4 text-xs font-semibold">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary-600" : "text-neutral-400"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
            1
          </div>
          <span className="hidden sm:inline">Download</span>
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary-600" : "text-neutral-400"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
            2
          </div>
          <span className="hidden sm:inline">Upload</span>
        </div>
        <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary-600" : "text-neutral-400"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${step >= 3 ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
            3
          </div>
          <span className="hidden sm:inline">Review & Commit</span>
        </div>
        <div className={`flex items-center gap-2 ${step === 4 ? "text-semantic-success" : "text-neutral-400"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${step === 4 ? "bg-semantic-success text-white" : "bg-neutral-200 text-neutral-600"}`}>
            4
          </div>
          <span className="hidden sm:inline">Credentials</span>
        </div>
      </div>

      {/* Step 1: Download Template */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary-600" />
              <span>Step 1: Download Excel Template</span>
            </CardTitle>
            <CardDescription>
              Use the official Rafiq workbook template formatted with sample rows and pre-configured dropdowns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 space-y-2">
              <h4 className="font-bold text-navy-900 text-sm">Template Guidelines:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Students Sheet:</strong> Add student names, grade (6, 7, 8), curriculum (american or cambridge), and class section (e.g. 6A).</li>
                <li><strong>Teachers Sheet:</strong> Add teacher names, assigned subjects (math, science, english), and their classes.</li>
                <li>Classes not already present in the system will be created automatically.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button variant="primary" size="lg" onClick={handleDownloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                <span>Download rafiq-import-template.xlsx</span>
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
                <span>Already have a completed file? Skip to Upload</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary-600" />
              <span>Step 2: Upload Completed File</span>
            </CardTitle>
            <CardDescription>
              Upload your completed spreadsheet (.xlsx, max 5 MB).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                <FileSpreadsheet className="h-10 w-10 text-primary-600 mx-auto" />
                <p className="text-sm font-semibold text-navy-900">
                  {file ? file.name : "Click to select or drag and drop your .xlsx file"}
                </p>
                <p className="text-xs text-neutral-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Excel files up to 5 MB"}
                </p>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back to Download
              </Button>
              <Button
                variant="primary"
                disabled={!file}
                isLoading={previewing}
                onClick={handleUploadAndPreview}
                className="gap-2"
              >
                <span>Upload & Validate</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Commit */}
      {step === 3 && previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary-600" />
              <span>Step 3: Review Import Preview</span>
            </CardTitle>
            <CardDescription>
              Review parsed rows and fix any validation errors before final commit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Counts breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                <span className="text-2xs uppercase font-semibold text-neutral-600">Students</span>
                <p className="text-xl font-bold text-navy-900">{previewData.summary.totalStudents}</p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                <span className="text-2xs uppercase font-semibold text-neutral-600">Teachers</span>
                <p className="text-xl font-bold text-navy-900">{previewData.summary.totalTeachers}</p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                <span className="text-2xs uppercase font-semibold text-neutral-600">Classes</span>
                <p className="text-xl font-bold text-navy-900">{previewData.summary.totalClasses}</p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                <span className="text-2xs uppercase font-semibold text-neutral-600">Errors</span>
                <p className={`text-xl font-bold ${previewData.errors.length > 0 ? "text-semantic-danger" : "text-semantic-success"}`}>
                  {previewData.errors.length}
                </p>
              </div>
            </div>

            {/* Errors Table if any */}
            {previewData.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-semantic-danger font-semibold text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Validation Issues Found ({previewData.errors.length})</span>
                </div>
                <div className="max-h-60 overflow-y-auto border border-red-200 rounded-lg divide-y divide-red-100 bg-red-50/40 text-xs">
                  {previewData.errors.map((err: ImportErrorItem, idx: number) => (
                    <div key={idx} className="p-2.5 flex items-start gap-2">
                      <span className="font-semibold text-red-900">
                        Row {err.row} ({err.sheet}):
                      </span>
                      <span className="text-red-700">
                        {err.column} — {err.message}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-500">
                  Please fix these errors in your spreadsheet and upload again.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Upload Different File
              </Button>
              <Button
                variant="primary"
                disabled={previewData.errors.length > 0}
                isLoading={committing}
                onClick={handleCommit}
                className="gap-2"
              >
                <span>Commit & Generate Codes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done & Download Credentials */}
      {step === 4 && (
        <Card className="border-primary-200 bg-gradient-to-b from-surface to-primary-50/20">
          <CardHeader className="text-center pb-4">
            <div className="h-12 w-12 rounded-full bg-semantic-success-bg text-semantic-success flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-navy-900">
              Import Completed Successfully!
            </CardTitle>
            <CardDescription className="text-sm">
              Created {commitSummary?.students} students, {commitSummary?.teachers} teachers, and {commitSummary?.classes} class sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Save or print login codes now!</p>
                <p>
                  For security, personal access codes are displayed and exported <strong>only at this moment</strong>. They are encrypted with a cryptographic pepper and cannot be retrieved from the database later.
                </p>
              </div>
            </div>

            {/* Download Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleExportCredentials("xlsx")}
                className="gap-2 h-14"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <div className="text-start">
                  <div className="font-bold text-sm">Download Excel Roster</div>
                  <div className="text-2xs opacity-80 font-normal">All names and login codes</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleExportCredentials("pdf")}
                className="gap-2 h-14 border-primary-300 hover:bg-primary-50"
              >
                <Printer className="h-5 w-5 text-primary-600" />
                <div className="text-start">
                  <div className="font-bold text-sm text-navy-900">Print Student Cards (PDF)</div>
                  <div className="text-2xs text-neutral-600 font-normal">8 ready-to-cut cards per A4 page</div>
                </div>
              </Button>
            </div>

            {/* Table of created credentials preview */}
            <div className="space-y-2 pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Generated Accounts Preview ({credentials.length})
              </h4>
              <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-200 text-xs bg-surface">
                {credentials.slice(0, 30).map((c, i) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-navy-900">{c.name}</span>
                      <span className="text-neutral-500 ml-2">({c.role} • {c.class})</span>
                    </div>
                    <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
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
