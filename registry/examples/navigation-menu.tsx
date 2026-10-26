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
