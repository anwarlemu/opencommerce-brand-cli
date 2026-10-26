"use client";

import * as React from "react";

import { type DateRange } from "@/components/ui/calendar";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

const TODAY = new Date(2026, 9, 26);
const days = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n);

export function Site() {
  const [date, setDate] = React.useState<Date | undefined>(days(30));
  return (
    <div className="grid w-full max-w-72 gap-1.5">
      <Label htmlFor="key-expiry">Key expires</Label>
      <DatePicker id="key-expiry" name="expires" value={date} onValueChange={setDate} calendar={{ today: TODAY, disabled: { before: TODAY } }} />
    </div>
  );
}

export function Range() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: days(-6), to: TODAY });
  return (
    <div className="grid w-full max-w-80 gap-1.5">
      <Label htmlFor="orders-range">Orders placed</Label>
      <DateRangePicker id="orders-range" name="placed" value={range} onValueChange={setRange} calendar={{ today: TODAY }} />
    </div>
  );
}

export function Presets() {
  const [range, setRange] = React.useState<DateRange | undefined>();
  return (
    <div className="grid w-full max-w-80 gap-1.5">
      <Label htmlFor="report-range">Report</Label>
      <DateRangePicker
        id="report-range"
        value={range}
        onValueChange={setRange}
        calendar={{ today: TODAY }}
        presets={[
          { label: "Today", value: { from: TODAY, to: TODAY } },
          { label: "Last 7 days", value: { from: days(-6), to: TODAY } },
          { label: "Last 30 days", value: { from: days(-29), to: TODAY } },
          { label: "This month", value: { from: new Date(2026, 9, 1), to: TODAY } },
        ]}
      />
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-72 gap-3">
      <DatePicker aria-label="Delivery date" placeholder="Pick a delivery date" aria-invalid />
      <p className="-mt-2 font-sans text-body-sm text-danger">Choose a delivery date.</p>
      <DatePicker aria-label="Locked date" defaultValue={TODAY} disabled />
    </div>
  );
}
