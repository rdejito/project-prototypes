# DTS Attendance — Functional Browser Prototype

Clickable, **fully working** prototype for the selected proposal, **Dual Training System
Attendance and Compliance System**. Open `index.html` in any modern browser — no build
step, server or account needed. All data persists in `localStorage`; use **Reset demo
data** in the sidebar to restore the seed.

## What "fully functional" means here

- Every button performs a real action with validation and a confirmation where needed.
- Data is not hard-coded: expected dates are **generated** from each student's school day
  and company work days, and regenerate when rules or the period change.
- Records, leave decisions, settings, notices and profiles are full create/read/update/
  void flows with an audit history on every record.
- Role restrictions are enforced in the action handlers, not only hidden in the UI.
- Reports export to CSV; full state can be backed up and restored as JSON.

## Roles

| Role | Access |
|---|---|
| Student (default) | Own attendance, own missing/pending days, own leave, own compliance, notices. Cannot verify, void, decide leave or edit rules. |
| Adviser | All attendance actions (verify, correct, void, mark absent, resolve conflicts), leave decisions, notices, reports, calendar regeneration. |
| Administrator | Everything the Adviser can do, plus student profiles, period/threshold settings and backup/restore. |

Switch roles from the top-right dropdown. **Company Supervisor has no account in Phase 1** —
it is a contact field in the profile, and the adviser/admin act as proxy.

## Screens

| Screen | What it does |
|---|---|
| Overview | Student: compliance ring, next expected days, pending entries, missing days, quick encode. Staff: attention board with days overdue, pending counts, compliance by student, activity feed. |
| Students & Rules | Add, edit and delete students; set school day, company, work days, work hours and requirements. Admin only. |
| Expected Schedule | Generated calendar of school/company dates with status; filters by student and status; regenerate dates; record directly on a missing day. |
| Attendance Records | Record same-day QR or backdated manual entries, correct, verify/unverify, void with reason, view audit history, filter, export CSV. |
| Reconciliation | Compare expected dates with actual sources; confirm late entries, mark absent, resolve duplicate conflicts, bulk-mark overdue days absent. |
| Leave & Exceptions | File, edit and withdraw leave; adviser/admin approves or rejects with a note; approval marks the expected date excused and adjusts the compliance target. |
| Compliance | Verified school days and OJT hours vs each student's own target, excused adjustments, at-risk flag, CSV export. |
| Reports & Notices | Search and filter all records, per-company summary, add/delete notices, mark read, CSV export and print. |
| System Settings | Edit demo date, period and at-risk threshold; export/import a JSON backup. Admin only. |

## Requirement coverage

| Core requirement | Where it appears |
|---|---|
| C-01 Accounts and three active roles | Role dropdown, restricted views and handler-level guards (no real passwords in a static prototype) |
| C-02 Student profile | Students & Rules screen with add/edit/delete |
| C-03 Schedule rules | Generated expected calendar; regenerate action; period settings |
| C-04 Check-in/out, two timestamps, history | Record Attendance modal, attendance list, Record audit trail modal, edit/void flows |
| C-05 Reconciliation and late confirmation | Reconciliation screen; Confirm late, Mark absent, Resolve conflict, bulk absence |
| C-06 Leave with affected date and approval | Leave & Exceptions screen, decision modal, excused-record creation |
| C-07 Compliance math and at-risk flag | Compliance screen, sidebar progress, overview cards, CSV export |
| C-08 Student self-view | Student Overview, student Compliance, hidden staff modules |
| C-09 Role-based dashboards | Staff Overview attention board and compliance-by-student cards |
| C-10 Filtered list, reports and notices | Attendance filters, Reports & Notices screen, notices, exports |

Traceability to the six base proposals is in `MD/AttendanceSystem_Lean_Proposal_Draft.md`
and `PDFs/AttendanceSystem_Requirements_and_Assignment.pdf`.

## Integrity rules demonstrated

- Two timestamps: attendance date vs exact encoding time.
- Backdated/manual entries start **not verified** and do not count until confirmed.
- Duplicate records for one expected date become a **conflict** until resolved.
- Voiding and corrections never delete history.
- Approved leave reduces the target instead of being counted as attendance.
- Changing a rule regenerates the calendar; obsolete records are voided with a history note.

## Phase 2 not implemented

Company Supervisor login, supervisor confirmation of company records, supervisor leave
approval, supervisor dashboard and supervisor notices. The profile field is already
present, so no data-model redesign is needed.
