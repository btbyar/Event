import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MonitorDashboard } from "@/components/monitor-dashboard";

export default async function MonitorPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  return <MonitorDashboard eventId={eventId} />;
}
