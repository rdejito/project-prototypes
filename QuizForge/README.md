# QuizForge — Interactive Prototype

A clickable, front-end prototype of **QuizForge: A Web-Based Quiz Creation and Assessment Platform** (based on the QuizForge proposal document). It demonstrates the full loop: a creator builds and publishes a quiz, a participant takes it under a timer, and answers are auto-saved, graded, and analyzed.

## How to run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. No installation, build step, server, or internet connection is required.
3. Use the role picker at the top right to switch between **Admin**, **Creator**, and **Participant** views.
4. Changes persist in the browser's `localStorage`; use **Reset demo data** in the sidebar to restore the original seed.

## What to try

| Screen | Interactions |
|---|---|
| **Dashboard** | Role-aware stats, available quizzes, average score ring, recent activity. |
| **Browse quizzes** | Search, filter Public / Authorized private / Taken; see best score; open quiz details; start or retake. Private quizzes are only visible to authorized participants (or creators/admins). |
| **Take quiz** | Countdown timer, question navigation grid, radio options for multiple-choice and true/false, text input for identification. Every answer change writes a draft to state and shows **Draft saved · HH:MM**. `Simulate time expiry` auto-submits the attempt. |
| **Results** | Auto-graded score, pass/fail, expired flag, filters, attempt history, and a per-question review modal. |
| **Creator studio** | Create/edit quizzes (title, description, visibility, duration, passing score, randomization), add questions of all three types, publish, unpublish, and archive. |
| **Analytics** | Overall and per-quiz average score and pass rate using `.analytics-grid` and `.bar-row`. |

## Coverage of the 12 functional requirements

| FR | Requirement (proposal) | Prototype implementation |
|---|---|---|
| 1 | Registration / login / logout | Simulated via the persistent role picker and demo user account. |
| 2 | Role-based access | Admin / Creator / Participant roles gate studio and analytics. |
| 3 | Admin account management | Admin role can access every creator module; demo accounts are seeded. |
| 4 | Create, edit, publish, archive quizzes | Creator studio forms + `set-quiz-status` actions. |
| 5 | Multiple-choice, true/false, identification | All three types are seeded and can be added in the studio. |
| 6 | Points, passing score, duration, randomization | Quiz form fields; randomization shuffles question order per attempt. |
| 7 | Public and private quizzes | Visibility field, badges, browse filters, authorized-list check. |
| 8 | Take, navigate, submit quizzes | Timed take view with question navigation and submit action. |
| 9 | Auto-save answers, submit expired attempts | `App.onInput` → `s.drafts` + `App.save()` + "Draft saved"; expiry simulation button and live timer tick. |
| 10 | Auto-grading across question types | `submitAttempt()` scores MCQ / true-false by index and identification by normalized text. |
| 11 | Results and attempt history | Results view with filters and per-question review modal. |
| 12 | Analytics (average score, pass rate) | Analytics view with overall cards and per-quiz bar rows. |

## Files

- `index.html` — shell referencing `../shared.css`, `../shared.js`, `data.js`, `app.js`.
- `data.js` — seed quizzes (all three question types), attempts, activity.
- `app.js` — views, timer, draft autosave, grading, and all interactions.
- `README.md` — this file.

## Deliberately out of scope

Real authentication, server-side validation, password hashing, LMS integration, and true background timers after the browser tab is closed. The countdown and expiry are simulated client-side for demonstration.
