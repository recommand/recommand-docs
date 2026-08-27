/**
 * The country-specific getting started guide is not a single page but a set of
 * MDX fragments in `content/guides/`, chained together according to three
 * answers the reader gives at the top of the page: whether they are setting up
 * one company or onboarding many, where those companies are registered, and
 * which direction they exchange documents in.
 *
 * The first axis is about scale, not about API versus dashboard. Recommand is an
 * API product either way; every guide is written around the API and says where
 * the dashboard does the same job.
 *
 * Every combination is a real, statically rendered URL
 * (`/getting-started/{country}/{audience}/{direction}`) with its own title,
 * description and canonical, so search engines can index each variant on its
 * own instead of one page hiding two dozen answers behind client-side state.
 */

export const SITE_URL = "https://docs.recommand.eu";

export const GUIDE_BASE_URL = "/getting-started";

export type AudienceId = "platform" | "business";
export type CountryId = "belgium" | "france" | "netherlands" | "other";
export type DirectionId = "sending" | "receiving" | "sending-and-receiving";

export type Audience = {
  id: AudienceId;
  /** Selector label. */
  label: string;
  /** Plural noun for titles: "for software platforms". */
  plural: string;
  /** Two or three words for the picker chip. */
  short: string;
  /**
   * Who the guide is about, phrased with the country's own noun: "Belgian
   * companies you onboard from your own software platform".
   */
  subject: (country: Country) => string;
};

export type Country = {
  id: CountryId;
  /**
   * ISO 3166-1 alpha-2, as used by the `country` field on a company. Null for
   * the catch-all guide, which covers every other supported country.
   */
  code: string | null;
  /** Short label for chips, breadcrumbs and lists. */
  label: string;
  /** The name as it reads mid-sentence: "in the Netherlands". */
  prose: string;
  /** Where the company is registered: "in a country other than ...". */
  registeredIn: string;
  /** Singular noun phrase: "your own Belgian company". */
  company: string;
  /** Plural noun phrase: "Belgian companies you onboard". */
  companies: string;
  flag: string;
  /** Two or three words for the picker chip. */
  short: string;
  /** Why this country needs its own guide, one sentence, used on hub pages. */
  hint: string;
};

export type Direction = {
  id: DirectionId;
  /** Selector label, imperative: "Send documents". */
  label: string;
  /** Gerund for headings and prose: "Sending and receiving". */
  gerund: string;
  /** Two or three words for the picker chip. */
  short: string;
  sends: boolean;
  receives: boolean;
};

export const audiences: readonly Audience[] = [
  {
    id: "platform",
    label: "Many companies",
    plural: "software platforms",
    short: "A SaaS platform, ERP, or invoicing software, ...",
    subject: (country) =>
      `${country.companies} you onboard from your own software platform`,
  },
  {
    id: "business",
    label: "One company",
    plural: "individual businesses",
    short: "My own business",
    subject: (country) => `your own ${country.company}`,
  },
];

export const countries: readonly Country[] = [
  {
    id: "belgium",
    code: "BE",
    label: "Belgium",
    prose: "Belgium",
    registeredIn: "Belgium",
    company: "Belgian company",
    companies: "Belgian companies",
    flag: "🇧🇪",
    short: "0208 · BIS 3 UBL",
    hint: "Peppol BIS 3 UBL, enterprise numbers under scheme 0208, and a B2B mandate that is already in force.",
  },
  {
    id: "france",
    code: "FR",
    label: "France",
    prose: "France",
    registeredIn: "France",
    company: "French company",
    companies: "French companies",
    flag: "🇫🇷",
    short: "0225 · Multiple formats",
    hint: "French UBL, CII and Factur-X on a French-accredited access point, with a signed mandate and its own regulated process.",
  },
  {
    id: "netherlands",
    code: "NL",
    label: "Netherlands",
    prose: "the Netherlands",
    registeredIn: "the Netherlands",
    company: "Dutch company",
    companies: "Dutch companies",
    flag: "🇳🇱",
    short: "0106 · SI-UBL 2.0",
    hint: "KVK numbers under scheme 0106, and SI-UBL 2.0 (NLCIUS) alongside Peppol BIS 3.",
  },
  {
    id: "other",
    code: null,
    label: "Another country",
    prose: "other countries",
    registeredIn: "a country other than Belgium, France or the Netherlands",
    company: "company in another country",
    companies: "companies in other countries",
    flag: "🌍",
    short: "Around thirty more",
    hint: "Around thirty other countries work the same way: Peppol BIS 3 UBL on Recommand's own access point, with that country's own identifier schemes.",
  },
];

export const directions: readonly Direction[] = [
  {
    id: "sending",
    label: "Send documents",
    gerund: "Sending",
    short: "Outgoing only",
    sends: true,
    receives: false,
  },
  {
    id: "receiving",
    label: "Receive documents",
    gerund: "Receiving",
    short: "Incoming only",
    sends: false,
    receives: true,
  },
  {
    id: "sending-and-receiving",
    label: "Both",
    gerund: "Sending and receiving",
    short: "Both directions",
    sends: true,
    receives: true,
  },
];

export type GuideAnswers = {
  country: Country;
  audience: Audience;
  direction: Direction;
};

export type GuideSlugs = {
  country: CountryId;
  audience: AudienceId;
  direction: DirectionId;
};

export function findAudience(id: string): Audience | undefined {
  return audiences.find((audience) => audience.id === id);
}

export function findCountry(id: string): Country | undefined {
  return countries.find((country) => country.id === id);
}

export function findDirection(id: string): Direction | undefined {
  return directions.find((direction) => direction.id === id);
}

/** Resolves a URL triple into answers, or undefined for a combination that does not exist. */
export function resolveAnswers(slugs: {
  country: string;
  audience: string;
  direction: string;
}): GuideAnswers | undefined {
  const country = findCountry(slugs.country);
  const audience = findAudience(slugs.audience);
  const direction = findDirection(slugs.direction);
  if (!country || !audience || !direction) return undefined;
  return { country, audience, direction };
}

export function guideUrl(answers: GuideAnswers): string {
  return `${GUIDE_BASE_URL}/${answers.country.id}/${answers.audience.id}/${answers.direction.id}`;
}

export function countryUrl(country: Country): string {
  return `${GUIDE_BASE_URL}/${country.id}`;
}

/*
 * The three questions as data, so the picker on the hub and the selector on a
 * guide page render the same columns from the same source instead of repeating
 * the axes three times each.
 */

export type AxisKey = "audience" | "country" | "direction";

export type AxisChoice = {
  id: string;
  label: string;
  /** Two or three words under the label: what this answer changes. */
  short: string;
  flag?: string;
};

export type Axis = {
  key: AxisKey;
  /** Reads as the start of a sentence the answers finish. */
  legend: string;
  /** Names the question while it is unanswered: "still to pick: which country". */
  pending: string;
  choices: readonly AxisChoice[];
};

export const axes: readonly Axis[] = [
  {
    key: "audience",
    legend: "I am integrating for",
    pending: "how many companies you are setting up",
    choices: audiences.map(({ id, label, short }) => ({ id, label, short })),
  },
  {
    key: "country",
    legend: "Registering companies in",
    pending: "where the companies are registered",
    choices: countries.map(({ id, label, short, flag }) => ({
      id,
      label,
      short,
      flag,
    })),
  },
  {
    key: "direction",
    legend: "I want to",
    pending: "which way the documents flow",
    choices: directions.map(({ id, label, short }) => ({ id, label, short })),
  },
];

/** A partially answered set of questions, as the hub picker holds it. */
export type Selection = Partial<Record<AxisKey, string>>;

/**
 * What an unanswered question falls back to. On the hub this only ever decides
 * the `href` of a chip — clicks are handled in the browser — so it matters for
 * a crawler and for a reader without JavaScript, both of which land on a real
 * guide with the same three questions waiting as plain links.
 */
export const defaultSelection: Required<Selection> = {
  audience: "platform",
  country: "belgium",
  direction: "sending-and-receiving",
};

export function answersFrom(selection: Selection): GuideAnswers {
  const merged = { ...defaultSelection, ...selection };
  return {
    audience: findAudience(merged.audience) ?? audiences[0],
    country: findCountry(merged.country) ?? countries[0],
    direction: findDirection(merged.direction) ?? directions[0],
  };
}

/** The guide a selection points at, with the unanswered questions filled in. */
export function urlFrom(selection: Selection): string {
  return guideUrl(answersFrom(selection));
}

/** The selection a guide page is the answer to. */
export function selectionOf(answers: GuideAnswers): Required<Selection> {
  return {
    audience: answers.audience.id,
    country: answers.country.id,
    direction: answers.direction.id,
  };
}

/** Every answer combination, country-major so hub pages and the sitemap group naturally. */
export function allAnswers(): GuideAnswers[] {
  const combinations: GuideAnswers[] = [];
  for (const country of countries) {
    for (const audience of audiences) {
      for (const direction of directions) {
        combinations.push({ country, audience, direction });
      }
    }
  }
  return combinations;
}

/** The combinations for one country, used by the country hub pages. */
export function answersForCountry(country: Country): GuideAnswers[] {
  return allAnswers().filter((answers) => answers.country.id === country.id);
}

/*
 * Copy. Every string below varies with at least one answer, so no two of the
 * eighteen pages share a title, description, heading or opening paragraph.
 */

/** The `<h1>`, and the anchor text other pages link this guide by. */
export function guideHeading({ country, audience, direction }: GuideAnswers): string {
  const forWhom =
    audience.id === "platform"
      ? "for the companies you onboard"
      : "for your own company";
  return `${direction.gerund} Peppol documents in ${country.prose} ${forWhom}`;
}

/** The `<title>`, kept front-loaded with the terms people actually search for. */
export function guideTitle({ country, audience, direction }: GuideAnswers): string {
  const what =
    direction.id === "sending"
      ? "Send e-invoices"
      : direction.id === "receiving"
        ? "Receive e-invoices"
        : "Send and receive e-invoices";
  return `${what} in ${country.prose} for ${audience.plural}`;
}

export function guideDescription({
  country,
  audience,
  direction,
}: GuideAnswers): string {
  const steps: string[] = ["register and verify the company"];
  if (direction.sends) {
    steps.push(
      country.id === "france"
        ? "send French UBL, CII or Factur-X invoices"
        : "send Peppol invoices and credit notes",
    );
  }
  if (direction.receives) {
    steps.push(
      audience.id === "platform"
        ? "pull incoming documents through webhooks"
        : "pick up incoming documents",
    );
    if (country.id === "france") {
      steps.push("report invoice lifecycle statuses");
    }
  }
  steps.push("go live");

  return `Getting started with Peppol e-invoicing for ${audience.subject(country)}: ${steps.join(", ")}. ${country.hint}`;
}

/** The paragraph directly under the selector, unique per combination. */
export function guideIntro({ country, audience, direction }: GuideAnswers): string {
  const who =
    audience.id === "platform"
      ? `you are integrating Recommand into your own product and onboarding ${country.companies} as your users`
      : `you are setting up your own ${country.company}`;

  const scope = direction.sends
    ? direction.receives
      ? "sends and receives documents over Peppol"
      : "only sends documents over Peppol"
    : "only receives documents over Peppol";

  return `This guide walks through everything needed to exchange Peppol documents for a company registered in ${country.registeredIn}, assuming ${who}, and that the company ${scope}. Change any of the three answers at the top of the page to get the guide for a different situation.`;
}

/**
 * The fragment chain for one combination, in reading order: the paths a guide is
 * built from, relative to `content/guides/` and without extension.
 *
 * Not every path exists. Fragments that only some countries need (French
 * e-reporting, French lifecycle statuses, the French go-live checklist) are
 * filtered against what is on disk by `fragmentPaths` in `country-guides.ts`, so
 * adding `sending/reporting-belgium.mdx` is enough to make it appear in the
 * Belgian sending guides. `scripts/lint-guides.ts` fails on a fragment that no
 * chain reaches, which is what keeps that indirection from swallowing typos.
 *
 * This lives in the data module, away from the MDX collection, so the lint
 * script can read the chain without pulling in the Next build.
 */
export function fragmentCandidates({
  country,
  audience,
  direction,
}: GuideAnswers): string[] {
  return [
    `overview/${audience.id}`,
    `country/${country.id}`,
    `account/${audience.id}`,
    `testing/${audience.id}`,
    `company/${audience.id}`,
    `identifiers/${country.id}`,
    `registration/${direction.id}`,
    ...(direction.receives ? [`registration/recipient-${country.id}`] : []),
    `verification/${country.id}`,
    `verification/${audience.id}`,
    ...(direction.sends
      ? [
          `sending/formats-${country.id}`,
          `sending/${audience.id}`,
          `sending/reporting-${country.id}`,
        ]
      : []),
    ...(direction.receives
      ? [
          `receiving/document-types-${country.id}`,
          `receiving/${audience.id}`,
          `receiving/statuses-${country.id}`,
        ]
      : []),
    `going-live/${audience.id}`,
    `going-live/${country.id}`,
    "support/common",
  ];
}
