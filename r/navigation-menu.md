# Navigation Menu
Site links with panels, drawn as the header's links, optionally in its frosted tray.

Install: npx opencommerce-ds add navigation-menu
Requires: theme, utils
Packages: @radix-ui/react-navigation-menu, class-variance-authority, lucide-react
Exports: NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuLinkDescription, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle
Client boundary: yes
Reference: opencommerce-agentcard-web src/app/globals.css (.nav-tray, .nav-link)


## Usage
Use for a site's main navigation when some entries open a panel of related links (Product, Developers). Give each link in a panel a title and a NavigationMenuLinkDescription. Set tray for the header's glass tray, and active on the current page's link.
- Avoid: Actions in the menu (use a dropdown menu)
- Avoid: Panels with more than eight links
- Avoid: Nesting panels


## Examples
Example components: npx opencommerce-ds add navigation-menu
[Site](https://opencommerce-ds.vercel.app/preview/navigation-menu/Site) | [Plain](https://opencommerce-ds.vercel.app/preview/navigation-menu/Plain) | [Open](https://opencommerce-ds.vercel.app/preview/navigation-menu/Open)

examples/navigation-menu.tsx

```tsx
"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const PRODUCT = [
  { title: "Search", href: "#search", line: "Find products across every store." },
  { title: "Checkout", href: "#checkout", line: "Buy with the agent's card in one call." },
  { title: "Orders", href: "#orders", line: "Track shipping and returns." },
  { title: "Monitoring", href: "#monitoring", line: "Live status for 4,000 merchants." },
];
const DEVELOPERS = [
  { title: "Quickstart", href: "#quickstart", line: "Your agent's first purchase in five minutes." },
  { title: "SDK", href: "#sdk", line: "TypeScript and Python clients." },
  { title: "API reference", href: "#api", line: "Every endpoint and its errors." },
];

function Links({ items }: { items: { title: string; href: string; line: string }[] }) {
  return (
    <ul className="grid w-[min(32rem,calc(100vw-3rem))] gap-0.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title}>
          <NavigationMenuLink href={item.href}>
            {item.title}
            <NavigationMenuLinkDescription>{item.line}</NavigationMenuLinkDescription>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  );
}

function Nav({ tray = false, defaultValue }: { tray?: boolean; defaultValue?: string }) {
  return (
    <NavigationMenu tray={tray} defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="product">
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Links items={PRODUCT} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="developers">
          <NavigationMenuTrigger>Developers</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Links items={DEVELOPERS} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing" active className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="max-sm:hidden">
          <NavigationMenuLink href="#faq" className={navigationMenuTriggerStyle()}>
            FAQ
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function Site() {
  return (
    <div className="flex h-80 items-start justify-center">
      <Nav tray />
    </div>
  );
}

export function Plain() {
  return (
    <div className="flex h-80 items-start justify-center">
      <Nav />
    </div>
  );
}

export function Open() {
  return (
    <div className="flex h-80 items-start justify-center">
      <Nav tray defaultValue="product" />
    </div>
  );
}

```

## Source

components/ui/navigation-menu.tsx

```tsx
"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Site navigation with panels, drawn from the header's links (globals.css .nav-link; computed): triggers and links are
// 14px Inter at 64 percent ink with 5px corners and 14px of side padding, a 5 percent ink wash and ink text under the
// pointer and while their panel is open; the current page is the white pill with blue text and the lit edge. `tray`
// sets the list in the header's frosted tray (a 10 percent ink edge, 8px corners). A trigger's chevron turns over when
// open (200ms in-out, it moves on screen). The panel opens below in the brand's floating panel (white, a 9 percent ink
// edge, 8px corners, a soft drop) that grows from 0.97 with a fade, resizes to each panel and crossfades between them;
// links inside take a 14px title and a 12px line at 64 percent ink. Reduced motion keeps the fades only.
function NavigationMenu({ className, children, viewport = true, tray = false, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean; tray?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      data-tray={tray || undefined}
      className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0.5",
        "group-data-[tray=true]/navigation-menu:rounded-control group-data-[tray=true]/navigation-menu:border group-data-[tray=true]/navigation-menu:border-line-glass group-data-[tray=true]/navigation-menu:bg-glass group-data-[tray=true]/navigation-menu:bg-(image:--ds-glass-sheen) group-data-[tray=true]/navigation-menu:p-0.75 group-data-[tray=true]/navigation-menu:shadow-glass group-data-[tray=true]/navigation-menu:[backdrop-filter:var(--ds-glass-blur)]",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex w-max items-center justify-center gap-1.5 rounded-menu px-3.5 py-2 font-sans text-body-sm leading-tight text-fg-nav outline-none transition-[background-color,color] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-wash-hover data-[state=open]:text-fg data-[active]:bg-surface data-[active]:text-fg-brand data-[active]:shadow-lit motion-reduce:transition-none",
);

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), className)} {...props}>
      {children}
      <ChevronDown aria-hidden strokeWidth={1.5} className="size-3.5 opacity-70 transition-[rotate] duration-200 ease-in-out group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-1 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-control group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-line group-data-[viewport=false]/navigation-menu:bg-surface group-data-[viewport=false]/navigation-menu:shadow-floating group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-pop-in",
        "data-[motion^=from-]:animate-fade-in motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-1/2 isolate z-50 flex -translate-x-1/2 justify-center md:left-0 md:translate-x-0">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-control border border-line bg-surface text-fg shadow-floating transition-[width,height] duration-200 ease-out data-[state=open]:animate-pop-in md:origin-top-left motion-reduce:animate-none motion-reduce:transition-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-0.5 rounded-menu px-3 py-2.5 font-sans text-body-sm leading-snug text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-wash-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring data-[active]:text-fg-brand motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** A link's second line: 12px Inter at 64 percent ink. */
function NavigationMenuLinkDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="navigation-menu-link-description" className={cn("text-caption leading-snug text-fg-muted", className)} {...props} />;
}

function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn("top-full z-10 flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-fade-in", className)}
      {...props}
    >
      <div className="relative top-[60%] size-2.5 rotate-45 rounded-tl-chip border-t border-l border-line bg-surface" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

```
