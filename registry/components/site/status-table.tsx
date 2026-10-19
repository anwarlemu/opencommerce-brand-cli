"use client";

import * as React from "react";

import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// A live status table (the opencommerce site, monitoring.tsx): one window across the column (monitoring.live). A mist
// strip on top holds the live dot (the blue dot with a ping ring, still with reduced motion) and a filter field; then
// the table: 12px muted heads, rows on hairlines that take the mist under the pointer, each with the item's mark in a
// small tile and its name, figures in 13px mono, and a run of day bars (blue up, pale blue degraded, faint ink down). A
// mist strip at the foot holds the legend and a note. On a phone each row becomes a stacked entry with the same bars.

type DayStatus = "up" | "degraded" | "down";
type StatusColumn = { label: React.ReactNode; mono?: boolean; muted?: boolean };
type StatusRow = {
  name: string;
  /** The item's mark, about 14px, drawn in currentColor. */
  logo?: React.ReactNode;
  /** One value per column, in the order of `columns`. */
  values: React.ReactNode[];
  /** The day bars, oldest first. */
  days?: DayStatus[];
};

const BAR: Record<DayStatus, string> = { up: "bg-brand", degraded: "bg-brand/35", down: "bg-ink/20" };
const LEGEND: Record<DayStatus, string> = { up: "Operational", degraded: "Degraded", down: "Down" };

function Days({ name, days, className }: { name: string; days: DayStatus[]; className: string }) {
  return (
    <div role="img" aria-label={`${name}: ${days.filter((d) => d === "up").length} of ${days.length} days operational`} className={cn("flex", className)}>
      {days.map((s, i) => (
        <span key={i} title={LEGEND[s]} className={cn("flex-1 rounded-chip", BAR[s])} />
      ))}
    </div>
  );
}

function Tile({ row }: { row: StatusRow }) {
  return (
    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-chip border border-line bg-surface text-fg/70 [&>svg]:h-3.5 [&>svg]:w-auto">
      {row.logo ?? <span className="font-mono text-caption">{row.name.slice(0, 1)}</span>}
    </span>
  );
}

function StatusTable({
  rows,
  columns,
  name = "monitoring.live",
  nameLabel = "Name",
  daysLabel,
  live = "Live",
  filterLabel = "Filter",
  filterPlaceholder = "Filter…",
  note,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  rows: StatusRow[];
  /** The columns between the name and the bars. */
  columns: StatusColumn[];
  /** The window's name. */
  name?: string;
  nameLabel?: React.ReactNode;
  /** The bars' heading ("Uptime · 45 days"). */
  daysLabel?: React.ReactNode;
  live?: React.ReactNode;
  filterLabel?: string;
  filterPlaceholder?: string;
  /** The foot's note at the right ("+ 4000 more merchants"). */
  note?: React.ReactNode;
}) {
  const [filter, setFilter] = React.useState("");
  const fieldId = React.useId();
  const shown = rows.filter((r) => r.name.toLowerCase().includes(filter.trim().toLowerCase()));
  const hasDays = rows.some((r) => r.days?.length);
  const empty = `Nothing matches “${filter}”.`;

  return (
    <Window name={name} data-slot="status-table" className={cn("relative z-10", className)} {...props}>
      <div className="flex items-center justify-between gap-4 border-b border-line bg-subtle px-5 py-3">
        <span className="flex items-center gap-2 text-snippet text-fg-muted">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-brand" />
          </span>
          {live}
        </span>
        <label className="sr-only" htmlFor={fieldId}>
          {filterLabel}
        </label>
        <input
          id={fieldId}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={filterPlaceholder}
          className="h-9 w-48 min-w-0 rounded-control border border-line-field bg-surface px-3 text-body-sm text-fg outline-none transition-colors duration-(--ds-duration-fast) ease-out placeholder:text-fg-faint focus:border-brand max-sm:w-40 motion-reduce:transition-none"
        />
      </div>

      <ul className="list-none p-0 md:hidden">
        {shown.map((r) => (
          <li key={r.name} className="border-b border-line px-4 py-4 last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 text-body-sm font-medium">
                <Tile row={r} />
                {r.name}
              </span>
              <span className="font-mono text-snippet">{r.values[0]}</span>
            </div>
            {r.values.length > 1 && (
              <p className="mt-2 text-caption text-fg-muted">
                {r.values.slice(1).map((v, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && " · "}
                    <span className={cn(columns[i + 1]?.mono && "font-mono")}>{v}</span>
                  </React.Fragment>
                ))}
              </p>
            )}
            {r.days && <Days name={r.name} days={r.days} className="mt-3 h-6 gap-0.5" />}
          </li>
        ))}
        {shown.length === 0 && <li className="px-4 py-10 text-center text-body-sm text-fg-muted">{empty}</li>}
      </ul>

      <div className="overflow-x-auto max-md:hidden">
        <table className="w-full min-w-190 border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-line text-left text-caption text-fg-muted">
              <th className="px-5 py-3 font-normal">{nameLabel}</th>
              {columns.map((c, i) => (
                <th key={i} className="px-3 py-3 font-normal">
                  {c.label}
                </th>
              ))}
              {hasDays && <th className="px-5 py-3 font-normal">{daysLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.name} className="border-b border-line transition-colors duration-(--ds-duration-fast) ease-out last:border-b-0 hover:bg-subtle motion-reduce:transition-none">
                <td className="px-5 py-4 font-medium">
                  <span className="flex items-center gap-3">
                    <Tile row={r} />
                    {r.name}
                  </span>
                </td>
                {columns.map((c, i) => (
                  <td key={i} className={cn("px-3 py-4", c.mono && "font-mono text-snippet", c.muted && "text-fg-muted")}>
                    {r.values[i]}
                  </td>
                ))}
                {hasDays && <td className="px-5 py-4">{r.days && <Days name={r.name} days={r.days} className="h-7 gap-0.75" />}</td>}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1 + (hasDays ? 1 : 0)} className="px-5 py-10 text-center text-fg-muted">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(hasDays || note) && (
        <div className="flex flex-wrap items-center gap-5 border-t border-line bg-subtle px-5 py-3 text-caption text-fg-muted">
          {hasDays &&
            (Object.keys(BAR) as DayStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-2">
                <span aria-hidden className={cn("h-3 w-1.5 rounded-chip", BAR[s])} />
                {LEGEND[s]}
              </span>
            ))}
          {note && <span className="ml-auto">{note}</span>}
        </div>
      )}
    </Window>
  );
}

export { StatusTable };
export type { DayStatus, StatusColumn, StatusRow };
