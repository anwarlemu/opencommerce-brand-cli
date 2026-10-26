"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight } from "lucide-react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A row of menus (File, Edit, View): a bar that is the page's white key laid flat (a 16 percent ink edge, 8px corners,
// 4px inside), its triggers 14px Inter at 64 percent ink with 5px corners that take a faint wash under the pointer and
// stay washed in ink while their menu is open. Each menu is the brand's panel (dropdown-menu.tsx): white, a 9 percent
// ink edge, a soft drop, rows that wash when highlighted with no transition. A menu grows from its trigger (scale 0.97
// and a fade, 160ms ease-out) and closes at once. Reduced motion keeps the fade.
const PANEL =
  "z-50 flex max-h-(--radix-menubar-content-available-height) max-w-(--radix-menubar-content-available-width) origin-(--radix-menubar-content-transform-origin) animate-pop-in flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-control border border-line bg-surface p-1 text-fg shadow-floating outline-none motion-reduce:animate-none";
const ROW =
  "relative flex w-full cursor-default items-center gap-2 rounded-menu px-2.5 py-2 font-sans text-body-sm leading-snug text-fg-muted outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-wash-hover data-[highlighted]:text-fg data-[inset]:pl-8 [&_svg]:size-3.5 [&_svg]:shrink-0";
const DANGER = "text-danger data-[highlighted]:bg-danger/6 data-[highlighted]:text-danger";
const QUIET = "text-fg-faint";

function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return <MenubarPrimitive.Root data-slot="menubar" className={cn("flex h-10 w-fit items-center gap-0.5 rounded-control border border-hairline bg-surface p-1", className)} {...props} />;
}

function MenubarMenu(props: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup(props: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal(props: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" container={usePortalContainer()} {...props} />;
}

function MenubarRadioGroup(props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex h-full items-center rounded-menu px-2.5 font-sans text-body-sm leading-none text-fg-muted outline-none select-none transition-[background-color,color] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring data-[highlighted]:bg-wash-hover data-[highlighted]:text-fg data-[state=open]:bg-wash-hover data-[state=open]:text-fg motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({ className, align = "start", alignOffset = -4, sideOffset = 8, collisionPadding = 8, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(PANEL, "min-w-[min(12rem,var(--radix-menubar-content-available-width))]", className)}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return <MenubarPrimitive.Item data-slot="menubar-item" data-inset={inset || undefined} data-variant={variant} className={cn(ROW, variant === "destructive" && DANGER, className)} {...props} />;
}

function MenubarCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" checked={checked} className={cn(ROW, "pr-8", className)} {...props}>
      {children}
      <MenubarPrimitive.ItemIndicator className="absolute right-2.5 text-fg-brand">
        <Check strokeWidth={1.75} />
      </MenubarPrimitive.ItemIndicator>
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(ROW, "pr-8 data-[state=checked]:text-fg", className)} {...props}>
      {children}
      <MenubarPrimitive.ItemIndicator className="absolute right-2.5 text-fg-brand">
        <Check strokeWidth={1.75} />
      </MenubarPrimitive.ItemIndicator>
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return <MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset || undefined} className={cn("px-2.5 pt-2 pb-1 font-sans text-caption data-[inset]:pl-8", QUIET, className)} {...props} />;
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="menubar-shortcut" className={cn("ml-auto pl-4 font-mono text-caption", QUIET, className)} {...props} />;
}

function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" data-inset={inset || undefined} className={cn(ROW, "data-[state=open]:bg-wash-hover data-[state=open]:text-fg", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" strokeWidth={1.5} />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({ className, collisionPadding = 8, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.SubContent data-slot="menubar-sub-content" collisionPadding={collisionPadding} className={cn(PANEL, "min-w-[min(10rem,var(--radix-menubar-content-available-width))]", className)} {...props} />
    </MenubarPortal>
  );
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
