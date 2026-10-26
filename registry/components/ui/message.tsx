import * as React from "react";

import { cn } from "@/lib/utils";

// One message in an agent conversation (extrapolated from avatar.tsx and the site's mono figures; computed): a 32px
// avatar square (the merchant tile's 6px corners on the 9 percent edge, initials in the display face, blue on the pale
// blue), the sender in 14px Inter at 500 with the time in the 11.5px platform mono at 64 percent ink beside it, the
// bubbles, and a mono footer (Delivered). The agent's own messages (align end) mirror to the right.
function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-group" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />;
}

function Message({ className, align = "start", ...props }: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return <div data-slot="message" data-align={align} className={cn("group/message relative flex w-full min-w-0 gap-2.5 font-sans text-body-sm data-[align=end]:flex-row-reverse", className)} {...props} />;
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-card border border-line bg-blue-5 font-display text-caption leading-none text-fg-brand group-has-data-[slot=message-footer]/message:-translate-y-6 *:[img]:size-full *:[img]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-content" className={cn("flex w-full min-w-0 flex-col gap-1.5 break-words group-data-[align=end]/message:items-end", className)} {...props} />;
}

/** The sender and the time: the name in ink at 500, the time in the mono at 64 percent ink. */
function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn("flex max-w-full min-w-0 items-baseline gap-2 px-1 text-body-sm leading-tight font-medium text-fg group-data-[align=end]/message:flex-row-reverse [&_time]:font-mono [&_time]:text-bar [&_time]:font-normal [&_time]:text-fg-muted group-has-data-[variant=ghost]/message:px-0", className)}
      {...props}
    />
  );
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn("flex max-w-full min-w-0 items-center gap-1 px-1 font-mono text-bar leading-tight text-fg-muted group-data-[align=end]/message:justify-end group-has-data-[variant=ghost]/message:px-0 [&_svg:not([class*='size-'])]:size-3", className)}
      {...props}
    />
  );
}

export { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader };
