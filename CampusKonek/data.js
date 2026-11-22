/* CampusKonek prototype seed data — QR-enabled student companion */
const SEED = {
  role: 'student',
  fakeCodes: [
    { code: 'QR-CK-4821', name: 'Data Structures (Textbook)', type: 'Book', location: 'Library Counter', owner: 'Juan Dela Cruz' },
    { code: 'BC-LK-1137', name: 'Circuits Lab Kit', type: 'Lab Kit', location: 'Science Block Storage', owner: 'Juan Dela Cruz' },
    { code: 'QR-CK-9012', name: 'Wireless Projector Remote', type: 'Equipment', location: 'Room 301', owner: 'Maria Santos' },
    { code: 'BC-SP-3304', name: 'Office Supply Pack', type: 'Supplies', location: 'Admin Office', owner: 'Pedro Reyes' },
    { code: 'QR-CK-7750', name: 'Statistics Workbook', type: 'Book', location: 'Library Counter', owner: 'Juan Dela Cruz' }
  ],
  items: [
    { id: 'it-1', code: 'QR-CK-4821', name: 'Data Structures (Textbook)', type: 'Book', location: 'Library Counter', owner: 'Juan Dela Cruz', status: 'ready', recordedAt: '2026-11-18 09:20', claimedAt: null, history: [{ at: '2026-11-18 09:20', actor: 'Library Staff', action: 'Item received and logged' }] },
    { id: 'it-2', code: 'BC-LK-1137', name: 'Circuits Lab Kit', type: 'Lab Kit', location: 'Science Block Storage', owner: 'Juan Dela Cruz', status: 'ready', recordedAt: '2026-11-19 14:05', claimedAt: null, history: [{ at: '2026-11-19 14:05', actor: 'Lab Attendant', action: 'Item received and logged' }] },
    { id: 'it-3', code: 'QR-CK-9012', name: 'Wireless Projector Remote', type: 'Equipment', location: 'Room 301', owner: 'Maria Santos', status: 'claimed', recordedAt: '2026-11-16 08:40', claimedAt: '2026-11-17 10:12', history: [{ at: '2026-11-16 08:40', actor: 'Room Custodian', action: 'Item received and logged' }, { at: '2026-11-17 10:12', actor: 'Maria Santos', action: 'Marked as claimed' }] },
    { id: 'it-4', code: 'BC-SP-3304', name: 'Office Supply Pack', type: 'Supplies', location: 'Admin Office', owner: 'Pedro Reyes', status: 'ready', recordedAt: '2026-11-20 11:30', claimedAt: null, history: [{ at: '2026-11-20 11:30', actor: 'Admin Staff', action: 'Item received and logged' }] },
    { id: 'it-5', code: 'QR-CK-7750', name: 'Statistics Workbook', type: 'Book', location: 'Library Counter', owner: 'Juan Dela Cruz', status: 'claimed', recordedAt: '2026-11-10 13:15', claimedAt: '2026-11-11 09:05', history: [{ at: '2026-11-10 13:15', actor: 'Library Staff', action: 'Item received and logged' }, { at: '2026-11-11 09:05', actor: 'Juan Dela Cruz', action: 'Marked as claimed' }] }
  ],
  duties: [
    { id: 'dt-1', room: 'Room 301', task: 'Wipe boards and arrange chairs', assignedTo: 'Juan Dela Cruz', date: '2026-11-22', status: 'pending', submitted: null, note: '' },
    { id: 'dt-2', room: 'Science Lab 2', task: 'Return tools to labeled cabinets', assignedTo: 'Juan Dela Cruz', date: '2026-11-23', status: 'pending', submitted: null, note: '' },
    { id: 'dt-3', room: 'Library', task: 'Reshelf returned books', assignedTo: 'Juan Dela Cruz', date: '2026-11-20', status: 'done', submitted: '2026-11-20', note: 'Books sorted by call number.' },
    { id: 'dt-4', room: 'CITE Lab 1', task: 'Clean computer desks', assignedTo: 'Maria Santos', date: '2026-11-22', status: 'pending', submitted: null, note: '' }
  ],
  services: [
    { id: 'svc-1', name: 'Registrar', desk: 'Admin Building', avg: 4 },
    { id: 'svc-2', name: 'Library Counter', desk: 'Library', avg: 3 },
    { id: 'svc-3', name: 'Guidance Office', desk: 'Student Center', avg: 6 }
  ],
  tickets: [
    { id: 'tk-1', code: 'A-101', service: 'Registrar', owner: 'Maria Santos', status: 'waiting', joined: '2026-11-22 08:10', eta: 4 },
    { id: 'tk-2', code: 'B-022', service: 'Library Counter', owner: 'Pedro Reyes', status: 'served', joined: '2026-11-22 08:00', eta: 0, calledAt: '2026-11-22 08:25' }
  ],
  quizzes: [
    { id: 'q-1', title: 'Campus Services Basics', minutes: 3, questions: [
      { q: 'Where do you claim a scanned library book?', options: ['Library Counter', 'Canteen', 'Gym', 'Dormitory'], answer: 0 },
      { q: 'What does a green "Claimed" badge mean?', options: ['Item is lost', 'Item was received by the student', 'Item is for sale', 'Item is overdue'], answer: 1 },
      { q: 'How are practice quiz scores computed?', options: ['By the teacher by hand', 'Automatically, right after submission', 'After one week', 'Never'], answer: 1 }
    ] },
    { id: 'q-2', title: 'Safety & Responsibility', minutes: 2, questions: [
      { q: 'What should you do with a damaged lab kit?', options: ['Keep it silently', 'Report it to the lab attendant', 'Throw it away', 'Give it to a friend'], answer: 1 },
      { q: 'When is a cleaning duty credited?', options: ['After completion is submitted', 'Automatically at midnight', 'Only on Fridays', 'Never'], answer: 0 }
    ] }
  ],
  attempts: [
    { id: 'at-1', quizId: 'q-1', quizTitle: 'Campus Services Basics', owner: 'Juan Dela Cruz', score: 2, total: 3, at: '2026-11-18 15:40', mode: 'submitted' }
  ],
  obligations: [
    { id: 'ob-1', item: 'Lab Kit Damage Fee', amount: 350, paid: 100, date: '2026-11-05', owner: 'Juan Dela Cruz', history: [{ at: '2026-11-10 09:30', amount: 100, actor: 'Juan Dela Cruz' }] },
    { id: 'ob-2', item: 'Library Book Replacement', amount: 220, paid: 0, date: '2026-11-14', owner: 'Juan Dela Cruz', history: [] },
    { id: 'ob-3', item: 'ID Card Printing', amount: 60, paid: 60, date: '2026-10-28', owner: 'Juan Dela Cruz', history: [{ at: '2026-10-28 14:10', amount: 60, actor: 'Juan Dela Cruz' }] },
    { id: 'ob-4', item: 'Club Room Deposit', amount: 500, paid: 0, date: '2026-11-12', owner: 'Maria Santos', history: [] }
  ],
  concerns: [
    { id: 'cn-1', title: 'Projector in Room 301 not working', category: 'Facilities', details: 'No display during the morning lecture.', owner: 'Juan Dela Cruz', created: '2026-11-21', status: 'inprogress', assignedTo: 'Maintenance', resolution: '', history: [{ at: '2026-11-21 08:15', actor: 'Juan Dela Cruz', action: 'Concern submitted' }, { at: '2026-11-21 09:02', actor: 'Support Staff', action: 'Started work' }] },
    { id: 'cn-2', title: 'Missing reference book on reserve', category: 'Library', details: 'Title listed online is not on the shelf.', owner: 'Maria Santos', created: '2026-11-20', status: 'open', assignedTo: '', resolution: '', history: [{ at: '2026-11-20 16:30', actor: 'Maria Santos', action: 'Concern submitted' }] },
    { id: 'cn-3', title: 'Broken chair in study area', category: 'Facilities', details: 'Chair near the window is cracked.', owner: 'Juan Dela Cruz', created: '2026-11-15', status: 'resolved', assignedTo: 'Maintenance', resolution: 'Chair replaced on 2026-11-17.', history: [{ at: '2026-11-15 10:00', actor: 'Juan Dela Cruz', action: 'Concern submitted' }, { at: '2026-11-15 11:20', actor: 'Support Staff', action: 'Forwarded to Maintenance' }, { at: '2026-11-17 13:45', actor: 'Support Staff', action: 'Resolved' }] }
  ],
  notices: [
    { id: 'nt-1', kind: 'resolution', text: 'Your concern "Broken chair in study area" was resolved: Chair replaced on 2026-11-17.', owner: 'Juan Dela Cruz', at: '2026-11-17 13:45', read: false, key: 'cn-3-resolved' },
    { id: 'nt-2', kind: 'turn', text: 'Head to the Library Counter — your turn is coming up.', owner: 'Pedro Reyes', at: '2026-11-22 08:20', read: false, key: 'tk-2-near' }
  ],
  activity: [
    { id: 'ac-1', text: 'Item QR-CK-4821 logged at Library Counter', module: 'scan', time: 'Today, 09:20' },
    { id: 'ac-2', text: 'Cleaning duty assigned: Wipe boards and arrange chairs', module: 'duty', time: 'Today, 08:00' },
    { id: 'ac-3', text: 'Practice quiz attempt recorded: 2/3', module: 'quiz', time: 'Nov 18, 2026' }
  ]
};
