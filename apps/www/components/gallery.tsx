import { Window } from "@/components/ui/window";

/** One generated file in a window: the bar names the file, the body shows it whole. */
export function Shot({ src, name, alt, width, height }: { src: string; name: string; alt: string; width: number; height: number }) {
  return (
    <Window name={name} bodyClassName="bg-subtle p-3">
      <a href={src} className="block rounded-card outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" className="block h-auto w-full rounded-chip border border-line-subtle bg-surface" />
      </a>
    </Window>
  );
}

/** A small table of names and what they are, in a window. */
export function Rows({ name, rows }: { name: string; rows: [string, string][] }) {
  return (
    <Window name={name} bodyClassName="divide-y divide-line-subtle">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
          <code className="font-mono text-body-sm text-fg">{k}</code>
          <p className="text-body-sm leading-lead text-fg-muted">{v}</p>
        </div>
      ))}
    </Window>
  );
}
