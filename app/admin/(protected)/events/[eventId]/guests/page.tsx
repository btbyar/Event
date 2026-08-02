import { notFound } from "next/navigation";
import { Trash2, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { ConfirmButton } from "@/components/confirm-button";
import { createGuest, updateGuest, deleteGuest } from "@/lib/actions/guests";
import { card, inputClass, labelClass, btnPrimary, badge } from "@/lib/ui";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATUS_TONE: Record<string, "gray" | "green" | "amber"> = {
  NOT_ARRIVED: "gray",
  ARRIVED: "green",
  LATE: "amber",
};

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { t } = await getDictionary();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  const [tables, guests] = await Promise.all([
    prisma.table.findMany({ where: { eventId }, orderBy: { label: "asc" } }),
    prisma.guest.findMany({ where: { eventId }, orderBy: { fullName: "asc" }, include: { table: true } }),
  ]);

  return (
    <div className="space-y-6">
      <section className={`${card} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <UserPlus className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          {t.guestsPage.addGuest}
        </h2>
        <GuestForm action={createGuest.bind(null, eventId)} tables={tables} t={t} />
      </section>

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.guestsPage.guestsCountTitle(guests.length)}
        </h2>
        {guests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-white/10">
            <Users className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t.guestsPage.noGuestsYet}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="rounded-xl border border-gray-200 p-3 transition hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {guest.fullName}
                    </span>
                    <span className={badge(STATUS_TONE[guest.status])}>
                      {t.status[guest.status as keyof typeof t.status]}
                    </span>
                    <span className="rounded-md bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-400 dark:bg-white/5 dark:text-gray-500">
                      {guest.invitationCode}
                    </span>
                  </div>
                  <form action={deleteGuest.bind(null, eventId, guest.id)}>
                    <ConfirmButton
                      confirmText={t.guestsPage.removeConfirm(guest.fullName)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      {t.guestsPage.delete}
                    </ConfirmButton>
                  </form>
                </div>
                <GuestForm
                  action={updateGuest.bind(null, eventId, guest.id)}
                  tables={tables}
                  guest={guest}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GuestForm({
  action,
  tables,
  guest,
  t,
}: {
  action: (formData: FormData) => Promise<void>;
  tables: { id: string; label: string }[];
  guest?: {
    fullName: string;
    phone: string | null;
    email: string | null;
    tableId: string | null;
    seatNumber: number | null;
    invitationCode: string;
  };
  t: Dictionary;
}) {
  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div className="sm:col-span-1 lg:col-span-2">
        <label className={labelClass}>{t.guestsPage.fullName}</label>
        <input
          name="fullName"
          required
          defaultValue={guest?.fullName ?? ""}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label className={labelClass}>{t.guestsPage.phone}</label>
        <input
          name="phone"
          defaultValue={guest?.phone ?? ""}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label className={labelClass}>{t.guestsPage.email}</label>
        <input
          name="email"
          type="email"
          defaultValue={guest?.email ?? ""}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label className={labelClass}>{t.guestsPage.table}</label>
        <select
          name="tableId"
          defaultValue={guest?.tableId ?? ""}
          className={`mt-1 ${inputClass}`}
        >
          <option value="">{t.guestsPage.unassigned}</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>{t.guestsPage.seatNumber}</label>
        <input
          type="number"
          name="seatNumber"
          min={1}
          defaultValue={guest?.seatNumber ?? ""}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label className={labelClass}>{t.guestsPage.invitationCode}</label>
        <input
          name="invitationCode"
          placeholder={t.guestsPage.invitationCodeAuto}
          defaultValue={guest?.invitationCode ?? ""}
          className={`mt-1 ${inputClass} uppercase`}
        />
      </div>
      <div className="sm:col-span-3 lg:col-span-6">
        <button type="submit" className={btnPrimary}>
          {guest ? t.guestsPage.save : t.guestsPage.addGuestButton}
        </button>
      </div>
    </form>
  );
}
