import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  const [event, guests, tables] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.guest.findMany({ where: { eventId }, include: { table: true } }),
    prisma.table.findMany({ where: { eventId } }),
  ]);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const totals = {
    total: guests.length,
    arrived: guests.filter((g) => g.status === "ARRIVED").length,
    late: guests.filter((g) => g.status === "LATE").length,
    notArrived: guests.filter((g) => g.status === "NOT_ARRIVED").length,
  };

  const perTable = tables
    .map((table) => {
      const tableGuests = guests.filter((g) => g.tableId === table.id);
      return {
        id: table.id,
        label: table.label,
        capacity: table.capacity,
        seated: tableGuests.length,
        arrived: tableGuests.filter((g) => g.status !== "NOT_ARRIVED").length,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const unassignedCount = guests.filter((g) => !g.tableId).length;

  const recentCheckIns = guests
    .filter((g) => g.checkedInAt)
    .sort((a, b) => b.checkedInAt!.getTime() - a.checkedInAt!.getTime())
    .slice(0, 10)
    .map((g) => ({
      fullName: g.fullName,
      checkedInAt: g.checkedInAt,
      status: g.status,
      tableLabel: g.table?.label ?? null,
    }));

  return NextResponse.json({ totals, perTable, unassignedCount, recentCheckIns });
}
