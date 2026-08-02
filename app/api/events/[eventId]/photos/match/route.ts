import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { findMatches } from "@/lib/face/matching";
import { signPhotoAccessToken } from "@/lib/photos/access-token";

const bodySchema = z.object({
  embedding: z.array(z.number()).length(128),
});

// Public, guest-facing: no admin auth. The guest's selfie image itself never
// reaches this route — only the numeric embedding computed on their device —
// and that embedding is used purely in-memory for this one comparison, never
// persisted anywhere.
export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found", code: "eventNotFound" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", code: "invalidRequest" }, { status: 400 });
  }

  const faces = await prisma.photoFace.findMany({
    where: { photo: { eventId } },
    select: { photoId: true, embedding: true },
  });

  const matches = findMatches(
    parsed.data.embedding,
    faces.map((f) => ({ photoId: f.photoId, embedding: f.embedding })),
  );

  if (matches.length === 0) {
    return NextResponse.json({ matches: [], token: null });
  }

  const photoIds = matches.map((m) => m.photoId);
  const token = await signPhotoAccessToken({ eventId, photoIds });

  return NextResponse.json({
    matches: matches.map((m) => ({
      photoId: m.photoId,
      thumbnailUrl: `/api/events/${eventId}/photos/${m.photoId}/file?variant=thumb&token=${encodeURIComponent(token)}`,
    })),
    token,
  });
}
