"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { tokenize } from "@/components/ui/code-window";
import { CopyButton } from "@/components/ui/copy-button";
import { WindowMark } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// shadcn's code block as the brand's code window (code-window.tsx, globals.css .win, .code; computed): the white window
// on the 16 percent ink edge with 12px corners and the soft drop; a 36px mist bar over a 9 percent rule set in the 11.5px
// platform mono at 64 percent ink, a dimmed arrow at the left, the file name centered and the [*] in blue at the right,
// which an action (Copy) replaces. The code is the 13px platform mono at 1.75 leading, light by default (ink, keywords
// blue, strings deep blue, comments faint) or `dark` on ink for code that runs. Long lines wrap and hang two columns
// past their indent (or scroll with wrap={false}); line numbers sit in a faint gutter; a highlighted line is the pale
// blue band (5 percent white on ink). Nothing animates except the copy key's own swap.
const codeBlockVariants = cva("group/code-block m-0 flex w-full min-w-0 flex-col overflow-hidden rounded-panel border border-line-window bg-surface text-fg shadow-card", {
  variants: {
    size: { default: "", sm: "" },
  },
  defaultVariants: { size: "default" },
});

const CodeBlockTheme = React.createContext<{ dark: boolean }>({ dark: false });

function CodeBlock({ className, size = "default", dark = false, ...props }: React.ComponentProps<"figure"> & VariantProps<typeof codeBlockVariants> & { dark?: boolean }) {
  return (
    <CodeBlockTheme.Provider value={{ dark }}>
      <figure data-slot="code-block" data-size={size} data-dark={dark || undefined} className={cn(codeBlockVariants({ size }), className)} {...props} />
    </CodeBlockTheme.Provider>
  );
}

/** The mist bar: the arrow, the title centered, the [*] or the actions at the right. */
function CodeBlockHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "grid min-h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line bg-window-bar pr-3 pl-3.5 font-mono text-bar leading-body text-fg-muted has-[[data-slot=code-block-actions]]:[&>[data-slot=code-block-mark]]:hidden",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="justify-self-start opacity-60">
        ↳
      </span>
      {children}
      <span data-slot="code-block-mark" className="col-start-3 flex justify-self-end">
        <WindowMark />
      </span>
    </div>
  );
}

function CodeBlockTitle({ className, ...props }: React.ComponentProps<"figcaption">) {
  return <figcaption data-slot="code-block-title" className={cn("col-start-2 min-w-0 truncate text-center font-mono text-bar text-fg-muted [&_svg]:mr-1.5 [&_svg]:inline-block [&_svg]:size-3 [&_svg]:align-[-0.125em]", className)} {...props} />;
}

function CodeBlockActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="code-block-actions" className={cn("col-start-3 flex min-w-0 items-center gap-1.5 justify-self-end", className)} {...props} />;
}

/** The brand's copy key (copy-button.tsx), compact in a small block. */
function CodeBlockCopyButton({ value, label = "Copy code", compact, className }: { value: string; label?: string; compact?: boolean; className?: string }) {
  return <CopyButton value={value} label={label} compact={compact} className={className} />;
}

const codeBlockLineVariants = cva(
  "relative block min-h-[1lh] px-3 group-data-[size=sm]/code-block:px-2.5 in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:min-w-6 in-data-numbered:before:text-right in-data-numbered:before:text-fg-faint in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none after:absolute after:top-0 after:left-0.5 after:select-none",
  {
    variants: {
      variant: {
        default: "",
        highlighted: "bg-blue-5 in-data-dark:bg-code-soft",
        added: "bg-blue-5 after:text-fg-brand after:content-['+'] in-data-dark:bg-code-soft in-data-dark:after:text-fg-code-string",
        removed: "bg-subtle after:text-danger after:content-['-'] in-data-dark:bg-code-soft",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/** One line. `hang` is its indent in columns: when the block wraps, the line's continuation hangs two columns past it. */
function CodeBlockLine({ className, variant = "default", hang = 0, style, children, ...props }: React.ComponentProps<"span"> & VariantProps<typeof codeBlockLineVariants> & { hang?: number }) {
  const empty = children === undefined || children === null || children === "" || (Array.isArray(children) && children.length === 0);
  return (
    <span data-slot="code-block-line" data-variant={variant} style={{ "--hang": `${hang + 2}ch`, ...style } as React.CSSProperties} className={cn(codeBlockLineVariants({ variant }), className)} {...props}>
      <span data-slot="code-block-line-content" className="min-w-0 in-data-wrap:pl-(--hang) in-data-wrap:[text-indent:calc(-1*var(--hang))]">
        {empty ? "\n" : children}
      </span>
    </span>
  );
}

const VOICE = {
  light: { plain: "", keyword: "text-fg-brand", string: "text-fg-string", comment: "text-fg-faint" },
  dark: { plain: "", keyword: "text-fg-code-key", string: "text-fg-code-string", comment: "text-fg-code-dim" },
} as const;

/** The code, split into lines with the code window's three voices. */
function highlightLines(code: string, language: string | undefined, dark: boolean) {
  const voice = VOICE[dark ? "dark" : "light"];
  const lines: React.ReactNode[][] = [[]];
  tokenize(code.replace(/\n$/, ""), language).forEach((t, i) => {
    t.text.split("\n").forEach((part, n) => {
      if (n > 0) lines.push([]);
      if (part) lines[lines.length - 1].push(t.kind === "plain" ? <React.Fragment key={`${i}-${n}`}>{part}</React.Fragment> : <span key={`${i}-${n}`} className={voice[t.kind]}>{part}</span>);
    });
  });
  return lines;
}

/**
 * The code. Pass the text as `code` (highlighted lightly; `language` only picks the comment marker) or your own
 * CodeBlockLine children. `lineNumbers` adds the gutter from `startLine`; `highlight` bands lines by zero-based index;
 * long lines wrap and hang past their indent, as in the code window; `wrap={false}` scrolls them instead.
 */
function CodeBlockContent({ className, children, style, code, language, wrap = true, lineNumbers = false, startLine = 1, highlight = [], ...props }: React.ComponentProps<"pre"> & { code?: string; language?: string; wrap?: boolean; lineNumbers?: boolean; startLine?: number; highlight?: number[] }) {
  const { dark } = React.useContext(CodeBlockTheme);
  const lines = React.useMemo(() => (code !== undefined ? highlightLines(code, language, dark) : null), [code, language, dark]);
  const banded = new Set(highlight);
  const indents = React.useMemo(() => (code ?? "").split("\n").map((l) => l.length - l.trimStart().length), [code]);
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      data-numbered={lineNumbers || undefined}
      data-dark={dark || undefined}
      dir="ltr"
      tabIndex={0}
      style={{ counterReset: `line ${startLine - 1}`, ...style }}
      className={cn(
        "m-0 min-h-0 min-w-0 flex-1 overflow-auto py-4 font-mono text-snippet leading-code outline-none [scrollbar-width:thin] [tab-size:2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring group-data-[size=sm]/code-block:py-3",
        dark ? "bg-code text-fg-code" : "bg-surface text-fg",
        wrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "whitespace-pre",
        className,
      )}
      {...props}
    >
      <code data-slot="code-block-code" className={cn("grid content-start font-[inherit] in-data-numbered:grid-cols-[auto_1fr]", wrap ? "min-w-0" : "min-w-max")}>
        {lines
          ? lines.map((line, i) => (
              <CodeBlockLine key={i} variant={banded.has(i) ? "highlighted" : "default"} hang={indents[i] ?? 0}>
                {line.length ? line : undefined}
              </CodeBlockLine>
            ))
          : children}
      </code>
    </pre>
  );
}

/** A quiet line under the code: the mist on a 9 percent rule, in the 11.5px mono at 64 percent ink. */
function CodeBlockFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="code-block-footer" className={cn("flex min-w-0 shrink-0 items-center gap-2 border-t border-line bg-window-bar px-3.5 py-2 font-mono text-bar leading-body text-fg-muted", className)} {...props} />;
}

export { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFooter, CodeBlockHeader, CodeBlockLine, CodeBlockTitle };
