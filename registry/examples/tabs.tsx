import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLANS = [
  { value: "search", label: "Search", body: "Your agent searches any store's catalog conversationally and gets back products it can buy." },
  { value: "checkout", label: "Checkout", body: "One call places the order, with the customer's stored card, at any online store." },
  { value: "tracking", label: "Tracking", body: "Follow every order from confirmation to delivery and report back to the user." },
];

export function Site() {
  return (
    <Tabs defaultValue="search" className="max-w-170">
      <TabsList>
        {PLANS.map((plan) => (
          <TabsTrigger key={plan.value} value={plan.value}>
            {plan.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {PLANS.map((plan) => (
        <TabsContent key={plan.value} value={plan.value} className="text-body text-fg-muted">
          {plan.body}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function Topics() {
  return (
    <div className="grid gap-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
        </TabsList>
        <TabsContent value="general">One endpoint for every online store.</TabsContent>
        <TabsContent value="payments">Cards are tokenized through your payment provider.</TabsContent>
        <TabsContent value="merchants">Any online store, monitored around the clock.</TabsContent>
      </Tabs>
      <Tabs defaultValue="month">
        <TabsList size="sm">
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="month">Billed each month.</TabsContent>
        <TabsContent value="year">Billed once a year.</TabsContent>
      </Tabs>
    </div>
  );
}

export function Plain() {
  return (
    <Tabs defaultValue="all">
      <TabsList variant="plain">
        <TabsTrigger value="all">All orders</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="declined">Declined</TabsTrigger>
      </TabsList>
      <TabsContent value="all">Target · Approved. DoorDash · Declined.</TabsContent>
      <TabsContent value="approved">Target · Approved.</TabsContent>
      <TabsContent value="declined">DoorDash · Declined.</TabsContent>
    </Tabs>
  );
}
