import { guideFragments } from "@/.source/server";
import {
  allAnswers,
  fragmentCandidates,
  type GuideAnswers,
  guideHeading,
  guideIntro,
  guideUrl,
} from "./country-guides-data";

/**
 * The half of the guide model that reads `content/guides/`, and therefore only
 * runs on the server. Everything that is pure data — the three questions, the
 * URLs, the per-combination copy — lives in `country-guides-data.ts` so the
 * interactive picker can import it into the browser without dragging the whole
 * MDX collection along.
 */

export * from "./country-guides-data";

/**
 * The fragments one combination is built from, in reading order: the candidate
 * chain minus the paths that have no file. See `fragmentCandidates`.
 */
export function fragmentPaths(answers: GuideAnswers): string[] {
  return fragmentCandidates(answers).filter((path) => fragmentIndex().has(path));
}

export type GuideFragment = (typeof guideFragments)[number];

let index: Map<string, GuideFragment> | undefined;

function fragmentIndex(): Map<string, GuideFragment> {
  if (!index) {
    index = new Map(
      guideFragments.map((fragment) => [
        fragment.info.path.replace(/\.mdx?$/, ""),
        fragment,
      ]),
    );
  }
  return index;
}

/**
 * The fragments for one combination. Throws on a path in the chain that has no
 * file, which cannot happen through `fragmentPaths` but does catch a typo in a
 * chain built by hand.
 */
export function guideChain(answers: GuideAnswers): GuideFragment[] {
  return fragmentPaths(answers).map((path) => {
    const fragment = fragmentIndex().get(path);
    if (!fragment) {
      throw new Error(`Guide fragment "${path}" does not exist in content/guides`);
    }
    return fragment;
  });
}

/** Assembles the guide as plain markdown, for the `.md` view and llms.txt. */
export async function guideMarkdown(answers: GuideAnswers): Promise<string> {
  const sections = await Promise.all(
    guideChain(answers).map((fragment) => fragment.getText("processed")),
  );

  const siblings = allAnswers()
    .filter((candidate) => guideUrl(candidate) !== guideUrl(answers))
    .map(
      (candidate) => `- [${guideHeading(candidate)}](${guideUrl(candidate)}.md)`,
    );

  return [
    `# ${guideHeading(answers)} (${guideUrl(answers)})`,
    guideIntro(answers),
    ...sections.map((section) => section.trim()),
    "## Guides for other situations",
    siblings.join("\n"),
  ].join("\n\n");
}
