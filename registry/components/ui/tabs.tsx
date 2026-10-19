"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";

import { useTabGlide } from "@/hooks/use-tab-glide";
import { cn } from "@/lib/utils";

// The brand's tabs are the header's tray (nav-pills.tsx, globals.css .nav-tray, .nav-link, .nav-lit; computed): a pane
// of frosted glass (white at 72 percent over a 16px blur, a 10 percent ink edge, a lit top line, 8px corners, 3px in)
// holding 14px Inter labels at 64 percent ink with 5px corners. Under the pointer a label turns ink on a 5 percent wash;
// the selected one is blue on a white pill with a hairline and a small lift that glides between tabs (it travels and
// stays on screen, so it moves on a spring that keeps its speed if you switch mid-way; reduced motion jumps). `plain`
// drops the tray for dense rows: quiet labels with a pale wash gliding between them.
type Variant = "default" | "plain";
type Size = "sm" | "md";

// The key, and the same surface on the selected trigger for the first paint before the key lands (or with no glide).
const KEY: Record<Variant, string> = {
  default: "rounded-menu bg-surface shadow-lit",
  plain: "rounded-sm bg-wash-pill",
};
const SELF_KEY: Record<Variant, string> = {
  default: "data-[state=active]:bg-surface data-[state=active]:shadow-lit",
  plain: "data-[state=active]:bg-wash-pill",
};

const tabsTriggerVariants = cva(
  "relative inline-flex items-center justify-center gap-1.5 font-sans leading-none whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Only the label and a faint wash answer the pointer, so nothing fades over the key gliding in beneath.
        default:
          "rounded-menu text-fg-muted transition-[background-color,color] duration-160 ease-out data-[state=active]:text-fg-brand data-[state=inactive]:hover:bg-wash-hover data-[state=inactive]:hover:text-fg",
        plain: "rounded-sm text-fg-muted transition-[color] duration-150 ease-out hover:text-fg data-[state=active]:text-fg",
      },
      size: { sm: "", md: "" },
    },
    compoundVariants: [
      // The header's links: 32px, 14px in, 14px Inter.
      { variant: "default", size: "md", className: "h-8 px-3.5 text-body-sm" },
      { variant: "default", size: "sm", className: "h-7 px-2.5 text-caption" },
      { variant: "plain", size: "md", className: "h-8 px-3 text-body-sm" },
      { variant: "plain", size: "sm", className: "h-7 px-2.5 text-caption" },
    ],
    defaultVariants: { variant: "default", size: "md" },
  },
);

const ActiveValue = React.createContext<string | undefined>(undefined);
const ListState = React.createContext<{ variant: Variant; size: Size; isKeyPlaced: boolean }>({ variant: "default", size: "md", isKeyPlaced: false });

// The active value is mirrored here so the list can move its key in the same render Radix switches tabs, whether the
// value is controlled or not.
function Tabs({ className, value, defaultValue, onValueChange, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const active = value ?? uncontrolled;
  return (
    <ActiveValue.Provider value={active}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={active}
        onValueChange={(next) => {
          setUncontrolled(next);
          onValueChange?.(next);
        }}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      />
    </ActiveValue.Provider>
  );
}

function TabsList({
  className,
  variant = "default",
  size = "md",
  glide = true,
  pillClassName,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: Variant;
  size?: Size;
  /** Off for lists whose triggers draw their own selected surface. */
  glide?: boolean;
  /** The gliding key's surface, for a list styled its own way. */
  pillClassName?: string;
}) {
  const active = React.useContext(ActiveValue);
  const keyRef = React.useRef<HTMLSpanElement>(null);
  const isPlaced = useTabGlide(keyRef, active ?? "");

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative isolate w-fit",
                variant === "default" ? "inline-flex items-center gap-0.5 rounded-control border border-line-glass bg-glass p-0.75 shadow-glass backdrop-blur-lg backdrop-saturate-140" : "inline-flex items-center gap-0.5",
        className,
      )}
      {...props}
    >
      {glide && (
        // The hook measures from the list's outer edge; -1px puts the key back inside the track's border.
        <span ref={keyRef} aria-hidden className={cn("pointer-events-none absolute -z-10", variant === "default" ? "-top-px -left-px" : "top-0 left-0", KEY[variant], pillClassName, !isPlaced && "invisible")} />
      )}
      <ListState.Provider value={{ variant, size, isKeyPlaced: glide && isPlaced }}>{children}</ListState.Provider>
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, value, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, size, isKeyPlaced } = React.useContext(ListState);
  // Until the key lands (or with no key), the selected tab draws the key itself, so the first paint matches.
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" data-tab-id={value} value={value} className={cn(tabsTriggerVariants({ variant, size }), !isKeyPlaced && SELF_KEY[variant], className)} {...props} />;
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsTriggerVariants };
