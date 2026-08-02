import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizeName } from "@/lib/matching";

const bodySchema = z.object({
  eventId: z.string().min(1),
  query: z.string().min(1).max(100),
});

function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 2) return null;
  return `••${digits.slice(-2)}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", code: "invalidRequest" },
      { status: 400 },
    );
  }
  const { eventId, query } = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json(
      { error: "Event not found", code: "eventNotFound" },
      { status: 404 },
    );
  }

  const trimmed = query.trim();

  const codeMatch = await prisma.guest.findFirst({
    where: { eventId, invitationCode: trimmed.toUpperCase() },
  });

  if (codeMatch) {
    return NextResponse.json({
      matches: [
        { id: codeMatch.id, fullName: codeMatch.fullName, phoneHint: maskPhone(codeMatch.phone) },
      ],
    });
  }

  const normalized = normalizeName(trimmed);
  if (normalized.length < 2) {
    return NextResponse.json({ matches: [] });
  }

  const guests = await prisma.guest.findMany({
    where: { eventId, normalizedName: { contains: normalized } },
    orderBy: { fullName: "asc" },
    take: 8,
  });

  return NextResponse.json({
    matches: guests.map((g) => ({
      id: g.id,
      fullName: g.fullName,
      phoneHint: maskPhone(g.phone),
    })),
  });
}
