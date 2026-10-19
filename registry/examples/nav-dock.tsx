import { NavDock } from "@/components/site/nav-dock";

export function Site() {
  return (
    <div className="flex justify-center bg-subtle py-16">
      <NavDock
        spy={false}
        links={[
          { label: "Home", href: "#top" },
          { label: "Features", href: "#features", current: true },
          { label: "Pricing", href: "#pricing" },
          { label: "Docs", href: "https://docs.example.com" },
        ]}
      />
    </div>
  );
}
