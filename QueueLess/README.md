# QueueLess — Interactive Prototype

A clickable front-end prototype of **QueueLess: A Virtual Queue Management System**
(based on the QueueLess Project Proposal proposal document). Customers join queues remotely, track their position
and ETA, receive turn notices, and personnel call the next ticket on a live board.

## How to run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. No installation, build step, server, or internet connection is required.
3. Try the top-right role switcher: **Customer**, **Service Personnel**, **Administrator**.
4. Use the session panel to register, log out, or log back in. Changes persist in `localStorage`;
   **Reset demo data** restores the seed.

## Distinct features

- **Session simulation** — registration, login, and logout with the active name used for ticket ownership and notices.
- **Establishment directory** — searchable cards of establishments and services with duration, fee, and waiting count.
- **Unique queue numbers** — per-service prefixes (`REG`, `REC`, `CLM`, `RET`, `CON`) with the next sequence
  derived from the highest existing number (e.g. `REG-016`).
- **Position & ETA** — every waiting ticket shows its live position and estimated minutes based on the
  service's average duration; values recalculate after each **Call next**.
- **Turn-near notices** — in-app notice center receives joined, turn, near, and served alerts; the top two
  waiting customers get a "your turn is near" notice.
- **Personnel controls** — **Call next** moves Waiting → Serving (and completes the previous Serving ticket),
  **Done** marks Served; statuses update instantly across My Queue, Live Board, and Reports.
- **Live-style queue board** — `.wall` columns per service showing the current serving number and waiting tickets;
  re-renders on each action (no WebSocket).
- **Reports** — served today, average wait, `.bar-row` per-service counts, and a full activity table.

## Coverage of the 7 functional requirements

| FR | Requirement | Prototype implementation |
|---|---|---|
| 1 | User registration and login | Session panel on Dashboard/Establishments + **Register** modal + **Logout** |
| 2 | Display available establishments and services | Establishments view with searchable service cards |
| 3 | Generate unique queue numbers | `nextNumber()` prefix + zero-padded sequence on **Join queue** |
| 4 | Display queue positions and estimated waiting times | `position()` / `eta()` on My Queue tickets, ETA chips, and live board |
| 5 | Send notifications to customers | In-app notice center with joined, turn, near, and served notices |
| 6 | Personnel manage and update queues | **Call next** / **Done** on the Live Board; Waiting → Serving → Served |
| 7 | Generate queue activity reports | Reports view with stats, per-service bars, and ticket activity table |

Supporting features: role switcher, stage track, `.wall` live board, toasts, activity feed, demo reset.

## Files

- `index.html` — app shell (loads `../shared.css`, `../shared.js`, then local data/app scripts)
- `data.js` — distinct QueueLess seed data (establishments, services, tickets, notices, activity)
- `app.js` — state, queue logic, rendering, and all interactions
- `README.md` — this file

## Deliberately out of scope

No real-time WebSocket, SMS/email gateway, payment processing, or backend accounts. The live board
updates by re-rendering after each action and all data is local to this browser.
