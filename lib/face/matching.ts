import { MATCH_THRESHOLD } from "@/lib/photos/limits";

export type FaceCandidate = {
  photoId: string;
  embedding: number[];
};

export type PhotoMatch = {
  photoId: string;
  distance: number;
};

export function euclideanDistance(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Compares one query embedding (the guest's selfie) against every stored face
 * candidate (all faces detected across an event's photos) and returns the
 * photos that contain a matching face, closest first. A photo can have
 * multiple detected faces (e.g. a crowd shot) — only the closest one counts,
 * and each photo appears at most once in the result.
 */
export function findMatches(
  queryEmbedding: readonly number[],
  candidates: readonly FaceCandidate[],
  threshold: number = MATCH_THRESHOLD,
): PhotoMatch[] {
  const bestByPhoto = new Map<string, number>();

  for (const candidate of candidates) {
    const distance = euclideanDistance(queryEmbedding, candidate.embedding);
    if (distance > threshold) continue;
    const existing = bestByPhoto.get(candidate.photoId);
    if (existing === undefined || distance < existing) {
      bestByPhoto.set(candidate.photoId, distance);
    }
  }

  return Array.from(bestByPhoto, ([photoId, distance]) => ({ photoId, distance })).sort(
    (a, b) => a.distance - b.distance,
  );
}
