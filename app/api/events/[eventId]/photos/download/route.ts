import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/db";
import { getPhotoStorage } from "@/lib/storage/photo-storage";
import { verifyPhotoAccessToken } from "@/lib/photos/access-token";
import { sanitizeFilename } from "@/lib/files";

// Public, guest-facing: gated entirely by the match token (see
// lib/photos/access-token.ts) rather than an admin session — this is how a
// guest downloads their own matched photos as a single zip, including long
// after the event when they're revisiting from a device that remembered them.
export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const token = req.nextUrl.searchParams.get("token");
  const payload = token ? await verifyPhotoAccessToken(token) : null;
  if (!payload || payload.eventId !== eventId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const photos = await prisma.eventPhoto.findMany({
    where: { id: { in: payload.photoIds }, eventId },
  });
  if (photos.length === 0) {
    return NextResponse.json({ error: "Photo not found", code: "photoNotFound" }, { status: 404 });
  }

  const storage = getPhotoStorage();
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const photo of photos) {
    const bytes = await storage.read(photo.storageKey);
    let name = `${sanitizeFilename(photo.originalName)}.jpg`;
    let i = 2;
    while (usedNames.has(name)) {
      name = `${sanitizeFilename(photo.originalName)}-${i}.jpg`;
      i++;
    }
    usedNames.add(name);
    zip.file(name, bytes);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="event-${eventId}-photos.zip"`,
    },
  });
}
