"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  Armchair,
  Users,
  UploadCloud,
  Activity,
  Images,
} from "lucide-react";
import { badge } from "@/lib/ui";
import { useI18n } from "@/components/i18n-provider";

type EventStatus = "DRAFT" | "ACTIVE" | "CLOSED";

const STATUS_TONE: Record<EventStatus, "amber" | "green" | "gray"> = {
  DRAFT: "amber",
  ACTIVE: "green",
  CLOSED: "gray",
};

export function EventSidebar({
  eventId,
  name,
  status,
  startsAt,
}: {
  eventId: string;
  name: string;
  status: EventStatus;
  startsAt: string;
}) {
  const pathname = usePathname();
  const { t, locale } = useI18n();

  const items = [
    { href: `/admin/events/${eventId}`, label: t.nav.overview, icon: LayoutGrid, exact: true },
    { href: `/admin/events/${eventId}/tables`, label: t.nav.tables, icon: Armchair },
    { href: `/admin/events/${eventId}/guests`, label: t.nav.guests, icon: Users },
    { href: `/admin/events/${eventId}/import`, label: t.nav.import, icon: UploadCloud },
    { href: `/admin/events/${eventId}/photos`, label: t.nav.photos, icon: Images },
    { href: `/admin/events/${eventId}/monitor`, label: t.nav.monitor, icon: Activity },
  ];

  return (
    <aside className="lg:w-64 lg:flex-none">
      <div className="lg:sticky lg:top-20">
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {t.common.allEvents}
        </Link>

        <div className="mb-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <p className="truncate font-display text-lg leading-tight font-medium text-gray-900 dark:text-gray-100">
            {name}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className={badge(STATUS_TONE[status])}>{t.status[status]}</span>
            <span className="truncate text-xs text-gray-400 dark:text-gray-500">
              {new Date(startsAt).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-600/25"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4 flex-none" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
