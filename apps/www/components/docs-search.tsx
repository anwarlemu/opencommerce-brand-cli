"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CommandDialog, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export type SearchEntry = { name: string; title: string; group: string; href: string };

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={cn("size-3.75 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-width:1.5]", className)}>
      <circle cx="7" cy="7" r="4.75" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

/**
 * The docs' search: a bar that opens a palette of every item and page (also on ⌘K). `field` is the white bar on a page
 * (a hairline edge, a faint inner shadow); `tray` the compact link in the header's glass tray. The palette opens
 * without an animation: it is opened from the keyboard many times a day.
 */
export function DocsSearch({ entries, tone = "field", className }: { entries: SearchEntry[]; tone?: "tray" | "field"; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = [...new Set(entries.map((e) => e.group))];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "flex items-center text-left text-body-sm outline-none transition-[background-color,border-color,color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-focus-ring motion-reduce:transition-none",
          tone === "tray"
            ? "gap-2 rounded-menu px-3 py-2.25 leading-none text-fg-muted hover:bg-wash-hover hover:text-fg focus-visible:-outline-offset-2"
            : "h-9 w-full gap-2.5 rounded-control border border-line-field bg-surface pr-3 pl-3.5 text-fg-muted shadow-inset hover:border-line-field-hover focus-visible:outline-offset-2",
          className,
        )}
      >
        <SearchIcon />
        <span className={tone === "field" ? "flex-1" : undefined}>{tone === "tray" ? "Search" : "Search the library..."}</span>
        <kbd className="font-mono text-caption text-fg-faint max-sm:hidden">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search the library" description="Find a component, section, page or visual">
        <CommandInput placeholder="Search the library" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          {groups.map((g) => (
            <CommandGroup key={g} heading={g}>
              {entries
                .filter((e) => e.group === g)
                .map((e) => (
                  <CommandItem
                    key={e.href}
                    value={`${e.title} ${e.name}`}
                    onSelect={() => {
                      setOpen(false);
                      router.push(e.href);
                    }}
                  >
                    {e.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
        <CommandFooter>
          <span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span>
            <Kbd>↵</Kbd> to open
          </span>
          <span className="ml-auto">
            <Kbd>esc</Kbd> to close
          </span>
        </CommandFooter>
      </CommandDialog>
    </>
  );
}
