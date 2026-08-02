import { PrismaClient } from "@prisma/client";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I to avoid ambiguity

export function generateInvitationCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueInvitationCode(
  prisma: PrismaClient,
  eventId: string,
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateInvitationCode();
    const existing = await prisma.guest.findUnique({
      where: { eventId_invitationCode: { eventId, invitationCode: candidate } },
    });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique invitation code.");
}
