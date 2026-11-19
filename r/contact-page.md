# Contact page
Contact page template with the header, the page's opening, a form in a window beside other ways to reach the team, and the footer.

Install: npx opencommerce-ds add contact-page
Requires: theme, page-header, section, site-footer, site-header, button, field, input, item, native-select, textarea, window
Packages: lucide-react
Exports: ContactPage
Client boundary: yes
Reference: Extension in the opencommerce site's voice (opencommerce-agentcard-web src/components/monitoring.tsx field, globals.css .win)


## Usage
Use as a starting point for a contact or sales page. Pass onSubmit to send the form's data to your endpoint, and replace the addresses.
- Avoid: More than one blue key
- Avoid: Required fields without the mark
- Avoid: Placeholder text in place of labels
`ContactPage` props: `onSubmit` (receives the form's `FormData`). After it resolves, the form thanks the sender in
place. Composed from `SiteHeader`, `PageHeader`, `Window`, `Field`, `Input`, `NativeSelect`, `Textarea`, `Button`,
`Item` and `SiteFooter`.

## Examples
Example components: npx opencommerce-ds add contact-page
[Block](https://opencommerce-ds.vercel.app/preview/contact-page/Block)

examples/contact-page.tsx

```tsx
import { ContactPage } from "@/components/blocks/contact-page";

export function Block() {
  return <ContactPage />;
}

```

## Source

components/blocks/contact-page.tsx

```tsx
"use client";

import * as React from "react";
import { BookOpen, CalendarDays, Mail } from "lucide-react";

import { PageHeader } from "@/components/site/page-header";
import { Eyebrow } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Window } from "@/components/ui/window";

// A contact page in the home page's voice: the glass header, the page's opening on the 800px column, then the form in
// a window (contact.form: name, work email, company, topic and message, the blue key) beside the other ways to reach
// the team as small white cards. The form holds its own state and thanks the sender in place; wire `onSubmit` to your
// own endpoint. Sample addresses; replace them with your own.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact", current: true },
  { label: "Docs", href: DOCS },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Changelog", href: "/changelog" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] },
];

const OPTIONS = [
  { title: "Book a call", description: "Thirty minutes with the team to plan your agent’s first purchase.", href: "https://cal.com/agentcard", icon: <CalendarDays strokeWidth={1.5} /> },
  { title: "Email support", description: "hello@agentcard.sh. We reply within a day.", href: "mailto:hello@agentcard.sh", icon: <Mail strokeWidth={1.5} /> },
  { title: "Read the docs", description: "Guides, the API reference and the SDK.", href: DOCS, icon: <BookOpen strokeWidth={1.5} /> },
];

export function ContactPage({ onSubmit }: { onSubmit?: (data: FormData) => void | Promise<void> }) {
  const [sent, setSent] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit?.(new FormData(event.currentTarget));
    setSent(true);
  }

  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <PageHeader eyebrow="Contact" title="Talk to us" lead="Planning an agent that buys for real? Tell us what it needs to do and we will help you get there." />
        <div className="mx-auto grid w-(--ds-frame-column) max-w-(--ds-layout-medium) gap-10 pt-12 pb-18 md:grid-cols-[minmax(0,1fr)_16rem] md:pb-30">
          <Window name="contact.form">
            <form onSubmit={submit} className="grid gap-4 p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="contact-name" required>
                  <Input id="contact-name" name="name" autoComplete="name" />
                </Field>
                <Field label="Work email" htmlFor="contact-email" required>
                  <Input id="contact-email" name="email" type="email" autoComplete="email" />
                </Field>
              </div>
              <Field label="Company" htmlFor="contact-company">
                <Input id="contact-company" name="company" autoComplete="organization" placeholder="Acme" />
              </Field>
              <Field label="Topic" htmlFor="contact-topic">
                <NativeSelect id="contact-topic" name="topic" className="w-full" defaultValue="sales">
                  <NativeSelectOption value="sales">Sales and volume pricing</NativeSelectOption>
                  <NativeSelectOption value="support">Support</NativeSelectOption>
                  <NativeSelectOption value="partnership">A store or partnership</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label="Message" htmlFor="contact-message" required help="What should your agent buy, and from which stores?">
                <Textarea id="contact-message" name="message" rows={5} />
              </Field>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Button type="submit">Send message</Button>
                <p aria-live="polite" className="text-body-sm text-fg-muted">
                  {sent ? "Thanks. We will reply within a day." : null}
                </p>
              </div>
            </form>
          </Window>
          <aside aria-label="Other ways to reach us">
            <Eyebrow className="mb-3.5">Other ways</Eyebrow>
            <ItemGroup className="gap-3">
              {OPTIONS.map((option) => (
                <Item key={option.title} asChild variant="outline" size="sm" role="listitem">
                  <a href={option.href}>
                    <ItemMedia variant="icon">{option.icon}</ItemMedia>
                    <ItemContent>
                      <ItemTitle>{option.title}</ItemTitle>
                      <ItemDescription>{option.description}</ItemDescription>
                    </ItemContent>
                  </a>
                </Item>
              ))}
            </ItemGroup>
          </aside>
        </div>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}

```
