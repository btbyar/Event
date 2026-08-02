import { LocalPhotoStorage } from "./local-photo-storage";

// Storage abstraction for event photo binaries. The only implementation today
// is local disk (see local-photo-storage.ts), but every caller in this app talks
// to this interface — swapping in S3/Vercel Blob later means writing one new
// file, not touching upload/matching/serving logic. Server-only (uses Node fs).
export interface PhotoStorage {
  /** Persists a buffer under `key` (e.g. "eventId/photoId/original.jpg"). */
  save(key: string, data: Buffer): Promise<void>;
  /** Reads back a previously saved buffer. Throws if the key doesn't exist. */
  read(key: string): Promise<Buffer>;
  /** Deletes a single stored object. No-ops if it doesn't exist. */
  delete(key: string): Promise<void>;
  /** Deletes every object stored under a given event, e.g. on "delete all photos". */
  deleteAllForEvent(eventId: string): Promise<void>;
}

let instance: PhotoStorage | undefined;

export function getPhotoStorage(): PhotoStorage {
  if (!instance) instance = new LocalPhotoStorage();
  return instance;
}
