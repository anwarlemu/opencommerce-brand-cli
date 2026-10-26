"use client";

import * as React from "react";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import { Window } from "@/components/ui/window";

const ITEMS = [
  { name: "buys", required: true },
  { name: "stores", multiple: true },
  { name: "approval", required: true },
] as const;

export function Site() {
  const [result, setResult] = React.useState<string>();
  return (
    <Window name="agent.setup" className="mx-auto w-full max-w-lg" bodyClassName="p-5">
      {result ? (
        <p role="status" className="text-body-sm leading-relaxed text-fg">
          {result}
        </p>
      ) : (
        <Questionnaire
          items={ITEMS}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setResult(`Saved. Your agent buys ${data.get("buys")}, from ${data.getAll("stores").filter(Boolean).join(", ") || "any store"}, and asks first ${data.get("approval")}.`);
          }}
        >
          <QuestionnaireProgress />
          <QuestionnaireItem name="buys" required>
            <QuestionnaireTitle>What will your agent buy?</QuestionnaireTitle>
            <QuestionnaireDescription>Pick the closest; you can change it later.</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="office supplies">Office supplies</QuestionnaireChoice>
              <QuestionnaireChoice value="travel">
                Travel
                <QuestionnaireChoiceDescription>Flights, hotels and trains</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="groceries">Groceries</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireInput placeholder="Something else" aria-label="Something else" />
            <QuestionnaireError />
          </QuestionnaireItem>
          <QuestionnaireItem name="stores" multiple>
            <QuestionnaireTitle>Which stores can it use?</QuestionnaireTitle>
            <QuestionnaireDescription>Leave them all off to allow any store.</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="Amazon">Amazon</QuestionnaireChoice>
              <QuestionnaireChoice value="Target">Target</QuestionnaireChoice>
              <QuestionnaireChoice value="Best Buy">Best Buy</QuestionnaireChoice>
              <QuestionnaireChoice value="Staples" disabled>
                Staples
                <QuestionnaireChoiceDescription>Paused while its route recovers</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireItem name="approval" required>
            <QuestionnaireTitle>When should it ask you first?</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="for every order">Every order</QuestionnaireChoice>
              <QuestionnaireChoice value="over $100">Orders over $100</QuestionnaireChoice>
              <QuestionnaireChoice value="never">Never</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            <QuestionnaireNext />
            <QuestionnaireSubmit>Save</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      )}
    </Window>
  );
}

export function Letters() {
  return (
    <Window name="feedback.form" className="mx-auto w-full max-w-lg" bodyClassName="p-5">
      <Questionnaire items={[{ name: "speed", required: true }]} shortcuts="letters" onSubmit={(event) => event.preventDefault()}>
        <QuestionnaireItem name="speed" required>
          <QuestionnaireTitle>How fast did checkout feel?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="instant">Instant</QuestionnaireChoice>
            <QuestionnaireChoice value="fine">Fine</QuestionnaireChoice>
            <QuestionnaireChoice value="slow">Slow</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSubmit>Send</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </Window>
  );
}
