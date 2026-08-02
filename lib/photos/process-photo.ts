import { prisma } from "@/lib/db";
import { getPhotoStorage } from "@/lib/storage/photo-storage";
import { detectFacesInImageBuffer } from "@/lib/face/server-engine";

/**
 * Runs face detection on one already-stored EventPhoto and records the
 * results. Called from `after()` right after upload so the HTTP response can
 * return immediately, and again by the "reprocess pending" admin action for
 * any photo left at `processedAt: null` (e.g. a server restart mid-batch).
 * Never throws past its own boundary — a failure just leaves the photo
 * pending/retryable instead of crashing the background task.
 */
export async function processEventPhoto(photoId: string): Promise<void> {
  try {
    const photo = await prisma.eventPhoto.findUnique({ where: { id: photoId } });
    if (!photo) return;

    const buffer = await getPhotoStorage().read(photo.storageKey);
    const faces = await detectFacesInImageBuffer(buffer);

    await prisma.$transaction([
      prisma.photoFace.deleteMany({ where: { photoId } }),
      ...faces.map((face) =>
        prisma.photoFace.create({
          data: { photoId, embedding: face.embedding, box: face.box },
        }),
      ),
      prisma.eventPhoto.update({
        where: { id: photoId },
        data: { processedAt: new Date(), faceCount: faces.length },
      }),
    ]);
  } catch (err) {
    console.error(`[process-photo] failed to process photo ${photoId}:`, err);
  }
}
