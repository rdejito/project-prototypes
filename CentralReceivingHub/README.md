# Central Receiving Hub — Interactive Prototype

A clickable front-end prototype of **Central Receiving Hub: An Automated Item Receiving, Monitoring,
and Claiming System** (based on `../../MD/CentralReceivingHub.md`). It simulates the End User Cage workflow:
scan an arrival, review the record, notify automatically, monitor aging, and claim.

## How to run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. No installation, build step, server, or internet connection is required.
3. Switch roles with the top-right dropdown: **Material Handler**, **Requestor**, **Supervisor / Manager**,
   **System Administrator**.
4. All changes are saved to `localStorage`; **Reset demo data** in the sidebar restores the seed.

## Distinct features

- **Scan simulation** — `.scan-frame` reader with a fake scanned-code picker; the selected payload
  auto-populates a fully editable item entry form (code, serial, name, category, supplier, department,
  requestor, cage location, condition, arrival date).
- **MH review & save** — scanned and existing records can be reviewed, edited, and saved with a timestamped history.
- **Automated notices** — arrival notices are created on save; **24-hour reminders** and **48-hour escalations**
  are generated from each item's arrival date with `App.addDays` / `App.daysSince`; claim notices go to the MH.
- **Requestor self-service** — own item details, pending items, and claiming history; **Mark claimed**
  updates the status instantly and notifies the MH.
- **Monitoring & escalations** — MH/supervisor filter authorized records (All / Pending / Claimed), see aging
  chips and a supervisor-only escalation list; an access-control notice explains hidden records.
- **History** — full claiming history table plus timeline details per item.

## Coverage of the 8 functional requirements

| ID | Requirement | Prototype implementation |
|---|---|---|
| 01 | Scan barcodes or QR codes; auto-populate the item entry form | **Scan** view: fake code picker → **Simulate scan** → prefilled `.scan-frame` form |
| 02 | MH reviews, edits, and saves item information | **Edit** on item rows and monitored records → review modal → **Save item** |
| 03 | Automatic arrival email, 24-hour reminder, 48-hour escalation | `ensureNotices()` derives notices from arrival dates; notification center shows kind and date |
| 04 | Requestors access item details, pending items, claiming history | Requestor role in **Items** and **History** with **Details** timeline |
| 05 | Requestors mark items claimed; status updates automatically | **Mark claimed** action updates status and adds a claim-history event |
| 06 | Notify MH when an item is claimed | Claim action creates a `claim` notice addressed to `mh` |
| 07 | MH and supervisors monitor authorized item records | **Monitor** view with filters, aging chips, and supervisor escalation list |
| 08 | Maintain records / claiming history; prevent unauthorized access | Role-scoped item lists, guarded **Details** modal, timestamped claim history |

Supporting features: role switcher, in-app notice center, age chips, stage track, activity feed, demo reset.

## Files

- `index.html` — app shell (loads `../shared.css`, `../shared.js`, then local data/app scripts)
- `data.js` — distinct CRH seed data (scan codes, items, notices, activity)
- `app.js` — state, notice generation, rendering, and all interactions
- `README.md` — this file

## Deliberately out of scope

No real camera/QR hardware, SMTP email scheduler, user-management backend, or database. Notices and
status changes are simulated in-app and persist only in this browser.
