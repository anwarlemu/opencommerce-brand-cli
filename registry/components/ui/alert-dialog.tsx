"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { buttonVariants } from "@/components/ui/button";
import { WindowBar } from "@/components/ui/window";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A confirmation is the dialog's window (dialog.tsx): white, a 16 percent ink edge, 12px corners, the 36px mist title bar
// with its arrow and a file-like name, over the 40 percent ink scrim, popping in from 0.97 with a fade (200ms ease-out,
// centered). It has no close mark: it must be answered, and a click outside does not dismiss it (Escape cancels). The
// answers are keys at the right: the white Cancel, then the blue action, or the red action for something destructive.
function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  const container = usePortalContainer();
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" container={container} {...props} />;
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn("fixed inset-0 z-50 animate-fade-in bg-scrim motion-reduce:animate-none", className)} {...props} />;
}

const SIZES = { sm: "max-w-sm", default: "max-w-lg" } as const;

function AlertDialogContent({
  className,
  children,
  size = "default",
  name = "confirm",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: keyof typeof SIZES;
  /** The title bar's label, file-like: `card.close`, `key.revoke`. */
  name?: React.ReactNode;
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-1/2 animate-pop-in flex-col overflow-hidden rounded-panel border border-line-window bg-surface text-fg shadow-floating outline-none [animation-duration:var(--ds-duration-base)] motion-reduce:animate-none",
          SIZES[size],
          className,
        )}
        {...props}
      >
        <WindowBar name={name} />
        <div className="grid min-h-0 gap-5 overflow-y-auto p-6">{children}</div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("grid gap-2 group-data-[size=sm]/alert-dialog:justify-items-center group-data-[size=sm]/alert-dialog:text-center", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end group-data-[size=sm]/alert-dialog:grid group-data-[size=sm]/alert-dialog:grid-cols-2", className)}
      {...props}
    />
  );
}

/** A 40px square above the title for the thing at stake: the mist with a 16 percent ink edge, the glyph in ink. */
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn("mb-1 grid size-10 place-items-center rounded-control border border-line-window bg-subtle text-fg [&_svg:not([class*='size-'])]:size-4.5", className)}
      {...props}
    />
  );
}

// 24px display at 500, tracked tight, like the dialog's title.
function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("font-display text-h3 leading-display font-medium tracking-tight text-fg", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-body-sm leading-relaxed text-pretty text-fg-muted", className)} {...props} />;
}

const DESTRUCTIVE = "border-danger bg-danger text-white hover:bg-danger/90";

function AlertDialogAction({ className, variant = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action> & { variant?: "default" | "destructive" }) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(buttonVariants({ variant: "primary" }), variant === "destructive" && DESTRUCTIVE, className)} {...props} />;
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(buttonVariants({ variant: "secondary" }), className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
