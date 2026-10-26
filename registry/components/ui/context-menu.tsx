"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight } from "lucide-react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// The brand's menu (dropdown-menu.tsx) opened with a right click or a long press on a surface: a floating white panel (a 9
// percent ink edge, 8px corners, a soft drop, 4px of padding), rows in 14px Inter with 5px corners that take a faint
// wash when highlighted, with no transition (menus are worked from the keyboard). It grows from the pointer (scale 0.97
// and a fade, 160ms ease-out); reduced motion keeps the fade. Checks are drawn in blue; destructive rows are red.
const PANEL =
  "z-50 flex max-h-(--radix-context-menu-content-available-height) max-w-(--radix-context-menu-content-available-width) origin-(--radix-context-menu-content-transform-origin) animate-pop-in flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-control border border-line bg-surface p-1 text-fg shadow-floating outline-none motion-reduce:animate-none";
const ROW =
  "relative flex w-full cursor-default items-center gap-2 rounded-menu px-2.5 py-2 font-sans text-body-sm leading-snug text-fg-muted outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-wash-hover data-[highlighted]:text-fg data-[inset]:pl-8 [&_svg]:size-3.5 [&_svg]:shrink-0";
const DANGER = "text-danger data-[highlighted]:bg-danger/6 data-[highlighted]:text-danger";
const QUIET = "text-fg-faint";

function ContextMenu(props: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" className={cn("select-none", className)} {...props} />;
}

function ContextMenuGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuPortal(props: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" container={usePortalContainer()} {...props} />;
}

function ContextMenuSub(props: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuContent({ className, collisionPadding = 8, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal container={usePortalContainer()}>
      <ContextMenuPrimitive.Content data-slot="context-menu-content" collisionPadding={collisionPadding} className={cn(PANEL, "min-w-[min(12rem,var(--radix-context-menu-content-available-width))]", className)} {...props} />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return <ContextMenuPrimitive.Item data-slot="context-menu-item" data-inset={inset || undefined} data-variant={variant} className={cn(ROW, variant === "destructive" && DANGER, className)} {...props} />;
}

function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" data-inset={inset || undefined} className={cn(ROW, "data-[state=open]:bg-wash-hover data-[state=open]:text-fg", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" strokeWidth={1.5} />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({ className, collisionPadding = 8, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.Portal container={usePortalContainer()}>
      <ContextMenuPrimitive.SubContent data-slot="context-menu-sub-content" collisionPadding={collisionPadding} className={cn(PANEL, "min-w-[min(10rem,var(--radix-context-menu-content-available-width))]", className)} {...props} />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" checked={checked} className={cn(ROW, "pr-8", className)} {...props}>
      {children}
      <ContextMenuPrimitive.ItemIndicator className="absolute right-2.5 text-fg-brand">
        <Check strokeWidth={1.75} />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={cn(ROW, "pr-8 data-[state=checked]:text-fg", className)} {...props}>
      {children}
      <ContextMenuPrimitive.ItemIndicator className="absolute right-2.5 text-fg-brand">
        <Check strokeWidth={1.75} />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" data-inset={inset || undefined} className={cn("px-2.5 pt-2 pb-1 font-sans text-caption data-[inset]:pl-8", QUIET, className)} {...props} />;
}

function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="context-menu-shortcut" className={cn("ml-auto pl-4 font-mono text-caption", QUIET, className)} {...props} />;
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
