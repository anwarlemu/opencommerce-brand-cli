# Avatar
A square photo or store mark with 6px corners and an initials fallback.

Install: npx opencommerce-ds add avatar
Requires: theme, utils
Packages: @radix-ui/react-avatar
Exports: Avatar, AvatarFallback, AvatarImage
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/components/monitoring.tsx (the merchant logo tile)


## Usage
Use beside a person’s name or role. Provide alt text on AvatarImage. Use size="lg" for larger profiles.
- Avoid: Round avatars
- Avoid: Colored rings for status
- Avoid: Overlapping avatar stacks


## Examples
Example components: npx opencommerce-ds add avatar window
[Site](https://opencommerce-ds.vercel.app/preview/avatar/Site)

examples/avatar.tsx

```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Window } from "@/components/ui/window";

const FOUNDERS = [
  { name: "Ada Park", role: "CEO & Co-Founder", initials: "AP" },
  { name: "Jonah Reyes", role: "CTO & Co-Founder", initials: "JR" },
];

const ANGELS = [
  { name: "Mia Chen", role: "Founder, Ledgerline", initials: "MC" },
  { name: "Sam Okafor", role: "Partner, North Fund", initials: "SO" },
  { name: "Lena Ruiz", role: "Angel investor", initials: "LR" },
];

function Person({ person, size }: { person: { name: string; role: string; initials: string }; size?: "md" | "lg" }) {
  return (
    <li className="flex items-center gap-3.5 p-4">
      <Avatar size={size}>
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>
      <span className="grid min-w-0 gap-1">
        <b className="font-display text-body leading-snug font-medium">{person.name}</b>
        <span className="font-display text-micro [letter-spacing:0.04em] text-fg-muted">{person.role}</span>
      </span>
    </li>
  );
}

export function Site() {
  return (
    <div className="grid w-full max-w-170 gap-6">
      <Window name="team.dir" tone="blue">
        <ul className="grid gap-px bg-line sm:grid-cols-2 [&>li]:bg-surface">
          {FOUNDERS.map((person) => (
            <Person key={person.name} person={person} size="lg" />
          ))}
        </ul>
      </Window>
      <Window name="angels.dir">
        <ul className="grid gap-px bg-line sm:grid-cols-3 [&>li]:bg-surface">
          {ANGELS.map((person) => (
            <Person key={person.name} person={person} />
          ))}
        </ul>
      </Window>
    </div>
  );
}

```

## Source

components/ui/avatar.tsx

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

// A person or a store: a square with 6px corners on the 9 percent ink edge (the merchant tiles' shape), 40px in a list,
// 64px (`lg`) for the people a page leads with. Until the photo loads, or without one, their initials in the display
// face, blue on the pale blue.
const SIZES = { md: "size-10 text-caption", lg: "size-16 text-body" } as const;

function Avatar({ className, size = "md", ...props }: React.ComponentProps<typeof AvatarPrimitive.Root> & { size?: keyof typeof SIZES }) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn("relative flex shrink-0 overflow-hidden rounded-card border border-line", SIZES[size], className)} {...props} />;
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn("flex size-full items-center justify-center bg-blue-5 font-display leading-none text-fg-brand", className)} {...props} />;
}

export { Avatar, AvatarFallback, AvatarImage };

```
