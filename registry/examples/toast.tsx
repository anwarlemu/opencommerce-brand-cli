"use client";

import { Button } from "@/components/ui/button";
import { ToastAction, Toaster, toast } from "@/components/ui/toast";

export function Site() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Order placed",
            description: "ord_8KQ2 at Northwind Outfitters",
            action: (
              <ToastAction altText="Open the order" onClick={() => undefined}>
                Open
              </ToastAction>
            ),
          })
        }
      >
        Place order
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: "destructive",
            title: "Checkout failed",
            description: "The card was declined",
            action: <ToastAction altText="Retry the checkout">Retry</ToastAction>,
          })
        }
      >
        Fail a checkout
      </Button>
      <Button variant="ghost" onClick={() => toast({ title: "Copied ord_8KQ2" })}>
        Copy order ID
      </Button>
      <Toaster />
    </div>
  );
}
