import { notFound } from "next/navigation";
import { Download, FileSpreadsheet, FileText, QrCode, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateEvent, deleteEvent } from "@/lib/actions/events";
import { ConfirmButton } from "@/components/confirm-button";
import { toDatetimeLocalValue } from "@/lib/dates";
import { card, inputClass, labelClass, btnPrimary, btnSecondary } from "@/lib/ui";
import { getDictionary } from "@/lib/i18n/server";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { t } = await getDictionary();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  const guestPath = `/e/${eventId}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className={`${card} p-5 lg:col-span-2`}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.eventOverview.eventDetails}
        </h2>
        <form
          action={updateEvent.bind(null, eventId)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className={labelClass}>{t.dashboard.eventName}</label>
            <input
              name="name"
              required
              defaultValue={event.name}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.dateTime}</label>
            <input
              type="datetime-local"
              name="startsAt"
              required
              defaultValue={toDatetimeLocalValue(new Date(event.startsAt))}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.location}</label>
            <input
              name="location"
              defaultValue={event.location ?? ""}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t.dashboard.description}</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={event.description ?? ""}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.lateThreshold}</label>
            <input
              type="number"
              name="lateThresholdMinutes"
              min={0}
              defaultValue={event.lateThresholdMinutes}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard.status}</label>
            <select
              name="status"
              defaultValue={event.status}
              className={`mt-1 ${inputClass}`}
            >
              <option value="DRAFT">{t.status.DRAFT}</option>
              <option value="ACTIVE">{t.status.ACTIVE}</option>
              <option value="CLOSED">{t.status.CLOSED}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary}>
              {t.eventOverview.saveChanges}
            </button>
          </div>
        </form>

        <form
          action={deleteEvent.bind(null, eventId)}
          className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10"
        >
          <ConfirmButton
            confirmText={t.eventOverview.deleteConfirm(event.name)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {t.eventOverview.deleteEvent}
          </ConfirmButton>
        </form>
      </div>

      <div className={`${card} p-5 text-center`}>
        <h2 className="mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <QrCode className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          {t.eventOverview.guestQrCode}
        </h2>
        <div className="mx-auto w-fit rounded-2xl border border-gray-100 bg-white p-3 shadow-inner dark:border-white/10">
          <img
            src={`/api/events/${eventId}/qrcode`}
            alt={t.eventOverview.guestQrCode}
            className="mx-auto h-48 w-48"
          />
        </div>
        <p className="mt-3 truncate rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
          {guestPath}
        </p>
        <a
          href={`/api/events/${eventId}/qrcode?download=1`}
          className={`mt-4 ${btnPrimary} w-full`}
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          {t.eventOverview.downloadQr}
        </a>
      </div>

      <div className={`${card} p-5 lg:col-span-3`}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.eventOverview.reports}
        </h2>
        <div className="flex flex-wrap gap-3">
          <a href={`/api/events/${eventId}/export/xlsx`} className={btnSecondary}>
            <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />
            {t.eventOverview.exportExcel}
          </a>
          <a href={`/api/events/${eventId}/export/pdf`} className={btnSecondary}>
            <FileText className="h-4 w-4" strokeWidth={2} />
            {t.eventOverview.exportPdf}
          </a>
        </div>
      </div>
    </div>
  );
}
