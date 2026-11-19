import { Cta } from "@/components/site/cta";
import { PageHeader } from "@/components/site/page-header";
import { Prose } from "@/components/site/prose";
import { Eyebrow, SiteSection } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/ui/window";

// One post in the home page's voice: the glass header, a trail back to the blog, the page's opening on the 800px
// column with the author line under the title, the post in the 576px reading column (Prose), two related posts as
// windows, the closing card and the footer. Sample post and people; replace them with your own.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog", current: true },
  { label: "Docs", href: DOCS },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Changelog", href: "/changelog" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] },
];

const RELATED = [
  { slug: "monitoring-every-route", title: "Monitoring every route, every hour", excerpt: "Why we buy from each store around the clock, and how the status table turns that into a picture you can trust.", date: "Oct 28, 2026", dateTime: "2026-10-28", tag: "Engineering" },
  { slug: "checkout-changes", title: "What happens when a store changes its checkout", excerpt: "Routes are re-learned within minutes. A look at how we notice, and what your agent sees meanwhile.", date: "Oct 9, 2026", dateTime: "2026-10-09", tag: "Engineering" },
];

export function BlogPostPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <div className="mx-auto w-(--ds-frame-column) max-w-(--ds-layout-medium) pt-18 md:pt-24">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Warmed routes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <PageHeader className="pt-6 md:pt-8" eyebrow="Engineering" title="How warmed routes cut checkout from minutes to seconds">
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Avatar>
              <AvatarFallback>AO</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-body-sm text-fg">Ada Okafor</span>
              <span className="font-mono text-caption leading-body text-fg-muted">
                <time dateTime="2026-11-12">Nov 12, 2026</time> · 8 min read
              </span>
            </div>
          </div>
        </PageHeader>
        <div className="mx-auto w-(--ds-frame-column) max-w-(--ds-layout-medium) pt-8">
          <Prose className="mx-0">
            <p>
              A cold route is a store your agent has not bought from in a while. Reaching its checkout means loading the catalogue, finding the item, filling the cart and walking every step of the payment form. On a good day that takes two or three minutes.
            </p>
            <p>A warmed route has already done that walk recently. The session is ready, the form is known, and the purchase takes seconds.</p>
            <h2>What we keep warm</h2>
            <p>
              We watch which stores your agents use and keep those routes ready around the clock. Everything else stays reachable, only slower on the first call. You do not configure any of it; the call is the same either way.
            </p>
            <ul>
              <li>The stores your agents bought from in the last week.</li>
              <li>The stores your customers search most, even before a first purchase.</li>
              <li>Every route the monitoring shows as degraded, until it recovers.</li>
            </ul>
            <h2>What it looks like in code</h2>
            <p>
              Nothing changes. <code>commerce.buy</code> picks the warm route when there is one and tells you which it took:
            </p>
            <pre>
              <code>{`const order = await agentcard.commerce.buy({\n  query: "USB-C charger, 65W",\n  maxPrice: 40,\n});\n\norder.route; // "warm"`}</code>
            </pre>
            <h3>When a route goes cold</h3>
            <p>
              If a store changes its checkout, the route is re-learned within minutes. Until it is, the status table shows the store as degraded and the call falls back to the slower walk. Read more in the <a href="https://docs.agentcard.sh">docs</a>.
            </p>
            <blockquote>A purchase your agent makes should feel like one a person makes: quick, and finished.</blockquote>
          </Prose>
        </div>
        <SiteSection aria-label="Related posts" width="medium">
          <Eyebrow className="mb-3.5">Related posts</Eyebrow>
          <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2">
            {RELATED.map((post) => (
              <li key={post.slug} className="flex">
                <Window name={`${post.slug}.post`} className="relative w-full" bodyClassName="flex flex-col">
                  <article className="flex flex-1 flex-col px-6 pt-6 pb-6">
                    <p className="font-mono text-caption leading-body text-fg-muted">
                      <time dateTime={post.dateTime}>{post.date}</time>
                    </p>
                    <h2 className="mt-2 font-display text-h4 leading-snug font-medium tracking-tight text-balance">
                      <a href={`/blog/${post.slug}`} className="rounded-chip outline-none after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
                        {post.title}
                      </a>
                    </h2>
                    <p className="mt-2 flex-1 text-body leading-relaxed text-fg-muted">{post.excerpt}</p>
                    <Badge variant="chip" className="mt-5">
                      {post.tag}
                    </Badge>
                  </article>
                </Window>
              </li>
            ))}
          </ul>
        </SiteSection>
        <SiteSection aria-label="Get started" className="pb-18 md:pb-30">
          <Cta
            title="Give your agent a checkout"
            description="One endpoint, every online store. Start free: your first purchase can go through today."
            actions={
              <>
                <Button asChild>
                  <a href={SIGNUP}>Get started</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href={DOCS}>Read the docs</a>
                </Button>
              </>
            }
          />
        </SiteSection>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
