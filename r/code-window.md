# Code window
Code in a window: the file name in the bar, Copy at the right, light or on ink, with banded lines.

Install: npx opencommerce-ds add code-window
Requires: theme, copy-button, window, utils
Packages: none
Exports: CodeWindow, tokenize, CodeWindowProps
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/code-block.tsx, hero.tsx, in-action.tsx; src/app/globals.css (.code, .code-dark, .tok-*, .code-line)


## Usage
Use for the code a page shows: the hero's setup file, a step's code, an API request. Pass code as a string for highlighting and copying, or pass rendered children. Light by default; dark for code that runs.
- Avoid: A full syntax theme with many colors
- Avoid: Code in a proportional face
- Avoid: Rounded corners other than 12px
- Avoid: Horizontal scrolling for long lines (they wrap and hang)
`CodeWindow` props: `title` (the file name in the bar), `code` (string) or `children`, `language` (picks the comment
marker and turns keywords off for `text` and `http`), `copy` (puts the Copy key in the bar; needs `code`), `dark` (the
body on ink), `highlight` (zero-based line numbers to band; a run reads as one inset block) and `preClassName` (a fixed
height, or `text-caption leading-snug` for a tighter hero card). It also exports `tokenize(code, language)`.

Three voices only: keywords in the blue, strings in the deep blue (sky on ink), comments faint. Long lines wrap and hang
two columns past their own indent, so the structure still reads on a phone.

## Examples
Example components: npx opencommerce-ds add code-window
Example packages: @agentcard/sdk
[Site](https://opencommerce-ds.vercel.app/preview/code-window/Site) | [Dark](https://opencommerce-ds.vercel.app/preview/code-window/Dark)

examples/code-window.tsx

```tsx
import { CodeWindow } from "@/components/ui/code-window";

const AGENT = `import { Agentcard } from "@agentcard/sdk";

const agentcard = new Agentcard({
  clientSecret: process.env.AGENTCARD_SECRET,
  clientId: process.env.AGENTCARD_ID,
});

// One tool for every store: search, checkout and tracking.
const tools = [agentcard.tools.commerce()];`;

const STEP = `npm install @agentcard/sdk

import { Agentcard } from "@agentcard/sdk";

const order = await agentcard.purchase({
  merchant: "target.com",
  thing: "Two notebooks and a pack of pens",
});`;

// Light, as the hero's code card: the setup lines banded.
export function Site() {
  return <CodeWindow title="agent.ts" language="ts" code={AGENT} copy highlight={[2, 3, 4, 5]} className="mx-auto w-full max-w-200" />;
}

// On ink, for code that runs (the step-by-step's window).
export function Dark() {
  return <CodeWindow title="step-2.ts" language="ts" code={STEP} copy dark className="mx-auto w-full max-w-160" preClassName="min-h-60" />;
}

```

## Source

components/ui/code-window.tsx

```tsx
import * as React from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { WindowBar } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// Code in one of the brand's windows (hero.tsx, in-action.tsx, code-block.tsx, globals.css .code; computed): the white
// window with its quiet mist bar (the file name centered, Copy at the right), the code in the 13px platform mono at 1.75
// leading. Light by default, as the hero's card: ink, keywords in the blue, strings in the deep blue, comments faint.
// `dark` puts the body on ink for code that runs: 88 percent white, keywords the blue lifted toward white, strings sky,
// comments dim. Highlighting is small on purpose: keywords, strings and comments are the only three voices. Long lines
// wrap and hang two columns past their own indent; `highlight` bands lines (a run reads as one inset block).

type Token = { text: string; kind: "plain" | "comment" | "string" | "keyword" };

const COMMENT: Record<string, RegExp> = {
  hash: /#[^\n]*/y,
  slash: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y,
  dash: /--[^\n]*/y,
};
const KEYWORD = /\b(?:import|from|export|default|const|let|var|new|await|async|return|function|type|interface|if|else|for|of|in|true|false|null|npm|pnpm|yarn|bun|npx|install|add)\b/y;
const STRING = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/y;

function commentStyle(language?: string) {
  const lang = (language ?? "").toLowerCase();
  if (["sh", "bash", "shell", "zsh", "py", "python", "rb", "ruby", "yaml", "yml", "toml"].includes(lang)) return COMMENT.hash;
  if (["sql", "lua"].includes(lang)) return COMMENT.dash;
  if (["text", "txt", "plain", "http"].includes(lang)) return undefined;
  return COMMENT.slash;
}

/** Splits code into plain runs, keywords, comments and strings. Language only picks the comment marker. */
function tokenize(code: string, language?: string): Token[] {
  const comment = commentStyle(language);
  // Plain text and HTTP have no keywords: "in" and "for" there are words.
  const keywords = !["text", "txt", "plain", "http"].includes((language ?? "").toLowerCase());
  const tokens: Token[] = [];
  let plain = "";
  let i = 0;
  const flush = () => {
    if (plain) tokens.push({ text: plain, kind: "plain" });
    plain = "";
  };
  while (i < code.length) {
    let match: RegExpExecArray | null = null;
    let kind: Token["kind"] = "plain";
    if (comment) {
      comment.lastIndex = i;
      match = comment.exec(code);
      kind = "comment";
    }
    if (!match) {
      STRING.lastIndex = i;
      match = STRING.exec(code);
      kind = "string";
    }
    // A keyword only where a word starts: not inside another identifier.
    if (!match && keywords && !/[\w$]/.test(code[i - 1] ?? "")) {
      KEYWORD.lastIndex = i;
      match = KEYWORD.exec(code);
      kind = "keyword";
    }
    if (match && match[0].length > 0) {
      flush();
      tokens.push({ text: match[0], kind });
      i += match[0].length;
    } else {
      plain += code[i];
      i += 1;
    }
  }
  flush();
  return tokens;
}

const VOICE = {
  light: { plain: "", keyword: "text-fg-brand", string: "text-fg-string", comment: "text-fg-faint" },
  dark: { plain: "", keyword: "text-fg-code-key", string: "text-fg-code-string", comment: "text-fg-code-dim" },
} as const;

/** The tokens cut at each newline, so every line can be its own block (wrapping, hanging indent, a band). */
function toLines(tokens: Token[]) {
  const lines: Token[][] = [[]];
  for (const t of tokens) {
    t.text.split("\n").forEach((part, n) => {
      if (n > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: t.kind });
    });
  }
  return lines;
}

function Lines({ code, language, dark, highlight = [] }: { code: string; language?: string; dark: boolean; highlight?: number[] }) {
  const lines = React.useMemo(() => toLines(tokenize(code, language)), [code, language]);
  const banded = new Set(highlight);
  const voice = VOICE[dark ? "dark" : "light"];
  return (
    <>
      {lines.map((line, i) => {
        const text = line.map((t) => t.text).join("");
        const indent = text.length - text.trimStart().length;
        const inBand = banded.has(i);
        return (
          <span
            key={i}
            style={{ "--hang": `${indent + 2}ch` } as React.CSSProperties}
            className={cn(
              "block pr-3 pl-[calc(var(--ds-space-3)+var(--hang))] [text-indent:calc(-1*var(--hang))] whitespace-pre-wrap [overflow-wrap:anywhere]",
              inBand && (dark ? "bg-code-soft" : "bg-blue-5"),
              inBand && !banded.has(i - 1) && "rounded-t-sm",
              inBand && !banded.has(i + 1) && "rounded-b-sm",
            )}
          >
            {line.length ? line.map((t, j) => (t.kind === "plain" ? <React.Fragment key={j}>{t.text}</React.Fragment> : <span key={j} className={voice[t.kind]}>{t.text}</span>)) : " "}
          </span>
        );
      })}
    </>
  );
}

type CodeWindowProps = Omit<React.ComponentProps<"figure">, "children" | "title"> & {
  /** The file name in the bar (agent.ts). */
  title?: React.ReactNode;
  /** The code as a string; highlighted lightly and copyable. */
  code?: string;
  /** Pre-rendered code instead of `code` (shown as is, not highlighted). */
  children?: React.ReactNode;
  /** Only picks the comment marker for highlighting (ts, sh, py, sql, text...). */
  language?: string;
  /** Puts Copy at the right of the bar (needs `code`). */
  copy?: boolean;
  /** The body on ink, for code that runs. */
  dark?: boolean;
  /** Zero-based line numbers to band. */
  highlight?: number[];
  /** Classes for the pre (a fixed height, tighter type for a hero card). */
  preClassName?: string;
};

function CodeWindow({ title, code, children, language, copy = false, dark = false, highlight, className, preClassName, ...props }: CodeWindowProps) {
  return (
    <figure data-slot="code-window" className={cn("m-0 flex min-w-0 flex-col overflow-hidden rounded-panel border border-line-window bg-surface text-fg shadow-card", className)} {...props}>
      <WindowBar name={title ?? ""} actions={copy && code ? <CopyButton value={code} label="Copy code" /> : undefined} />
      <pre
        tabIndex={0}
        className={cn(
          "m-0 min-h-0 flex-1 overflow-auto px-3 py-4 font-mono text-snippet leading-code outline-none [tab-size:2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring",
          dark ? "bg-code text-fg-code" : "bg-surface text-fg",
          preClassName,
        )}
      >
        <code className="font-[inherit]">{code !== undefined ? <Lines code={code} language={language} dark={dark} highlight={highlight} /> : children}</code>
      </pre>
    </figure>
  );
}

export { CodeWindow, tokenize };
export type { CodeWindowProps };

```
