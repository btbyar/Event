import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { getPhotoStorage } from "@/lib/storage/photo-storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  await prisma.eventPhoto.deleteMany({ where: { eventId } });
  await getPhotoStorage().deleteAllForEvent(eventId);

  return NextResponse.json({ ok: true });
}
