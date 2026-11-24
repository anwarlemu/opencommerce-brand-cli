"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// The newsletter sign-up: one window (newsletter.signup) on the medium column, the heading and a line on the left, the
// work email and the blue key on the right, stacking on phones. The form holds its state and thanks the reader in place;
// wire onSubmit to your list.
function Newsletter({ title, description, action = "Subscribe", thanks = "Thanks. Check your inbox.", onSubmit, className, ...props }: Omit<React.ComponentProps<"div">, "title" | "onSubmit"> & { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; thanks?: React.ReactNode; onSubmit?: (data: FormData) => void | Promise<void> }) {
  const [sent, setSent] = React.useState(false);
  const id = React.useId();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit?.(new FormData(event.currentTarget));
    setSent(true);
  }
  return (
    <div data-slot="newsletter" className={cn("mx-auto w-full max-w-(--ds-layout-medium)", className)} {...props}>
      <Window name="newsletter.signup">
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:p-8">
          <div>
            <h2 className="font-display text-h3 leading-snug font-medium tracking-tighter">{title}</h2>
            {description && <p className="mt-2 text-body-sm leading-relaxed text-fg-muted">{description}</p>}
          </div>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field label="Work email" htmlFor={`${id}-email`} required>
              <Input id={`${id}-email`} name="email" type="email" autoComplete="email" />
            </Field>
            <Button type="submit">{action}</Button>
            <p aria-live="polite" className="text-body-sm text-fg-muted sm:col-span-2">
              {sent ? thanks : null}
            </p>
          </form>
        </div>
      </Window>
    </div>
  );
}

export { Newsletter };
