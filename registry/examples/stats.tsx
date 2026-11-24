import { Stats } from "@/components/site/stats";

export function Site() {
  return (
    <Stats
      title="Built for volume"
      stats={[
        { value: "1,200+", label: "Stores an agent can buy from", name: "stores.live" },
        { value: "3 s", label: "From request to confirmed order", name: "checkout.live" },
        { value: "99.9%", label: "Uptime over the last 90 days", name: "uptime.live" },
      ]}
    />
  );
}
