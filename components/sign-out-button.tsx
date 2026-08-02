"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function SignOutButton() {
  const { t } = useI18n();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      {t.common.signOut}
    </button>
  );
}
