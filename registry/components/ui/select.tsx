"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { usePortalContainer } from "@/lib/surface";
import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// A single choice. `field` is the brand's field (the input's 36px box with 8px corners on the 16 percent ink edge, 14px
// Inter) with a drawn chevron 12px in from the right; focus and an open list turn the edge blue, with no glow. `compact`
// is the same at 32px for dense rows. `ghost` is the white key for a toolbar, `chip` a quiet label on a wash. The list is
// the brand's floating panel (white, a 9 percent ink edge, 8px corners) growing from its trigger in a quick ease-out;
// the row under the pointer or the keys takes the pale blue, the chosen one a blue tick.
const triggerVariants = cva(
  "flex min-w-0 max-w-full items-center gap-2 whitespace-nowrap outline-none transition-[background-color,border-color,color,scale] duration-160 ease-out disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:shrink-0 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate [&>[data-slot=select-value]]:text-left",
  {
    variants: {
      appearance: {
        field:
          "w-full gap-3 rounded-control border border-hairline bg-surface font-sans text-fg hover:border-line-field-hover focus-visible:border-line-brand data-[state=open]:border-line-brand data-placeholder:text-fg-faint aria-invalid:border-danger [&>span]:flex-1 [&>span]:truncate [&>span]:text-left",
        ghost:
          "h-8 rounded-control border border-hairline bg-surface px-3 font-sans text-body-sm text-fg hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:scale-97 data-[state=open]:bg-subtle motion-reduce:active:scale-100",
        chip: "h-7 rounded-sm bg-wash-pill px-2.5 font-sans text-caption text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring data-[state=open]:text-fg",
      },
      // A shorter field, for dense rows.
      compact: { true: "", false: "" },
    },
    compoundVariants: [
      { appearance: "field", compact: false, className: "h-9 px-3 text-body-sm" },
      { appearance: "field", compact: true, className: "h-8 px-2.5 text-body-sm" },
    ],
    defaultVariants: { appearance: "field", compact: false },
  },
);

/** The select's mark: a small open chevron, drawn in a 1.5px line. */
function SelectMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 10 6" className={cn("h-1.5 w-2.5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]", className)}>
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const { required } = useFieldControl({ required: props.required });
  return <SelectPrimitive.Root data-slot="select" {...props} required={required} />;
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, appearance, compact, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger> & VariantProps<typeof triggerVariants>) {
  const { required, ...control } = useFieldControl(props);
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" className={cn(triggerVariants({ appearance, compact }), className)} aria-required={required || undefined} {...control}>
      {children}
      <SelectPrimitive.Icon asChild>
        <SelectMark className={appearance === "field" || appearance == null ? "ml-auto text-fg-muted" : "text-fg-muted"} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, compact = false, position = "popper", collisionPadding = 8, ...props }: React.ComponentProps<typeof SelectPrimitive.Content> & { compact?: boolean }) {
  return (
    <SelectPrimitive.Portal container={usePortalContainer()}>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-compact={compact || undefined}
        position={position}
        collisionPadding={collisionPadding}
        sideOffset={4}
        align="start"
        className={cn(
          "relative z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-0 max-w-(--radix-select-content-available-width) origin-(--radix-select-content-transform-origin) animate-pop-in motion-reduce:animate-none overflow-hidden rounded-control border border-line bg-surface p-1 font-sans text-body-sm leading-snug text-fg shadow-floating",
          position === "popper" && "w-[max(11rem,var(--radix-select-trigger-width))]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-fg-muted">
          <ChevronUp className="size-3.5" strokeWidth={1.5} />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="flex w-full flex-col gap-0.5">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-fg-muted">
          <ChevronDown className="size-3.5" strokeWidth={1.5} />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" className={cn("px-2.5 pt-1.5 pb-1 font-sans text-caption text-fg-muted", className)} {...props} />;
}

function SelectItem({ className, children, description, ...props }: React.ComponentProps<typeof SelectPrimitive.Item> & { description?: React.ReactNode }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-start gap-2 rounded-menu py-2 pr-8 pl-2.5 break-words text-fg-muted outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-search-selected data-[highlighted]:text-fg data-[state=checked]:text-fg",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 flex-1">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && <span className="mt-0.5 block font-sans text-caption text-fg-muted">{description}</span>}
      </span>
      <SelectPrimitive.ItemIndicator className="absolute top-1/2 right-2.5 -translate-y-1/2 text-fg-brand">
        <Check className="size-3.5" strokeWidth={1.75} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
