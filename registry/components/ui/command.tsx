"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";

import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { WindowBar } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// A search palette as one of the brand's windows: white on the 16 percent ink edge with 12px corners and a soft drop,
// the mist window bar on top (`name`), then the field: a search mark and a 52px input in 16px Inter over a 9 percent
// rule. Groups are headed in the 11.5px platform mono at 64 percent ink, ruled apart; a row is a 15px Inter title over a
// 12px line at 64 percent ink, the highlighted one on the pale blue with a blue return mark. The dialog lays it 12vh from
// the top over the ink scrim with a light blur. It opens from the keyboard many times a day, so nothing animates: the
// palette, the highlight and the return mark appear at once.

function SearchMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={cn("size-3.75 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-width:1.5]", className)}>
      <circle cx="7" cy="7" r="4.75" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function Command({ className, name, children, ...props }: React.ComponentProps<typeof CommandPrimitive> & { name?: React.ReactNode }) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn("flex max-h-[72vh] w-full flex-col overflow-hidden rounded-panel border border-line-window bg-surface text-fg shadow-floating", className)}
      {...props}
    >
      {name ? <WindowBar aria-hidden name={name} className="[&>span:nth-child(2)]:text-left" /> : null}
      {children}
    </CommandPrimitive>
  );
}

function CommandDialog({
  title = "Search",
  description = "Search for a page or an action",
  name = "search",
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & { title?: string; description?: string; name?: React.ReactNode; className?: string }) {
  return (
    <Dialog {...props}>
      <DialogPortal>
        <DialogPrimitive.Overlay
          data-slot="command-overlay"
          className="fixed inset-0 z-50 bg-scrim backdrop-blur-xs"
        />
        <DialogPrimitive.Content data-slot="command-dialog" className="fixed top-[12vh] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-160 -translate-x-1/2 outline-none">
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          <Command name={name} className={className}>
            {children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

/** The field: a blue search mark, the 19px display input, and an optional hint at the right (`hint="Esc"`). */
function CommandInput({ className, hint, ...props }: React.ComponentProps<typeof CommandPrimitive.Input> & { hint?: React.ReactNode }) {
  return (
    <div data-slot="command-input-wrapper" className="flex shrink-0 items-center gap-2.5 border-b border-line px-4 text-fg-muted">
      <SearchMark />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "h-13 min-w-0 flex-1 bg-transparent font-sans text-body text-fg caret-primary outline-none placeholder:text-fg-faint disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        {...props}
      />
      {hint ? <kbd className="shrink-0 font-mono text-caption text-fg-faint">{hint}</kbd> : null}
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("min-h-0 flex-1 scroll-py-2 overflow-x-hidden overflow-y-auto px-2 pt-1.5 pb-2 [scrollbar-color:var(--ds-color-border-default)_transparent] [scrollbar-width:thin]", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("px-3.5 py-4.5 font-sans text-body-sm text-fg-muted", className)} {...props} />;
}

// A group's heading in the 11.5px platform mono at 64 percent ink; every group after the first visible one is ruled
// off by a 9 percent ink line.
function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "[&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-bar [&_[cmdk-group-heading]]:leading-body [&_[cmdk-group-heading]]:text-fg-muted [[cmdk-group]:not([hidden])~&]:mt-1.5 [[cmdk-group]:not([hidden])~&]:border-t [[cmdk-group]:not([hidden])~&]:border-line [[cmdk-group]:not([hidden])~&_[cmdk-group-heading]]:pt-3.5",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("my-1.5 border-t border-line", className)} {...props} />;
}

/** A row: the title (children) in 15px Inter, an optional `description` under it, the return mark when
 * highlighted. */
function CommandItem({ className, children, description, ...props }: React.ComponentProps<typeof CommandPrimitive.Item> & { description?: React.ReactNode }) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/item relative grid cursor-pointer gap-0.75 rounded-sm py-2.5 pr-10 pl-3.5 text-fg outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[selected=true]:bg-blue-5",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2.5 font-sans text-button leading-body [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-brand">{children}</span>
      {description ? <span className="truncate font-sans text-caption leading-normal text-fg-muted">{description}</span> : null}
      <span aria-hidden className="absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-body-sm text-fg-brand opacity-0 group-data-[selected=true]/item:opacity-100">
        ↵
      </span>
    </CommandPrimitive.Item>
  );
}

// The keys under the list: the sky bar, blue 10px labels, each key a small white box on a blue edge. Hidden on phones,
// which have no keyboard to hint at.
function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-footer"
      aria-hidden
      className={cn(
        "flex shrink-0 gap-4.5 border-t border-line bg-window-bar px-3.5 py-2 font-mono text-micro text-fg-muted max-md:hidden [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1 [&_kbd]:min-w-4.5 [&_kbd]:rounded-[calc(var(--ds-radius-control)/2)] [&_kbd]:border [&_kbd]:border-hairline [&_kbd]:bg-surface [&_kbd]:px-1 [&_kbd]:py-px [&_kbd]:text-center [&_kbd]:font-[inherit] [&_kbd]:leading-4",
        className,
      )}
      {...props}
    />
  );
}

export { Command, CommandDialog, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator };
