# ClearPass — Interactive Prototype

A clickable, front-end prototype of **ClearPass: A Student Clearance and Self-Service Status Hub**
(based on `../../MD/ClearPass_Project_Proposal.md`). It demonstrates the core idea: **one checklist**
that shows exactly what is pending and what is done across six school touchpoints.

## How to run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. No installation, build step, server, or internet connection is required.
   All code is plain HTML, CSS, and JavaScript.

The prototype saves changes to the browser's `localStorage`, so status updates survive a
refresh. Use **Reset demo data** at the bottom of the sidebar to restore the original data.

## Screens and interactions

| Module | What you can try |
|---|---|
| **Overview** | See clearance percentage, pending counts per module, today's focus list, and recent activity. |
| **Item Clearance** | Switch between Pending / Claiming history / All; view item details and history; **Mark as claimed** — status updates instantly. |
| **Duty Clearance** | Filter pending/completed tasks; submit a completion note — the duty moves to Done. |
| **Service Clearance** | Search campus services; take a token — a unique number (e.g. `REG-042`) is generated and listed under Your queue tokens. |
| **Quiz Clearance** | Filter by public/private/completed; view results and attempt history; run a short 3-question practice quiz to record a new attempt. |
| **Financial Clearance** | See total paid (including partials) and outstanding balances; record a full or partial payment; inspect payment history. |
| **Concern Clearance** | Search and filter by Open/Resolved; file a concern; mark a concern as resolved. |

### Role switcher

The top-right dropdown demonstrates role-based access:

- **Student view** — all self-service actions (claim, submit, take token, practice quiz, pay, file/resolve concern).
- **Staff view** — can verify duties and resolve concerns; self-service actions are hidden.
- **Admin view** — can add campus services from the Service Clearance page and inspect all modules.

## Coverage of the 12 functional requirements

| FR | Requirement | Prototype implementation |
|---|---|---|
| FR-1 | View item details, pending items, claiming history | Item Clearance tabs + Details modal with timeline |
| FR-2 | Mark item as claimed, auto-update status | `Mark as claimed` action |
| FR-3 | Record completed and pending cleaning tasks | Duty Clearance tabs |
| FR-4 | Submit cleaning task completion | `Submit completion` modal |
| FR-5 | Display available campus services | Service Clearance cards + search |
| FR-6 | Generate unique queue number | `Take a token` action + token list |
| FR-7 | Support public and private quizzes | Visibility badges and filters |
| FR-8 | View results and attempt history | `Results & history` modal + practice attempts |
| FR-9 | Record full or partial payments | `Record payment` modal with amount chips |
| FR-10 | Show unpaid balances | Outstanding balance cards + Unpaid tab |
| FR-11 | Open / Resolved concern statuses | Status badges and `Mark resolved` |
| FR-12 | Search and filter concerns | Search box + All/Open/Resolved tabs |

Supporting features included: role switcher, in-app toast notices, activity feed, and demo-data reset.

## Files

- `index.html` — app shell (sidebar, top bar, content area, modal and toast roots)
- `styles.css` — responsive styling (desktop, tablet, phone)
- `data.js` — seed data for the six modules
- `app.js` — state, rendering, navigation, and all interactions

## Deliberately out of scope

As stated in the proposal: no QR/barcode scanning, real-time wall, email scheduler,
payment gateway, or LMS. Statuses change on the student's own actions and persist locally.
