import { createOpenAPI } from "fumadocs-openapi/server";

export const SPEC_URL = "https://app.recommand.eu/openapi";

export const openapi = createOpenAPI({
  input: [SPEC_URL],
});
