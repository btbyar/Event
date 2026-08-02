import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { processEventPhoto } from "@/lib/photos/process-photo";

// Re-queues face detection for any photo still stuck at `processedAt: null`
// (e.g. the server restarted mid-batch after upload). Safe to call anytime —
// processing a photo is idempotent, it just replaces that photo's faces.
export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const pending = await prisma.eventPhoto.findMany({
    where: { eventId, processedAt: null },
    select: { id: true },
  });

  after(() => Promise.all(pending.map((p) => processEventPhoto(p.id))));

  return NextResponse.json({ queuedCount: pending.length });
}
