import * as React from "react";

import { cn } from "@/lib/utils";

// A changelog in the home page's voice: one row per day on hairlines, the date in the small platform mono at the left
// and the day's changes at the right, grouped under small mono tags in sentence case (Added on the pale blue, Improved
// on mist, Fixed in the danger red on mist). Each group is a short bulleted list in 14px muted text; a group may also
// carry a title, a body and media (a video or a screenshot in a window-like frame). On phones the date sits above.

type Tone = "blue" | "ink" | "danger";

type UpdateEntry = {
  /** The tag: Added, Improved, Fixed (any word works; those three pick their color). */
  tag: string;
  /** Overrides the tag's color. */
  tone?: Tone;
  /** An optional headline for the group, in the display face. */
  title?: React.ReactNode;
  /** An optional paragraph under the title. */
  body?: React.ReactNode;
  /** The changes, one bullet each. */
  items?: React.ReactNode[];
  /** A video (iframe, <video>) or image, framed with a hairline. Video frames keep 16:9. */
  media?: React.ReactNode;
};

type UpdateDay = {
  /** The date as shown (Wed Oct 14). */
  date: React.ReactNode;
  /** A machine date for the <time> element (2026-10-14). */
  dateTime?: string;
  entries: UpdateEntry[];
};

const TAG_TONE: Record<string, Tone> = { added: "blue", new: "blue", improved: "ink", changed: "ink", fixed: "danger", removed: "danger" };

const TONES: Record<Tone, string> = {
  blue: "bg-tint text-fg-brand",
  ink: "bg-subtle text-fg",
  danger: "bg-subtle text-danger",
};

function UpdateTag({ tag, tone, className }: { tag: string; tone?: Tone; className?: string }) {
  const t = tone ?? TAG_TONE[tag.toLowerCase()] ?? "ink";
  return <span className={cn("w-fit rounded-chip px-2 py-1 font-mono text-caption leading-none", TONES[t], className)}>{tag}</span>;
}

function Entry({ entry }: { entry: UpdateEntry }) {
  return (
    <div className="flex flex-col gap-2">
      <UpdateTag tag={entry.tag} tone={entry.tone} />
      {entry.title ? <h3 className="mt-1 font-display text-h5 leading-snug font-medium tracking-tight">{entry.title}</h3> : null}
      {entry.body ? <p className="text-body-sm leading-relaxed text-fg-secondary">{entry.body}</p> : null}
      {entry.items?.length ? (
        <ul className="m-0 flex list-disc flex-col gap-2.5 pl-4.5">
          {entry.items.map((item, i) => (
            <li key={i} className="text-body-sm leading-relaxed text-fg-muted">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {entry.media ? (
        <div className="mt-2 overflow-hidden rounded-panel border border-line-strong shadow-card [&_iframe]:block [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_img]:block [&_img]:h-auto [&_img]:w-full [&_video]:block [&_video]:w-full">
          {entry.media}
        </div>
      ) : null}
    </div>
  );
}

type UpdatesFeedProps = Omit<React.ComponentProps<"div">, "children"> & { days: UpdateDay[] };

function UpdatesFeed({ days, className, ...props }: UpdatesFeedProps) {
  return (
    <div data-slot="updates-feed" className={cn("flex flex-col", className)} {...props}>
      {days.map((day, i) => (
        <section key={i} className="grid grid-cols-1 gap-2.5 border-b border-line py-6.5 sm:grid-cols-[9.375rem_minmax(0,1fr)] sm:gap-5">
          <h2 className="m-0 pt-0.5 font-mono text-caption leading-body font-normal text-fg-muted">
            {day.dateTime ? <time dateTime={day.dateTime}>{day.date}</time> : day.date}
          </h2>
          <div className="flex min-w-0 flex-col gap-4.5">
            {day.entries.map((entry, j) => (
              <Entry key={j} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export { UpdatesFeed, UpdateTag };
export type { UpdateDay, UpdateEntry, UpdatesFeedProps };
