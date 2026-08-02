"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n/dictionaries";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "mn", label: "МН" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={`inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-white/10 ${className}`}
    >
      <Languages
        className="ml-1.5 h-3.5 w-3.5 flex-none text-gray-400 dark:text-gray-500"
        strokeWidth={2}
      />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
            locale === option.value
              ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
