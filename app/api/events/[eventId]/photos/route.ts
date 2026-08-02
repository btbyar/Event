import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { getPhotoStorage } from "@/lib/storage/photo-storage";
import { processEventPhoto } from "@/lib/photos/process-photo";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILES_PER_REQUEST,
  MAX_FILE_SIZE_BYTES,
  THUMBNAIL_MAX_DIMENSION,
} from "@/lib/photos/limits";

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const photos = await prisma.eventPhoto.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    photos: photos.map((p) => ({
      id: p.id,
      originalName: p.originalName,
      width: p.width,
      height: p.height,
      processedAt: p.processedAt,
      faceCount: p.faceCount,
      createdAt: p.createdAt,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found", code: "eventNotFound" }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request", code: "invalidRequest" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Invalid request", code: "invalidRequest" }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: "Too many files", code: "tooManyFiles" }, { status: 400 });
  }

  const storage = getPhotoStorage();
  const created: { id: string }[] = [];
  const skipped: { fileName: string; reasonCode: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      skipped.push({ fileName: file.name, reasonCode: "invalidFileType" });
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      skipped.push({ fileName: file.name, reasonCode: "fileTooLarge" });
      continue;
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const image = sharp(buffer).rotate();
      const metadata = await image.metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;

      const thumbnail = await image
        .clone()
        .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      const normalizedOriginal = await image.clone().jpeg({ quality: 92 }).toBuffer();

      const photoId = randomUUID();
      const storageKey = `${eventId}/${photoId}/original.jpg`;
      const thumbnailKey = `${eventId}/${photoId}/thumb.webp`;

      await Promise.all([
        storage.save(storageKey, normalizedOriginal),
        storage.save(thumbnailKey, thumbnail),
      ]);

      const photo = await prisma.eventPhoto.create({
        data: {
          id: photoId,
          eventId,
          storageKey,
          thumbnailKey,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: normalizedOriginal.byteLength,
          width,
          height,
        },
      });
      created.push({ id: photo.id });
    } catch (err) {
      console.error(`[photos/upload] failed to store ${file.name}:`, err);
      skipped.push({ fileName: file.name, reasonCode: "unknownError" });
    }
  }

  // Respond as soon as files are safely stored; face detection continues
  // after the response so a large batch upload doesn't block on ML inference.
  after(() => Promise.all(created.map((p) => processEventPhoto(p.id))));

  return NextResponse.json({ createdCount: created.length, skipped });
}
