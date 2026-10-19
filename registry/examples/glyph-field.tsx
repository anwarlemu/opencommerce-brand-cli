import { GlyphField } from "@/components/visuals/glyph-field";

export function Site() {
  return (
    <div className="grid gap-8 py-10">
      <div className="relative isolate mx-auto h-72 w-full max-w-200">
        <GlyphField className="absolute inset-0 -z-10 size-full" />
        <div className="relative mx-auto mt-16 h-40 max-w-120 rounded-panel border border-line-strong bg-surface shadow-card" />
      </div>
      <div className="relative isolate overflow-hidden rounded-shell border border-line bg-subtle px-6 py-20 text-center">
        <GlyphField seed={11} fade="in" className="absolute inset-0 size-full" />
        <p className="relative font-display text-h2 leading-display font-medium tracking-tighter">Copy sits on clean ground</p>
      </div>
    </div>
  );
}
