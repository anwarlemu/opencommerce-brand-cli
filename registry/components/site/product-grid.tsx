import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Products or use cases as large cards, in the home page's voice: white with 12px corners, a hairline and the window's
// soft drop, each holding a mist stage for the product's picture and its copy. A `lead` card spans the row, the stage on
// one side and the copy on the other (each lead turns the other way from the last); `half` cards pair up, stage above
// copy, their stages and copy lined up across the pair. Titles are the display face at 44px (32px on phones) and 500,
// the line 16px muted, then the blue key. Below 1024px every card stacks, stage first.

type ProductAction = { label: React.ReactNode; href: string; icon?: React.ReactNode };

type ProductItem = {
  title: React.ReactNode;
  description: React.ReactNode;
  /** The card's key: a label and href (the blue key), or your own element. */
  action?: ProductAction | React.ReactNode;
  /** The product's picture on the blue stage: a screen, a window, a 3D object. */
  media: React.ReactNode;
  layout?: "lead" | "half";
};

const isAction = (a: ProductItem["action"]): a is ProductAction => typeof a === "object" && a !== null && !React.isValidElement(a) && "href" in a;

function Action({ action, className }: { action: ProductItem["action"]; className?: string }) {
  if (!action) return null;
  if (!isAction(action)) return <div className={className}>{action}</div>;
  return (
    <Button asChild className={className}>
      <a href={action.href}>
        {action.label}
        {action.icon}
      </a>
    </Button>
  );
}

// The stage: mist under a hairline, the picture centered on it.
function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate flex min-h-80 items-center justify-center overflow-hidden rounded-card border border-line bg-subtle p-[clamp(0.875rem,1.8vw,1.375rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const CARD = "rounded-panel border border-line-strong bg-surface p-3 text-fg shadow-card max-lg:mx-auto max-lg:w-full max-lg:max-w-140";
const TITLE = "mb-3 font-display text-h2 leading-display font-medium tracking-tighter";
const LINE = "text-body leading-lead text-fg-muted";

function LeadCard({ product, reverse }: { product: ProductItem; reverse: boolean }) {
  return (
    <li
      className={cn(
        CARD,
        "grid grid-cols-1 items-center lg:col-span-2 lg:gap-[clamp(2rem,5vw,4.5rem)]",
        reverse ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]" : "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]",
      )}
    >
      <Stage className={cn("self-stretch", reverse && "lg:order-2")}>{product.media}</Stage>
      <div className={cn("px-3 pt-5.5 pb-3 lg:px-0 lg:py-6", reverse ? "lg:pl-[clamp(1.25rem,3vw,3rem)]" : "lg:pr-[clamp(1.25rem,3vw,3rem)]")}>
        <h3 className={TITLE}>{product.title}</h3>
        <p className={cn(LINE, "max-w-[30ch]")}>{product.description}</p>
        <Action action={product.action} className="mt-5.5" />
      </div>
    </li>
  );
}

function HalfCard({ product }: { product: ProductItem }) {
  return (
    <li className={cn(CARD, "grid grid-cols-1 lg:row-span-2 lg:grid-rows-subgrid lg:gap-0")}>
      <Stage className="self-stretch py-[clamp(1.125rem,2vw,1.625rem)]">{product.media}</Stage>
      <div className="flex flex-col self-stretch px-3 pt-5.5 pb-3">
        <h3 className={TITLE}>{product.title}</h3>
        <p className={cn(LINE, "mb-9 max-w-[44ch]")}>{product.description}</p>
        {product.action && <Action action={product.action} className="mt-auto self-start" />}
      </div>
    </li>
  );
}

/** The product cards: leads across the row, halves in pairs. */
function ProductGrid({ products, className, ...props }: React.ComponentProps<"ul"> & { products: ProductItem[] }) {
  let leads = 0;
  return (
    <ul data-slot="product-grid" className={cn("grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8", className)} {...props}>
      {products.map((product, i) =>
        product.layout === "half" ? <HalfCard key={i} product={product} /> : <LeadCard key={i} product={product} reverse={leads++ % 2 === 1} />,
      )}
    </ul>
  );
}

export { ProductGrid, type ProductItem, type ProductAction };
