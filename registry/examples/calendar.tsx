"use client";

import * as React from "react";

import { Calendar, type DateRange } from "@/components/ui/calendar";

const TODAY = new Date(2026, 9, 26);

export function Site() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 9, 29));
  return (
    <div className="w-fit rounded-panel border border-line-window bg-surface shadow-card">
      <Calendar mode="single" selected={date} onSelect={setDate} today={TODAY} disabled={{ before: TODAY }} />
    </div>
  );
}

export function Range() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 9, 20), to: new Date(2026, 9, 26) });
  return (
    <div className="w-fit max-w-full overflow-x-auto rounded-panel border border-line-window bg-surface shadow-card">
      <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} today={TODAY} />
    </div>
  );
}

export function Multiple() {
  const [days, setDays] = React.useState<Date[]>([new Date(2026, 9, 27), new Date(2026, 9, 30)]);
  return (
    <div className="w-fit rounded-panel border border-line-window bg-surface shadow-card">
      <Calendar mode="multiple" selected={days} onSelect={setDays} max={5} weekStartsOn={1} today={TODAY} disabled={{ dayOfWeek: [0, 6] }} />
    </div>
  );
}

export function Dropdown() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2027, 2, 15));
  return (
    <div className="w-fit rounded-panel border border-line-window bg-surface shadow-card">
      <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" fromYear={2024} toYear={2030} today={TODAY} />
    </div>
  );
}
