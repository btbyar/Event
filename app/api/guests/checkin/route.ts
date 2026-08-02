import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computeArrivalStatus } from "@/lib/attendance";

const bodySchema = z.object({ guestId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", code: "invalidRequest" },
      { status: 400 },
    );
  }

  const guest = await prisma.guest.findUnique({
    where: { id: parsed.data.guestId },
    include: { event: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found", code: "guestNotFound" }, { status: 404 });
  }

  const now = new Date();
  const alreadyCheckedIn = Boolean(guest.checkedInAt);

  if (!alreadyCheckedIn) {
    const status = computeArrivalStatus(now, guest.event);
    const result = await prisma.guest.updateMany({
      where: { id: guest.id, checkedInAt: null },
      data: { checkedInAt: now, status },
    });
    if (result.count === 1) {
      await prisma.checkInLog.create({
        data: { guestId: guest.id, checkedInAt: now, source: "guest-lookup" },
      });
    }
  }

  const fresh = await prisma.guest.findUnique({
    where: { id: guest.id },
    include: { event: true, table: true },
  });

  if (!fresh) {
    return NextResponse.json({ error: "Guest not found", code: "guestNotFound" }, { status: 404 });
  }

  return NextResponse.json({
    guest: {
      fullName: fresh.fullName,
      status: fresh.status,
      checkedInAt: fresh.checkedInAt,
      tableLabel: fresh.table?.label ?? null,
      seatNumber: fresh.seatNumber,
      alreadyCheckedIn,
    },
    event: {
      name: fresh.event.name,
      description: fresh.event.description,
      location: fresh.event.location,
      startsAt: fresh.event.startsAt,
    },
  });
}
