import { FileCode2 } from "lucide-react";

import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFooter, CodeBlockHeader, CodeBlockLine, CodeBlockTitle } from "@/components/ui/code-block";

const AGENT = `import { Agentcard } from "@agentcard/sdk";

const agentcard = new Agentcard({
  clientSecret: process.env.AGENTCARD_SECRET,
  clientId: process.env.AGENTCARD_ID,
});

// Buy from any online store from a single endpoint.
const order = await agentcard.purchase({ thing: "USB-C hub", maxPrice: 40 });
console.log(order.status);`;

const INSTALL = `npm install @agentcard/sdk
export AGENTCARD_SECRET="sk_live_..."`;

export function Site() {
  return (
    <CodeBlock className="mx-auto w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>agent.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={AGENT} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={AGENT} language="ts" highlight={[8]} />
    </CodeBlock>
  );
}

export function Dark() {
  return (
    <CodeBlock dark className="mx-auto w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>install.sh</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={INSTALL} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={INSTALL} language="sh" />
    </CodeBlock>
  );
}

export function LineNumbers() {
  return (
    <CodeBlock size="sm" className="mx-auto w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <FileCode2 aria-hidden strokeWidth={1.5} />
          order.ts
        </CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent code={AGENT} language="ts" lineNumbers />
      <CodeBlockFooter>TypeScript, 10 lines</CodeBlockFooter>
    </CodeBlock>
  );
}

export function Diff() {
  return (
    <CodeBlock className="mx-auto w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>route.diff</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent>
        <CodeBlockLine>{"const route = await router.find(store);"}</CodeBlockLine>
        <CodeBlockLine variant="removed">{"const cart = await route.coldStart();"}</CodeBlockLine>
        <CodeBlockLine variant="added">{"const cart = await route.warmed();"}</CodeBlockLine>
        <CodeBlockLine />
        <CodeBlockLine variant="highlighted">{"return cart.checkout();"}</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  );
}
