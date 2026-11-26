# Sign in page
Sign in template with the header, one window holding work email, password and the blue key, the way to an account under it, and the footer.

Install: npx opencommerce-ds add sign-in-page
Requires: theme, site-footer, site-header, button, field, input, window
Packages: none
Exports: SignInPage
Client boundary: yes
Reference: Extension in the opencommerce site's voice, after contact-page (opencommerce-agentcard-web globals.css .win, the fields of monitoring.tsx)


## Usage
Use for the sign-in page. Pass onSubmit; throw an Error with a short message to show it under the password.
- Avoid: Social buttons in other brands' colors
- Avoid: A second blue key
- Avoid: Placeholder text in place of labels
`SignInPage` props: `onSubmit` (receives the form's `FormData`; throw to show an error). Composed from `SiteHeader`,
`Window`, `Field`, `Input`, `Button` and `SiteFooter`.

## Examples
Example components: npx opencommerce-ds add sign-in-page
[Block](https://opencommerce-ds.vercel.app/preview/sign-in-page/Block)

examples/sign-in-page.tsx

```tsx
import { SignInPage } from "@/components/blocks/sign-in-page";

export function Block() {
  return <SignInPage />;
}

```

## Source

components/blocks/sign-in-page.tsx

```tsx
"use client";

import * as React from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Window } from "@/components/ui/window";

// Sign in, in the contact page's voice: the glass header, then one window on the 400px column (sign-in.form: work
// email, password, the blue key) with the page's opening above it and the way to an account under it. The form holds
// its state and shows the error in place; wire onSubmit to your own auth, which resolves or throws a message.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: DOCS },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Changelog", href: "/changelog" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
];

export function SignInPage({ onSubmit }: { onSubmit?: (data: FormData) => void | Promise<void> }) {
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit?.(new FormData(event.currentTarget));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main className="mx-auto grid w-(--ds-frame-column) max-w-sm gap-8 py-18 md:py-30">
        <div className="text-center">
          <h1 className="font-display text-h2 leading-display font-medium tracking-hero">Sign in</h1>
          <p className="mt-3 text-body leading-lead text-fg-muted">Welcome back. Your agents kept buying.</p>
        </div>
        <Window name="sign-in.form">
          <form onSubmit={submit} className="grid gap-4 p-6">
            <Field label="Work email" htmlFor="signin-email" required>
              <Input id="signin-email" name="email" type="email" autoComplete="email" />
            </Field>
            <Field label="Password" htmlFor="signin-password" required error={error ?? undefined}>
              <Input id="signin-password" name="password" type="password" autoComplete="current-password" aria-invalid={error ? true : undefined} />
            </Field>
            <Button type="submit" className="mt-2 w-full" disabled={busy}>
              {busy ? "Signing in" : "Sign in"}
            </Button>
          </form>
        </Window>
        <p className="text-center text-body-sm text-fg-muted">
          No account yet? <a href={SIGNUP} className="text-fg-brand underline-offset-4 hover:underline">Create one</a>
        </p>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}

```
