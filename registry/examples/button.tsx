import { Button } from "@/components/ui/button";

export function Site() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild><a href="#get-started">Get started</a></Button>
        <Button variant="secondary" asChild><a href="#docs">Read the docs</a></Button>
        <Button variant="ghost" asChild><a href="#pricing">See pricing</a></Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="rounded-sm" asChild><a href="#get-started">Get started</a></Button>
        <Button size="sm" variant="secondary" asChild><a href="#book">Book a call</a></Button>
        <Button disabled>Processing</Button>
      </div>
    </div>
  );
}
