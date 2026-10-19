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
