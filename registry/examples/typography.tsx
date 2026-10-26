import { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable } from "@/components/ui/typography";

export function Site() {
  return (
    <article className="mx-auto w-full max-w-2xl">
      <TypographyH1>Open router for commerce</TypographyH1>
      <TypographyLead className="mt-4">Buy from any online store from a single endpoint.</TypographyLead>
      <TypographyH2 className="mt-12">Built for agents that buy</TypographyH2>
      <TypographyP className="mt-4">
        One SDK sits in front of every storefront. Call <TypographyInlineCode>agentcard.purchase()</TypographyInlineCode> with what to buy, and opencommerce
        finds the route, fills the cart and checks out.
      </TypographyP>
      <TypographyH3 className="mt-8">What every order reports</TypographyH3>
      <TypographyList>
        <li>The cart, with each item and its price</li>
        <li>The payment, with the card that paid</li>
        <li>The confirmation number from the merchant</li>
      </TypographyList>
      <TypographyBlockquote>Routes are cached and warmed, so a purchase lands in seconds instead of minutes.</TypographyBlockquote>
      <TypographyH4 className="mt-8">Route timings</TypographyH4>
      <TypographyTable>
        <thead>
          <tr>
            <th>Route</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cold</td>
            <td className="font-mono text-snippet">2m 40s</td>
          </tr>
          <tr>
            <td>Warmed</td>
            <td className="font-mono text-snippet">9s</td>
          </tr>
        </tbody>
      </TypographyTable>
    </article>
  );
}

export function Small() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-3">
      <TypographyLarge>Checkout completion</TypographyLarge>
      <TypographySmall>Updated 2 minutes ago</TypographySmall>
      <TypographyMuted>Carts, payment and confirmation are handled end to end, and every step reports back.</TypographyMuted>
      <TypographyList ordered>
        <li>Add the Commerce SDK tool to your agent</li>
        <li>Navigate catalogues and place orders</li>
        <li>Follow orders and report back to users</li>
      </TypographyList>
    </div>
  );
}
