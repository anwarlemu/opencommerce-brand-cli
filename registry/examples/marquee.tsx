import { Marquee } from "@/components/visuals/marquee";

const NAMES = ["Northwind", "Acme Supply", "Globex", "Initech", "Umbrella", "Hooli", "Stark Goods", "Wayne Retail", "Soylent", "Vandelay", "Pied Piper", "Gringotts"];

export function Site() {
  return (
    <div className="mx-auto w-full max-w-200 py-10">
      <Marquee label="Stores" items={NAMES.map((name) => <span key={name} className="font-display text-h5 font-medium tracking-tight">{name}</span>)} />
    </div>
  );
}
