"use client";

import { AlertTriangle } from "lucide-react";
import { btnSecondary } from "@/lib/ui";

// A custom in-app confirmation modal, used in place of the native
// `window.confirm()` for destructive actions — this codebase has a known
// issue where a native `confirm()` dialog freezes the claude-in-chrome
// browser-automation tool used to test this app, so destructive confirmations
// use a real DOM dialog instead.
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 flex-none" strokeWidth={2} />
          <h2 id="confirm-dialog-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">{body}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className={btnSecondary}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
