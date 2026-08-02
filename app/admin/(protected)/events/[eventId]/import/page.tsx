import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GuestImport } from "@/components/guest-import";

export default async function ImportPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  return <GuestImport eventId={eventId} />;
}
