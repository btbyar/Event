import { PrismaClient } from "@prisma/client";
import { normalizeName } from "@/lib/matching";
import type { ImportErrorCode } from "@/lib/i18n/dictionaries";

export type ImportRowInput = {
  fullName: string;
  phone?: string;
  email?: string;
  tableLabel?: string;
  seatNumber?: string;
  invitationCode?: string;
};

export type ValidatedRow = {
  row: number;
  ok: boolean;
  reasonCode?: ImportErrorCode;
  reasonParams?: (string | number)[];
  resolved?: {
    fullName: string;
    normalizedName: string;
    phone: string | null;
    email: string | null;
    tableId: string | null;
    seatNumber: number | null;
    invitationCode: string; // "" means one will be generated at insert time
  };
};

/**
 * Validates every row up front against existing DB state and against the rest
 * of the batch, so realistic mistakes (duplicate seat/code across two rows in
 * the same file) surface before any writes happen, rather than as a Postgres
 * constraint violation mid-insert. Errors are returned as a locale-independent
 * code + params so the client can render them in the active language.
 */
export async function validateImportRows(
  prisma: PrismaClient,
  eventId: string,
  rows: ImportRowInput[],
): Promise<ValidatedRow[]> {
  const tables = await prisma.table.findMany({ where: { eventId } });
  const tableByLabel = new Map(tables.map((t) => [t.label.trim().toLowerCase(), t.id]));

  const existingGuests = await prisma.guest.findMany({
    where: { eventId },
    select: { invitationCode: true, tableId: true, seatNumber: true },
  });
  const existingCodes = new Set(existingGuests.map((g) => g.invitationCode));
  const existingSeats = new Set(
    existingGuests
      .filter((g) => g.tableId && g.seatNumber != null)
      .map((g) => `${g.tableId}:${g.seatNumber}`),
  );

  const seenCodesInBatch = new Set<string>();
  const seenSeatsInBatch = new Set<string>();

  const results: ValidatedRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;
    const fullName = row.fullName?.trim() ?? "";

    if (!fullName) {
      results.push({ row: rowNumber, ok: false, reasonCode: "missingName" });
      continue;
    }

    let tableId: string | null = null;
    const tableLabel = row.tableLabel?.trim() ?? "";
    if (tableLabel) {
      const found = tableByLabel.get(tableLabel.toLowerCase());
      if (!found) {
        results.push({
          row: rowNumber,
          ok: false,
          reasonCode: "unknownTable",
          reasonParams: [tableLabel],
        });
        continue;
      }
      tableId = found;
    }

    let seatNumber: number | null = null;
    const seatRaw = row.seatNumber?.trim() ?? "";
    if (seatRaw) {
      const n = Number(seatRaw);
      if (!Number.isInteger(n) || n < 1) {
        results.push({
          row: rowNumber,
          ok: false,
          reasonCode: "invalidSeatNumber",
          reasonParams: [seatRaw],
        });
        continue;
      }
      seatNumber = n;
    }

    if (tableId && seatNumber != null) {
      const seatKey = `${tableId}:${seatNumber}`;
      if (existingSeats.has(seatKey)) {
        results.push({
          row: rowNumber,
          ok: false,
          reasonCode: "seatTaken",
          reasonParams: [seatNumber],
        });
        continue;
      }
      if (seenSeatsInBatch.has(seatKey)) {
        results.push({
          row: rowNumber,
          ok: false,
          reasonCode: "duplicateSeatInFile",
          reasonParams: [seatNumber],
        });
        continue;
      }
    }

    let invitationCode = "";
    const codeRaw = row.invitationCode?.trim() ?? "";
    if (codeRaw) {
      invitationCode = codeRaw.toUpperCase();
      if (existingCodes.has(invitationCode)) {
        results.push({
          row: rowNumber,
          ok: false,
          reasonCode: "codeTaken",
          reasonParams: [invitationCode],
        });
        continue;
      }
      if (seenCodesInBatch.has(invitationCode)) {
        results.push({
          row: rowNumber,
          ok: false,
          reasonCode: "duplicateCodeInFile",
          reasonParams: [invitationCode],
        });
        continue;
      }
    }

    if (tableId && seatNumber != null) seenSeatsInBatch.add(`${tableId}:${seatNumber}`);
    if (invitationCode) seenCodesInBatch.add(invitationCode);

    results.push({
      row: rowNumber,
      ok: true,
      resolved: {
        fullName,
        normalizedName: normalizeName(fullName),
        phone: row.phone?.trim() || null,
        email: row.email?.trim() || null,
        tableId,
        seatNumber,
        invitationCode,
      },
    });
  }

  return results;
}
