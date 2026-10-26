"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function Site() {
  const [retried, setRetried] = useState(false);
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <Alert variant="info">
        <Info strokeWidth={1.5} />
        <AlertTitle>Checkout runs in test mode</AlertTitle>
        <AlertDescription>Orders placed with a test key are routed to the merchant&apos;s sandbox. Nothing is charged.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert strokeWidth={1.5} />
        <AlertTitle>{retried ? "Retrying the order" : "Payment was declined at Staples"}</AlertTitle>
        <AlertDescription>{retried ? "The route is warming up again. This usually takes under ten seconds." : "The card on file reached its daily limit. Raise the limit or retry tomorrow."}</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="secondary" disabled={retried} onClick={() => setRetried(true)}>
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}

export function Variants() {
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <Alert>
        <Info strokeWidth={1.5} />
        <AlertTitle>One endpoint for every store</AlertTitle>
        <AlertDescription>
          Send the same request to Amazon, Target or Best Buy. <a href="#docs">Read the guide</a>.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck strokeWidth={1.5} />
        <AlertTitle>Order #A-10293 confirmed</AlertTitle>
        <AlertDescription>2 items, $48.20, arriving Thursday.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert strokeWidth={1.5} />
        <AlertTitle>Wayfair is responding slowly</AlertTitle>
        <AlertDescription>Purchases still go through; expect checkouts to take up to a minute.</AlertDescription>
      </Alert>
      <Alert>
        <AlertTitle>Without a glyph</AlertTitle>
        <AlertDescription>The title and detail take the full width.</AlertDescription>
      </Alert>
    </div>
  );
}
