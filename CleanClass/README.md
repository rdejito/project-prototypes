# CleanClass — Interactive Prototype

Classroom cleanliness monitoring for CITE. Open `index.html` in any modern browser;
no build step or server is required. State persists in `localStorage`, with a
**Reset demo data** button in the sidebar.

## Roles

- **Student** — views their cleaning schedule and submits task completion with a note.
- **Teacher** — assigns tasks, marks rooms clean / needing attention, and records completions.
- **Admin** — all teacher actions plus adding new classrooms.

Switch roles from the top-right dropdown.

## Screens

| Screen | What it demonstrates |
|---|---|
| Overview | Classroom/pending-task stats, today's duties, room status, activity feed |
| Cleaning Schedule | Published tasks, filtered by mine / pending / completed / all |
| Tasks & Submissions | Pending vs completed records with submission dates and notes |
| Classrooms | Cleanliness status per room; teacher can update checks; admin can add rooms |
| Records | Full task history table |

## Requirement coverage

| Proposal requirement | Prototype implementation |
|---|---|
| Login / role-based access | Role switcher (student / teacher / admin) |
| Display classroom cleaning schedules | Cleaning Schedule view |
| Teachers assign cleaning tasks | Assign task modal (teacher/admin) |
| Students submit cleaning task completion | Submit completion modal with note |
| Teachers monitor classroom cleanliness | Classrooms view with status updates |
| Record completed and pending tasks | Tasks & Submissions + Records views |
| Admin manages classrooms / schedules | Add classroom + assign task actions |

## Files

`index.html` (shell), `data.js` (seed), `app.js` (views and interactions).
Uses `../shared.css` and `../shared.js` from the prototype set.
