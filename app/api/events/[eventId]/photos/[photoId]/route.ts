import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { getPhotoStorage } from "@/lib/storage/photo-storage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; photoId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId, photoId } = await params;
  const photo = await prisma.eventPhoto.findFirst({ where: { id: photoId, eventId } });
  if (!photo) {
    return NextResponse.json({ error: "Photo not found", code: "photoNotFound" }, { status: 404 });
  }

  await prisma.eventPhoto.delete({ where: { id: photoId } });

  const storage = getPhotoStorage();
  await Promise.all([
    storage.delete(photo.storageKey).catch((err) => console.error("[photos/delete]", err)),
    storage.delete(photo.thumbnailKey).catch((err) => console.error("[photos/delete]", err)),
  ]);

  return NextResponse.json({ ok: true });
}
