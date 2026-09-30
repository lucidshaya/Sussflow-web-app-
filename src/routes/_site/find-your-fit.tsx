import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";

import { PersonaCard, PersonaLink } from "@/components/site/PersonaCard";
import { glassCard, PageHero, SectionHeading } from "@/components/site/primitives";
import { SwipeRow } from "@/components/site/SwipeRow";
import { Button } from "@/components/ui/button";
import { PERSONAS, type Persona } from "@/content/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/find-your-fit")({
  head: () => ({
    meta: [
      { title: "Find Your Period Care | Sussflow" },
      {
        name: "description",
        content:
          "Answer a few questions and find the reusable menstrual care that fits your body, lifestyle and cycle.",
      },
    ],
  }),
  component: FindYourFitPage,
});

type PersonaId = Persona["id"];

const QUESTIONS: { q: string; options: { label: string; points: PersonaId[] }[] }[] = [
  {
    q: "Who are you shopping for?",
    options: [
      { label: "Myself", points: [] },
      {
        label: "My daughter / a young girl",
        points: ["first-period-parent", "first-period-parent"],
      },
      {
        label: "A school, NGO or organisation",
        points: ["impact-partner", "impact-partner", "impact-partner"],
      },
    ],
  },
  {
    q: "What do you use right now?",
    options: [
      { label: "Disposable pads", points: ["pad-girl"] },
      { label: "I've tried reusable products", points: ["period-pro"] },
      { label: "A menstrual cup", points: ["cup-convert", "period-pro"] },
      { label: "Nothing yet — it's a first period", points: ["first-period-parent"] },
    ],
  },
  {
    q: "How do you feel about inserting a product?",
    options: [
      { label: "I'd rather not — pads feel right", points: ["pad-girl", "pad-girl"] },
      { label: "Curious, but unsure", points: ["curious-switcher", "curious-switcher"] },
      { label: "I'm ready (or already there)", points: ["cup-convert", "cup-convert"] },
    ],
  },
  {
    q: "What matters most to you?",
    options: [
      { label: "Understanding my options first", points: ["curious-switcher"] },
      { label: "Comfort that feels familiar", points: ["pad-girl"] },
      { label: "Freedom and long-term use", points: ["cup-convert"] },
      { label: "Just restocking what works", points: ["period-pro", "period-pro"] },
    ],
  },
];

function FindYourFitPage() {
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step >= QUESTIONS.length;

  const result = (() => {
    if (!done) return null;
    const score = new Map<PersonaId, number>();
    answers.forEach((answer, qi) => {
      for (const id of QUESTIONS[qi]?.options[answer]?.points ?? [])
        score.set(id, (score.get(id) ?? 0) + 1);
    });
    const [best] = [...score.entries()].sort((a, b) => b[1] - a[1]);
    return (
      PERSONAS.find((p) => p.id === best?.[0]) ?? PERSONAS.find((p) => p.id === "curious-switcher")
    );
  })();

  const current = QUESTIONS[step];

  return (
    <>
      <PageHero eyebrow="Find your fit" title="Which menstrual care option is right for you?">
        You don't need to know the name of the product.{" "}
        <strong className="text-foreground">Start with yourself.</strong>
      </PageHero>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className={`${glassCard} p-7 md:p-10`}>
          {!done && current ? (
            <>
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-foreground/55">
                <span>
                  Question {step + 1} of {QUESTIONS.length}
                </span>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => a.slice(0, -1))}
                    className="hover:text-brand"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-glass-soft">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">{current.q}</h2>
              <div className="mt-5 grid gap-3">
                {current.options.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setAnswers((a) => [...a, index])}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border border-glass-border bg-glass-soft px-5 py-4 text-left font-medium transition-colors hover:border-brand/50 hover:bg-glass hover:text-brand",
                    )}
                  >
                    {option.label} <ArrowRight className="size-4 opacity-50" />
                  </button>
                ))}
              </div>
            </>
          ) : result ? (
            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-brand">Your fit</p>
              <h2 className="mt-2 font-display text-4xl font-semibold">You're a {result.name}.</h2>
              <p className="mx-auto mt-3 max-w-lg font-display text-lg">“{result.quote}”</p>
              <p className="mx-auto mt-3 max-w-lg text-foreground/70">{result.body}</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <PersonaLink persona={result}>
                    {result.cta} <ArrowRight className="size-4" />
                  </PersonaLink>
                </Button>
                <Button variant="glass" onClick={() => setAnswers([])}>
                  <RotateCcw className="size-4" /> Start again
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <SectionHeading eyebrow="Or pick yourself" title="Which one sounds like you?" />
        <div className="mt-6">
          <SwipeRow label="Period care personas">
            {PERSONAS.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </SwipeRow>
        </div>
      </section>
    </>
  );
}
