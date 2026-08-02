import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EventPhotos } from "@/components/event-photos";

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  return <EventPhotos eventId={eventId} />;
}
