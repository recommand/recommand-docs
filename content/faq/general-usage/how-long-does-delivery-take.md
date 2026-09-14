---
title: How long does it take for an invoice to reach the recipient?
category: General usage
excerpt: Delivery and visibility depend on the receiving system.
updatedAt: 2026-09-14
---

Delivery time depends on the access point and the receiving software. A successful `send` response can still have `deliveryStatus: "pending"` while the access point processes the document.

For Peppol, `delivered` means the recipient's access point acknowledged the document. When it becomes visible in the recipient's accounting software depends on that software's processing. Follow the document's delivery status or [status-change webhooks](/docs/working-with-webhooks#document-delivery-status-changed-event).
