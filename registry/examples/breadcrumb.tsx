"use client";

import { ChevronDown, Slash } from "lucide-react";

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Site() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#orders">Orders</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#order">ord_8KQ2</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Refund</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Collapsed() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-chip outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus-ring" aria-label="Show hidden steps">
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="#api">API reference</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#checkout">Checkout</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#errors">Errors</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>card_declined</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function CustomSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#merchants">Merchants</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash strokeWidth={1.5} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-chip text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus-ring">
              Northwind Outfitters
              <ChevronDown strokeWidth={1.5} className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Northwind Outfitters</DropdownMenuItem>
              <DropdownMenuItem>Contoso Coffee</DropdownMenuItem>
              <DropdownMenuItem>Fabrikam Home</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash strokeWidth={1.5} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Checkout settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
