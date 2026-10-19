import { Cta } from "@/components/site/cta";
import { Button } from "@/components/ui/button";
import { InstallTabs } from "@/components/ui/install-tabs";

export function Site() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <Cta
        title="Give your agent a checkout"
        description="One endpoint, every online store. Start free: your first purchase can go through today."
        actions={
          <>
            <Button asChild>
              <a href="https://app.agentcard.sh">Get started</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="https://cal.com/agentcard">Book a call</a>
            </Button>
          </>
        }
        media={
          <InstallTabs
            className="w-full max-w-md"
            commands={[
              { label: "npm", command: "npm install @agentcard/sdk" },
              { label: "pnpm", command: "pnpm add @agentcard/sdk" },
              { label: "yarn", command: "yarn add @agentcard/sdk" },
              { label: "bun", command: "bun add @agentcard/sdk" },
            ]}
          />
        }
      />
    </div>
  );
}
