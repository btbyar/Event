"use client";

import { AlertTriangle } from "lucide-react";
import { btnDanger } from "@/lib/ui";
import { useI18n } from "@/components/i18n-provider";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mx-auto mt-20 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
      <AlertTriangle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
      <p className="text-sm font-medium text-red-800 dark:text-red-300">
        {error.message || t.adminError.message}
      </p>
      <button onClick={() => reset()} className={btnDanger}>
        {t.adminError.tryAgain}
      </button>
    </div>
  );
}
