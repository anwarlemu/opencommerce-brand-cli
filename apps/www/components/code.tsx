import { WindowBar } from "@/components/ui/window";
import { tokenize } from "@/components/ui/code-window";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

/**
 * Code in a docs page, as the brand shows code that runs: a window with the quiet mist bar (the file name, the white
 * copy key) over ink, code in the platform mono at 13px, keywords in the lifted blue, strings sky, comments faint. Long
 * files scroll inside a fixed height.
 */
export function Code({ code, title, lang = "tsx", tall = false, className }: { code: string; title?: string; lang?: string; tall?: boolean; className?: string }) {
  const text = code.trim();
  return (
    <figure className={cn("m-0 min-w-0 overflow-hidden rounded-panel border border-line-strong bg-code shadow-card", className)}>
      <WindowBar name={<figcaption>{title ?? "code"}</figcaption>} actions={<CopyButton value={text} />} />
      <pre tabIndex={0} className={cn("m-0 overflow-auto px-5 pt-4 pb-5 font-mono text-snippet leading-code whitespace-pre text-fg-code outline-none [scrollbar-width:thin] [tab-size:2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky", tall ? "max-h-140" : "max-h-96")}>
        <code>
          {tokenize(text, lang).map((t, i) => (
            <span key={i} className={t.kind === "comment" ? "text-fg-code-dim" : t.kind === "string" ? "text-fg-code-string" : t.kind === "keyword" ? "text-fg-code-key" : undefined}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
