"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const ADDRESSES = [
  { id: "home", name: "Home", line: "18 Harbor St, Portland, OR 97209" },
  { id: "office", name: "Office", line: "400 Market St, Floor 6, San Francisco, CA 94105" },
  { id: "locker", name: "Parcel locker", line: "Locker 22, Union Station, Portland, OR 97209" },
];

function ShipTo({ defaultOpen = false, direction }: { defaultOpen?: boolean; direction?: "bottom" | "top" | "left" | "right" }) {
  const [chosen, setChosen] = React.useState("home");
  const [open, setOpen] = React.useState(defaultOpen);
  const current = ADDRESSES.find((a) => a.id === chosen)!;
  return (
    <div className="grid justify-items-start gap-3">
      <Drawer open={open} onOpenChange={setOpen} direction={direction}>
        <DrawerTrigger asChild>
          <Button variant="secondary">Ship to: {current.name}</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Where should it ship?</DrawerTitle>
            <DrawerDescription>The agent uses this address at checkout for order ord_8KQ2.</DrawerDescription>
          </DrawerHeader>
          <div role="radiogroup" aria-label="Shipping address" className="grid gap-2 px-6 pb-4" data-drawer-no-drag>
            {ADDRESSES.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={chosen === a.id}
                onClick={() => setChosen(a.id)}
                className="grid gap-0.5 rounded-control border border-hairline px-4 py-3 text-left outline-none transition-[background-color,border-color] duration-150 ease-out hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring aria-checked:border-line-brand aria-checked:bg-blue-5 motion-reduce:transition-none"
              >
                <span className="text-body-sm font-medium text-fg">{a.name}</span>
                <span className="text-caption text-fg-muted">{a.line}</span>
              </button>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button>Use this address</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <p role="status" className="text-body-sm text-fg-muted">
        Shipping to {current.line}.
      </p>
    </div>
  );
}

export function Site() {
  return <ShipTo />;
}

export function Right() {
  return <ShipTo direction="right" />;
}

export function Open() {
  return (
    <div className="h-130">
      <ShipTo defaultOpen />
    </div>
  );
}
