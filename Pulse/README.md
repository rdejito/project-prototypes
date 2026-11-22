# PULSE — Interactive Prototype

A clickable, front-end prototype of **PULSE (Logistics Urgent Wall): An Automated Urgent Request Management and Monitoring System** (based on the Pulse proposal document). It centralizes urgent logistics requests, routes them to the right team, shows them on a live-style wall, and records every action in an audit trail.

## How to run

1. Open `index.html` in any modern browser.
2. No installation, build step, server, or internet connection is required.
3. Use the role picker: **Requestor**, **Material handler**, **Supervisor**, **Admin**. Requestors see only their own requests; other roles can update, forward, and resolve.
4. State persists in `localStorage`; **Reset demo data** restores the seed requests and audit records.

## What to try

| Screen | Interactions |
|---|---|
| **Dashboard** | Open/resolved stats, resolved-rate ring, workflow stage track, aging open requests (with `App.ageChip`), notification center, activity. |
| **Submit request** | Form captures Request Type, Category, Request For, Requestor, and Remarks. The routing hint updates live; submitting routes by category (Inbound → Receiving, Outbound → Shipping, Concerns → CSR, Kit Assembly → Kitting, FPA → FPA). |
| **Visual wall** | Four columns (New / In Progress / Forwarded / Resolved) using `.wall`/`.wall-col`/`.wall-card`. Search, team tabs, status tabs, category select. **Start**, **Forward**, **Resolve**, and **Reopen** move cards instantly. |
| **Request history** | Searchable/filterable full request records with aging, status, and details modal containing the request's audit timeline. |
| **Reports** | Bar charts by team, request type, and status using `.bar-row`, plus aging/forwards/audit summary. |
| **Audit trail** | Full table of actor, timestamp, action, and detail for every created/updated/forwarded/resolved request. |

## Coverage of the 15 functional requirements

| FR | Requirement (proposal) | Prototype implementation |
|---|---|---|
| 01 | Create urgent requests | Submit request form → `createRequest()`. |
| 02 | Capture type, category, request for, requestor, remarks | All five fields on the submit form. |
| 03 | Route to appropriate logistics team | `s.routes` category-to-team map; team assigned on creation. |
| 04 | Display on PULSE Visual Wall in real time | Four-column wall re-rendered after every status change. |
| 05 | Authorized users update status | Start / Resolve / Reopen gated by role. |
| 06 | Open and Resolved statuses | New / In Progress / Forwarded are open; Resolved is terminal (reopenable). |
| 07 | Calculate and display aging | `App.ageChip()` on wall cards, dashboard, and request history. |
| 08 | Forward between logistics teams | Forward modal + audit + notification; forward count tracked. |
| 09 | Notifications for new/forwarded/resolved | Notice center with unread badges and mark-as-read actions. |
| 10 | Notify requestor when resolved | Resolution creates a `resolved` notification naming the actor. |
| 11 | Request history and audit records | Request history view + audit view + per-request timeline. |
| 12 | Dashboards and reports | Dashboard stats and Reports view. |
| 13 | Statistics by team, type, status | `.bar-row` charts in Reports. |
| 14 | Search and filter requests | `App.onInput` search boxes + filter tabs/status/team/category. |
| 15 | Centralized repository | Single `s.requests` array persisted in `localStorage`. |

Supporting features: role-based access, sidebar counts/progress, toasts, activity feed, and demo reset.

## Files

- `index.html` — shell referencing `../shared.css`, `../shared.js`, `data.js`, `app.js`.
- `data.js` — seed teams, routing map, requests, audit records, notices, activity.
- `app.js` — routing, wall, status actions, notifications, reports, and audit helpers.
- `README.md` — this file.

## Deliberately out of scope

Real-time server push, authentication infrastructure, email/SMS delivery, and database backups. "Real-time" is simulated by immediate re-rendering of the wall after each local action.
