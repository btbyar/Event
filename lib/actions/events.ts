"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().min(1, "Date/time is required"),
  lateThresholdMinutes: z.coerce.number().int().min(0).default(15),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).default("DRAFT"),
});

async function requireAdminId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function parseEventForm(formData: FormData) {
  return eventSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    startsAt: formData.get("startsAt"),
    lateThresholdMinutes: formData.get("lateThresholdMinutes") || 15,
    status: formData.get("status") || "DRAFT",
  });
}

export async function createEvent(formData: FormData) {
  const adminId = await requireAdminId();
  const parsed = parseEventForm(formData);

  const event = await prisma.event.create({
    data: {
      ...parsed,
      startsAt: new Date(parsed.startsAt),
      createdById: adminId,
    },
  });

  revalidatePath("/admin/dashboard");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  await requireAdminId();
  const parsed = parseEventForm(formData);

  await prisma.event.update({
    where: { id: eventId },
    data: { ...parsed, startsAt: new Date(parsed.startsAt) },
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/dashboard");
}

export async function deleteEvent(eventId: string) {
  await requireAdminId();
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}
