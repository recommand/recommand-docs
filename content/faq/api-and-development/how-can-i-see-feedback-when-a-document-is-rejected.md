---
title: How can I see feedback when a document is rejected by the recipient?
category: API & development
excerpt: Delivery failures and invoice acceptance are separate outcomes.
updatedAt: 2026-09-14
---

For a technical delivery failure, inspect the document's `deliveries` or subscribe to [delivery status webhooks](/docs/working-with-webhooks#document-delivery-status-changed-event). The failure includes a category and any available message or provider code. `success: true` on the send response alone does not confirm delivery.

A recipient's business decision to accept or reject an invoice is separate from its delivery status. Invoice Responses depend on the receiving software; a `delivered` status does not establish that the recipient approved the invoice.
