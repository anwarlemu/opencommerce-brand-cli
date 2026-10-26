import { readFileSync } from "node:fs";
import path from "node:path";

import brand from "../../../brand/brand.json";
import index from "./registry-index.json";

export type Item = {
  name: string;
  title: string;
  type: "ui" | "site" | "product" | "visual" | "block" | "hook" | "lib";
  surface: "site" | "product" | "both";
  description: string;
  kinds: string[];
  use_for: string;
  never: string[];
  source?: string;
  paths: string[];
  dependencies: string[];
  npm: string[];
  examples: string[];
  body: string;
  exports: string[];
  client: boolean;
};

export const registryName = index.name;
export const registryUrl = index.url;
// The repository and the release branch apps install, from brand.json's source (github:owner/repo#release).
const [, repoPath = ""] = brand.source.match(/^github:([^#]+)/) ?? [];
export const REPO = `https://github.com/${repoPath}`;
export const BRAND_SITE = brand.site;
export const BIN = brand.bin;
export const INSTALL_COMMAND = `npm install --save-dev ${brand.source}`;
export const CLI_COMMAND = `npx -y ${brand.source}`;
export const items = (index.items as Item[]).filter((i) => i.type !== "lib" && i.type !== "hook");

export const GROUPS: { type: Item["type"]; id: string; label: string; blurb: string }[] = [
  { type: "ui", id: "components", label: "Components", blurb: "Buttons, form controls, navigation and overlays." },
  { type: "site", id: "site", label: "Sections", blurb: `Headers, content sections and footers for ${brand.name} pages.` },
  { type: "block", id: "blocks", label: "Pages", blurb: "Page templates built from the library components." },
  { type: "visual", id: "visuals", label: "Visuals", blurb: "Logos, the wordmark and the glyph fields behind cards." },
];

// The rail's order, and the order previous and next follow: each group, then its items A to Z.
export const RAIL = GROUPS.map((g) => ({ ...g, items: items.filter((i) => i.type === g.type).sort((a, b) => a.title.localeCompare(b.title)) })).filter((g) => g.items.length);
export const ORDER = RAIL.flatMap((g) => g.items);
export const groupOf = (item: Pick<Item, "type">) => GROUPS.find((g) => g.type === item.type);

export const counts = Object.fromEntries(GROUPS.map((g) => [g.type, items.filter((i) => i.type === g.type).length]));
export const findItem = (name: string) => items.find((i) => i.name === name);

const root = path.join(process.cwd(), "../../registry");
export const sourceOf = (rel: string) => readFileSync(path.join(root, rel), "utf8");
export const exampleSource = (name: string) => sourceOf(`examples/${name}.tsx`);

// These demos open overlays or focus/scroll their content on mount. Keep those effects inside a frame.
const FRAMED_COMPONENTS = new Set(["alert-dialog", "combobox", "command", "context-menu", "date-picker", "dialog", "drawer", "dropdown-menu", "hover-card", "menubar", "navigation-menu", "popover", "select", "sheet", "sidebar", "sonner", "toast", "tooltip"]);
export const needsPreviewFrame = (item: Pick<Item, "type" | "name">) => item.type === "site" || item.type === "block" || FRAMED_COMPONENTS.has(item.name);
