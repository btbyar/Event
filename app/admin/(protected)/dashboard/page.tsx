import Link from "next/link";
import { CalendarPlus, MapPin, PartyPopper, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { createEvent } from "@/lib/actions/events";
import { card, inputClass, labelClass, btnPrimary, badge } from "@/lib/ui";
import { getDictionary } from "@/lib/i18n/server";

const STATUS_TONE: Record<string, "amber" | "green" | "gray"> = {
  DRAFT: "amber",
  ACTIVE: "green",
  CLOSED: "gray",
};

export default async function DashboardPage() {
  const { t, locale } = await getDictionary();
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { guests: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">
          {t.dashboard.heading}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.dashboard.subheading}</p>
      </div>

      <section className={`${card} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <CalendarPlus className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          {t.dashboard.createEvent}
        </h2>
        <form action={createEvent} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t.dashboard.eventName}</label>
            <input
              name="name"
              required
              className={`mt-1 ${inputClass}`}
              placeholder={t.dashboard.eventNamePlaceholder}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.dateTime}</label>
            <input
              type="datetime-local"
              name="startsAt"
              required
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.location}</label>
            <input
              name="location"
              className={`mt-1 ${inputClass}`}
              placeholder={t.dashboard.locationPlaceholder}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t.dashboard.description}</label>
            <textarea name="description" rows={2} className={`mt-1 ${inputClass}`} />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.lateThreshold}</label>
            <input
              type="number"
              name="lateThresholdMinutes"
              defaultValue={15}
              min={0}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.status}</label>
            <select name="status" defaultValue="DRAFT" className={`mt-1 ${inputClass}`}>
              <option value="DRAFT">{t.status.DRAFT}</option>
              <option value="ACTIVE">{t.status.ACTIVE}</option>
              <option value="CLOSED">{t.status.CLOSED}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary}>
              <CalendarPlus className="h-4 w-4" strokeWidth={2} />
              {t.dashboard.createEventButton}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.dashboard.yourEvents}
        </h2>
        {events.length === 0 ? (
          <div className={`${card} flex flex-col items-center gap-2 py-14 text-center`}>
            <PartyPopper className="h-8 w-8 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.noEventsYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className={`group block ${card} p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:hover:border-violet-500/30`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-display text-lg font-medium text-gray-900 group-hover:text-violet-700 dark:text-gray-100 dark:group-hover:text-violet-400">
                    {event.name}
                  </h3>
                  <span className={badge(STATUS_TONE[event.status])}>
                    {t.status[event.status as keyof typeof t.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(event.startsAt).toLocaleString(locale === "mn" ? "mn-MN" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {event.location && (
                  <p className="mt-1 flex items-center gap-1 truncate text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 flex-none" strokeWidth={2} />
                    {event.location}
                  </p>
                )}
                <p className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-white/10 dark:text-gray-500">
                  <Users className="h-3.5 w-3.5" strokeWidth={2} />
                  {t.common.guestsCount(event._count.guests)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
