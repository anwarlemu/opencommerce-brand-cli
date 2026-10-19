import { StatusTable, type DayStatus } from "@/components/site/status-table";

// Deterministic per name, so the server and the browser draw the same bars.
function history(name: string): DayStatus[] {
  let seed = [...name].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  return Array.from({ length: 45 }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const r = seed / 2 ** 32;
    return r < 0.03 ? "down" : r < 0.08 ? "degraded" : "up";
  });
}

const ROWS = [
  ["Northwind", "100%", "5 min ago", "12 sec"],
  ["Acme Supply", "99.9%", "1 min ago", "9 sec"],
  ["Globex", "99.8%", "2 min ago", "14 sec"],
  ["Initech", "100%", "4 min ago", "11 sec"],
].map(([name, ...values]) => ({ name, values, days: history(name) }));

export function Site() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <StatusTable
        nameLabel="Merchant"
        columns={[{ label: "Success rate", mono: true }, { label: "Last purchase", muted: true }, { label: "Duration", mono: true, muted: true }]}
        daysLabel="Uptime · 45 days"
        filterLabel="Filter merchants"
        filterPlaceholder="Filter merchants…"
        note="+ 4000 more merchants"
        rows={ROWS}
      />
    </div>
  );
}
