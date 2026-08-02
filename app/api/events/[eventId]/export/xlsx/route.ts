import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { sanitizeFilename } from "@/lib/files";
import { getDictionary } from "@/lib/i18n/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const { t, locale } = await getDictionary();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json(
      { error: "Event not found", code: "eventNotFound" },
      { status: 404 },
    );
  }

  const guests = await prisma.guest.findMany({
    where: { eventId },
    include: { table: true },
    orderBy: [{ fullName: "asc" }],
  });

  const dateLocale = locale === "mn" ? "mn-MN" : "en-US";
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(t.exports.sheetName);
  sheet.columns = [
    { header: t.exports.name, key: "name", width: 28 },
    { header: t.exports.table, key: "table", width: 14 },
    { header: t.exports.seat, key: "seat", width: 8 },
    { header: t.exports.status, key: "status", width: 14 },
    { header: t.exports.checkedInAt, key: "checkedInAt", width: 22 },
    { header: t.exports.phone, key: "phone", width: 18 },
    { header: t.exports.email, key: "email", width: 24 },
    { header: t.exports.invitationCode, key: "code", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const g of guests) {
    sheet.addRow({
      name: g.fullName,
      table: g.table?.label ?? "",
      seat: g.seatNumber ?? "",
      status: t.status[g.status as keyof typeof t.status],
      checkedInAt: g.checkedInAt ? g.checkedInAt.toLocaleString(dateLocale) : "",
      phone: g.phone ?? "",
      email: g.email ?? "",
      code: g.invitationCode,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(event.name)}-guests.xlsx"`,
    },
  });
}
