"use client";

import { AreaChart, BarChart, type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, LineChart, PieChart } from "@/components/ui/chart";

const ORDERS = [
  { month: "May", purchases: 1860, retries: 80 },
  { month: "June", purchases: 3050, retries: 200 },
  { month: "July", purchases: 2370, retries: 120 },
  { month: "August", purchases: 3730, retries: 190 },
  { month: "September", purchases: 4090, retries: 130 },
  { month: "October", purchases: 4640, retries: 140 },
];

const config = {
  purchases: { label: "Purchases" },
  retries: { label: "Retries" },
} satisfies ChartConfig;

const short = (v: string) => v.slice(0, 3);

export function Site() {
  return (
    <ChartContainer config={config} className="aspect-auto h-80 w-full">
      <BarChart data={ORDERS} index="month" tickFormatter={short} aria-label="Purchases and retries per month" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

export function Line() {
  return (
    <ChartContainer config={config} className="aspect-auto h-80 w-full">
      <LineChart data={ORDERS} index="month" tickFormatter={short} showYAxis dots aria-label="Purchases per month" />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

export function Area() {
  return (
    <ChartContainer config={config} className="aspect-auto h-80 w-full">
      <AreaChart data={ORDERS} index="month" tickFormatter={short} stacked aria-label="Purchases and retries per month, stacked" />
      <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
    </ChartContainer>
  );
}

const STORES = [
  { store: "amazon", count: 1240 },
  { store: "target", count: 640 },
  { store: "bestbuy", count: 380 },
  { store: "staples", count: 210 },
];

const storeConfig = {
  amazon: { label: "Amazon" },
  target: { label: "Target" },
  bestbuy: { label: "Best Buy" },
  staples: { label: "Staples" },
} satisfies ChartConfig;

export function Pie() {
  return (
    <ChartContainer config={storeConfig} className="mx-auto aspect-square max-h-72">
      <PieChart data={STORES} index="store" value="count" aria-label="Orders by merchant" />
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}
