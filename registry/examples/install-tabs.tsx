import { InstallTabs } from "@/components/ui/install-tabs";

const INSTALL = [
  { label: "npm", command: "npm install @agentcard/sdk" },
  { label: "pnpm", command: "pnpm add @agentcard/sdk" },
  { label: "yarn", command: "yarn add @agentcard/sdk" },
  { label: "bun", command: "bun add @agentcard/sdk" },
];

export function Site() {
  return (
    <div className="flex justify-center rounded-shell border border-line bg-subtle px-6 py-16">
      <InstallTabs commands={INSTALL} />
    </div>
  );
}
