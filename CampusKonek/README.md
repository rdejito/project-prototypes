# CampusKonek — Interactive Prototype

A student companion prototype built on the shared `../shared.js` / `../shared.css` mini-framework. Six modules in one dashboard: QR scanning and claiming, classroom duty, campus queue, practice quiz, student ledger, and a live help wall.

## Features

- **Scan & Claim** — a `.scan-frame` with a **Simulate scan** button loads a fake QR/barcode code into an item entry form. Staff/MH can review, edit, and save the item record; students can claim an item in one step, which immediately changes the status, appends claim history, and raises a notice.
- **Classroom Duty** — filterable cleaning schedule (mine / pending / completed / all), one-tap completion submission with a note, and staff assignment of new duties.
- **Campus Queue** — join any service remotely, see a live-style ticket with position, ETA, and progress bar, refresh ETAs, leave a queue, and let staff call the next ticket. Turn alerts land in the notification center.
- **Practice Quiz** — timed quizzes with a visible countdown, instant auto-grading, a **Simulate expiry** button for auto-submission, attempt history, and an improvement indicator compared with the previous attempt.
- **Student Ledger** — itemized obligations, automatic balance computation from payments, partial payments, and strict student-only access to personal balances/history (staff can review authorized records).
- **Help Wall** — a four-column `.wall` (Open / In Progress / Forwarded / Resolved). Students file concerns; staff start, forward, and resolve them. Every change adds history and resolution notices go to the notification center.
- **Notification center** — filterable notice list (all / turn / resolution / info) with unread counts and mark-all-read, available on the dashboard, queue, and wall.
- **Roles** — Student, Staff / MH, and Administrator via the top-bar role picker. Role switching is persisted in browser storage.

## FR coverage

| FR | Requirement | Prototype implementation |
|---|---|---|
| FR-1 | Scan barcodes or QR codes and auto-populate the item entry form | `Simulate scan` loads a fake code into `#scan-form` with prefilled name, type, location, and owner |
| FR-2 | Mark an item as claimed and auto-update status | `claim-item` / `claim-draft` set status to `claimed`, stamp the time, append history, and re-render |
| FR-3 | Display each student's cleaning schedule | Duty view, "My schedule" filter, and dashboard duty list |
| FR-4 | Submit cleaning task completion | `submit-duty` → `confirm-duty` sets status `done`, records date and note |
| FR-5 | Display queue position and estimated waiting time | Queue ticket panel with position, ETA, mini progress track, and refresh action |
| FR-6 | Notify students when their turn is near | `refresh-eta` near-turn notices and `call-next` turn notices in the notification center |
| FR-7 | Automatically grade and calculate scores immediately | `gradeQuiz()` computes the score on submit or simulated timeout; result toast shown instantly |
| FR-8 | View quiz results and attempt history | Attempt table with score, mode, and improvement vs. previous attempt |
| FR-9 | Automatically compute remaining balance | `amount - paid` computed in ledger stat cards and every row |
| FR-10 | View only own balance and history | Students get a filtered ledger and an access-control notice; staff/admin see authorized records |
| FR-11 | Display concerns on a Help Wall in real time | `.wall` Kanban with Open / In Progress / Forwarded / Resolved columns that update on status changes |
| FR-12 | Notify requestors when concerns are resolved | `confirm-resolve` pushes a `resolution` notice to the owner's notification center |

Supporting requirements demonstrated: role-based access, staff review/edit/save of scanned items, concern creation with category and details, status routing, resolution details, one notification service, and retained concern history.

## How to run

1. From `Project_Proposals/`, run a local static server, e.g. `python3 -m http.server 8000`.
2. Open `http://localhost:8000/Prototypes/CampusKonek/` in a browser. (Opening `index.html` directly also works in most browsers.)
3. Use the role picker in the top bar to switch between Student, Staff / MH, and Administrator.
4. State is stored in `localStorage` under `cp_proto_campuskonek`; use **Reset demo data** in the sidebar to restore the seed.

## Verification

```bash
node --check Prototypes/CampusKonek/app.js
node /tmp/opencode/proto_smoke.js Prototypes/CampusKonek
```
