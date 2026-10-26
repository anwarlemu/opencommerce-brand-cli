"use client";

import { CircleCheck, CircleX, CreditCard, Search, ShoppingCart, Truck } from "lucide-react";

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";

export function Site() {
  return (
    <Trace className="mx-auto max-w-xl">
      <TraceLine>
        <TraceIcon>
          <Search strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Searched 4 stores for a USB-C hub</TraceTitle>
        <TraceDescription>1.2s</TraceDescription>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <ShoppingCart strokeWidth={1.5} />
            </TraceIcon>
            <TraceTitle>Filled the cart at Best Buy</TraceTitle>
            <TraceDescription>2.8s</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <p>Anker 7-in-1 USB-C hub, $34.99. Route warmed, so the cart was ready on the first request.</p>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine>
        <TraceIcon>
          <CreditCard strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Paid with the office card</TraceTitle>
        <TraceDescription>0.9s</TraceDescription>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon>
          <Truck strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Waiting for the confirmation number</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon>
          <CircleCheck strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Report back to Jordan</TraceTitle>
      </TraceLine>
    </Trace>
  );
}

export function Failed() {
  return (
    <Trace className="mx-auto max-w-xl">
      <TraceLine>
        <TraceIcon>
          <ShoppingCart strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Filled the cart at Staples</TraceTitle>
        <TraceDescription>3.1s</TraceDescription>
      </TraceLine>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <CircleX strokeWidth={1.5} />
            </TraceIcon>
            <TraceTitle>Payment was declined</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <p>
            The card reached its daily limit. <span className="font-mono text-snippet">card_limit_reached</span>
          </p>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

export function Linked() {
  return (
    <Trace className="mx-auto max-w-xl">
      <a href="#order-A-10293">
        <TraceLine>
          <TraceIcon>
            <Truck strokeWidth={1.5} />
          </TraceIcon>
          <TraceTitle>Order #A-10293 delivered</TraceTitle>
          <TraceDescription>Thu</TraceDescription>
        </TraceLine>
      </a>
      <button type="button">
        <TraceLine>
          <TraceIcon>
            <Search strokeWidth={1.5} />
          </TraceIcon>
          <TraceTitle>Search again</TraceTitle>
        </TraceLine>
      </button>
    </Trace>
  );
}
