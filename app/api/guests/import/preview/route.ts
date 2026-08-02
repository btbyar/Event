import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { validateImportRows } from "@/lib/import-validation";

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

// Read-only: parses + validates the mapped rows against current DB state and
// against each other, without writing anything, so the admin can see
// per-row errors before committing the import.
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
  const errorCount = validated.filter((v) => !v.ok).length;

  return NextResponse.json({
    total: validated.length,
    validCount: validated.length - errorCount,
    errorCount,
    rows: validated.map((v) => ({
      row: v.row,
      ok: v.ok,
      reasonCode: v.reasonCode,
      reasonParams: v.reasonParams,
    })),
  });
}
