import * as React from "react";

import { SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// Pricing (the opencommerce site, pricing.tsx): the centered heading, then the plans side by side in the 800px column,
// each in a window named after it (free.plan). A plan has its name at 20px, the figure at 44px in the display face with
// its unit in 14px muted type beside it, a line on who it is for, then the compared rows on hairlines (the label muted
// at the left, the value at the right) and a full-width key. The featured plan carries a small mono tag in the pale blue,
// sets its values in blue and takes the blue key; the others take the white key. Rows line up across plans because
// every plan answers the same `rows`.

type PlanAction = { label: React.ReactNode; href: string };

type Plan = {
  name: string;
  /** A small tag beside the name (the featured plan's). */
  badge?: React.ReactNode;
  price: React.ReactNode;
  /** Beside the figure: "of each completed order", "/ month". */
  unit?: React.ReactNode;
  /** Who it is for, under the figure. */
  blurb?: React.ReactNode;
  /** One value per row, in the order of `rows`. */
  values: React.ReactNode[];
  /** The plan's key: a label and href, or your own element. */
  action?: PlanAction | React.ReactNode;
  /** The plan to steer toward: blue values and the blue key. One at most. */
  featured?: boolean;
  /** The window's name; defaults to the plan's slug with .plan. */
  file?: string;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isAction = (a: Plan["action"]): a is PlanAction => typeof a === "object" && a !== null && !React.isValidElement(a) && "href" in a;

function PlanWindow({ plan, rows }: { plan: Plan; rows: React.ReactNode[] }) {
  return (
    <Window name={plan.file ?? `${slug(plan.name)}.plan`} bodyClassName="flex flex-col">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-h4 leading-snug font-medium tracking-tight">{plan.name}</h3>
          {plan.badge && <span className="rounded-chip bg-tint px-2 py-1 font-mono text-caption leading-none text-fg-brand">{plan.badge}</span>}
        </div>
        <p className="mt-5 flex items-baseline gap-2">
          <span className="font-display text-h2 leading-none font-medium tracking-hero">{plan.price}</span>
          {plan.unit && <span className="text-body-sm text-fg-muted">{plan.unit}</span>}
        </p>
        {plan.blurb && <p className="mt-3 text-button leading-relaxed text-fg-muted">{plan.blurb}</p>}
        {rows.length > 0 && (
          <dl className="mt-6 border-t border-line">
            {rows.map((row, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5 text-body-sm">
                <dt className="text-fg-muted">{row}</dt>
                <dd className={cn("text-right", plan.featured && "text-fg-brand")}>{plan.values[i]}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto pt-7">
          {isAction(plan.action) ? (
            <Button asChild variant={plan.featured ? "primary" : "secondary"} className="w-full">
              <a href={plan.action.href}>{plan.action.label}</a>
            </Button>
          ) : (
            plan.action
          )}
        </div>
      </div>
    </Window>
  );
}

function Pricing({
  title,
  description,
  rows = [],
  plans,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & { title?: React.ReactNode; description?: React.ReactNode; rows?: React.ReactNode[]; plans: Plan[] }) {
  return (
    <div data-slot="pricing" className={cn("w-full", className)} {...props}>
      {title && <SectionHeading title={title} description={description} />}
      <div className={cn("mx-auto grid max-w-(--ds-layout-medium) gap-5 md:gap-6", plans.length > 1 && "md:grid-cols-2")}>
        {plans.map((plan) => (
          <PlanWindow key={plan.name} plan={plan} rows={rows} />
        ))}
      </div>
    </div>
  );
}

export { Pricing, type Plan, type PlanAction };
