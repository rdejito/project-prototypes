/* SariCredit prototype seed data */
const SEED = {
  role: 'owner',
  lang: 'en',
  offline: false,
  lastBackup: null,
  customers: [
    { id: 'cu-1', name: 'Nora Reyes', phone: '0917-123-4567', address: 'Purok 2', joined: '2026-09-01' },
    { id: 'cu-2', name: 'Pedro Santos', phone: '0918-555-0123', address: 'Purok 5', joined: '2026-08-14' },
    { id: 'cu-3', name: 'Lita Gomez', phone: '0999-888-2210', address: 'Purok 1', joined: '2026-10-02' },
    { id: 'cu-4', name: 'Benito Cruz', phone: '0915-222-7788', address: 'Purok 3', joined: '2026-07-20' }
  ],
  transactions: [
    { id: 'tx-1', customerId: 'cu-1', type: 'utang', item: 'Rice 3kg', amount: 180, date: '2026-10-04', note: '' },
    { id: 'tx-2', customerId: 'cu-1', type: 'utang', item: 'Cooking oil', amount: 90, date: '2026-10-12', note: '' },
    { id: 'tx-3', customerId: 'cu-1', type: 'payment', item: 'Partial payment', amount: 150, date: '2026-10-20', note: 'Cash' },
    { id: 'tx-4', customerId: 'cu-2', type: 'utang', item: 'Detergent', amount: 120, date: '2026-11-02', note: '' },
    { id: 'tx-5', customerId: 'cu-2', type: 'utang', item: 'Coffee 1kg', amount: 60, date: '2026-11-05', note: '' },
    { id: 'tx-6', customerId: 'cu-3', type: 'utang', item: 'Soap bars', amount: 75, date: '2026-10-28', note: '' },
    { id: 'tx-7', customerId: 'cu-3', type: 'payment', item: 'Full payment', amount: 75, date: '2026-11-01', note: 'GCash' },
    { id: 'tx-8', customerId: 'cu-1', type: 'utang', item: 'Snacks and soda', amount: 45, date: '2026-11-15', note: '' },
    { id: 'tx-9', customerId: 'cu-4', type: 'utang', item: 'Rice 5kg', amount: 300, date: '2026-11-18', note: '' },
    { id: 'tx-10', customerId: 'cu-4', type: 'payment', item: 'Partial payment', amount: 200, date: '2026-11-20', note: 'Cash' }
  ],
  reminders: [
    { id: 'rm-1', customerId: 'cu-1', text: 'Reminder sent to Nora Reyes for ₱165.00 balance', date: '2026-11-20 09:15', read: false },
    { id: 'rm-2', customerId: 'cu-4', text: 'Reminder sent to Benito Cruz for ₱100.00 balance', date: '2026-11-18 16:40', read: true }
  ],
  accounts: [
    { id: 'us-1', name: 'Aling Nena', username: 'owner', role: 'owner', status: 'active' },
    { id: 'us-2', name: 'Nora Reyes', username: 'nora', role: 'customer', status: 'active' },
    { id: 'us-3', name: 'Admin User', username: 'admin', role: 'admin', status: 'active' }
  ],
  activity: [
    { id: 'ac-1', text: 'Payment recorded: ₱200.00 from Benito Cruz', module: 'payments', time: 'Nov 20, 2026' },
    { id: 'ac-2', text: 'Reminder sent to Nora Reyes', module: 'reminders', time: 'Nov 20, 2026' },
    { id: 'ac-3', text: 'Utang recorded: Rice 5kg — ₱300.00', module: 'transactions', time: 'Nov 18, 2026' }
  ]
};
