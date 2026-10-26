import { Clock, Inbox } from "lucide-react";

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function Site() {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-5">
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="unread">
        <MarkerContent>3 new updates</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Inbox strokeWidth={1.5} />
        </MarkerIcon>
        <MarkerContent>Order #A-10293</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Clock strokeWidth={1.5} />
        </MarkerIcon>
        <MarkerContent>
          Checkout took 9s. <a href="#route">See the route</a>
        </MarkerContent>
      </Marker>
    </div>
  );
}
