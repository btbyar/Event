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

  // Behind a reverse proxy (Render, Railway, etc.) the request's own origin
  // can resolve to an internal address like "localhost" rather than the
  // public domain, producing QR codes that only work from inside the host's
  // network. NEXT_PUBLIC_APP_URL is the reliable source of truth when set;
  // req.nextUrl.origin is only trustworthy for local dev, where there's no
  // proxy in between.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const url = `${baseUrl}/e/${eventId}`;
  const png = await QRCode.toBuffer(url, { width: 512, margin: 2 });

  const headers = new Headers({ "Content-Type": "image/png" });
  if (req.nextUrl.searchParams.get("download")) {
    headers.set("Content-Disposition", `attachment; filename="event-${eventId}-qrcode.png"`);
  }

  return new NextResponse(new Uint8Array(png), { headers });
}
