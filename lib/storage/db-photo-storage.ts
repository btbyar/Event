import { prisma } from "@/lib/db";
import type { PhotoStorage } from "./photo-storage";

// Stores photo bytes directly in Postgres (see the PhotoBlob model). A
// zero-new-account fallback for hosts with no persistent disk and no budget
// for a separate object storage service — it piggybacks entirely on
// infrastructure the app already has (its own database). Fine at small to
// moderate event-photo volumes; keys mirror the same "eventId/photoId/name"
// format the other backends use, so this is a drop-in swap.
export class DbPhotoStorage implements PhotoStorage {
  async save(key: string, data: Buffer): Promise<void> {
    // Prisma's Bytes field wants a plain Uint8Array<ArrayBuffer>; Buffer's
    // type is technically Uint8Array<ArrayBufferLike> (could be a
    // SharedArrayBuffer), so re-wrap to satisfy the stricter type.
    const bytes = new Uint8Array(data);
    await prisma.photoBlob.upsert({
      where: { key },
      create: { key, data: bytes },
      update: { data: bytes },
    });
  }

  async read(key: string): Promise<Buffer> {
    const row = await prisma.photoBlob.findUniqueOrThrow({ where: { key } });
    return Buffer.from(row.data);
  }

  async delete(key: string): Promise<void> {
    await prisma.photoBlob.deleteMany({ where: { key } });
  }

  async deleteAllForEvent(eventId: string): Promise<void> {
    await prisma.photoBlob.deleteMany({ where: { key: { startsWith: `${eventId}/` } } });
  }
}
