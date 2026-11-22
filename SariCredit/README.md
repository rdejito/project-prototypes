# SariCredit — Interactive Prototype

A clickable, front-end prototype of **SariCredit: A Digital Utang Ledger for Sari-Sari Stores** (based on `../../MD/SariCredit.md`). It replaces the paper utang notebook with customer profiles, item entries, partial payments, automatic balances, reminders, reports, and local settings.

## How to run

1. Open `index.html` in any modern browser.
2. No installation, build step, server, or internet connection is required.
3. Switch roles with the top-right picker: **Store owner**, **Customer view**, **Admin view**.
4. All changes persist in `localStorage`; **Reset demo data** restores the seed ledger.

## What to try

| Screen | Interactions |
|---|---|
| **Dashboard** | Owner: total outstanding, collection ring, unpaid follow-up list with **Remind**, notice center, activity. Customer: only their own balance and history. Admin: accounts/backup overview and notices. |
| **Customers** | Add, edit, delete profiles; filter All/Unpaid/Paid; per-customer **Record utang**, **Record payment**, **Remind**, and history modal. Customer role sees only their own profile. |
| **Utang entries** | Record an item, amount, and date; view all entries (or only your own as a customer); this-month filter. |
| **Payments** | Record full or partial payments with quick amount chips (full balance, half, ₱100, ₱500); the remaining balance is recomputed immediately. |
| **Reports** | Monthly table of total utang, payments, and net outstanding; role-scoped totals. |
| **Settings** | English / Filipino / Cebuano labels switch instantly; offline indicator toggle; Admin-only account activation and **Backup now** (stamps last backup). |

## Coverage of functional requirements

| FR | Requirement (proposal) | Prototype implementation |
|---|---|---|
| FR-1 | Register / log in | Simulated demo accounts in the role picker and Admin account list. |
| FR-2 | Add, edit, delete customer profiles | Customer view forms + delete confirmation modal. |
| FR-3 | Record utang (item, amount, date) | `Record utang` modal and Utang entries table. |
| FR-4 | Full or partial payments | `Record payment` modal with amount chips; payments stored as ledger entries. |
| FR-5 | Automatic remaining balance | `balance()` recomputes utang minus payments after every change; `App.money` formats all amounts. |
| FR-6 | Customers with unpaid balances | Unpaid filter, dashboard follow-up list, sidebar count. |
| FR-7 | Payment reminders / notices | `Remind` action creates a notice in the dashboard notice center; mark read / mark all read. |
| FR-8 | Customer sees only own data | Customer role scopes dashboard, customers, entries, payments, and reports to one linked profile. |
| FR-9 | Monthly utang/payment report | Reports view groups entries by `YYYY-MM` and totals each month. |
| FR-10 | Admin accounts and backup | Admin settings panel with account status toggle and simulated backup timestamp. |

Non-functional demos: offline toggle shows **Offline — changes will sync**; language selector swaps key labels; all amounts use `App.money`; responsive shared styles work on phones and desktops.

## Files

- `index.html` — shell referencing `../shared.css`, `../shared.js`, `data.js`, `app.js`.
- `data.js` — seed customers, ledger transactions, reminders, accounts, activity.
- `app.js` — balance engine, localized labels, views, and interactions.
- `README.md` — this file.

## Deliberately out of scope

Real SMS delivery, real authentication, actual cloud sync/backup storage, payment gateways, and server-side Data Privacy Act enforcement. Reminders, backups, and offline mode are client-side simulations.
