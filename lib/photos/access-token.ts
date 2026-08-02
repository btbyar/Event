import { SignJWT, jwtVerify } from "jose";
import { PHOTO_TOKEN_TTL_SECONDS } from "@/lib/photos/limits";

// Signs/verifies guest photo-gallery tokens (long-lived — see
// PHOTO_TOKEN_TTL_SECONDS — so a returning guest's device can keep browsing
// their matched photos long after the event). Deliberately a separate secret
// from AUTH_SECRET so an admin session and a guest photo token can never be
// confused with or substituted for one another.
const secret = new TextEncoder().encode(
  process.env.PHOTO_ACCESS_SECRET || "dev-only-insecure-photo-access-secret",
);

export type PhotoAccessPayload = {
  eventId: string;
  photoIds: string[];
};

export async function signPhotoAccessToken(payload: PhotoAccessPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PHOTO_TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyPhotoAccessToken(token: string): Promise<PhotoAccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.eventId !== "string" ||
      !Array.isArray(payload.photoIds) ||
      !payload.photoIds.every((id) => typeof id === "string")
    ) {
      return null;
    }
    return { eventId: payload.eventId, photoIds: payload.photoIds as string[] };
  } catch {
    return null;
  }
}
