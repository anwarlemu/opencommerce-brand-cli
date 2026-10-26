import * as React from "react";

import { cn } from "@/lib/utils";

// The brand's type as parts (globals.css h1 to h3, .lead, .mono; prose.tsx). Headings are the display face at 500,
// tracked tight: 48px for a page title, 44px for a section, 24px and 20px below; never bold, never caps. Body is 16px
// Inter at 1.6; secondary copy at 64 percent ink. Inline code is the platform mono in blue on the pale blue chip; a quote
// hangs on a 2px blue rule; lists take blue markers; a table has a mist head on hairlines.
function TypographyH1({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 className={cn("font-display text-h1 leading-heading font-medium tracking-hero text-balance text-fg", className)} {...props} />;
}

function TypographyH2({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("font-display text-h2 leading-heading font-medium tracking-tighter text-balance text-fg", className)} {...props} />;
}

function TypographyH3({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-display text-h3 leading-snug font-medium tracking-tight text-fg", className)} {...props} />;
}

function TypographyH4({ className, ...props }: React.ComponentProps<"h4">) {
  return <h4 className={cn("font-display text-h4 leading-snug font-medium tracking-tight text-fg", className)} {...props} />;
}

function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-body leading-body text-pretty text-fg [&:not(:first-child)]:mt-4", className)} {...props} />;
}

/** The line under a section heading: 16px at 64 percent ink, 576px wide at most. */
function TypographyLead({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("max-w-(--ds-layout-text) text-body-lg leading-lead text-pretty text-fg-muted", className)} {...props} />;
}

function TypographyLarge({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-display text-h5 leading-snug font-medium tracking-tight text-fg", className)} {...props} />;
}

function TypographySmall({ className, ...props }: React.ComponentProps<"small">) {
  return <small className={cn("text-body-sm leading-snug font-medium text-fg", className)} {...props} />;
}

function TypographyMuted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-body-sm leading-relaxed text-fg-muted", className)} {...props} />;
}

function TypographyBlockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return <blockquote className={cn("mt-6 border-l-2 border-brand pl-4 text-body leading-body text-fg-muted", className)} {...props} />;
}

function TypographyList({ className, ordered = false, ...props }: Omit<React.ComponentProps<"ul">, "ref"> & { ordered?: boolean }) {
  const Comp = ordered ? "ol" : "ul";
  return <Comp className={cn("my-4 flex flex-col gap-2 pl-5.5 text-body leading-body text-fg-muted marker:text-fg-brand", ordered ? "list-decimal" : "list-disc", className)} {...props} />;
}

function TypographyInlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return <code className={cn("rounded-chip bg-tint px-1.5 py-px font-mono text-snippet text-fg-brand [overflow-wrap:anywhere]", className)} {...props} />;
}

/** A small table in running text: a mist head on hairlines, 14px rows. */
function TypographyTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="my-4.5 w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse text-body-sm leading-relaxed [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top [&_th]:border-b [&_th]:border-line [&_th]:bg-subtle [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-normal [&_th]:text-fg-muted",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable };
