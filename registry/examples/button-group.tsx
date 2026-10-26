"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Copy, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export function Site() {
  const [page, setPage] = React.useState(1);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup aria-label="Order actions">
        <Button variant="secondary" size="sm">Reorder</Button>
        <Button variant="secondary" size="sm">Track</Button>
        <Button variant="secondary" size="sm">Refund</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Pages">
        <Button variant="secondary" size="sm" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft />
        </Button>
        <ButtonGroupText>Page {page} of 12</ButtonGroupText>
        <Button variant="secondary" size="sm" aria-label="Next page" disabled={page === 12} onClick={() => setPage((p) => p + 1)}>
          <ChevronRight />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function Split() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup aria-label="Checkout">
        <Button size="sm">Buy now</Button>
        <ButtonGroupSeparator />
        <Button size="sm" aria-label="More checkout options">
          <ChevronDown />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Refresh">
        <Button variant="secondary" size="sm">
          <RefreshCw />
          Refresh
        </Button>
        <ButtonGroupText>2m ago</ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}

export function WithInput() {
  return (
    <ButtonGroup className="w-full max-w-110" aria-label="Webhook">
      <ButtonGroupText>POST</ButtonGroupText>
      <Input aria-label="Webhook URL" defaultValue="https://acme.com/hooks/orders" />
      <Button variant="secondary" size="sm" aria-label="Copy URL" className="h-9">
        <Copy />
      </Button>
    </ButtonGroup>
  );
}

export function Vertical() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Zoom" className="w-fit">
      <Button variant="secondary" size="sm">Zoom in</Button>
      <Button variant="secondary" size="sm">Zoom out</Button>
      <Button variant="secondary" size="sm">Reset</Button>
    </ButtonGroup>
  );
}
