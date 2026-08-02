"use client";

import { useEffect } from "react";
import { GuestShell } from "@/components/guest-shell";
import { useI18n } from "@/components/i18n-provider";

export default function GuestEventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <GuestShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <svg
              className="h-7 w-7 text-red-500 dark:text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-neutral-50">
            {t.errorPage.title}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">
            {t.errorPage.message}
          </p>
          <button
            onClick={reset}
            className="mt-5 w-full rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 dark:shadow-none"
          >
            {t.errorPage.tryAgain}
          </button>
        </div>
      </div>
    </GuestShell>
  );
}
