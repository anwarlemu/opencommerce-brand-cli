"use client";

import * as React from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

/**
 * The brand's install box: a tab per way in, the line to run, and a copy key, on ink. The current tab is white over a
 * 2px white rule; the others wait at half white and brighten under the pointer (color, 150ms ease-out).
 */
export function InstallBox({ tabs }: { tabs: { label: string; command: string; note: string }[] }) {
  const [active, setActive] = React.useState(0);
  const id = React.useId();
  const tab = tabs[active];
  const [head, ...rest] = tab.command.split(" ");
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-panel border border-line bg-code text-left shadow-code">
      <div className="flex items-center justify-between border-b border-line-on-code pr-2 pl-3">
        <div role="tablist" aria-label="Ways to start" className="flex">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(i)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 font-mono text-snippet outline-none transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky motion-reduce:transition-none",
                i === active ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton key={active} value={tab.command} label="Copy command" dark />
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} className="px-5 pt-4 pb-4.5">
        <code className="block font-mono text-body-sm leading-code break-all text-fg-code">
          <span className="text-fg-code-key">{head}</span> <span className="text-fg-code-string">{rest.join(" ")}</span>
        </code>
        <p className="mt-2 text-caption text-white/50">{tab.note}</p>
      </div>
    </div>
  );
}
