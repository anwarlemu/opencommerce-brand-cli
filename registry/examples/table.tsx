import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROWS = [
  { merchant: "DoorDash", success: "100%", last: "5 min ago", duration: "12 sec", status: "Operational" },
  { merchant: "Amazon", success: "99.9%", last: "1 min ago", duration: "9 sec", status: "Operational" },
  { merchant: "Best Buy", success: "99.6%", last: "7 min ago", duration: "16 sec", status: "Degraded" },
] as const;

export function Site() {
  return (
    <Table label="Merchant monitoring">
      <TableHeader>
        <TableRow>
          <TableHead>Merchant</TableHead>
          <TableHead>Success rate</TableHead>
          <TableHead>Last purchase</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.merchant}>
            <TableCell className="font-medium">{row.merchant}</TableCell>
            <TableCell label="Success rate" className="font-mono text-snippet">
              {row.success}
            </TableCell>
            <TableCell label="Last purchase" className="text-fg-muted">
              {row.last}
            </TableCell>
            <TableCell label="Duration" className="font-mono text-snippet text-fg-muted">
              {row.duration}
            </TableCell>
            <TableCell label="Status">
              <Badge variant={row.status === "Operational" ? "success" : "warning"}>{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// A comparison, the row names in the first column.
export function Compare() {
  const rows = [
    ["Merchants", "5 of your choice", "Every merchant"],
    ["Payment providers", "2", "Every provider"],
    ["Platform fee", "None", "1% of each completed order"],
  ];
  return (
    <Table label="Free and Standard compared">
      <TableHeader>
        <TableRow>
          <TableHead>
            <span className="sr-only">Topic</span>
          </TableHead>
          <TableHead>Free</TableHead>
          <TableHead>Standard</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([topic, free, standard]) => (
          <TableRow key={topic}>
            <TableCell className="text-fg-muted">{topic}</TableCell>
            <TableCell label="Free">{free}</TableCell>
            <TableCell label="Standard" className="text-fg-brand">{standard}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
