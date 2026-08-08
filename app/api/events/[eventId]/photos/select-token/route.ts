import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signPhotoAccessToken } from "@/lib/photos/access-token";

const bodySchema = z.object({
  photoIds: z.array(z.string()).min(1).max(500),
});

// Public, guest-facing: mints a token scoped to exactly the photos a guest
// picked while browsing the full gallery (as opposed to the selfie-match
// token, which is scoped to whatever the face search found). Feeds the same
// existing /download zip endpoint unchanged.
export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", code: "invalidRequest" }, { status: 400 });
  }

  const found = await prisma.eventPhoto.findMany({
    where: { id: { in: parsed.data.photoIds }, eventId },
    select: { id: true },
  });
  if (found.length === 0) {
    return NextResponse.json({ error: "Photo not found", code: "photoNotFound" }, { status: 404 });
  }

  const token = await signPhotoAccessToken({ eventId, photoIds: found.map((f) => f.id) });
  return NextResponse.json({ token });
}
