import { CheckCheck } from "lucide-react";

import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";

export function Site() {
  return (
    <MessageGroup className="mx-auto w-full max-w-xl">
      <Message>
        <MessageAvatar>JM</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Jordan Miles <time dateTime="2026-10-14T09:12">9:12 AM</time>
          </MessageHeader>
          <BubbleGroup>
            <Bubble variant="secondary">
              <BubbleContent>Order more printer paper for the office.</BubbleContent>
            </Bubble>
            <Bubble variant="secondary">
              <BubbleContent>The usual, ten reams.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>OA</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Office agent <time dateTime="2026-10-14T09:13">9:13 AM</time>
          </MessageHeader>
          <Bubble align="end">
            <BubbleContent>Ordered ten reams from Staples for $62.40. They arrive Thursday.</BubbleContent>
          </Bubble>
          <MessageFooter>
            <CheckCheck aria-hidden strokeWidth={1.5} />
            Delivered
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
