# Accordion
Expandable questions or sections with keyboard navigation.

Install: npx opencommerce-ds add accordion
Requires: theme, utils
Packages: @radix-ui/react-accordion
Exports: Accordion, AccordionContent, AccordionItem, AccordionMark, AccordionTrigger
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/faq.tsx; src/app/globals.css (details[open] > .faq-answer)


## Usage
Use for FAQs or details that can stay collapsed, in a reading column (800px at most). Pull the list out by its row padding (-mx-4) so the questions line up with the heading. The WithTopics example adds topic tabs.
- Avoid: Chevrons or typed plus signs
- Avoid: Bold questions
- Avoid: Borders or shadows around each question
- Avoid: More than one answer open by default


## Examples
Example components: npx opencommerce-ds add accordion tabs
[Site](https://opencommerce-ds.vercel.app/preview/accordion/Site) | [WithTopics](https://opencommerce-ds.vercel.app/preview/accordion/WithTopics)

examples/accordion.tsx

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GENERAL = [
  { q: "What is opencommerce?", a: "An open router for commerce: one endpoint your agent calls to search, buy and track orders across any online store, built by Agentcard." },
  { q: "Which stores can my agent buy from?", a: "Any online store. The Free plan covers five merchants of your choice; Standard opens every merchant we route to." },
  { q: "How are payments handled?", a: "Cards are tokenized through your payment provider and attached to a customer. Your agent never sees or stores raw card numbers." },
  { q: "Which agent frameworks does it work with?", a: "Anything that can call a tool. The SDK exports a ready-made tool definition, and the same API is available over plain HTTP." },
];

function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="-mx-4 w-[calc(100%+var(--ds-space-8))] max-w-208">
      {items.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Site() {
  return (
    <div className="mx-auto w-full max-w-200 px-4">
      <Faq items={GENERAL} />
    </div>
  );
}

export function WithTopics() {
  return (
    <div className="mx-auto flex w-full max-w-200 flex-col items-center gap-10 px-4">
      <h2 className="text-center text-h2 leading-display tracking-tighter">Questions</h2>
      <Tabs defaultValue="general" className="w-full items-center gap-8">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="w-full">
          <Faq items={GENERAL} />
        </TabsContent>
        <TabsContent value="payments" className="w-full">
          <Faq items={GENERAL.slice(2)} />
        </TabsContent>
        <TabsContent value="merchants" className="w-full">
          <Faq items={GENERAL.slice(1, 3)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

## Source

components/ui/accordion.tsx

```tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";

// The brand's questions (faq.tsx, globals.css details[open] > .faq-answer; computed): rows on 9 percent ink rules, each
// question in 16px Inter at 20px by 16px, a drawn + at the right (two 1px bars in a 14px box, 64 percent ink). Under the
// pointer, and while open, a row takes the pale blue on a card drawn 3px inside its edges (6px corners), and the rules on
// both its edges step aside so the card never sits between lines; the color eases in 200ms. Open, the + turns an eighth
// into an x and goes blue (200ms ease-out), and the answer (15px Inter at 64 percent ink, 576px wide) slides open and
// fades up 4px into place. Reduced motion opens it at once. Pull the list out by its padding (-mx-4) so the text lines
// up with the column.
function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn(
        "relative isolate border-b border-line px-4 before:absolute before:inset-x-0 before:inset-y-0.75 before:-z-10 before:rounded-card before:transition-[background-color] before:duration-200 before:ease-out last:border-b-0 hover:border-b-transparent hover:before:bg-blue-5 data-[state=open]:border-b-transparent data-[state=open]:before:bg-blue-5 motion-reduce:before:transition-none [&:has(+:hover)]:border-b-transparent [&:has(+[data-state=open])]:border-b-transparent",
        className,
      )} {...props} />;
}

/** The question's mark: a 14px plus drawn in two 1px bars. */
function AccordionMark({ className }: { className?: string }) {
  return (
    <span aria-hidden data-slot="accordion-mark" className={cn("relative size-3.5 shrink-0 text-fg-muted transition-[rotate,color] duration-200 ease-out motion-reduce:transition-[color]", className)}>
      <span className="absolute top-1/2 left-0 h-px w-3.5 -translate-y-1/2 bg-current" />
      <span className="absolute top-0 left-1/2 h-3.5 w-px -translate-x-1/2 bg-current" />
    </span>
  );
}

function AccordionTrigger({ className, children, icon, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { icon?: React.ReactNode | null }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between gap-6 py-5 text-left font-sans text-body leading-body text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        {icon === undefined ? <AccordionMark className="group-data-[state=open]:rotate-45 group-data-[state=open]:text-fg-brand" /> : icon}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-button leading-relaxed text-fg-muted motion-safe:data-[state=closed]:animate-accordion-up data-[state=closed]:[animation-duration:var(--ds-duration-base)] motion-safe:data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("max-w-xl pb-6 transition-[opacity,translate] duration-200 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-[opacity]", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionMark, AccordionTrigger };

```
