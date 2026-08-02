import { LocalPhotoStorage } from "./local-photo-storage";
import { R2PhotoStorage } from "./r2-photo-storage";
import { DbPhotoStorage } from "./db-photo-storage";

// Storage abstraction for event photo binaries. Every caller in this app
// talks to this interface, never to a concrete implementation directly.
// Three backends: local disk (dev, or a host with a real persistent volume),
// Cloudflare R2 (object storage, for hosts without a volume), and Postgres
// (DbPhotoStorage — a zero-new-account fallback that piggybacks on the
// app's existing database when neither of the above is available). Server-only.
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

function resolveBackend(): PhotoStorage {
  // Explicit opt-in wins outright — set PHOTO_STORAGE_BACKEND=db (or "r2" /
  // "local") when you want to force a specific backend regardless of what
  // else looks configured.
  const explicit = process.env.PHOTO_STORAGE_BACKEND;
  if (explicit === "db") return new DbPhotoStorage();
  if (explicit === "r2") return new R2PhotoStorage();
  if (explicit === "local") return new LocalPhotoStorage();

  return r2Configured() ? new R2PhotoStorage() : new LocalPhotoStorage();
}

export function getPhotoStorage(): PhotoStorage {
  if (!instance) instance = resolveBackend();
  return instance;
}
