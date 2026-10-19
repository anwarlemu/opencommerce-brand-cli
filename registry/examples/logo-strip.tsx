import { LogoStrip } from "@/components/site/logo-strip";

const Dot = () => (
  <svg viewBox="0 0 24 24" className="fill-current">
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const Square = () => (
  <svg viewBox="0 0 24 24" className="fill-current">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);

const NAMES = ["Northwind", "Acme Supply", "Globex", "Initech", "Umbrella", "Hooli", "Vandelay", "Soylent", "Wonka", "Pied Piper"];

export function Site() {
  return (
    <div className="py-12">
      <LogoStrip brands={NAMES.map((name, i) => (i % 3 === 0 ? { name, logo: i % 2 ? <Square /> : <Dot /> } : { name }))} />
    </div>
  );
}
