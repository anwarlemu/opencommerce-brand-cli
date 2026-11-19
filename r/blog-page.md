# Blog page
Blog index template with the header, the page's opening, the posts as windows (the latest across the column), page keys and the footer.

Install: npx opencommerce-ds add blog-page
Requires: theme, page-header, site-footer, site-header, badge, pagination, window, utils
Packages: none
Exports: BlogPage
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice (opencommerce-agentcard-web src/components: windows, mono labels, chips)


## Usage
Use as a starting point for a blog or news index. Replace the sample posts, people and page links.
- Avoid: Stock photos on posts
- Avoid: Cards that tilt or lift on hover
- Avoid: Tags in caps
- Avoid: More than one post across the column
Composed from `SiteHeader`, `PageHeader`, `Window`, `Badge` (chip), `Pagination` and `SiteFooter`. Each post window is
one link: the title's anchor covers the window.

## Examples
Example components: npx opencommerce-ds add blog-page
[Block](https://opencommerce-ds.vercel.app/preview/blog-page/Block)

examples/blog-page.tsx

```tsx
import { BlogPage } from "@/components/blocks/blog-page";

export function Block() {
  return <BlogPage />;
}

```

## Source

components/blocks/blog-page.tsx

```tsx
import { PageHeader } from "@/components/site/page-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// A blog index in the home page's voice: the glass header, the page's opening on the 800px column, the posts as
// windows two to a row (the latest across the whole column), each named after its post (warmed-routes.post) with the
// date in the platform mono, the title in the display face, one muted line and, on a hairline, the author and a tag.
// The whole window is the link. Under the posts, the page keys. Sample posts and people; replace them with your own.

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

type Post = { slug: string; title: string; excerpt: string; date: string; dateTime: string; read: string; author: string; tag: string };

const POSTS: Post[] = [
  { slug: "warmed-routes", title: "How warmed routes cut checkout from minutes to seconds", excerpt: "The stores your agents use most stay warm. Here is what that means, and what it took to keep 4,000 of them ready.", date: "Nov 12, 2026", dateTime: "2026-11-12", read: "8 min read", author: "Ada Okafor", tag: "Engineering" },
  { slug: "spending-limits", title: "Spending limits your customers set themselves", excerpt: "A ceiling per order and per month, enforced before the agent ever reaches a checkout page.", date: "Nov 4, 2026", dateTime: "2026-11-04", read: "5 min read", author: "Luis Romero", tag: "Product" },
  { slug: "monitoring-every-route", title: "Monitoring every route, every hour", excerpt: "Why we buy from each store around the clock, and how the status table turns that into a picture you can trust.", date: "Oct 28, 2026", dateTime: "2026-10-28", read: "6 min read", author: "Mara Lindqvist", tag: "Engineering" },
  { slug: "first-purchase", title: "Your agent’s first purchase, step by step", excerpt: "From installing the SDK to a tracking number in under fifteen minutes, with the code for each step.", date: "Oct 19, 2026", dateTime: "2026-10-19", read: "4 min read", author: "Noor Haddad", tag: "Guide" },
  { slug: "checkout-changes", title: "What happens when a store changes its checkout", excerpt: "Routes are re-learned within minutes. A look at how we notice, and what your agent sees meanwhile.", date: "Oct 9, 2026", dateTime: "2026-10-09", read: "7 min read", author: "Ada Okafor", tag: "Engineering" },
];

function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span aria-hidden className="flex size-6 flex-none items-center justify-center rounded-chip bg-tint font-display text-caption leading-none text-fg-brand">
      {letters}
    </span>
  );
}

function PostWindow({ post, lead = false }: { post: Post; lead?: boolean }) {
  return (
    <li className={cn("flex", lead && "sm:col-span-2")}>
      <Window name={`${post.slug}.post`} className="relative w-full" bodyClassName="flex flex-col">
        <article className="flex flex-1 flex-col px-6 pt-6 pb-6 md:px-8 md:pt-7">
          <p className="font-mono text-caption leading-body text-fg-muted">
            <time dateTime={post.dateTime}>{post.date}</time> · {post.read}
          </p>
          <h2 className={cn("mt-2 font-display leading-snug font-medium tracking-tight text-balance", lead ? "text-h3" : "text-h4")}>
            <a href={`/blog/${post.slug}`} className="rounded-chip outline-none after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
              {post.title}
            </a>
          </h2>
          <p className="mt-2 max-w-xl flex-1 text-body leading-relaxed text-fg-muted">{post.excerpt}</p>
          <footer className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-body-sm">
            <Initials name={post.author} />
            <span>{post.author}</span>
            <Badge variant="chip" className="ml-auto">
              {post.tag}
            </Badge>
          </footer>
        </article>
      </Window>
    </li>
  );
}

export function BlogPage() {
  const [latest, ...rest] = POSTS;
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <PageHeader eyebrow="Blog" title="Notes from the router" lead="How we keep every store reachable, what we ship, and how teams give their agents a checkout." />
        <div className="mx-auto w-(--ds-frame-column) max-w-(--ds-layout-medium) pt-12 pb-18 md:pb-30">
          <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2">
            <PostWindow post={latest} lead />
            {rest.map((post) => (
              <PostWindow key={post.slug} post={post} />
            ))}
          </ul>
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="/blog" aria-disabled="true" tabIndex={-1} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="/blog" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="/blog/page/2">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="/blog/page/3">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="/blog/page/2" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}

```
