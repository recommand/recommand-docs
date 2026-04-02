---
title: What is the correct format for a Peppol address?
category: API & development
excerpt: Use the ISO6523 format, e.g. 0208:0123456789 or 0088:5400000000001.
updatedAt: 2026-04-02
---

A Peppol address consists of two parts: the **scheme** and the **identifier**, separated by a colon.

### Belgian enterprise number (0208)

For the Belgian company number, the prefix `0208` is used, followed by the full company number. The company number always starts with a `0` or a `1`.
For example: `0208:0xxxxxxxxx` or `0208:1xxxxxxxxx`.

### GLN — Global Location Number (0088)

Some organizations — especially in retail, logistics, and healthcare — are registered on Peppol under their GLN instead of a national company number. The scheme code for GLN is `0088`, followed by the 13-digit GLN.
For example: `0088:5400000000001`.

A full list of electronic address schemes is available on the [Peppol EAS code list](https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/).
