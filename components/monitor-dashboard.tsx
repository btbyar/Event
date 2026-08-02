"use client";

import useSWR from "swr";
import {
  Activity,
  Armchair,
  CheckCircle2,
  Clock,
  UserCheck,
  Users,
} from "lucide-react";
import { card } from "@/lib/ui";
import { useI18n } from "@/components/i18n-provider";

type Stats = {
  totals: { total: number; arrived: number; late: number; notArrived: number };
  perTable: { id: string; label: string; capacity: number; seated: number; arrived: number }[];
  unassignedCount: number;
  recentCheckIns: {
    fullName: string;
    checkedInAt: string;
    status: string;
    tableLabel: string | null;
  }[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MonitorDashboard({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { data, error, isLoading } = useSWR<Stats>(`/api/events/${eventId}/stats`, fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Activity className="h-4 w-4 animate-pulse" strokeWidth={2} />
        {t.monitor.loading}
      </div>
    );
  if (error || !data)
    return <p className="text-sm text-red-600 dark:text-red-400">{t.monitor.failedToLoad}</p>;

  const { totals, perTable, unassignedCount, recentCheckIns } = data;
  const dateLocale = locale === "mn" ? "mn-MN" : "en-US";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label={t.monitor.totalGuests}
          value={totals.total}
          icon={Users}
          tone="text-gray-900 dark:text-gray-100"
          iconTone="text-violet-600 dark:text-violet-400"
        />
        <StatTile
          label={t.monitor.arrived}
          value={totals.arrived}
          icon={CheckCircle2}
          tone="text-green-700 dark:text-green-400"
          iconTone="text-green-600 dark:text-green-400"
        />
        <StatTile
          label={t.monitor.late}
          value={totals.late}
          icon={Clock}
          tone="text-amber-700 dark:text-amber-400"
          iconTone="text-amber-600 dark:text-amber-400"
        />
        <StatTile
          label={t.monitor.notArrived}
          value={totals.notArrived}
          icon={UserCheck}
          tone="text-gray-500 dark:text-gray-400"
          iconTone="text-gray-400 dark:text-gray-500"
        />
      </div>

      <div className={`${card} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Armchair className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          {t.monitor.byTable}
        </h2>
        {perTable.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.monitor.noTablesYet}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                  <th className="py-2 pr-3 font-medium">{t.monitor.tableCol}</th>
                  <th className="py-2 pr-3 font-medium">{t.monitor.seatedCol}</th>
                  <th className="py-2 pr-3 font-medium">{t.monitor.arrivedCol}</th>
                </tr>
              </thead>
              <tbody>
                {perTable.map((tbl) => (
                  <tr
                    key={tbl.id}
                    className="border-b border-gray-100 last:border-0 dark:border-white/10"
                  >
                    <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-100">
                      {tbl.label}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">
                      {tbl.seated}/{tbl.capacity}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-violet-600 to-indigo-600"
                            style={{
                              width: `${tbl.seated === 0 ? 0 : Math.round((tbl.arrived / tbl.seated) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">
                          {tbl.arrived}/{tbl.seated}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {unassignedCount > 0 && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {t.monitor.unassignedCount(unassignedCount)}
          </p>
        )}
      </div>

      <div className={`${card} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          {t.monitor.recentCheckins}
        </h2>
        {recentCheckIns.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.monitor.noCheckinsYet}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentCheckIns.map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-white/10"
              >
                <span className="flex min-w-0 items-center gap-2 text-gray-700 dark:text-gray-200">
                  <span className="truncate">
                    {c.fullName}
                    {c.tableLabel ? (
                      <span className="text-gray-400 dark:text-gray-500"> — {c.tableLabel}</span>
                    ) : (
                      ""
                    )}
                  </span>
                  {c.status === "LATE" && (
                    <span className="flex-none rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                      {t.monitor.lateBadge}
                    </span>
                  )}
                </span>
                <span className="flex-none text-gray-400 dark:text-gray-500">
                  {new Date(c.checkedInAt).toLocaleTimeString(dateLocale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
  iconTone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: string;
  iconTone: string;
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${iconTone}`} strokeWidth={2} />
      </div>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
