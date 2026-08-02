"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { normalizeName } from "@/lib/matching";
import { generateInvitationCode } from "@/lib/codes";

const guestSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  tableId: z.string().optional(),
  seatNumber: z.coerce.number().int().min(1).optional(),
  invitationCode: z.string().optional(),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

function parseGuestForm(formData: FormData) {
  return guestSchema.parse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    tableId: formData.get("tableId") || undefined,
    seatNumber: formData.get("seatNumber") || undefined,
    invitationCode: formData.get("invitationCode") || undefined,
  });
}

async function resolveInvitationCode(eventId: string, preferred?: string, excludeGuestId?: string) {
  if (preferred) {
    const normalized = preferred.trim().toUpperCase();
    const existing = await prisma.guest.findUnique({
      where: { eventId_invitationCode: { eventId, invitationCode: normalized } },
    });
    if (existing && existing.id !== excludeGuestId) {
      throw new Error(`Invitation code "${normalized}" is already in use for this event.`);
    }
    return normalized;
  }

  for (let i = 0; i < 10; i++) {
    const candidate = generateInvitationCode();
    const existing = await prisma.guest.findUnique({
      where: { eventId_invitationCode: { eventId, invitationCode: candidate } },
    });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique invitation code, please try again.");
}

export async function createGuest(eventId: string, formData: FormData) {
  await requireAuth();
  const parsed = parseGuestForm(formData);
  const invitationCode = await resolveInvitationCode(eventId, parsed.invitationCode);

  try {
    await prisma.guest.create({
      data: {
        eventId,
        fullName: parsed.fullName,
        normalizedName: normalizeName(parsed.fullName),
        phone: parsed.phone,
        email: parsed.email,
        tableId: parsed.tableId || null,
        seatNumber: parsed.seatNumber ?? null,
        invitationCode,
      },
    });
  } catch (err: unknown) {
    throw translateGuestError(err);
  }

  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}/tables`);
}

export async function updateGuest(eventId: string, guestId: string, formData: FormData) {
  await requireAuth();
  const parsed = parseGuestForm(formData);
  const invitationCode = await resolveInvitationCode(eventId, parsed.invitationCode, guestId);

  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        fullName: parsed.fullName,
        normalizedName: normalizeName(parsed.fullName),
        phone: parsed.phone,
        email: parsed.email,
        tableId: parsed.tableId || null,
        seatNumber: parsed.seatNumber ?? null,
        invitationCode,
      },
    });
  } catch (err: unknown) {
    throw translateGuestError(err);
  }

  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}/tables`);
}

export async function deleteGuest(eventId: string, guestId: string) {
  await requireAuth();
  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}/tables`);
}

function translateGuestError(err: unknown): Error {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: unknown }).code;
    if (code === "P2002") {
      return new Error("That seat is already assigned to another guest at this table.");
    }
  }
  return err instanceof Error ? err : new Error("Something went wrong saving the guest.");
}
