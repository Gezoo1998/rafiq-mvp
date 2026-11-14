"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Copy, Check, AlertTriangle, KeyRound } from "lucide-react";

interface CredentialOnceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userRole: string;
  code: string;
}

export function CredentialOnceDialog({
  open,
  onOpenChange,
  userName,
  userRole,
  code,
}: CredentialOnceDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [isSavedChecked, setIsSavedChecked] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClose = () => {
    if (!isSavedChecked) return;
    onOpenChange(false);
    setIsSavedChecked(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && !isSavedChecked) return; // Prevent closing by clicking outside if not confirmed
      onOpenChange(val);
      if (!val) setIsSavedChecked(false);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <KeyRound className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Access Credential</span>
          </div>
          <DialogTitle className="text-xl">One-Time Login Code</DialogTitle>
          <DialogDescription>
            Account created for <span className="font-semibold text-neutral-900">{userName}</span> ({userRole}).
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 p-4 bg-primary-50 rounded-lg border border-primary-100 flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-semibold text-primary-700 uppercase tracking-widest">
            Personal Login Code
          </span>
          <div className="font-mono text-2xl font-bold tracking-widest text-navy-900 select-all">
            {code}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-semantic-success" />
                <span>Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </div>

        <div className="p-3 bg-amber-50 rounded-md border border-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Important:</span> This code is displayed only once. It cannot be recovered from the database. Make sure you copy or share it with the user now.
          </p>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={isSavedChecked}
            onChange={(e) => setIsSavedChecked(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-300"
          />
          <span>I have securely copied or delivered this access code</span>
        </label>

        <DialogFooter>
          <Button
            type="button"
            variant="primary"
            disabled={!isSavedChecked}
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Done & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

