"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { card, inputClass, labelClass, btnPrimary, btnSecondary } from "@/lib/ui";
import { useI18n } from "@/components/i18n-provider";
import type { ApiErrorCode, ImportErrorCode } from "@/lib/i18n/dictionaries";

type FieldKey = "fullName" | "phone" | "email" | "tableLabel" | "seatNumber" | "invitationCode";

const FIELDS: { key: FieldKey; required?: boolean }[] = [
  { key: "fullName", required: true },
  { key: "phone" },
  { key: "email" },
  { key: "tableLabel" },
  { key: "seatNumber" },
  { key: "invitationCode" },
];

const AUTO_MATCH: Record<FieldKey, string[]> = {
  fullName: ["name", "full name", "guest", "guest name"],
  phone: ["phone", "mobile", "cell"],
  email: ["email", "e-mail"],
  tableLabel: ["table"],
  seatNumber: ["seat", "seat #", "seat number"],
  invitationCode: ["code", "invitation", "invitation code"],
};

type ReasonPayload = { reasonCode?: ImportErrorCode; reasonParams?: (string | number)[] };
type ImportResult = {
  insertedCount: number;
  skipped: ({ row: number } & ReasonPayload)[];
};
type PreviewResult = {
  total: number;
  validCount: number;
  errorCount: number;
  rows: ({ row: number; ok: boolean } & ReasonPayload)[];
};
type ApiError = { error?: string; code?: ApiErrorCode };

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-sm shadow-violet-600/30">
      {n}
    </span>
  );
}

export function GuestImport({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const FIELD_LABELS: Record<FieldKey, string> = {
    fullName: t.guestsPage.fullName,
    phone: t.guestsPage.phone,
    email: t.guestsPage.email,
    tableLabel: t.guestsPage.table,
    seatNumber: t.guestsPage.seatNumber,
    invitationCode: t.guestsPage.invitationCode,
  };

  function formatReason(payload: ReasonPayload): string {
    if (!payload.reasonCode) return "";
    const fn = t.importErrors[payload.reasonCode];
    return fn(...(payload.reasonParams ?? []));
  }

  function apiErrorMessage(data: ApiError | null): string {
    if (data?.code && t.apiErrors[data.code]) return t.apiErrors[data.code];
    return data?.error ?? t.apiErrors.unknownError;
  }

  const [headers, setHeaders] = useState<string[] | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, number>>>({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setPreview(null);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });

    if (data.length === 0) {
      setError(t.apiErrors.invalidRequest);
      return;
    }

    const [headerRow, ...dataRows] = data;
    const cleanHeaders = headerRow.map((h) => String(h ?? "").trim());
    setHeaders(cleanHeaders);
    setRows(dataRows.map((r) => cleanHeaders.map((_, i) => String(r[i] ?? ""))));

    const autoMapping: Partial<Record<FieldKey, number>> = {};
    for (const field of FIELDS) {
      const idx = cleanHeaders.findIndex((h) =>
        AUTO_MATCH[field.key].includes(h.trim().toLowerCase()),
      );
      if (idx !== -1) autoMapping[field.key] = idx;
    }
    setMapping(autoMapping);
  }

  const mappedRows = useMemo(() => {
    return rows.map((row) => ({
      fullName: mapping.fullName !== undefined ? row[mapping.fullName] : "",
      phone: mapping.phone !== undefined ? row[mapping.phone] : "",
      email: mapping.email !== undefined ? row[mapping.email] : "",
      tableLabel: mapping.tableLabel !== undefined ? row[mapping.tableLabel] : "",
      seatNumber: mapping.seatNumber !== undefined ? row[mapping.seatNumber] : "",
      invitationCode: mapping.invitationCode !== undefined ? row[mapping.invitationCode] : "",
    }));
  }, [rows, mapping]);

  const missingNameCount = mappedRows.filter((r) => !r.fullName.trim()).length;

  const previewReasonByRow = useMemo(() => {
    const map = new Map<number, string>();
    if (preview) {
      for (const r of preview.rows) {
        if (!r.ok && r.reasonCode) map.set(r.row, formatReason(r));
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, t]);

  async function handleValidate() {
    setValidating(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/guests/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, rows: mappedRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(apiErrorMessage(data));
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.apiErrors.unknownError);
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, rows: mappedRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(apiErrorMessage(data));
      setResult(data);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.apiErrors.unknownError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className={`${card} p-5`}>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <StepBadge n={1} />
          {t.importPage.step1Title}
        </h2>
        <label
          htmlFor="import-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50/40 dark:border-white/10 dark:bg-white/2 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/5"
        >
          <UploadCloud className="h-8 w-8 text-violet-500" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.importPage.dropzoneText}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t.importPage.dropzoneHint}
          </span>
          <input
            id="import-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
          />
        </label>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 flex-none" strokeWidth={2} />
            {error}
          </p>
        )}
      </div>

      {headers && (
        <div className={`${card} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <StepBadge n={2} />
            {t.importPage.step2Title}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className={labelClass}>
                  {FIELD_LABELS[field.key]}
                  {field.required && <span className="text-violet-500"> *</span>}
                </label>
                <select
                  value={mapping[field.key] ?? ""}
                  onChange={(e) => {
                    setPreview(null);
                    setMapping((m) => ({
                      ...m,
                      [field.key]: e.target.value === "" ? undefined : Number(e.target.value),
                    }));
                  }}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="">{t.importPage.notMapped}</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>
                      {h || t.importPage.columnFallback(i + 1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {headers && (
        <div className={`${card} p-5`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <StepBadge n={3} />
              {t.importPage.step3Title(rows.length)}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleValidate}
                disabled={validating || mapping.fullName === undefined || rows.length === 0}
                className={btnSecondary}
              >
                <ListChecks className="h-4 w-4" strokeWidth={2} />
                {validating ? t.importPage.checking : t.importPage.checkForErrors}
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !preview || mapping.fullName === undefined || rows.length === 0}
                className={btnPrimary}
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                {loading ? t.importPage.importing : t.importPage.importButton(rows.length)}
              </button>
            </div>
          </div>
          {mapping.fullName === undefined && (
            <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 flex-none" strokeWidth={2} />
              {t.importPage.mapNameFirst}
            </p>
          )}
          {missingNameCount > 0 && (
            <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 flex-none" strokeWidth={2} />
              {t.importPage.missingNameRows(missingNameCount)}
            </p>
          )}
          {!preview && mapping.fullName !== undefined && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              {t.importPage.runCheckHint}
            </p>
          )}
          {preview && (
            <p className="mb-3 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                {t.importPage.validCount(preview.validCount)}
              </span>
              {preview.errorCount > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                  {t.importPage.errorCountText(preview.errorCount)}
                </span>
              )}
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                  <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.name}</th>
                  <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.phone}</th>
                  <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.email}</th>
                  <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.table}</th>
                  <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.seat}</th>
                  <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.code}</th>
                  {preview && (
                    <th className="px-3 py-2 font-medium">{t.importPage.tableHeaders.status}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mappedRows.slice(0, 20).map((r, i) => {
                  const rowNumber = i + 1;
                  const reason = previewReasonByRow.get(rowNumber);
                  const hasError = !r.fullName.trim() || Boolean(reason);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 last:border-0 dark:border-white/10 ${
                        hasError ? "bg-red-50/70 dark:bg-red-500/10" : ""
                      }`}
                    >
                      <td className="px-3 py-1.5 text-gray-900 dark:text-gray-100">
                        {r.fullName || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{r.phone}</td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{r.email}</td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">
                        {r.tableLabel}
                      </td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">
                        {r.seatNumber}
                      </td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">
                        {r.invitationCode}
                      </td>
                      {preview && (
                        <td className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400">
                          {reason ?? ""}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400 dark:border-white/10 dark:text-gray-500">
                {t.importPage.showingFirstRows(20, rows.length)}
              </p>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className={`${card} p-5`}>
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <ClipboardCheck className="h-5 w-5 text-green-600 dark:text-green-400" strokeWidth={2} />
            {t.importPage.importComplete}
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            {t.importPage.insertedCount(result.insertedCount)}
          </p>
          {result.skipped.length > 0 && (
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                {t.importPage.skippedCount(result.skipped.length)}
              </p>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
                {result.skipped.map((s, i) => (
                  <li key={i}>{t.importPage.rowLabel(s.row, formatReason(s))}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
