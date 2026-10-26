# Carousel
A row of slides that snap into place, with white keys to step through them.

Install: npx opencommerce-ds add carousel
Requires: theme, utils
Packages: lucide-react
Exports: Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel, CarouselApi
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.win, .btn-secondary)


## Usage
Use for a few related items people browse one at a time (merchant cards, screenshots of a checkout). Keep Previous and Next visible; use setApi to show the current slide. Set opts.loop to wrap around and orientation="vertical" for a column.
- Avoid: Auto-playing slides
- Avoid: Hiding important content in later slides
- Avoid: A carousel for text people must read in full


## Examples
Example components: npx opencommerce-ds add carousel badge window
[Site](https://opencommerce-ds.vercel.app/preview/carousel/Site) | [Sizes](https://opencommerce-ds.vercel.app/preview/carousel/Sizes) | [Vertical](https://opencommerce-ds.vercel.app/preview/carousel/Vertical)

examples/carousel.tsx

```tsx
"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Window } from "@/components/ui/window";

const MERCHANTS = [
  { name: "Northwind Outfitters", host: "northwind.example", checkouts: "1,284", status: "success" as const, label: "Operational" },
  { name: "Contoso Coffee", host: "contoso.example", checkouts: "642", status: "success" as const, label: "Operational" },
  { name: "Fabrikam Home", host: "fabrikam.example", checkouts: "318", status: "warning" as const, label: "Degraded" },
  { name: "Tailspin Toys", host: "tailspin.example", checkouts: "97", status: "success" as const, label: "Operational" },
  { name: "Litware Books", host: "litware.example", checkouts: "1,016", status: "success" as const, label: "Operational" },
];

function Card({ m }: { m: (typeof MERCHANTS)[number] }) {
  return (
    <Window name={m.host} bodyClassName="grid gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-h5 font-medium tracking-tight text-fg">{m.name}</p>
        <Badge variant={m.status}>{m.label}</Badge>
      </div>
      <p className="text-body-sm text-fg-muted">
        <span className="font-mono text-fg tabular-nums">{m.checkouts}</span> checkouts today
      </p>
    </Window>
  );
}

export function Site() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (!api) return;
    const update = (a: CarouselApi) => setIndex(a.selectedScrollSnap());
    api.on("select", update);
    return () => api.off("select", update);
  }, [api]);
  return (
    <div className="mx-auto grid w-full max-w-80 gap-3 sm:max-w-96">
      <Carousel setApi={setApi} aria-label="Merchants">
        <CarouselContent>
          {MERCHANTS.map((m) => (
            <CarouselItem key={m.host}>
              <Card m={m} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="max-sm:hidden" />
        <CarouselNext className="max-sm:hidden" />
      </Carousel>
      <p className="text-center font-mono text-bar text-fg-muted">
        Merchant {index + 1} of {MERCHANTS.length}
      </p>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="mx-auto w-full max-w-160 px-12 max-sm:px-0">
      <Carousel opts={{ align: "start" }} aria-label="Merchants">
        <CarouselContent>
          {MERCHANTS.map((m) => (
            <CarouselItem key={m.host} className="basis-full sm:basis-1/2">
              <Card m={m} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="max-sm:hidden" />
        <CarouselNext className="max-sm:hidden" />
      </Carousel>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="mx-auto grid w-full max-w-80 justify-items-center py-12">
      <Carousel orientation="vertical" opts={{ align: "start" }} className="w-full" aria-label="Merchants">
        <CarouselContent className="h-72">
          {MERCHANTS.map((m) => (
            <CarouselItem key={m.host} className="basis-1/2">
              <Card m={m} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

```

## Source

components/ui/carousel.tsx

```tsx
"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

// A row of slides that snap into place, drawn from the brand's windows and keys. Slides scroll natively (touch,
// trackpad and wheel) and snap; the previous and next keys are the white key (a 16 percent ink edge, 8px corners) at
// 32px with an ink arrow, outside the row, that takes the mist under the pointer and shrinks to 0.97 when pressed.
// Arrow keys move a slide when the carousel has focus. The scroll is smooth (the browser's own easing) unless reduced
// motion is set.

type CarouselEvent = "select" | "reInit";
type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
  on: (event: CarouselEvent, callback: (api: CarouselApi) => void) => void;
  off: (event: CarouselEvent, callback: (api: CarouselApi) => void) => void;
};
type CarouselOptions = { loop?: boolean; align?: "start" | "center" | "end" };

type CarouselProps = {
  opts?: CarouselOptions;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  viewport: React.RefObject<HTMLDivElement | null>;
  orientation: "horizontal" | "vertical";
  align: "start" | "center" | "end";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  update: () => void;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

function Carousel({ orientation = "horizontal", opts, setApi, className, children, ...props }: React.ComponentProps<"div"> & CarouselProps) {
  const viewport = React.useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = React.useState({ prev: false, next: false, index: 0 });
  const listeners = React.useRef<Record<CarouselEvent, Set<(api: CarouselApi) => void>>>({ select: new Set(), reInit: new Set() });
  const vertical = orientation === "vertical";
  const loop = !!opts?.loop;

  const slides = React.useCallback(() => Array.from(viewport.current?.querySelectorAll<HTMLElement>(":scope > [data-slot=carousel-content] > [data-slot=carousel-item]") ?? []), []);
  const offsetOf = React.useCallback((el: HTMLElement) => (vertical ? el.offsetTop : el.offsetLeft), [vertical]);
  const current = React.useCallback(() => {
    const el = viewport.current;
    if (!el) return 0;
    const pos = vertical ? el.scrollTop : el.scrollLeft;
    const list = slides();
    let best = 0;
    list.forEach((s, i) => {
      if (Math.abs(offsetOf(s) - pos) < Math.abs(offsetOf(list[best]) - pos)) best = i;
    });
    return best;
  }, [offsetOf, slides, vertical]);

  const scrollTo = React.useCallback((index: number) => {
    const el = viewport.current;
    const list = slides();
    if (!el || !list.length) return;
    const i = loop ? (index + list.length) % list.length : Math.max(0, Math.min(list.length - 1, index));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ [vertical ? "top" : "left"]: offsetOf(list[i]), behavior: reduce ? "auto" : "smooth" });
  }, [loop, offsetOf, slides, vertical]);

  const api = React.useMemo<CarouselApi>(() => {
    const self: CarouselApi = {
      scrollPrev: () => scrollTo(current() - 1),
      scrollNext: () => scrollTo(current() + 1),
      scrollTo,
      canScrollPrev: () => {
        const el = viewport.current;
        return !!el && (loop || (vertical ? el.scrollTop : el.scrollLeft) > 1);
      },
      canScrollNext: () => {
        const el = viewport.current;
        if (!el) return false;
        return loop || (vertical ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
      },
      selectedScrollSnap: current,
      scrollSnapList: () => slides().map((_, i) => i),
      on: (event, cb) => void listeners.current[event].add(cb),
      off: (event, cb) => void listeners.current[event].delete(cb),
    };
    return self;
  }, [current, loop, scrollTo, slides, vertical]);

  // The last slide listeners heard about: they are told outside React's state updates, from the scroll event.
  const announced = React.useRef(0);
  const update = React.useCallback(() => {
    const next = { prev: api.canScrollPrev(), next: api.canScrollNext(), index: api.selectedScrollSnap() };
    setEdges((e) => (e.prev === next.prev && e.next === next.next && e.index === next.index ? e : next));
    if (announced.current !== next.index) {
      announced.current = next.index;
      listeners.current.select.forEach((cb) => cb(api));
    }
  }, [api]);

  React.useEffect(() => {
    setApi?.(api);
    const el = viewport.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(() => {
      update();
      listeners.current.reInit.forEach((cb) => cb(api));
    });
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [api, setApi, update]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const back = vertical ? "ArrowUp" : "ArrowLeft";
    const forward = vertical ? "ArrowDown" : "ArrowRight";
    if (event.key === back) {
      event.preventDefault();
      api.scrollPrev();
    } else if (event.key === forward) {
      event.preventDefault();
      api.scrollNext();
    }
  };

  return (
    <CarouselContext.Provider value={{ viewport, orientation, align: opts?.align ?? "start", scrollPrev: api.scrollPrev, scrollNext: api.scrollNext, canScrollPrev: edges.prev, canScrollNext: edges.next, update }}>
      <div onKeyDownCapture={onKeyDown} className={cn("relative min-w-0", className)} role="region" aria-roledescription="carousel" data-slot="carousel" data-orientation={orientation} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { viewport, orientation } = useCarousel();
  const vertical = orientation === "vertical";
  return (
    <div
      ref={viewport}
      data-slot="carousel-viewport"
      className={cn("overflow-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", vertical ? "h-full snap-y snap-mandatory" : "snap-x snap-mandatory")}
    >
      <div data-slot="carousel-content" className={cn("flex", vertical ? "-mt-4 flex-col" : "-ml-4", className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation, align } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", align === "center" ? "snap-center" : align === "end" ? "snap-end" : "snap-start", className)}
      {...props}
    />
  );
}

const ARROW =
  "absolute inline-flex size-8 items-center justify-center rounded-control border border-hairline bg-surface text-fg outline-none transition-[background-color,opacity,scale] duration-160 ease-out hover:bg-subtle active:scale-97 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-[background-color,opacity] motion-reduce:active:scale-100 [&_svg]:size-3.5";

function CarouselPrevious({ className, ...props }: React.ComponentProps<"button">) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(ARROW, orientation === "horizontal" ? "top-1/2 -left-12 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      {...props}
    >
      <ArrowLeft strokeWidth={1.5} />
      <span className="sr-only">Previous slide</span>
    </button>
  );
}

function CarouselNext({ className, ...props }: React.ComponentProps<"button">) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(ARROW, orientation === "horizontal" ? "top-1/2 -right-12 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      {...props}
    >
      <ArrowRight strokeWidth={1.5} />
      <span className="sr-only">Next slide</span>
    </button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel };
export type { CarouselApi };

```
