---
title: What happens if the recipient is unreachable?
category: Sending & error handling
excerpt: The failure can appear in the send response or in a later delivery status update.
updatedAt: 2026-09-14
---

If sending fails during the request and no email fallback succeeds, the API returns an error. When the access point first accepts the document and reports a failure later, the send response can already have succeeded; inspect the failed attempt in `deliveries` or subscribe to `document.delivery_status_changed`.

If you requested email fallback with `email.when: "on_peppol_failure"`, it also applies to a later Peppol failure. Check the Peppol and email attempts before deciding whether to resend. See [Tracking Delivery](/docs/email-delivery-and-notifications#tracking-delivery).
