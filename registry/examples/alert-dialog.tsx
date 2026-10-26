"use client";

import * as React from "react";
import { KeyRound } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function CancelOrder({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [status, setStatus] = React.useState("Order ord_8KQ2 is placed and waiting on the merchant.");
  return (
    <div className="grid justify-items-start gap-3">
      <AlertDialog defaultOpen={defaultOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="secondary">Cancel order</Button>
        </AlertDialogTrigger>
        <AlertDialogContent name="order.cancel">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>The agent's purchase at Northwind Outfitters is refunded to the card it used, and the merchant is told to stop fulfillment. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => setStatus("Order ord_8KQ2 was canceled and refunded.")}>
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-body-sm text-fg-muted">
        {status}
      </p>
    </div>
  );
}

export function Site() {
  return <CancelOrder />;
}

export function Small() {
  const [revoked, setRevoked] = React.useState(false);
  return (
    <div className="grid justify-items-start gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary" disabled={revoked}>
            Revoke key
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm" name="key.revoke">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <KeyRound strokeWidth={1.5} />
            </AlertDialogMedia>
            <AlertDialogTitle>Revoke sk_live_4f2a?</AlertDialogTitle>
            <AlertDialogDescription>Agents using this key stop being able to check out at once.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => setRevoked(true)}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-body-sm text-fg-muted">
        {revoked ? "Key sk_live_4f2a revoked." : "Key sk_live_4f2a is active."}
      </p>
    </div>
  );
}

export function Confirm() {
  const [published, setPublished] = React.useState(false);
  return (
    <div className="grid justify-items-start gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Go live</Button>
        </AlertDialogTrigger>
        <AlertDialogContent name="agent.live">
          <AlertDialogHeader>
            <AlertDialogTitle>Let the agent buy for real?</AlertDialogTitle>
            <AlertDialogDescription>Checkouts will charge the card on file at every merchant on the Standard plan, with a 1% platform fee on each completed order.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in test mode</AlertDialogCancel>
            <AlertDialogAction onClick={() => setPublished(true)}>Go live</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-body-sm text-fg-muted">
        {published ? "Live: checkouts now charge real cards." : "Test mode: no card is charged."}
      </p>
    </div>
  );
}

export function Open() {
  return (
    <div className="h-110">
      <CancelOrder defaultOpen />
    </div>
  );
}
