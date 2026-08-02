// Shared constants for the event-photo upload/face-match feature. Imported by
// both client components (pre-validation, nicer errors before a request is even
// sent) and API routes (the actual enforcement) so the two never drift apart.

export const MAX_FILES_PER_REQUEST = 12;
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const THUMBNAIL_MAX_DIMENSION = 480;
// Photos are downscaled before face detection to bound per-photo compute cost
// on the server's CPU backend — detection accuracy is unaffected in practice
// since faces in event photos are rarely smaller than this after downscaling.
export const DETECTION_MAX_DIMENSION = 1600;

// Guest photo-access JWTs live long enough for a guest to come back and
// re-download from the same device well after the event ends — matching is
// still computed fresh per selfie/photo, so this is purely how long a
// *device* can skip re-matching, not how long server-side data is retained
// (that's controlled entirely by admin-triggered photo deletion).
export const PHOTO_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

// Euclidean distance between two face-recognition-net descriptors. Slightly
// stricter than face-api.js's commonly-cited 0.6 "1:1 verification" default,
// since we're comparing one selfie against potentially hundreds of stored
// faces per event — a fixed per-pair threshold has more chances to produce an
// accidental false positive the more candidates it's checked against.
export const MATCH_THRESHOLD = 0.52;
