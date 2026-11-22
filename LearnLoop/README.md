# LearnLoop — Interactive Prototype

A study-time maximizer prototype built on the shared `../shared.js` / `../shared.css` mini-framework. Every feature is judged by one question: does it give the student more time or less stress?

## Features

- **Study time saved** — a prominent hero stat (formatted as `Xh Ym`) increases whenever a nudge, queue join, routed concern, practice attempt, duty, or payment saves effort. Recent savings appear in the activity feed.
- **Material Arrival Nudges** — `syncNudges()` generates arrival, 24-hour reminder, and 48-hour escalation entries from each material's dates using `App.addDays` and `App.daysSince`, with deduplication keys. A pending-items view shows item details, claiming history, and one-tap claiming.
- **Study-Space Readiness** — cleaning schedule plus room cards with cleanliness status, last check, checker, and a recorded check history. Teachers/admins can mark a room clean or needing attention.
- **Time-Saver Queue** — remote join, live-style position, ETA, refreshable ETAs, turn alerts in the nudge center, and staff/teacher call-next.
- **Never-Lose-Progress Practice** — `App.onInput` autosaves every answer with an on-screen confirmation, drafts are recovered when resuming, a countdown runs, **Simulate expiry** auto-submits, and result history includes a `.bar-row` score trend with improvement markers.
- **Stress-Free Balance** — itemized obligations (item, amount, date), partial payments, automatic remaining balance, and a full payment timeline. Students see only their own records.
- **Rapid Help Channel** — concerns are auto-routed by category (Facilities → Maintenance, IT → IT Support, Academics → Adviser, Library → Library Staff). A `.stage-track` shows New → Forwarded → Resolved, and staged notices are sent at each transition.
- **Notification center** — filterable nudges (arrivals, reminders, escalations, turns, help updates) with unread counts, manual regeneration, and mark-all-read.
- **Roles** — Student, Teacher, and Administrator via the top-bar role picker.

## FR coverage

| FR | Requirement | Prototype implementation |
|---|---|---|
| FR-1 | Arrival emails, 24h reminders, 48h escalations | `syncNudges()` derives three notice kinds from `arrived` using `App.addDays` / `App.daysSince` and shows them in the nudge center |
| FR-2 | Item details, pending items, claiming history | Materials view with details modal, history timeline, and pending/claimed/all filters |
| FR-3 | Display classroom cleaning schedules | Space view duty list and room cards |
| FR-4 | Teachers monitor classroom cleanliness | `set-clean` records checker, date, and a check history; `room-checks` shows it |
| FR-5 | Queue position and estimated wait | Ticket panel with position, ETA, progress track, and refresh |
| FR-6 | Notify when turn is near | `refresh-eta` near-turn notices and `call-next` turn notices |
| FR-7 | Auto-save answers and submit expired attempts | `App.onInput` draft saving with visible status, recovered drafts, and `expire-quiz` |
| FR-8 | Results and previous attempt history | Score trend bars and result table with per-attempt improvement |
| FR-9 | Record obligations (item, amount, date) | Balance view itemized table with payment action |
| FR-10 | Auto-compute remaining balance | `amount - paid` recomputed in stat cards and each row |
| FR-11 | Route concerns to the appropriate team | `s.routes` category map applied in `save-concern`, shown as "Auto-routed to …" |
| FR-12 | Notifications for new, forwarded, resolved | Each stage pushes a `help` nudge; `help-detail` shows every staged update |

Supporting requirements demonstrated: role-based access, staged updates through one notification service, responsibility logging for cleanliness checks, and localStorage persistence of all progress.

## How to run

1. From `Project_Proposals/`, run `python3 -m http.server 8000`.
2. Open `http://localhost:8000/Prototypes/LearnLoop/`.
3. Use the role picker to compare student and teacher/admin actions.
4. State persists in `localStorage` under `cp_proto_learnloop`; use **Reset demo data** to restore the seed.

## Verification

```bash
node --check Prototypes/LearnLoop/app.js
node /tmp/opencode/proto_smoke.js Prototypes/LearnLoop
```
