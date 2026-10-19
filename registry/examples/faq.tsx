import { Faq } from "@/components/site/faq";

export function Site() {
  return (
    <section className="mx-auto w-(--ds-frame-column) py-20">
      <Faq
        title="Questions"
        lead="What teams ask before their agent makes its first purchase."
        items={[
          { question: "What is opencommerce?", answer: "An open router for commerce: one endpoint your agent calls to search a store, check out and track the order." },
          { question: "Which stores can my agent buy from?", answer: "More than 4,000 online stores, from marketplaces to restaurants, with new routes added every week." },
          { question: "How are payments handled?", answer: "Your customers’ cards stay in Agentcard’s vault; the agent pays with them, within the limits they set." },
          { question: "Which agent frameworks does it work with?", answer: "Any that can call a tool: the SDK ships tools for the common frameworks and a plain HTTP API." },
          { question: "How does the 1% platform fee work?", answer: "It is charged on each completed order. Failed and cancelled orders cost nothing." },
        ]}
      />
    </section>
  );
}
