import Link from "next/link";
import { CalendarCheck2 } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getDictionary();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-600/30">
              <CalendarCheck2 className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </span>
            <span className="font-display text-lg font-medium tracking-tight text-gray-900 dark:text-gray-100">
              {t.brand.title}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
