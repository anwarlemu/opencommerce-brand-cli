# Tag filter
Searchable tag picker with removable selected filters.

Install: npx opencommerce-ds add tag-filter
Requires: theme, popover, utils
Packages: lucide-react
Exports: TagFilter
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/components/pricing.tsx (the plan chip), monitoring.tsx (#merchant-filter)


## Usage
Connect onAddTag and onRemoveTag to the filter state, then apply those filters to the results.
- Avoid: Filters that hide which tags are on
- Avoid: Colored tags per category


## Examples
Example components: npx opencommerce-ds add tag-filter
[Site](https://opencommerce-ds.vercel.app/preview/tag-filter/Site)

examples/tag-filter.tsx

```tsx
"use client";

import { useState } from "react";

import { TagFilter } from "@/components/ui/tag-filter";

export function Site() {
  const [tags, setTags] = useState(["travel", "software"]);
  return (
    <TagFilter
      tags={tags}
      tagOptions={["travel", "software", "office", "meals", "ads"]}
      onAddTag={(tag) => setTags((t) => [...t, tag])}
      onRemoveTag={(tag) => setTags((t) => t.filter((x) => x !== tag))}
    />
  );
}

```

## Source

components/ui/tag-filter.tsx

```tsx
"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// A tag filter. The picked tags are the brand's chips (the mono in blue on the pale blue, 2px corners), each clearing
// itself; then a small white key, Tags, opens the brand's floating panel with a small search inside it (a search mark
// and a borderless field over a 9 percent rule; rows that take the pale blue under the pointer), each row ticked in
// blue when picked.
function TagFilter({
  tags,
  tagOptions,
  onAddTag,
  onRemoveTag,
  className,
}: {
  tags: string[];
  tagOptions: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const options = [...new Set([...tags, ...tagOptions])].filter((tag) => tag.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = new Set(tags);

  return (
    <div data-slot="tag-filter" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onRemoveTag(tag)}
          aria-label={`Clear tag filter ${tag}`}
          className="flex h-7 items-center gap-1 rounded-chip bg-blue-5 pr-2 pl-2.5 font-mono text-bar leading-none text-fg-brand outline-none transition-[background-color] duration-160 ease-out hover:bg-blue-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none [&_svg]:opacity-70"
        >
          {tag}
          <X className="size-3" strokeWidth={1.75} />
        </button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Filter by tags"
          className="flex h-8 items-center gap-2 rounded-control border border-hairline bg-surface px-3 font-sans text-body-sm whitespace-nowrap text-fg outline-none transition-[background-color,scale] duration-160 ease-out hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:scale-97 data-[state=open]:bg-subtle motion-reduce:transition-[background-color] motion-reduce:active:scale-100"
        >
          Tags
          <svg aria-hidden viewBox="0 0 10 6" className="h-1.5 w-2.5 fill-current text-fg-muted">
            <path d="M0 0h10L5 6z" />
          </svg>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className="w-64 p-0">
          <label className="flex items-center gap-2.5 border-b border-line px-3.5 text-fg-muted">
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.75 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-width:1.5]">
              <circle cx="7" cy="7" r="4.75" />
              <path d="M10.5 10.5 14 14" />
            </svg>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tags"
              aria-label="Search tags"
              className="h-11 min-w-0 flex-1 bg-transparent font-sans text-body-sm text-fg caret-primary outline-none placeholder:text-fg-faint [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
          <ul className="max-h-64 overflow-y-auto p-1">
            {options.length === 0 && <li className="px-2.5 py-2 font-sans text-body-sm text-fg-muted">{tagOptions.length === 0 ? "No tags yet" : "No matching tags"}</li>}
            {options.map((tag) => {
              const isSelected = selected.has(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => (isSelected ? onRemoveTag(tag) : onAddTag(tag))}
                    className={cn(
                      "flex h-9 w-full items-center gap-2.5 rounded-menu px-2.5 text-left font-sans text-body-sm outline-none hover:bg-blue-5 focus-visible:bg-blue-5",
                      isSelected ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{tag}</span>
                    <Check className={cn("size-3.5 shrink-0 text-fg-brand", !isSelected && "invisible")} strokeWidth={1.75} />
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { TagFilter };

```
