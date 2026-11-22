# UniServe — Interactive Prototype

A clickable front-end prototype of **UniServe: A Unified Role-Based Service Management System**
(based on the UniServe Project Proposal proposal document). It demonstrates the core idea: **one system serving
both the people who run services and the people who use them**, with all 15 gathered requirements
implemented across six modules.

## How to run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. No installation, build step, server, or internet connection is required — plain HTML, CSS, and JavaScript.
3. Use the **role switcher** in the top-right of the toolbar to explore admin, owner, material handler,
   teacher, and customer views.
4. Changes persist in the browser's `localStorage`. Use **Reset demo data** in the sidebar to restore the seed.

## Distinct features

- **Smart Receiving** — simulated QR/barcode scan auto-populates an editable item entry form; MH reviews,
  edits, and saves records; requestors see only their own pending items and claiming history and can claim them.
- **Customer Ledger** — owner adds, edits, and deletes customer profiles and records full or partial payments;
  customers see only their own balance and payment history.
- **Quiz & Analytics** — creators (admin/owner/teacher) create and publish quizzes and view average score and
  pass rate in an `.analytics-grid` with `.bar-row` breakdowns; participants take published quizzes.
- **Service Desk** — registration / login / logout session panel, establishment and service directory with search,
  and an in-app notice center that receives service, payment, item, quiz, and request alerts.
- **Clean Spaces** — cleaning schedules with task status and teacher cleanliness monitoring (mark clean / flag issue).
- **Request Desk** — Open / Resolved request statuses, requestor-only views, and an automatic resolution notice.
- **Role & permission matrix** on the Overview page explains which role can do what in each module.

## Coverage of the 15 functional requirements

| FR | Requirement | Prototype implementation |
|---|---|---|
| FR-1 | Scan barcode/QR; auto-populate item entry form | Smart Receiving `.scan-frame`, fake code picker, **Simulate scan** → prefilled editable form |
| FR-2 | MH reviews, edits, and saves item information | **Edit** on item records → review modal → **Save changes** |
| FR-3 | Requestors access item details, pending items, claiming history | Customer role in Smart Receiving + **Details** modal timeline |
| FR-4 | Owner adds, edits, deletes customer profiles | Ledger **Add customer / Edit / Delete profile** actions |
| FR-5 | Owner records full or partial payments | **Payment** modal with full/partial amount chips |
| FR-6 | Customers view only own balance and history | Customer role in Ledger; records filtered by session email |
| FR-7 | Role-based access (admin, creators, participants) | Role switcher + capability checks in every module + permission matrix |
| FR-8 | Creator analytics: average score and pass rate | Quiz **Analytics** tab with `.analytics-grid`, `.bar-row`, attempt table |
| FR-9 | User registration, login, logout | Service Desk session panel + **Register** modal |
| FR-10 | Display establishments and services | Service Desk directory cards with search |
| FR-11 | Send notifications to customers | In-app notice center; owner broadcasts notices; actions generate notices |
| FR-12 | Open and Resolved request statuses | Request Desk tabs, badges, and **Resolve** action |
| FR-13 | Notify requestor when request is resolved | **Mark resolved & notify** creates a notice addressed to the requestor |
| FR-14 | Teachers monitor classroom cleanliness | Clean Spaces room cards with **Mark clean / Flag issue** |
| FR-15 | Display cleaning schedules | Clean Spaces cleaning schedule task list |

Supporting features: role switcher, timestamped activity feed, age chips, toasts, demo-data reset.

## Files

- `index.html` — app shell (loads `../shared.css`, `../shared.js`, then local data/app scripts)
- `data.js` — distinct UniServe seed data (items, customers, quizzes, services, rooms, requests, notices)
- `app.js` — state, rendering, navigation, and all interactions
- `README.md` — this file

## Deliberately out of scope

No real camera scanning, email delivery, payment gateway, backend authentication, or LMS. Notices and
sessions are simulated in-app and persist only in this browser.
