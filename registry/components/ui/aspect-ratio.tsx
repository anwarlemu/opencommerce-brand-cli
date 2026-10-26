"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

// Holds media at a fixed shape (a product shot, a store's logo tile, a screen in a window). The frame takes no style of
// its own; round and clip the media inside it with the window's corners and edge.
function AspectRatio(props: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
