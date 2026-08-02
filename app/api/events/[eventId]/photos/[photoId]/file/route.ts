import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { getPhotoStorage } from "@/lib/storage/photo-storage";
import { verifyPhotoAccessToken } from "@/lib/photos/access-token";
import { sanitizeFilename } from "@/lib/files";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; photoId: string }> },
) {
  const { eventId, photoId } = await params;

  const session = await auth();
  const isAdmin = Boolean(session?.user?.id);

  if (!isAdmin) {
    const token = req.nextUrl.searchParams.get("token");
    const payload = token ? await verifyPhotoAccessToken(token) : null;
    if (!payload || payload.eventId !== eventId || !payload.photoIds.includes(photoId)) {
      return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }
  }

  const photo = await prisma.eventPhoto.findFirst({ where: { id: photoId, eventId } });
  if (!photo) {
    return NextResponse.json({ error: "Photo not found", code: "photoNotFound" }, { status: 404 });
  }

  const variant = req.nextUrl.searchParams.get("variant") === "thumb" ? "thumb" : "original";
  const storage = getPhotoStorage();
  const key = variant === "thumb" ? photo.thumbnailKey : photo.storageKey;
  const bytes = await storage.read(key);

  const headers = new Headers({
    "Content-Type": variant === "thumb" ? "image/webp" : "image/jpeg",
    "Cache-Control": "private, max-age=3600",
  });
  if (req.nextUrl.searchParams.get("download")) {
    const ext = variant === "thumb" ? "webp" : "jpg";
    headers.set(
      "Content-Disposition",
      `attachment; filename="${sanitizeFilename(photo.originalName)}.${ext}"`,
    );
  }

  return new NextResponse(new Uint8Array(bytes), { headers });
}
