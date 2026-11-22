# ScholarGuard — Interactive Prototype

A trust-and-proof prototype built on the shared `../shared.js` / `../shared.css` mini-framework. Every student action leaves a timestamped, attributed, access-controlled record with visible history.

## Features

- **Verified Claim Log** — each item has an append-only history. Claiming stamps the time, records the actor, and never rewrites earlier entries. Students see only their own claims; staff and auditors see authorized records.
- **Duty Proof Board** — students submit their own completion evidence with an attributed timestamp; staff verification is a separate logged action. Each duty shows its full proof timeline and age chip.
- **Fair Tokens** — unique token generation (collision-checked codes), a call-next action, cancellation, and a queue activity report listing every token with time, service, owner, and status. Each token has its own event history.
- **Tamper-Resistant Quiz Record** — answers autosave on every radio change through `App.onInput` with a visible "Draft autosaved at" indicator, drafts are recovered when a quiz is resumed, a countdown runs during the attempt, and **Simulate expired attempt** auto-submits saved answers. Grading is a deterministic rule set; a grading-proof modal shows every answer against the key.
- **Transparent Obligation Ledger** — partial payments are credited immediately, appended to a timestamped payment history, and the remaining balance is recomputed. Students see only their own ledger.
- **Escalation & Resolution Audit** — concerns show aging with `App.ageChip`, and every status change (file, forward, resolve) writes an audit entry with actor, timestamp, action, and detail. The audit register and per-concern audit trail make every change reviewable.
- **Proof analytics** — the trust dashboard counts proof events per module using `.analytics-grid` / `.bar-row`, plus a notification center with audit and resolution notices.
- **Roles** — Student, Service Staff, Administrator, and read-only Auditor.

## FR coverage

| FR | Requirement | Prototype implementation |
|---|---|---|
| FR-1 | Mark item claimed and auto-update status | `claim-item` stamps `claimedAt`, appends a claim event, and refreshes the log |
| FR-2 | Maintain item records and claiming history with access control | `scope()` filters claims to the student's own records; `claim-proof` modal renders full history |
| FR-3 | Record completed and pending cleaning tasks | Duty board shows pending / submitted / verified states with histories |
| FR-4 | Student submits cleaning completion | `submit-duty` → `confirm-duty` writes evidence, actor, and timestamp |
| FR-5 | Generate unique queue numbers | `take-token` creates a collision-checked `TK-####` code with an issue event |
| FR-6 | Generate queue activity reports | Token view table with issued time, service, owner, status, called time, plus per-service bar rows |
| FR-7 | Auto-save answers and submit expired attempts | `App.onInput` draft autosave, recovered drafts, and `expire-quiz` auto-submission |
| FR-8 | Auto-grade consistently | `gradeQuiz()` is pure and deterministic; `attempt-proof` shows answer-by-answer grading |
| FR-9 | Record full or partial payments | `confirm-payment` credits any positive amount and appends a payment proof entry |
| FR-10 | View own balance and history only | Ledger is scoped to the student with an access-control notice; `payment-proof` shows history |
| FR-11 | Calculate and display request aging | `App.ageChip(c.created)` on every concern and an "Aging > 3 days" stat |
| FR-12 | Maintain request history and audit records | `auditLine()` logs every status change with actor + timestamp; `audit-trail` and the audit register display all entries |

Supporting requirements demonstrated: role-based access including read-only auditor, attributed verifications, immutable-style histories, and a shared notification stream.

## How to run

1. From `Project_Proposals/`, run `python3 -m http.server 8000`.
2. Open `http://localhost:8000/Prototypes/ScholarGuard/`.
3. Switch roles in the top bar to compare the student, staff, admin, and auditor views.
4. State persists in `localStorage` under `cp_proto_scholarguard`; use **Reset demo data** to restore the seed.

## Verification

```bash
node --check Prototypes/ScholarGuard/app.js
node /tmp/opencode/proto_smoke.js Prototypes/ScholarGuard
```
