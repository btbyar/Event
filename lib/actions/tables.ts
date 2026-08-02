"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const tableSchema = z.object({
  label: z.string().min(1, "Label is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

export async function createTable(eventId: string, formData: FormData) {
  await requireAuth();
  const parsed = tableSchema.parse({
    label: formData.get("label"),
    capacity: formData.get("capacity"),
  });

  try {
    await prisma.table.create({ data: { ...parsed, eventId } });
  } catch (err: unknown) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`A table named "${parsed.label}" already exists for this event.`);
    }
    throw err;
  }

  revalidatePath(`/admin/events/${eventId}/tables`);
}

export async function updateTable(eventId: string, tableId: string, formData: FormData) {
  await requireAuth();
  const parsed = tableSchema.parse({
    label: formData.get("label"),
    capacity: formData.get("capacity"),
  });

  try {
    await prisma.table.update({ where: { id: tableId }, data: parsed });
  } catch (err: unknown) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`A table named "${parsed.label}" already exists for this event.`);
    }
    throw err;
  }

  revalidatePath(`/admin/events/${eventId}/tables`);
}

export async function deleteTable(eventId: string, tableId: string) {
  await requireAuth();
  await prisma.table.delete({ where: { id: tableId } });
  revalidatePath(`/admin/events/${eventId}/tables`);
  revalidatePath(`/admin/events/${eventId}/guests`);
}

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
}
