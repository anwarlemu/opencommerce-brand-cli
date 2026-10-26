# Attachment
A file card: white on the 9 percent edge with 6px corners, its file in a pale blue tile, the name in 14px Inter and the size in the mono.

Install: npx opencommerce-ds add attachment
Requires: theme, button, utils
Packages: @radix-ui/react-slot, class-variance-authority
Exports: Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger
Client boundary: not required by this entry file
Reference: Extrapolated from opencommerce (card.tsx small card, the merchant tiles, mono figures)


## Usage
Use for files sent with a message or attached to an order: receipts, invoices, exports. Set state to idle, uploading, processing, error or done; add AttachmentActions with AttachmentAction keys (remove, retry, download) and AttachmentTrigger to open the file. Line several up in AttachmentGroup.
- Avoid: Thumbnails for every file type
- Avoid: Progress bars inside the card
- Avoid: Red fills for errors


## Examples
Example components: npx opencommerce-ds add attachment
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/attachment/Site) | [States](https://opencommerce-ds.vercel.app/preview/attachment/States) | [Sizes](https://opencommerce-ds.vercel.app/preview/attachment/Sizes)

examples/attachment.tsx

```tsx
"use client";

import { useState } from "react";
import { Download, FileText, ImageIcon, RotateCw, X } from "lucide-react";

import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment";

const FILES = [
  { name: "receipt-A-10293.pdf", size: "84 KB" },
  { name: "invoice-october.pdf", size: "212 KB" },
  { name: "packing-slip.pdf", size: "36 KB" },
];

export function Site() {
  const [files, setFiles] = useState(FILES);
  const [opened, setOpened] = useState<string>();
  return (
    <div className="grid w-full gap-3">
      <AttachmentGroup>
        {files.map((file) => (
          <Attachment key={file.name}>
            <AttachmentTrigger aria-label={`Open ${file.name}`} onClick={() => setOpened(file.name)} />
            <AttachmentMedia>
              <FileText strokeWidth={1.5} />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>{file.size}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label={`Remove ${file.name}`} onClick={() => setFiles((all) => all.filter((f) => f.name !== file.name))}>
                <X strokeWidth={1.5} />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}
      </AttachmentGroup>
      <p aria-live="polite" className="text-body-sm text-fg-muted">
        {opened ? `Opened ${opened}.` : files.length ? "Choose a file to open it." : "All files removed."}
      </p>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap gap-3">
      <Attachment state="idle">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>return-label.pdf</AttachmentTitle>
          <AttachmentDescription>Waiting</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>receipt-T-48211.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading 62%</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>statement.pdf</AttachmentTitle>
          <AttachmentDescription>The file is over 20 MB.</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Retry">
            <RotateCw strokeWidth={1.5} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {(["default", "sm", "xs"] as const).map((size) => (
        <Attachment key={size} size={size}>
          <AttachmentMedia>
            <FileText strokeWidth={1.5} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>order-{size}.pdf</AttachmentTitle>
            <AttachmentDescription>48 KB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
      <Attachment orientation="vertical">
        <AttachmentMedia>
          <ImageIcon strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>product.jpg</AttachmentTitle>
          <AttachmentDescription>1.2 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download product.jpg">
            <Download strokeWidth={1.5} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  );
}

```

## Source

components/ui/attachment.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A file attached to a message or an order, as the site's small cards (globals.css .feat-tile, the merchant tiles;
// computed): white on the 9 percent ink edge with 6px corners and a hairline drop. The file sits in a merchant tile (the
// pale blue with its glyph in the blue, 6px corners); its name is 14px Inter at 500 in ink and its size or status the
// 11.5px platform mono at 64 percent ink, as figures are set on the site. A file still waiting has a dashed edge; one
// uploading breathes its name; one that failed takes the red edge and a red line. Under the pointer an openable file
// takes the mist (160ms).
const attachmentVariants = cva(
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-card border border-line bg-surface text-fg shadow-tile transition-[background-color,border-color] duration-160 ease-out has-[>[data-slot=attachment-trigger]]:hover:bg-subtle has-[>[data-slot=attachment-trigger]:focus-visible]:outline-2 has-[>[data-slot=attachment-trigger]:focus-visible]:outline-offset-2 has-[>[data-slot=attachment-trigger]:focus-visible]:outline-solid has-[>[data-slot=attachment-trigger]:focus-visible]:outline-focus-ring data-[state=error]:border-danger data-[state=idle]:border-dashed data-[state=idle]:border-line-mid motion-reduce:transition-none",
  {
    variants: {
      size: {
        default: "gap-3 text-body-sm has-data-[slot=attachment-content]:px-3 has-data-[slot=attachment-content]:py-2.5 has-data-[slot=attachment-media]:p-2.5",
        sm: "gap-2.5 text-body-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
        xs: "gap-2 text-caption has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
      },
      orientation: {
        horizontal: "min-w-48 items-center",
        vertical: "w-28 flex-col has-data-[slot=attachment-content]:w-36",
      },
    },
    defaultVariants: { size: "default", orientation: "horizontal" },
  },
);

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

function Attachment({ className, state = "done", size = "default", orientation = "horizontal", ...props }: React.ComponentProps<"div"> & VariantProps<typeof attachmentVariants> & { state?: AttachmentState }) {
  return <div data-slot="attachment" data-state={state} data-size={size} data-orientation={orientation} aria-busy={state === "uploading" || state === "processing" || undefined} className={cn(attachmentVariants({ size, orientation }), className)} {...props} />;
}

const attachmentMediaVariants = cva(
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-blue-5 text-fg-brand group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-chip group-data-[state=error]/attachment:bg-subtle group-data-[state=error]/attachment:text-danger [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        icon: "",
        // A photo shows itself; it stays faint until it has uploaded.
        image: "bg-subtle opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: { variant: "icon" },
  },
);

function AttachmentMedia({ className, variant = "icon", ...props }: React.ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants>) {
  return <div data-slot="attachment-media" data-variant={variant} className={cn(attachmentMediaVariants({ variant }), className)} {...props} />;
}

function AttachmentContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="attachment-content" className={cn("max-w-full min-w-0 flex-1 leading-snug group-data-[orientation=vertical]/attachment:px-1 group-data-[orientation=vertical]/attachment:pb-1", className)} {...props} />;
}

function AttachmentTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-title"
      className={cn("block max-w-full min-w-0 truncate font-sans font-medium text-fg group-data-[state=processing]/attachment:animate-pulse-soft group-data-[state=uploading]/attachment:animate-pulse-soft motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="attachment-description" className={cn("mt-1 block max-w-full min-w-0 truncate font-mono text-bar leading-tight text-fg-muted group-data-[state=error]/attachment:font-sans group-data-[state=error]/attachment:text-caption group-data-[state=error]/attachment:text-danger", className)} {...props} />;
}

function AttachmentActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="attachment-actions" className={cn("relative z-20 flex shrink-0 items-center gap-0.5 group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3.5 group-data-[orientation=vertical]/attachment:right-3.5", className)} {...props} />;
}

/** A row action on the attachment (remove, retry, download): the ghost key at 28px. */
function AttachmentAction({ className, variant, size = "icon", ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="attachment-action" variant={variant ?? "ghost"} size={size} className={cn("size-7 group-data-[orientation=vertical]/attachment:border-line group-data-[orientation=vertical]/attachment:bg-surface group-data-[orientation=vertical]/attachment:shadow-tile", className)} {...props} />;
}

/** Makes the whole card open the file: a button (or a link with asChild) stretched over it. */
function AttachmentTrigger({ className, asChild = false, type, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="attachment-trigger" type={asChild ? undefined : (type ?? "button")} className={cn("absolute inset-0 z-10 cursor-pointer rounded-card outline-none", className)} {...props} />;
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn("flex min-w-0 snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain p-1 [scrollbar-width:none] *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start", className)}
      {...props}
    />
  );
}

export { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger };

```
