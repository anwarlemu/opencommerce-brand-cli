"use client";

import * as React from "react";
import { BarChart3, BookOpen, ChevronsUpDown, CreditCard, KeyRound, LifeBuoy, PanelLeftClose, Plus, Search, ShoppingBag, Store, Webhook } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const MAIN = [
  { id: "orders", label: "Orders", icon: ShoppingBag, count: "12" },
  { id: "merchants", label: "Merchants", icon: Store },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "monitoring", label: "Monitoring", icon: BarChart3, mark: "Live" },
];
const DEVELOPERS = [
  { id: "keys", label: "API keys", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "docs", label: "Docs", icon: BookOpen },
];

function Wordmark() {
  return (
    <span className="flex items-baseline gap-1.5 px-2 group-data-[collapsible=icon]/sidebar:hidden">
      <span className="font-display text-h5 font-medium tracking-tight text-fg">opencommerce</span>
      <span className="text-caption text-fg-muted">by Agentcard</span>
    </span>
  );
}

function CollapseRow() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Expand" onClick={toggleSidebar} aria-expanded={state === "expanded"}>
        <PanelLeftClose strokeWidth={1.5} className="transition-[rotate] duration-200 ease-in-out group-data-[collapsible=icon]/sidebar:rotate-180 motion-reduce:transition-none" />
        <span>{state === "expanded" ? "Collapse" : "Expand"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function Rail({ collapsible = "offcanvas", variant = "sidebar" }: { collapsible?: "offcanvas" | "icon" | "none"; variant?: "sidebar" | "floating" | "inset" }) {
  const [current, setCurrent] = React.useState("orders");
  const [sub, setSub] = React.useState("all");
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <Wordmark />
        <SidebarInput placeholder="Search orders" aria-label="Search orders" className="group-data-[collapsible=icon]/sidebar:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Commerce</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={current === item.id} tooltip={item.label} onClick={() => setCurrent(item.id)}>
                    <item.icon strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.count && <SidebarMenuBadge>{item.count}</SidebarMenuBadge>}
                  {item.mark && <SidebarMenuBadge variant="mark">{item.mark}</SidebarMenuBadge>}
                  {item.id === "orders" && current === "orders" && (
                    <SidebarMenuSub>
                      {[
                        ["all", "All orders"],
                        ["failed", "Failed checkouts"],
                        ["returns", "Returns"],
                      ].map(([id, label]) => (
                        <SidebarMenuSubItem key={id}>
                          <SidebarMenuSubButton
                            href={`#${id}`}
                            isActive={sub === id}
                            onClick={(event) => {
                              event.preventDefault();
                              setSub(id);
                            }}
                          >
                            <span>{label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Developers</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Create an API key">
            <Plus strokeWidth={1.5} />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {DEVELOPERS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={current === item.id} tooltip={item.label} onClick={() => setCurrent(item.id)}>
                    <item.icon strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help">
              <LifeBuoy strokeWidth={1.5} />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Labs">
              <span className="grid size-6 shrink-0 place-items-center rounded-sm border border-line-brand-edge bg-primary font-mono text-bar text-on-primary">A</span>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-body-sm text-fg">Acme Labs</span>
                <span className="truncate font-mono text-bar text-fg-muted">Standard plan</span>
              </span>
              <ChevronsUpDown strokeWidth={1.5} className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {collapsible === "icon" && <CollapseRow />}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function Page({ title }: { title: string }) {
  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-2 border-b border-line px-4">
        <SidebarTrigger className="-ml-1.5" />
        <p className="font-display text-h5 font-medium tracking-tight text-fg">{title}</p>
        <span className="ml-auto flex items-center gap-2 text-caption text-fg-muted max-sm:hidden">
          <Search strokeWidth={1.5} className="size-3.5" />
          <kbd className="font-mono text-bar">⌘B</kbd> toggles the rail
        </span>
      </header>
      <div className="grid gap-3 p-6">
        {["ord_8KQ2 · Northwind Outfitters · $222.00", "ord_8KR9 · Contoso Coffee · $48.50", "ord_8KS6 · Litware Books · $31.20"].map((row) => (
          <div key={row} className="rounded-control border border-line px-4 py-3 font-mono text-snippet text-fg">
            {row}
          </div>
        ))}
      </div>
    </SidebarInset>
  );
}

export function Site() {
  return (
    <SidebarProvider className="min-h-150 overflow-hidden rounded-panel border border-line-window">
      <Rail />
      <Page title="Orders" />
    </SidebarProvider>
  );
}

export function Icons() {
  return (
    <SidebarProvider defaultOpen={false} className="min-h-150 overflow-hidden rounded-panel border border-line-window">
      <Rail collapsible="icon" />
      <Page title="Orders" />
    </SidebarProvider>
  );
}

export function Floating() {
  return (
    <SidebarProvider className="min-h-150 overflow-hidden rounded-panel border border-line-window bg-subtle">
      <Rail variant="floating" />
      <Page title="Merchants" />
    </SidebarProvider>
  );
}

export function Inset() {
  return (
    <SidebarProvider className="min-h-150 overflow-hidden rounded-panel border border-line-window">
      <Rail variant="inset" />
      <Page title="Monitoring" />
    </SidebarProvider>
  );
}

export function Loading() {
  return (
    <SidebarProvider className="min-h-100 overflow-hidden rounded-panel border border-line-window">
      <Sidebar collapsible="none">
        <SidebarHeader>
          <Wordmark />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Commerce</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 5 }, (_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="grid h-full place-items-center p-6 text-body-sm text-fg-muted">Loading your workspace</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
