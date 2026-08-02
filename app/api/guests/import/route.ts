import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { generateUniqueInvitationCode } from "@/lib/codes";
import { validateImportRows } from "@/lib/import-validation";
import type { ImportErrorCode } from "@/lib/i18n/dictionaries";

const rowSchema = z.object({
  fullName: z.string(),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  tableLabel: z.string().optional().default(""),
  seatNumber: z.string().optional().default(""),
  invitationCode: z.string().optional().default(""),
});

const bodySchema = z.object({
  eventId: z.string().min(1),
  rows: z.array(rowSchema).max(5000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", code: "invalidRequest" },
      { status: 400 },
    );
  }
  const { eventId, rows } = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json(
      { error: "Event not found", code: "eventNotFound" },
      { status: 404 },
    );
  }

  const validated = await validateImportRows(prisma, eventId, rows);

  let insertedCount = 0;
  const skipped: { row: number; reasonCode: ImportErrorCode; reasonParams?: (string | number)[] }[] =
    [];

  // Each row is inserted as its own independent statement (no wrapping
  // transaction) so a Postgres constraint violation on one row can't poison
  // the connection and roll back rows that already succeeded.
  for (const v of validated) {
    if (!v.ok || !v.resolved) {
      skipped.push({
        row: v.row,
        reasonCode: v.reasonCode ?? "invalidRow",
        reasonParams: v.reasonParams,
      });
      continue;
    }

    try {
      const invitationCode =
        v.resolved.invitationCode || (await generateUniqueInvitationCode(prisma, eventId));

      await prisma.guest.create({
        data: {
          eventId,
          fullName: v.resolved.fullName,
          normalizedName: v.resolved.normalizedName,
          phone: v.resolved.phone,
          email: v.resolved.email,
          tableId: v.resolved.tableId,
          seatNumber: v.resolved.seatNumber,
          invitationCode,
        },
      });
      insertedCount++;
    } catch (err) {
      skipped.push({ row: v.row, reasonCode: rowErrorCode(err) });
    }
  }

  return NextResponse.json({ insertedCount, skipped });
}

function rowErrorCode(err: unknown): ImportErrorCode {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(",") : "";
    if (target.includes("invitationCode")) {
      return "codeInUse";
    }
    return "seatInUse";
  }
  return "unknownError";
}
