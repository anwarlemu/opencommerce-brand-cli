# Install tabs
One install line on ink, a tab per package manager and a Copy key.

Install: npx opencommerce-ds add install-tabs
Requires: theme, copy-button, utils
Packages: none
Exports: InstallTabs, Install
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/install-tabs.tsx, src/components/cta.tsx


## Usage
Use under a closing call to action or in a getting-started section, for the one command that installs the SDK. Pass one entry per package manager.
- Avoid: More than one command per tab
- Avoid: A light install box
- Avoid: Tabs that change anything but the command
`InstallTabs` takes `commands` (`{ label, command }[]`, one per package manager), `label` (the tab list's accessible
name, default "Package manager"), `defaultIndex` and `className`. The first word of each command is set as the tool,
the rest as its arguments. Copy always copies the selected command.

## Examples
Example components: npx opencommerce-ds add install-tabs
[Site](https://opencommerce-ds.vercel.app/preview/install-tabs/Site)

examples/install-tabs.tsx

```tsx
import { InstallTabs } from "@/components/ui/install-tabs";

const INSTALL = [
  { label: "npm", command: "npm install @agentcard/sdk" },
  { label: "pnpm", command: "pnpm add @agentcard/sdk" },
  { label: "yarn", command: "yarn add @agentcard/sdk" },
  { label: "bun", command: "bun add @agentcard/sdk" },
];

export function Site() {
  return (
    <div className="flex justify-center rounded-shell border border-line bg-subtle px-6 py-16">
      <InstallTabs commands={INSTALL} />
    </div>
  );
}

```

## Source

components/ui/install-tabs.tsx

```tsx
"use client";

import * as React from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

type Install = { label: string; command: string };

// The brand's install box (install-tabs.tsx; computed): one line to install the SDK on ink, with a tab per package
// manager and the dark Copy key. 12px corners on a 9 percent ink edge with the code box's drop; the tabs are the 13px
// platform mono, half white and turning white under the pointer, the selected one on a 2px white rule. The command is
// 14px mono: the tool in the lifted blue, its arguments in sky. Arrow keys, Home and End move between tabs.
function InstallTabs({ commands, label = "Package manager", defaultIndex = 0, className }: { commands: Install[]; label?: string; defaultIndex?: number; className?: string }) {
  const [active, setActive] = React.useState(defaultIndex);
  const id = React.useId();
  const tab = commands[active] ?? commands[0];
  if (!tab) return null;
  const [tool, ...args] = tab.command.split(" ");

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = commands.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div data-slot="install-tabs" className={cn("w-full max-w-md overflow-hidden rounded-panel border border-line bg-code text-left shadow-code", className)}>
      <div className="flex items-center justify-between border-b border-line-on-code pr-2 pl-3">
        <div role="tablist" aria-label={label} className="flex">
          {commands.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onKeyDown}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 font-mono text-snippet leading-none outline-none transition-[border-color,color] duration-160 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-sky",
                i === active ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton key={active} value={tab.command} label={`Copy ${tab.label} command`} dark />
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} className="px-5 py-4 font-mono text-body-sm leading-code text-fg-code">
        <span className="text-fg-code-key">{tool}</span> <span className="text-fg-code-string">{args.join(" ")}</span>
      </div>
    </div>
  );
}

export { InstallTabs };
export type { Install };

```
