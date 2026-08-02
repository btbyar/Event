import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { sanitizeFilename } from "@/lib/files";
import { GuestListPdf, type PdfGuestRow } from "@/components/pdf/guest-list-pdf";
import { getDictionary } from "@/lib/i18n/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const { t, locale } = await getDictionary();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json(
      { error: "Event not found", code: "eventNotFound" },
      { status: 404 },
    );
  }

  const guests = await prisma.guest.findMany({
    where: { eventId },
    include: { table: true },
    orderBy: [{ fullName: "asc" }],
  });

  const dateLocale = locale === "mn" ? "mn-MN" : "en-US";
  const rows: PdfGuestRow[] = guests.map((g) => ({
    fullName: g.fullName,
    tableLabel: g.table?.label ?? "-",
    seatNumber: g.seatNumber?.toString() ?? "-",
    status: t.status[g.status as keyof typeof t.status],
    checkedInAt: g.checkedInAt ? g.checkedInAt.toLocaleString(dateLocale) : "-",
    invitationCode: g.invitationCode,
  }));

  const eventDate = new Date(event.startsAt).toLocaleString(dateLocale);

  const buffer = await renderToBuffer(
    GuestListPdf({
      eventName: event.name,
      subtitle: `${eventDate} — ${t.exports.guestListAndAttendance(guests.length)}`,
      headers: {
        name: t.exports.name,
        table: t.exports.table,
        seat: t.exports.seat,
        status: t.exports.status,
        checkedInAt: t.exports.checkedInAt,
        code: t.exports.invitationCode,
      },
      guests: rows,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(event.name)}-guests.pdf"`,
    },
  });
}
