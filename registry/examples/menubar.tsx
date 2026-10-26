"use client";

import * as React from "react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

function Console({ defaultValue }: { defaultValue?: string }) {
  const [message, setMessage] = React.useState("Choose a command.");
  const [density, setDensity] = React.useState("comfortable");
  const [showTest, setShowTest] = React.useState(false);
  const [showFailed, setShowFailed] = React.useState(true);
  return (
    <div className="grid justify-items-start gap-3">
      <Menubar defaultValue={defaultValue}>
        <MenubarMenu value="orders">
          <MenubarTrigger>Orders</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => setMessage("New test order started.")}>
              New test order <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onSelect={() => setMessage("Exported 1,284 orders as CSV.")}>
              Export as CSV <MenubarShortcut>⌘E</MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Retry failed</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onSelect={() => setMessage("Retried 3 checkouts from the last hour.")}>From the last hour</MenubarItem>
                <MenubarItem onSelect={() => setMessage("Retried 11 checkouts from today.")}>From today</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem variant="destructive" onSelect={() => setMessage("Cleared every test order.")}>
              Clear test orders
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Show</MenubarLabel>
            <MenubarCheckboxItem checked={showTest} onCheckedChange={(on) => setShowTest(on === true)}>
              Test orders
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showFailed} onCheckedChange={(on) => setShowFailed(on === true)}>
              Failed checkouts
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>Density</MenubarLabel>
            <MenubarRadioGroup value={density} onValueChange={setDensity}>
              <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
              <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="help">
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => setMessage("Opened the API reference.")}>API reference</MenubarItem>
            <MenubarItem onSelect={() => setMessage("Opened the status page.")}>Merchant status</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p role="status" className="text-body-sm text-fg-muted">
        {message} Showing {[showTest && "test orders", showFailed && "failed checkouts"].filter(Boolean).join(" and ") || "live orders only"}, {density}.
      </p>
    </div>
  );
}

export function Site() {
  return <Console />;
}

export function Open() {
  return (
    <div className="h-72">
      <Console defaultValue="orders" />
    </div>
  );
}
