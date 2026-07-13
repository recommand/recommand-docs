import type { ThemeRegistration } from "shiki";

/**
 * Recommand brand code themes (see DESIGN.md in recommand-site + recommand-brand).
 *
 * Two inks carry the code, like the rest of the site: warm paper / dark green
 * ink for plain text, with restrained accent moments:
 * - strings (the "data" in every sample) take mint `folder` — THE brand accent
 * - functions take `progress` blue, numbers and constants take `data` yellow
 * - types get a sparing `warning` orange
 * - keywords stay ink, set bold (editorial, no extra color statement)
 *
 * All values are hex renderings of the OKLCH brand tokens in globals.css
 * (shiki/TextMate themes require hex). Both themes are emitted as
 * `--shiki-light`/`--shiki-dark` CSS variables (fumadocs sets
 * `defaultColor: false`), so light and dark are always generated together.
 *
 * Bold keywords rely on the `--shiki-*-font-weight` shim in
 * `src/app/api-reference.css` — without it they gracefully render regular.
 */

// Brand tokens, hex-rendered (light ramp = readable on paper surfaces)
const ink = "#1d2a1f"; // darkslate
const inkSoft = "#263829"; // slate
const meta = "#5c5e5c"; // stone-dark
const mint = "#216e48"; // folder-dark
const blue = "#264f8b"; // progress-dark
const yellow = "#987500"; // data-dark
const orange = "#8e350b"; // warning-dark
const orangeMid = "#c0571e"; // warning-mid

// Dark ramp = readable on darkslate/slate surfaces
const inkDark = "#f7f5f2"; // sheet
const metaDark = "#999d99"; // stone
const mintDark = "#4ecb8e"; // folder
const blueDark = "#79a6e9"; // progress, +30% tint for contrast on darkslate
const yellowDark = "#f7db78"; // data
const orangeDark = "#f1783b"; // warning

export const recommandCodeLight: ThemeRegistration = {
  name: "recommand-light",
  displayName: "Recommand Light",
  type: "light",
  colors: {
    "editor.background": "#fbfaf8", // sheet-light
    "editor.foreground": ink,
  },
  settings: [
    { settings: { foreground: ink } },
    {
      scope: "comment, punctuation.definition.comment",
      settings: { foreground: meta, fontStyle: "italic" },
    },
    {
      scope: "keyword, storage",
      settings: { foreground: inkSoft, fontStyle: "bold" },
    },
    {
      scope: "keyword.operator",
      settings: { foreground: meta, fontStyle: "" },
    },
    {
      scope: "string, punctuation.definition.string",
      settings: { foreground: mint },
    },
    {
      scope: "constant.numeric, constant.language",
      settings: { foreground: yellow },
    },
    {
      scope: "constant.character.escape, string.regexp",
      settings: { foreground: orangeMid },
    },
    {
      scope:
        "entity.name.function, support.function, meta.function-call.generic",
      settings: { foreground: blue },
    },
    {
      scope: "entity.name.type, entity.name.class, support.class, support.type",
      settings: { foreground: orange },
    },
    // JSON object keys (support.type.property-name.json) stay quiet ink;
    // the mint string values carry the accent, ledger-style.
    {
      scope: "support.type.property-name",
      settings: { foreground: ink },
    },
    // XML/HTML: UBL documents are the product — tags take the mint accent
    {
      scope: "entity.name.tag, punctuation.definition.tag",
      settings: { foreground: mint },
    },
    {
      scope: "entity.other.attribute-name",
      settings: { foreground: yellow },
    },
  ],
};

export const recommandCodeDark: ThemeRegistration = {
  name: "recommand-dark",
  displayName: "Recommand Dark",
  type: "dark",
  colors: {
    "editor.background": "#1d2a1f", // darkslate
    "editor.foreground": inkDark,
  },
  settings: [
    { settings: { foreground: inkDark } },
    {
      scope: "comment, punctuation.definition.comment",
      settings: { foreground: metaDark, fontStyle: "italic" },
    },
    {
      scope: "keyword, storage",
      settings: { foreground: inkDark, fontStyle: "bold" },
    },
    {
      scope: "keyword.operator",
      settings: { foreground: metaDark, fontStyle: "" },
    },
    {
      scope: "string, punctuation.definition.string",
      settings: { foreground: mintDark },
    },
    {
      scope: "constant.numeric, constant.language",
      settings: { foreground: yellowDark },
    },
    {
      scope: "constant.character.escape, string.regexp",
      settings: { foreground: orangeDark },
    },
    {
      scope:
        "entity.name.function, support.function, meta.function-call.generic",
      settings: { foreground: blueDark },
    },
    {
      scope: "entity.name.type, entity.name.class, support.class, support.type",
      settings: { foreground: orangeDark },
    },
    {
      scope: "support.type.property-name",
      settings: { foreground: inkDark },
    },
    {
      scope: "entity.name.tag, punctuation.definition.tag",
      settings: { foreground: mintDark },
    },
    {
      scope: "entity.other.attribute-name",
      settings: { foreground: yellowDark },
    },
  ],
};

/** Shared light/dark pair for fumadocs-mdx (rehype-code) and fumadocs-openapi. */
export const codeThemes = {
  light: recommandCodeLight,
  dark: recommandCodeDark,
};
