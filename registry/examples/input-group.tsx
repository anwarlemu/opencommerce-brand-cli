"use client";

import * as React from "react";
import { Check, Copy, Search, X } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

export function Site() {
  const [query, setQuery] = React.useState("");
  return (
    <div className="grid w-full max-w-100 gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Search strokeWidth={1.5} />
        </InputGroupAddon>
        <InputGroupInput type="search" placeholder="Filter merchants..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter merchants" />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear" onClick={() => setQuery("")}>
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <div className="grid gap-1.5">
        <Label htmlFor="store-domain">Store domain</Label>
        <InputGroup>
          <InputGroupAddon variant="segment">https://</InputGroupAddon>
          <InputGroupInput id="store-domain" placeholder="acme" />
          <InputGroupAddon variant="segment" align="inline-end">
            .myshopify.com
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export function WithButton() {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="grid w-full max-w-100 gap-4">
      <InputGroup>
        <InputGroupInput readOnly value="oc_live_7f3k2v9m1q" aria-label="API key" className="font-mono" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs" onClick={() => setCopied(true)}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput inputMode="decimal" placeholder="0.00" aria-label="Budget" />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="font-mono text-caption">USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function Textarea() {
  const [note, setNote] = React.useState("");
  return (
    <InputGroup className="max-w-110">
      <InputGroupTextarea placeholder="Tell the agent what to buy..." value={note} onChange={(e) => setNote(e.target.value)} aria-label="Instructions" />
      <InputGroupAddon align="block-end" className="justify-between">
        <InputGroupText className="font-mono text-caption">{note.length}/500</InputGroupText>
        <InputGroupButton variant="primary" size="sm" disabled={!note}>
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-100 gap-3">
      <InputGroup>
        <InputGroupInput defaultValue="not-a-domain" aria-invalid aria-label="Webhook URL" />
        <InputGroupAddon align="inline-end">
          <X className="text-danger" strokeWidth={1.75} />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput disabled placeholder="Disabled" aria-label="Disabled" />
      </InputGroup>
    </div>
  );
}
