import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const url = `${req.nextUrl.origin}/e/${eventId}`;
  const png = await QRCode.toBuffer(url, { width: 512, margin: 2 });

  const headers = new Headers({ "Content-Type": "image/png" });
  if (req.nextUrl.searchParams.get("download")) {
    headers.set("Content-Disposition", `attachment; filename="event-${eventId}-qrcode.png"`);
  }

  return new NextResponse(new Uint8Array(png), { headers });
}
