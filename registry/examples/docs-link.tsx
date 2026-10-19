import { DocsLink } from "@/components/ui/docs-link";

export function Site() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <DocsLink href="https://agentcard.sh">Read the docs</DocsLink>
      <DocsLink href="https://agentcard.sh">Make your first purchase</DocsLink>
    </div>
  );
}
