import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GENERAL = [
  { q: "What is opencommerce?", a: "An open router for commerce: one endpoint your agent calls to search, buy and track orders across any online store, built by Agentcard." },
  { q: "Which stores can my agent buy from?", a: "Any online store. The Free plan covers five merchants of your choice; Standard opens every merchant we route to." },
  { q: "How are payments handled?", a: "Cards are tokenized through your payment provider and attached to a customer. Your agent never sees or stores raw card numbers." },
  { q: "Which agent frameworks does it work with?", a: "Anything that can call a tool. The SDK exports a ready-made tool definition, and the same API is available over plain HTTP." },
];

function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="-mx-4 w-[calc(100%+var(--ds-space-8))] max-w-208">
      {items.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Site() {
  return (
    <div className="mx-auto w-full max-w-200 px-4">
      <Faq items={GENERAL} />
    </div>
  );
}

export function WithTopics() {
  return (
    <div className="mx-auto flex w-full max-w-200 flex-col items-center gap-10 px-4">
      <h2 className="text-center text-h2 leading-display tracking-tighter">Questions</h2>
      <Tabs defaultValue="general" className="w-full items-center gap-8">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="w-full">
          <Faq items={GENERAL} />
        </TabsContent>
        <TabsContent value="payments" className="w-full">
          <Faq items={GENERAL.slice(2)} />
        </TabsContent>
        <TabsContent value="merchants" className="w-full">
          <Faq items={GENERAL.slice(1, 3)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
