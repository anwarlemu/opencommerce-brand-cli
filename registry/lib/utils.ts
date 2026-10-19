import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The brand's scales have their own names (text-body-sm, rounded-card, shadow-card). Without teaching tailwind-merge,
// it reads text-body-sm as a text color and drops the real color beside it, and keeps a default rounded-md next to a
// brand radius meant to replace it. Brand text sizes do not set line height: keep explicit leading in either order.
const twMerge = extendTailwindMerge<"brand-font-size">({
  extend: {
    theme: {
      leading: ["tight", "heading", "display", "snug", "lead", "body", "relaxed", "code"],
      tracking: ["display", "hero", "tighter", "tight", "snug", "normal", "label", "caps", "mark"],
      radius: ["chip", "sm", "menu", "control", "card", "panel", "shell", "pill"],
      shadow: ["guide", "inset", "key", "key-brand", "key-muted", "pressed", "well", "card", "raised", "code", "plan", "tile", "floating", "glass", "lit", "glass-hover", "tooltip", "ring-hover"],
    },
    classGroups: {
      "brand-font-size": [{ text: ["display", "hero", "h1", "h2", "h3", "h4", "h5", "body-lg", "body", "button", "body-sm", "snippet", "caption", "bar", "micro"] }],
    },
    conflictingClassGroups: {
      "brand-font-size": ["font-size"],
      "font-size": ["brand-font-size"],
    },
    conflictingClassGroupModifiers: { "brand-font-size": ["leading"] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
