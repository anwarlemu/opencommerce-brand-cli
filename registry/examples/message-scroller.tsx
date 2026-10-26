"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent, MessageHeader } from "@/components/ui/message";
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport, useMessageScroller } from "@/components/ui/message-scroller";
import { Window } from "@/components/ui/window";

type Entry = { id: number; from: "person" | "agent"; text: string };

const STORES = ["Amazon", "Target", "Best Buy", "Staples", "Wayfair"];
const START: Entry[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  from: i % 3 === 2 ? "agent" : "person",
  text: i % 3 === 2 ? `Checked ${STORES[i % STORES.length]}: in stock, ships tomorrow.` : `Can you price the standing desk at ${STORES[i % STORES.length]}?`,
}));

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const { scrollToEnd } = useMessageScroller();
  const [text, setText] = React.useState("");
  return (
    <form
      className="flex items-center gap-2 border-t border-line p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
        scrollToEnd({ behavior: "auto" });
      }}
    >
      <Input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask your agent to buy something" />
      <Button type="submit" size="icon" className="size-10" aria-label="Send">
        <SendHorizontal strokeWidth={1.75} />
      </Button>
    </form>
  );
}

export function Site() {
  const [entries, setEntries] = React.useState(START);
  return (
    <Window name="agent.chat" className="mx-auto h-110 w-full max-w-xl" bodyClassName="flex min-h-0 flex-col">
      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4">
              <Marker variant="separator">
                <MarkerContent>Yesterday</MarkerContent>
              </Marker>
              {entries.map((entry) => (
                <MessageScrollerItem key={entry.id}>
                  <Message align={entry.from === "agent" ? "end" : "start"}>
                    <MessageContent>
                      <MessageHeader>{entry.from === "agent" ? "Shopping agent" : "Jordan Miles"}</MessageHeader>
                      <Bubble variant={entry.from === "agent" ? "default" : "secondary"} align={entry.from === "agent" ? "end" : "start"}>
                        <BubbleContent>{entry.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <Composer onSend={(text) => setEntries((all) => [...all, { id: all.length, from: "person", text }])} />
      </MessageScrollerProvider>
    </Window>
  );
}

export function Streaming() {
  const [count, setCount] = React.useState(3);
  React.useEffect(() => {
    if (count >= 12) return;
    // ds-latency: simulates order updates arriving in this example; scrolling and input remain immediate.
    const t = setTimeout(() => setCount((c) => c + 1), 900);
    return () => clearTimeout(t);
  }, [count]);
  return (
    <Window name="orders.live" className="mx-auto h-80 w-full max-w-xl" bodyClassName="flex min-h-0 flex-col">
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-2">
            {Array.from({ length: count }, (_, i) => (
              <MessageScrollerItem key={i}>
                <Bubble variant="muted">
                  <BubbleContent>{`Update ${i + 1}: order #A-${10293 + i} moved to ${i % 2 ? "shipped" : "confirmed"}.`}</BubbleContent>
                </Bubble>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="start" />
        <MessageScrollerButton />
      </MessageScroller>
    </Window>
  );
}
