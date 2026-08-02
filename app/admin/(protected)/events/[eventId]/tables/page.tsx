import { notFound } from "next/navigation";
import { Armchair, Plus, Save, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { ConfirmButton } from "@/components/confirm-button";
import { createTable, updateTable, deleteTable } from "@/lib/actions/tables";
import { card, inputClass, labelClass, btnPrimary, btnSecondary, btnDanger } from "@/lib/ui";
import { getDictionary } from "@/lib/i18n/server";

export default async function TablesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { t } = await getDictionary();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  const tables = await prisma.table.findMany({
    where: { eventId },
    orderBy: { label: "asc" },
    include: { _count: { select: { guests: true } } },
  });

  return (
    <div className="space-y-6">
      <section className={`${card} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Plus className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          {t.tables.addTable}
        </h2>
        <form
          action={createTable.bind(null, eventId)}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className={labelClass}>{t.tables.label}</label>
            <input
              name="label"
              required
              placeholder={t.tables.labelPlaceholder}
              className={`mt-1 w-40 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.tables.capacity}</label>
            <input
              type="number"
              name="capacity"
              min={1}
              required
              defaultValue={8}
              className={`mt-1 w-28 ${inputClass}`}
            />
          </div>
          <button type="submit" className={btnPrimary}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            {t.tables.addTableButton}
          </button>
        </form>
      </section>

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.tables.tablesCount(tables.length)}
        </h2>
        {tables.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-white/10">
            <Armchair className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.tables.noTablesYet}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
              >
                <form
                  action={updateTable.bind(null, eventId, table.id)}
                  className="flex flex-wrap items-end gap-3"
                >
                  <div>
                    <label className={labelClass}>{t.tables.label}</label>
                    <input
                      name="label"
                      required
                      defaultValue={table.label}
                      className={`mt-1 w-36 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t.tables.capacity}</label>
                    <input
                      type="number"
                      name="capacity"
                      min={1}
                      required
                      defaultValue={table.capacity}
                      className={`mt-1 w-24 ${inputClass}`}
                    />
                  </div>
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                    <Armchair className="h-3.5 w-3.5" strokeWidth={2} />
                    {t.tables.seatedCount(table._count.guests, table.capacity)}
                  </span>
                  <button type="submit" className={btnSecondary}>
                    <Save className="h-4 w-4" strokeWidth={2} />
                    {t.tables.save}
                  </button>
                </form>
                <form action={deleteTable.bind(null, eventId, table.id)}>
                  <ConfirmButton
                    confirmText={t.tables.deleteConfirm(table.label)}
                    className={btnDanger}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                    {t.tables.delete}
                  </ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
