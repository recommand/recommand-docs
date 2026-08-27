"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import {
  answersFrom,
  axes,
  guideTitle,
  type Selection,
  urlFrom,
} from "@/lib/country-guides-data";
import {
  ChipBody,
  chipClass,
  hairline,
  QuestionColumn,
  questionPanel,
} from "./guide-ui";

/**
 * The three questions, answered in place: picking an option never navigates, it
 * only fills that answer in. Once all three are answered, the call to action
 * underneath names the guide and links to it.
 *
 * Every option is still a real link to the guide it would produce, so the page
 * works without JavaScript and every combination stays crawlable from here.
 * `initial` pre-answers a question, which is how a country hub arrives with its
 * own country already picked.
 */
export function GuidePicker({ initial }: { initial?: Selection }) {
  const [selection, setSelection] = useState<Selection>(initial ?? {});
  const baseId = useId();

  const pending = axes
    .filter((axis) => !selection[axis.key])
    .map((axis) => axis.pending);

  return (
    <section
      aria-label="Build your getting started guide"
      className={questionPanel}
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {axes.map((axis, index) => (
          <QuestionColumn
            id={`${baseId}-${axis.key}`}
            key={axis.key}
            legend={axis.legend}
            step={index + 1}
          >
            {axis.choices.map((choice) => {
              const active = selection[axis.key] === choice.id;
              return (
                <Link
                  aria-current={active ? "true" : undefined}
                  className={chipClass(active)}
                  href={urlFrom({ ...selection, [axis.key]: choice.id })}
                  key={choice.id}
                  onClick={(event) => {
                    event.preventDefault();
                    setSelection((current) => ({
                      ...current,
                      [axis.key]: choice.id,
                    }));
                  }}
                >
                  <ChipBody choice={choice} />
                </Link>
              );
            })}
          </QuestionColumn>
        ))}
      </div>

      <div aria-live="polite" className={`mt-6 border-t pt-5 ${hairline}`}>
        {pending.length > 0 ? (
          <p className="text-fd-muted-foreground text-sm">
            {pending.length === axes.length
              ? "Answer the three questions and your guide is assembled from the parts that apply."
              : `Still to pick: ${pending.join(" and ")}.`}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-folder-dark px-4 py-2.5 font-semibold text-sheet text-sm no-underline transition-opacity hover:opacity-90 dark:bg-folder dark:text-darkslate"
              href={urlFrom(selection)}
            >
              Read the guide
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <span className="text-fd-muted-foreground text-sm">
              {guideTitle(answersFrom(selection))}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
