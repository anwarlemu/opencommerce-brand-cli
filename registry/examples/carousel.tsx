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
