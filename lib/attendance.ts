import type { GuestStatus } from "@prisma/client";

export function computeArrivalStatus(
  now: Date,
  event: { startsAt: Date; lateThresholdMinutes: number },
): GuestStatus {
  const cutoff = new Date(new Date(event.startsAt).getTime() + event.lateThresholdMinutes * 60_000);
  return now > cutoff ? "LATE" : "ARRIVED";
}
