# DTS Attendance — Interactive Prototype

Clickable demo for the selected proposal, **Dual Training System Attendance and
Compliance System**. Open `index.html` in any modern browser; no build step or
server is required. State persists in `localStorage`, with a **Reset demo data**
button in the sidebar.

## Roles

| Role | What it demonstrates |
|---|---|
| Student (default) | Records own attendance, views own self-view, files leave, views own compliance. Reconciliation and Reports are hidden. |
| Adviser | Verifies backdated entries, resolves conflicts, marks absences, decides leave, sees the two staff dashboards. |
| Administrator | Same as Adviser plus editing profile/schedule rules. |

Switch roles from the top-right dropdown. **Company Supervisor has no account in
Phase 1** — it is stored as a contact name in the profile and appears in notices.

## Screens

| Screen | What it demonstrates |
|---|---|
| Overview | Student: compliance ring, next expected days, records awaiting verification. Staff: attention board with missing days and days overdue, compliance by student, recent activity. |
| Schedule Rules | Per-student school day and per-company work dates/hours; derived expected dates. Staff can edit the rule; students can record attendance on a missing day. |
| Attendance Records | Check-in/out capture, two timestamps (attended vs encoded), retained audit history, verify/void, backdated "Pending verification". |
| Reconciliation | Expected date vs school/company source; no-record, late, pending and conflict states; confirm late, mark absent, resolve conflict. |
| Leave & Exceptions | Leave names the affected date and source; resolved by adviser/admin; approval marks the expected day excused. |
| Compliance | Required vs completed school days and OJT hours per student, percentage, at-risk flag; only verified records count. |
| Reports & Notices | Searchable attendance report, per-company summary and simple reminder notices. |

## Requirement coverage

| Core requirement | Where it appears |
|---|---|
| C-01 Accounts and three active roles | Role dropdown, role-scoped navigation, adviser/admin-only actions and views |
| C-02 Student profile | Edit Profile & Schedule Rule modal (company and supervisor contact are profile fields) |
| C-03 Schedule rules | Schedule Rules screen and derived expected-date calendar |
| C-04 Check-in/out + two timestamps + history | Attendance Records, Record Attendance modal, Record audit trail modal |
| C-05 Reconciliation and late-entry confirmation | Reconciliation screen; Verify / Mark absent / Resolve conflict actions |
| C-06 Leave with affected date and adviser/admin approval | Leave & Exceptions screen and File leave modal |
| C-07 Compliance math and at-risk flag | Compliance screen, sidebar progress, overview cards |
| C-08 Student self-view | Student Overview, student Compliance, hidden staff modules |
| C-09 Role-based dashboards | Staff Overview attention board, adviser/admin-only views |
| C-10 Filtered list, report and notices | Attendance filters, Reports & Notices screen, grace-period notices |

Traceability back to the six base proposals is documented in
`MD/AttendanceSystem_Lean_Proposal_Draft.md` and
`PDFs/AttendanceSystem_Requirements_and_Assignment.pdf`.

## Phase 2 not implemented

Company Supervisor login, supervisor confirmation of company records, supervisor
leave approval, supervisor dashboard view and supervisor notices. The profile
field is already present so no data-model redesign is needed.
