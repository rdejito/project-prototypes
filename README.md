# Project Proposals — Prototype Set

Clickable, front-end prototypes for every proposal. Start at `index.html`
in this folder (the hub), or open any prototype's `index.html` directly.
The original proposal documents live in the parent workspace and are not part
of this repository.

No installation, build step, server, or internet connection is required. Each
prototype persists its state in the browser's `localStorage`; use **Reset demo data**
in the sidebar to restore the seed data.

## Prototypes

| Prototype | Folder | Concept |
|---|---|---|
| ClearPass | `ClearPass_Prototype/` | One self-service checklist across six status modules |
| CampusKonek | `CampusKonek/` | QR scan, live queue/ETA, help wall, instant grading, notifications |
| ScholarGuard | `ScholarGuard/` | Timestamped, access-controlled proof and audit records |
| LearnLoop | `LearnLoop/` | Nudges, routing, autosave, and staged notifications that protect study time |
| UniServe | `UniServe/` | One role-based platform for staff tools and user self-service (15 FRs) |
| Central Receiving Hub | `CentralReceivingHub/` | Scan, reminders, claiming, and monitored item records |
| CleanClass | `CleanClass/` | Cleaning schedules, submissions, and cleanliness monitoring |
| QueueLess | `QueueLess/` | Virtual queues with unique numbers, positions, ETAs, and reports |
| QuizForge | `QuizForge/` | Quiz creation, timed attempts, auto-grading, and analytics |
| SariCredit | `SariCredit/` | Utang ledger, partial payments, balances, and reports |
| PULSE | `Pulse/` | Urgent request wall, routing, aging, forwarding, and audit trail |

## Shared framework

Newer prototypes share two files:

- `shared.css` — the design system and responsive layout (copied from the original
  standalone ClearPass prototype, with extra wall/scan/analytics components).
- `shared.js` — a small vanilla-JS framework exposing the global `App` object:

```js
App.init(config)        // config: slug, title, nav[], views{}, roles, seed, ...
App.go(viewId)          // render a registered view
App.refresh()           // re-render the current view after a state change
App.state               // persistent state object (mutate it, then App.save())
App.save()              // write to localStorage
App.on(action, fn)      // delegated [data-action] click handler
App.onSubmit(id, fn)    // delegated <form id="..."> submit handler
App.onInput(id, fn)     // delegated input handler
App.modal(title, sub, body, footer, wide)
App.toast(message, type)
App.setCounts({navId: number})
App.setProgress(percent, label)
App.can('admin staff')  // true when the active role is in the list
App.allowedFor(viewId)  // true when the active role may open the view
App.gate('admin', html) // returns html only for the listed roles
```

Helpers: `App.icon`, `App.esc`, `App.money`, `App.uid`, `App.today`, `App.stamp`,
`App.addDays`, `App.daysSince`, `App.ageChip`, `App.badge`, `App.tabs`, `App.card`,
`App.empty`, `App.notice`, `App.activity`.

### Role-based feature flags

The role picker in the top bar is a feature flag: selecting a role hides the
modules and controls that role would not have, so each view behaves like a real
user session. Configure it per prototype in `App.init({...})`:

```js
viewAccess: { studio: ['creator', 'admin'], analytics: ['creator', 'admin'] }
```

Views not listed in `viewAccess` are available to every role (their contents are
still scoped by the prototype's own logic). Individual controls can be flagged
with `data-roles="admin staff"` in rendered markup. If the active role loses
access to the current view, the app returns to the first allowed view.
Examples: QuizForge hides Creator studio/Analytics from participants; Central
Receiving Hub hides Scan from requestors and Monitor from non-supervisors.

Each prototype adds only three files of its own: `index.html` (shell references),
`data.js` (seed data), and `app.js` (views + interactions), plus a `README.md`
documenting requirement coverage. ClearPass is the original standalone prototype
and keeps its own copies of the CSS/JS so it can be opened independently.

## Smoke tests

A small Node DOM-stub harness is available at `/tmp/opencode/proto_smoke.js`:

```bash
node /tmp/opencode/proto_smoke.js Prototypes/CleanClass
```

It loads `shared.js`, `data.js`, and `app.js`, renders every registered view,
switches roles, and exercises the discovered actions. (A real browser is still
recommended for visual checks.)
