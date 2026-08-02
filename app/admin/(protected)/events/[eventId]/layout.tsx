import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EventSidebar } from "@/components/event-sidebar";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, status: true, startsAt: true },
  });
  if (!event) notFound();

  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      <EventSidebar
        eventId={event.id}
        name={event.name}
        status={event.status}
        startsAt={event.startsAt.toISOString()}
      />
      <div className="mt-6 min-w-0 flex-1 lg:mt-0">{children}</div>
    </div>
  );
}
