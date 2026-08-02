import { LocalPhotoStorage } from "./local-photo-storage";
import { R2PhotoStorage } from "./r2-photo-storage";

// Storage abstraction for event photo binaries. Every caller in this app
// talks to this interface, never to a concrete implementation directly — the
// two implementations are local disk (dev, or a host with a real persistent
// volume) and Cloudflare R2 (production hosts without one, e.g. Render
// without a paid Disk add-on). Server-only (uses Node fs / network).
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

function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

export function getPhotoStorage(): PhotoStorage {
  if (!instance) {
    instance = r2Configured() ? new R2PhotoStorage() : new LocalPhotoStorage();
  }
  return instance;
}
