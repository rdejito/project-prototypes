/* UniServe prototype seed data — one account, six modules, staff + user views. */
const SEED = {
  role: 'customer',
  session: { loggedIn: true, registered: true, name: 'Alex Morgan', email: 'alex.morgan@campus.edu' },

  /* Smart Receiving */
  scanCodes: [
    { code: 'QR-8842-AX', name: 'Wireless barcode scanner', category: 'Equipment', supplier: 'TechSupply Co.', requestor: 'Alex Morgan' },
    { code: 'BC-1097-ZP', name: 'Ergonomic office chair', category: 'Furniture', supplier: 'ErgoWorks', requestor: 'Priya Shah' },
    { code: 'QR-5561-KL', name: 'Projector lamp module', category: 'Electronics', supplier: 'Lumen Depot', requestor: 'Alex Morgan' },
    { code: 'BC-7730-MN', name: 'Safety goggles (box)', category: 'Supplies', supplier: 'SafeGuard Inc.', requestor: 'Diego Reyes' }
  ],
  items: [
    { id: 'it-1', code: 'QR-8842-AX', name: 'Wireless barcode scanner', category: 'Equipment', supplier: 'TechSupply Co.', requestor: 'Alex Morgan', arrival: '2026-11-20', status: 'pending', condition: 'Good', location: 'Cage A-12', claimHistory: [{ by: 'System', date: '2026-11-20', note: 'Arrival recorded from QR scan.' }] },
    { id: 'it-2', code: 'BC-1097-ZP', name: 'Ergonomic office chair', category: 'Furniture', supplier: 'ErgoWorks', requestor: 'Priya Shah', arrival: '2026-11-19', status: 'pending', condition: 'Good', location: 'Cage B-03', claimHistory: [{ by: 'System', date: '2026-11-19', note: 'Arrival recorded from barcode scan.' }] },
    { id: 'it-3', code: 'QR-5561-KL', name: 'Projector lamp module', category: 'Electronics', supplier: 'Lumen Depot', requestor: 'Alex Morgan', arrival: '2026-11-14', status: 'claimed', condition: 'Good', location: 'Cage A-09', claimHistory: [{ by: 'System', date: '2026-11-14', note: 'Arrival recorded from QR scan.' }, { by: 'Alex Morgan', date: '2026-11-15', note: 'Claimed at the receiving cage.' }] },
    { id: 'it-4', code: 'BC-7730-MN', name: 'Safety goggles (box)', category: 'Supplies', supplier: 'SafeGuard Inc.', requestor: 'Diego Reyes', arrival: '2026-11-18', status: 'claimed', condition: 'Sealed', location: 'Cage C-02', claimHistory: [{ by: 'System', date: '2026-11-18', note: 'Arrival recorded from barcode scan.' }, { by: 'Diego Reyes', date: '2026-11-18', note: 'Claimed same day.' }] }
  ],

  /* Customer Ledger */
  customers: [
    { id: 'cu-1', name: 'Alex Morgan', email: 'alex.morgan@campus.edu', phone: '0917-111-2233', balance: 3250, payments: [
      { id: 'pm-1', date: '2026-11-02', amount: 1500, mode: 'Cash', note: 'Partial payment' },
      { id: 'pm-2', date: '2026-10-05', amount: 2000, mode: 'Online', note: 'Full payment for September' }
    ] },
    { id: 'cu-2', name: 'Priya Shah', email: 'priya.shah@campus.edu', phone: '0918-222-4455', balance: 8600, payments: [
      { id: 'pm-3', date: '2026-11-10', amount: 1200, mode: 'Cash', note: 'Partial payment' }
    ] },
    { id: 'cu-3', name: 'Diego Reyes', email: 'diego.reyes@campus.edu', phone: '0919-333-6677', balance: 0, payments: [
      { id: 'pm-4', date: '2026-11-16', amount: 4200, mode: 'Online', note: 'Settled in full' }
    ] }
  ],

  /* Quiz & Analytics */
  quizzes: [
    { id: 'qz-1', title: 'Campus Safety Basics', creator: 'Ms. Rivera', status: 'published', passScore: 70, questions: [
      { q: 'Where should a spill be reported first?', options: ['To the facility desk', 'To a classmate', 'Nowhere'], answer: 0 },
      { q: 'Which extinguisher step comes first?', options: ['Sweep', 'Pull', 'Aim'], answer: 1 }
    ], attempts: [
      { id: 'at-1', participant: 'Alex Morgan', score: 100, date: '2026-11-12', passed: true },
      { id: 'at-2', participant: 'Diego Reyes', score: 50, date: '2026-11-13', passed: false },
      { id: 'at-3', participant: 'Priya Shah', score: 100, date: '2026-11-15', passed: true }
    ] },
    { id: 'qz-2', title: 'Service Desk Etiquette', creator: 'Mr. Santos', status: 'published', passScore: 80, questions: [
      { q: 'What should you bring to the service desk?', options: ['Valid ID', 'Nothing', 'A friend'], answer: 0 }
    ], attempts: [
      { id: 'at-4', participant: 'Alex Morgan', score: 100, date: '2026-11-17', passed: true },
      { id: 'at-5', participant: 'Priya Shah', score: 0, date: '2026-11-18', passed: false }
    ] },
    { id: 'qz-3', title: 'Warehouse Handling 101', creator: 'Ms. Rivera', status: 'draft', passScore: 75, questions: [
      { q: 'How should heavy boxes be lifted?', options: ['With your back', 'With bent knees', 'One-handed'], answer: 1 }
    ], attempts: [] }
  ],

  /* Service Desk */
  establishments: [
    { id: 'es-1', name: 'Campus Service Center', location: 'Building A, Ground Floor', services: [
      { id: 'sv-1', name: 'Student ID Issuance', description: 'New and replacement campus IDs.', duration: 10, fee: 150 },
      { id: 'sv-2', name: 'Records Request', description: 'Certified copies of academic records.', duration: 15, fee: 100 }
    ] },
    { id: 'es-2', name: 'Central Receiving Hub', location: 'Warehouse Annex', services: [
      { id: 'sv-3', name: 'Item Claiming', description: 'Claim arriving items and check cage status.', duration: 8, fee: 0 },
      { id: 'sv-4', name: 'Equipment Return', description: 'Return borrowed equipment and tools.', duration: 12, fee: 0 }
    ] },
    { id: 'es-3', name: 'Health & Wellness Office', location: 'Student Union, 2/F', services: [
      { id: 'sv-5', name: 'Consultation', description: 'Walk-in basic health consultation.', duration: 20, fee: 0 }
    ] }
  ],
  notices: [
    { id: 'nt-1', to: 'Alex Morgan', kind: 'item', text: 'Your item QR-8842-AX has arrived and is pending at the cage.', date: '2026-11-20 09:14', read: false },
    { id: 'nt-2', to: 'all', kind: 'service', text: 'Campus Service Center is open today until 5:00 PM.', date: '2026-11-22 08:00', read: false },
    { id: 'nt-3', to: 'Alex Morgan', kind: 'payment', text: 'A partial payment of ₱1,500.00 was recorded on your ledger.', date: '2026-11-02 14:32', read: true }
  ],

  /* Clean Spaces */
  rooms: [
    { id: 'rm-1', name: 'Room 301', building: 'Building A', cleanliness: 'Good', lastChecked: '2026-11-21' },
    { id: 'rm-2', name: 'CITE Lab 1', building: 'CITE Building', cleanliness: 'Needs attention', lastChecked: '2026-11-18' },
    { id: 'rm-3', name: 'Library Reading Area', building: 'Library', cleanliness: 'Good', lastChecked: '2026-11-20' },
    { id: 'rm-4', name: 'Science Lab 2', building: 'Science Block', cleanliness: 'Poor', lastChecked: '2026-11-15' }
  ],
  tasks: [
    { id: 'tk-1', room: 'Room 301', task: 'Wipe boards and arrange chairs', assignedTo: 'Alex Morgan', date: '2026-11-22', status: 'pending' },
    { id: 'tk-2', room: 'CITE Lab 1', task: 'Clean computer desks', assignedTo: ' caretaker', date: '2026-11-23', status: 'pending' },
    { id: 'tk-3', room: 'Science Lab 2', task: 'Return tools to labeled cabinets', assignedTo: 'Caretaker', date: '2026-11-22', status: 'pending' },
    { id: 'tk-4', room: 'Library Reading Area', task: 'Sweep floor and empty trash', assignedTo: 'Caretaker', date: '2026-11-20', status: 'done', note: 'Completed and checked.' }
  ],

  /* Request Desk */
  requests: [
    { id: 'rq-1', title: 'Projector not turning on', description: 'Room 301 projector shows no display during class.', requestor: 'Alex Morgan', date: '2026-11-20', status: 'open', note: '' },
    { id: 'rq-2', title: 'Broken chair in CITE Lab 1', description: 'One chair has a loose leg.', requestor: 'Priya Shah', date: '2026-11-16', status: 'resolved', note: 'Chair replaced by facilities.', resolvedAt: '2026-11-18' },
    { id: 'rq-3', title: 'Air conditioning too cold', description: 'Library reading area needs temperature adjustment.', requestor: 'Alex Morgan', date: '2026-11-14', status: 'resolved', note: 'Thermostat adjusted by staff.', resolvedAt: '2026-11-15' }
  ],

  activity: [
    { id: 'ac-1', text: 'QR scan recorded arrival: Wireless barcode scanner', module: 'receiving', time: 'Today, 09:14' },
    { id: 'ac-2', text: 'Quiz published: Campus Safety Basics', module: 'quiz', time: 'Nov 12, 2026' },
    { id: 'ac-3', text: 'Request resolved: Broken chair in CITE Lab 1', module: 'requests', time: 'Nov 18, 2026' }
  ]
};
