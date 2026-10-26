"use client";

import * as React from "react";

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

function pages(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = [...new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count))].sort((a, b) => a - b);
  return set.flatMap((p, i) => (i && p - set[i - 1] > 1 ? (["gap", p] as const) : [p]));
}

function Pager({ count, start = 1 }: { count: number; start?: number }) {
  const [page, setPage] = React.useState(start);
  const go = (p: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (p >= 1 && p <= count) setPage(p);
  };
  return (
    <div className="grid w-full gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={page === 1 || undefined} tabIndex={page === 1 ? -1 : undefined} />
          </PaginationItem>
          {pages(page, count).map((p, i) =>
            p === "gap" ? (
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={p === page} onClick={go(p)} aria-label={`Page ${p}`}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={page === count || undefined} tabIndex={page === count ? -1 : undefined} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p role="status" className="text-center text-body-sm text-fg-muted">
        Orders {(page - 1) * 25 + 1} to {Math.min(page * 25, count * 25 - 9)} of {count * 25 - 9}
      </p>
    </div>
  );
}

export function Site() {
  return <Pager count={12} start={4} />;
}

export function Few() {
  return <Pager count={3} />;
}
