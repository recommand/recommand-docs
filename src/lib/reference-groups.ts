/*
 * The endpoint groups of the API reference, in sidebar order, with the name and
 * the one-line description each group is shown with. One list serves both the
 * generator (scripts/generate-openapi.mts), which writes the reference pages and
 * their navigation, and the reference index page, which renders the group cards.
 * A group that is missing here is generated but unreachable, so add new tags
 * here first.
 */
export const referenceGroupOrder = [
  "authentication",
  "sending",
  "reporting",
  "recipients",
  "documents",
  "companies",
  "company-identifiers",
  "company-document-types",
  "company-notification-email-addresses",
  "playgrounds",
  "labels",
  "suppliers",
  "customers",
  "webhooks",
] as const;

export const referenceGroupNames: Record<string, string> = {
  authentication: "Authentication",
  sending: "Sending",
  reporting: "Reporting",
  recipients: "Recipients",
  documents: "Documents",
  companies: "Companies",
  "company-identifiers": "Company Identifiers",
  "company-document-types": "Company Document Types",
  "company-notification-email-addresses": "Notification Emails",
  playgrounds: "Playgrounds",
  labels: "Labels",
  suppliers: "Suppliers",
  customers: "Customers",
  webhooks: "Webhooks",
  models: "Models",
};

export const referenceGroupDescriptions: Record<string, string> = {
  authentication: "Verify authentication and manage API credentials.",
  sending: "Send Peppol documents such as invoices and credit notes.",
  reporting:
    "Register companies for French e-reporting and submit their B2C and cross-border reports.",
  recipients: "Verify recipient presence on the Peppol network.",
  documents: "Retrieve, list, and manage sent and received documents.",
  companies: "Create and manage company profiles.",
  "company-identifiers": "Manage Peppol identifiers for your companies.",
  "company-document-types": "Configure supported document types per company.",
  "company-notification-email-addresses":
    "Manage notification email addresses for companies.",
  playgrounds: "Create and manage sandbox environments for testing.",
  labels: "Organize documents with labels.",
  suppliers: "Manage supplier records.",
  customers: "Manage customer records.",
  webhooks: "Configure webhook endpoints for real-time event notifications.",
  models: "Data models shared across requests and responses.",
};
