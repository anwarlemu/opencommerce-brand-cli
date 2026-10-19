import { CodeWindow } from "@/components/ui/code-window";

const AGENT = `import { Agentcard } from "@agentcard/sdk";

const agentcard = new Agentcard({
  clientSecret: process.env.AGENTCARD_SECRET,
  clientId: process.env.AGENTCARD_ID,
});

// One tool for every store: search, checkout and tracking.
const tools = [agentcard.tools.commerce()];`;

const STEP = `npm install @agentcard/sdk

import { Agentcard } from "@agentcard/sdk";

const order = await agentcard.purchase({
  merchant: "target.com",
  thing: "Two notebooks and a pack of pens",
});`;

// Light, as the hero's code card: the setup lines banded.
export function Site() {
  return <CodeWindow title="agent.ts" language="ts" code={AGENT} copy highlight={[2, 3, 4, 5]} className="mx-auto w-full max-w-200" />;
}

// On ink, for code that runs (the step-by-step's window).
export function Dark() {
  return <CodeWindow title="step-2.ts" language="ts" code={STEP} copy dark className="mx-auto w-full max-w-160" preClassName="min-h-60" />;
}
