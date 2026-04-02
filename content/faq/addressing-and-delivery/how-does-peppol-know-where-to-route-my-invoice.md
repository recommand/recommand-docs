---
title: How does Peppol know where to route my invoice?
category: Addressing & delivery
excerpt: Via the recipient's unique Peppol ID.
updatedAt: 2026-04-02
---

Every organization has a unique Peppol ID, usually based on its company number (in Belgium `0208:xxxxxxxxxx`). This ensures every invoice automatically reaches the correct company.

For Belgian company numbers, the prefix `0208` is used, followed by the full company number. The company number always starts with a `0` or a `1`.
For example: `0208:0xxxxxxxxx` or `0208:1xxxxxxxxx`.

Some organizations are registered under their GLN (Global Location Number) using scheme `0088` instead of a national company number. This is common in retail, logistics, and healthcare. In that case the Peppol address looks like `0088:5400000000001`. If you cannot reach a recipient via `0208`, they may be registered under `0088`. See [What is a GLN and when should I use it?](/faq/addressing-and-delivery/what-is-a-gln-and-when-should-i-use-it) for more details.
