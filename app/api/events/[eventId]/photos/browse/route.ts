import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signPhotoAccessToken } from "@/lib/photos/access-token";

const PAGE_SIZE = 60;

// Public, guest-facing: lets anyone who knows the eventId (the same trust
// level as the QR/invite link itself) browse every uploaded photo for the
// event, not just ones matched to their selfie. Thumbnails are gated behind a
// signed token minted per page, same mechanism as the selfie-match flow.
export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) {
    return NextResponse.json({ error: "Event not found", code: "eventNotFound" }, { status: 404 });
  }

  const cursor = req.nextUrl.searchParams.get("cursor");

  const rows = await prisma.eventPhoto.findMany({
    where: { eventId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  if (page.length === 0) {
    return NextResponse.json({ photos: [], token: null, nextCursor: null });
  }

  const photoIds = page.map((p) => p.id);
  const token = await signPhotoAccessToken({ eventId, photoIds });

  return NextResponse.json({
    photos: photoIds.map((photoId) => ({
      photoId,
      thumbnailUrl: `/api/events/${eventId}/photos/${photoId}/file?variant=thumb&token=${encodeURIComponent(token)}`,
    })),
    token,
    nextCursor,
  });
}
