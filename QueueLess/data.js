/* QueueLess prototype seed data — establishments, services, tickets, notices. */
const SEED = {
  role: 'customer',
  session: { loggedIn: true, registered: true, name: 'Alex Morgan', email: 'alex@example.com' },
  establishments: [
    { id: 'es-1', name: 'Campus Service Center', location: 'Building A, Ground Floor', services: [
      { id: 'sv-1', name: 'Student ID Issuance', prefix: 'REG', duration: 8, fee: 150, description: 'New or replacement campus IDs.' },
      { id: 'sv-2', name: 'Records Request', prefix: 'REC', duration: 12, fee: 100, description: 'Certified copies of academic records.' }
    ] },
    { id: 'es-2', name: 'Central Receiving Hub', location: 'Warehouse Annex', services: [
      { id: 'sv-3', name: 'Item Claiming', prefix: 'CLM', duration: 6, fee: 0, description: 'Claim arriving items at the cage.' },
      { id: 'sv-4', name: 'Equipment Return', prefix: 'RET', duration: 10, fee: 0, description: 'Return borrowed tools and equipment.' }
    ] },
    { id: 'es-3', name: 'Health & Wellness Office', location: 'Student Union, 2/F', services: [
      { id: 'sv-5', name: 'Consultation', prefix: 'CON', duration: 15, fee: 0, description: 'Walk-in basic health consultation.' }
    ] }
  ],
  tickets: [
    { id: 'tk-1', number: 'REG-013', serviceId: 'sv-1', name: 'Priya Shah', status: 'serving', createdAt: '2026-11-22 09:05', calledAt: '2026-11-22 09:18', servedAt: '' },
    { id: 'tk-2', number: 'REG-014', serviceId: 'sv-1', name: 'Alex Morgan', status: 'waiting', createdAt: '2026-11-22 09:12', calledAt: '', servedAt: '' },
    { id: 'tk-3', number: 'REG-015', serviceId: 'sv-1', name: 'Diego Reyes', status: 'waiting', createdAt: '2026-11-22 09:20', calledAt: '', servedAt: '' },
    { id: 'tk-4', number: 'REG-012', serviceId: 'sv-1', name: 'Maya Cruz', status: 'served', createdAt: '2026-11-22 08:40', calledAt: '2026-11-22 08:55', servedAt: '2026-11-22 09:04' },
    { id: 'tk-5', number: 'REC-005', serviceId: 'sv-2', name: 'Jordan Lee', status: 'served', createdAt: '2026-11-22 08:30', calledAt: '2026-11-22 08:44', servedAt: '2026-11-22 08:56' },
    { id: 'tk-6', number: 'REC-006', serviceId: 'sv-2', name: 'Alex Morgan', status: 'waiting', createdAt: '2026-11-22 09:01', calledAt: '', servedAt: '' },
    { id: 'tk-7', number: 'CLM-008', serviceId: 'sv-3', name: 'Priya Shah', status: 'served', createdAt: '2026-11-22 08:50', calledAt: '2026-11-22 08:56', servedAt: '2026-11-22 09:02' },
    { id: 'tk-8', number: 'CLM-009', serviceId: 'sv-3', name: 'Diego Reyes', status: 'waiting', createdAt: '2026-11-22 09:15', calledAt: '', servedAt: '' }
  ],
  notices: [
    { id: 'nt-1', to: 'Alex Morgan', kind: 'joined', text: 'You joined Student ID Issuance. Your number is REG-014.', time: 'Today, 09:12', read: false },
    { id: 'nt-2', to: 'all', kind: 'info', text: 'All service counters are open today until 5:00 PM.', time: 'Today, 08:00', read: false },
    { id: 'nt-3', to: 'Alex Morgan', kind: 'near', text: 'You are 2nd in line for Student ID Issuance — please proceed to the counter.', time: 'Today, 09:18', read: true }
  ],
  activity: [
    { id: 'ac-1', text: 'REG-013 called to counter 1', module: 'live', time: 'Today, 09:18' },
    { id: 'ac-2', text: 'REG-014 joined Student ID Issuance', module: 'tickets', time: 'Today, 09:12' },
    { id: 'ac-3', text: 'CLM-008 served at Item Claiming', module: 'live', time: 'Today, 09:02' }
  ]
};
