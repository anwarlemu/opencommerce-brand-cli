# Breadcrumb
Where a page sits: muted ancestors, the page in ink, faint chevrons between them.

Install: npx opencommerce-ds add breadcrumb
Requires: theme, utils
Packages: @radix-ui/react-slot, lucide-react
Exports: Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
Client boundary: not required by this entry file
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.nav-link)


## Usage
Use on pages two or more levels deep (Orders, then an order, then a refund). Link every ancestor and end with BreadcrumbPage. For a long trail, fold the middle into a BreadcrumbEllipsis that opens a dropdown of the hidden steps.
- Avoid: A breadcrumb on a top-level page
- Avoid: The current page as a link
- Avoid: Breadcrumbs as the only navigation


## Examples
Example components: npx opencommerce-ds add breadcrumb dropdown-menu
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/breadcrumb/Site) | [Collapsed](https://opencommerce-ds.vercel.app/preview/breadcrumb/Collapsed) | [CustomSeparator](https://opencommerce-ds.vercel.app/preview/breadcrumb/CustomSeparator)

examples/breadcrumb.tsx

```tsx
"use client";

import { ChevronDown, Slash } from "lucide-react";

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Site() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#orders">Orders</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#order">ord_8KQ2</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Refund</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Collapsed() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-chip outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus-ring" aria-label="Show hidden steps">
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="#api">API reference</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#checkout">Checkout</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#errors">Errors</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>card_declined</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function CustomSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#merchants">Merchants</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash strokeWidth={1.5} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-chip text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus-ring">
              Northwind Outfitters
              <ChevronDown strokeWidth={1.5} className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Northwind Outfitters</DropdownMenuItem>
              <DropdownMenuItem>Contoso Coffee</DropdownMenuItem>
              <DropdownMenuItem>Fabrikam Home</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash strokeWidth={1.5} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Checkout settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

```

## Source

components/ui/breadcrumb.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

// Where a page sits, drawn from the docs' trail and the header's links: 14px Inter, ancestors at 64 percent ink that
// turn ink under the pointer (150ms, color only), the current page in ink, separated by a faint 14px chevron. A long
// trail folds its middle into an ellipsis that can open a menu of the hidden steps.
function Breadcrumb(props: React.ComponentProps<"nav">) {
  return <nav data-slot="breadcrumb" aria-label="Breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-1.5 font-sans text-body-sm leading-snug break-words text-fg-muted sm:gap-2", className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("rounded-chip text-fg-muted no-underline outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={cn("text-fg", className)} {...props} />;
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("text-fg-faint [&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRight strokeWidth={1.5} />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn("flex size-6 items-center justify-center [&>svg]:size-4", className)} {...props}>
      <MoreHorizontal strokeWidth={1.5} />
      <span className="sr-only">More</span>
    </span>
  );
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };

```
