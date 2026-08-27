import Link from "next/link";
import {
  axes,
  type GuideAnswers,
  selectionOf,
  urlFrom,
} from "@/lib/country-guides-data";
import { ChipBody, chipClass, QuestionColumn, questionPanel } from "./guide-ui";

/**
 * The same three questions at the top of every guide, but already answered:
 * each option is a plain link to the guide for that combination, so switching
 * one answer swaps the page. No client JavaScript is involved, which is also
 * what makes every alternative a crawlable link from every guide.
 */
export function GuideSelector({ answers }: { answers: GuideAnswers }) {
  const selection = selectionOf(answers);

  return (
    <section aria-label="Choose your situation" className={questionPanel}>
      <div className="grid gap-6 sm:grid-cols-3">
        {axes.map((axis, index) => (
          <QuestionColumn
            id={`selector-${axis.key}`}
            key={axis.key}
            legend={axis.legend}
            step={index + 1}
          >
            {axis.choices.map((choice) => {
              const active = selection[axis.key] === choice.id;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={chipClass(active)}
                  href={urlFrom({ ...selection, [axis.key]: choice.id })}
                  key={choice.id}
                >
                  <ChipBody choice={choice} />
                </Link>
              );
            })}
          </QuestionColumn>
        ))}
      </div>
    </section>
  );
}
