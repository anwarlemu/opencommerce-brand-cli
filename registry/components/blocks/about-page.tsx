import { PageHeader } from "@/components/site/page-header";
import { Eyebrow } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TeamDirectory } from "@/components/site/team-directory";

// An about page in the home page's voice: the glass header, the page's opening on the 800px column, the team and the
// investors in directory windows, and the footer with its outlined wordmark. Sample people; replace them with your own.

const SIGNUP = "https://app.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about", current: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "https://docs.agentcard.sh" },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Monitoring", href: "/#monitoring" }, { label: "Pricing", href: "/pricing" }] },
  { title: "Developers", links: [{ label: "Docs", href: "https://docs.agentcard.sh" }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Agentcard", href: "https://agentcard.sh" }] },
];

function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span role="img" aria-label={`Photo of ${name}`} className="flex items-center justify-center bg-tint font-display text-body-sm text-fg-brand">
      {letters}
    </span>
  );
}

const person = (name: string, role: string) => ({ name, role, photo: <Initials name={name} /> });

export function AboutPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <PageHeader eyebrow="The company" title="About" lead="We are building opencommerce so an agent can buy from any store on the web through one endpoint, the way a person would." />
        <div className="mx-auto grid w-(--ds-frame-column) max-w-(--ds-layout-medium) gap-16 pt-16 pb-18 md:pb-30">
          <section aria-label="Team">
            <Eyebrow className="mb-3.5">Team</Eyebrow>
            <TeamDirectory name="team.dir" columns={2} people={[person("Ada Okafor", "CEO & Co-Founder"), person("Luis Romero", "CTO & Co-Founder"), person("Mara Lindqvist", "Member of Technical Staff"), person("Noor Haddad", "Member of Marketing Staff")]} />
          </section>
          <section aria-label="Investors">
            <Eyebrow className="mb-3.5">Investors</Eyebrow>
            <TeamDirectory
              name="investors.dir"
              columns={3}
              people={[person("Priya Raman", "Co-founder, a fund"), person("Tom Becker", "CEO, a commerce platform"), person("Elena Ruiz", "CTO, a CRM"), person("Sam Wu", "CEO, an auth company"), person("Jonas Berg", "CEO, a cloud"), person("Ines Duarte", "Board, an AI lab")]}
            />
          </section>
        </div>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
