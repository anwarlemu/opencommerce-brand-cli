"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export function Site() {
  const [reviewing, setReviewing] = useState(false);
  return <div className="grid max-w-3xl gap-4">
    <Banner name="tracking.beta" title="Order tracking is in beta" actions={<Button size="sm" asChild><a href="#docs">Read the guide</a></Button>}>Your agent can now follow an order from checkout to the door.</Banner>
    <Banner tone="brand" name="merchants.news" title="Fifty new stores this month" actions={<Button size="sm" variant="secondary" asChild><a href="#monitoring">See the list</a></Button>}>Every one is monitored around the clock from day one.</Banner>
    <Banner tone="alert" name="agent.paused" title="Travel agent was paused" actions={<Button variant="secondary" size="sm" aria-expanded={reviewing} onClick={() => setReviewing(!reviewing)}>{reviewing ? "Hide details" : "Review"}</Button>}>It hit its monthly limit on Oct 14.</Banner>
    {reviewing && <p className="text-body-sm text-fg-muted">Travel agent has spent $2,000 of its $2,000 monthly limit. Purchases are paused until its limit resets.</p>}
  </div>;
}
