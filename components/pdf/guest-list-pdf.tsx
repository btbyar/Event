import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 4 },
  subtitle: { fontSize: 10, marginBottom: 16, color: "#555555" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeeee", paddingVertical: 4 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 4,
    marginBottom: 4,
  },
  cellName: { width: "26%" },
  cellTable: { width: "14%" },
  cellSeat: { width: "10%" },
  cellStatus: { width: "16%" },
  cellCheckedIn: { width: "20%" },
  cellCode: { width: "14%" },
});

export type PdfGuestRow = {
  fullName: string;
  tableLabel: string;
  seatNumber: string;
  status: string;
  checkedInAt: string;
  invitationCode: string;
};

export function GuestListPdf({
  eventName,
  subtitle,
  headers,
  guests,
}: {
  eventName: string;
  subtitle: string;
  headers: {
    name: string;
    table: string;
    seat: string;
    status: string;
    checkedInAt: string;
    code: string;
  };
  guests: PdfGuestRow[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{eventName}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.cellName}>{headers.name}</Text>
          <Text style={styles.cellTable}>{headers.table}</Text>
          <Text style={styles.cellSeat}>{headers.seat}</Text>
          <Text style={styles.cellStatus}>{headers.status}</Text>
          <Text style={styles.cellCheckedIn}>{headers.checkedInAt}</Text>
          <Text style={styles.cellCode}>{headers.code}</Text>
        </View>
        {guests.map((g, i) => (
          <View style={styles.row} key={i} wrap={false}>
            <Text style={styles.cellName}>{g.fullName}</Text>
            <Text style={styles.cellTable}>{g.tableLabel}</Text>
            <Text style={styles.cellSeat}>{g.seatNumber}</Text>
            <Text style={styles.cellStatus}>{g.status}</Text>
            <Text style={styles.cellCheckedIn}>{g.checkedInAt}</Text>
            <Text style={styles.cellCode}>{g.invitationCode}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
