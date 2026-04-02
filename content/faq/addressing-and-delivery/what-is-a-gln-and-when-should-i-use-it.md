---
title: What is a GLN and when should I use it?
category: Addressing & delivery
excerpt: A GLN identifies specific locations within an organization and uses scheme 0088 on Peppol.
updatedAt: 2026-04-02
---

A Global Location Number (GLN) is a 13-digit identifier issued by GS1 that uniquely identifies a legal entity, a function within an entity, or a physical location such as a warehouse or accounting department.

On the Peppol network, GLNs use the scheme code `0088`. A Peppol address based on a GLN looks like `0088:1234567890123`.

### When to use a GLN

- **Multiple delivery or billing points** — When a company has several locations (e.g. warehouses, branch offices) that each need to receive documents independently, each location can be registered with its own GLN.
- **Internal routing** — Large organizations use GLNs to route incoming invoices or orders to the right department automatically.
- **Trading partners require it** — Retail, logistics, and healthcare sectors commonly use GLNs as their primary Peppol identifier. If a recipient is registered under `0088` rather than a national scheme like `0208`, you must address them with their GLN.

### How it relates to other schemes

Belgian companies are typically registered with scheme `0208` (enterprise number), but some are registered under `0088` (GLN) instead — or under both. If you cannot find a recipient using `0208`, try verifying them with `0088` and their GLN. See [What is the correct format for a Peppol address?](/faq/api-and-development/what-is-the-correct-format-for-a-peppol-address) for more details on schemes.
