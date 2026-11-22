/* ScholarGuard prototype seed data — trust, proof, and audit records */
const SEED = {
  role: 'student',
  claims: [
    { id: 'cl-1', code: 'CRH-8842', item: 'Microscope Kit A', owner: 'Ana Reyes', location: 'Science Lab 2', status: 'ready', recordedAt: '2026-11-18 09:15', claimedAt: null, history: [{ at: '2026-11-18 09:15', actor: 'Lab Custodian', action: 'Item registered', detail: 'Kit A logged with barcode CRH-8842.' }] },
    { id: 'cl-2', code: 'CRH-7719', item: 'Auditing Reference Book', owner: 'Ana Reyes', location: 'Library Reserve', status: 'claimed', recordedAt: '2026-11-12 10:40', claimedAt: '2026-11-13 14:22', history: [{ at: '2026-11-12 10:40', actor: 'Library Staff', action: 'Item registered', detail: 'Reserve copy logged.' }, { at: '2026-11-13 14:22', actor: 'Ana Reyes', action: 'Claim recorded', detail: 'Status changed from ready to claimed.' }] },
    { id: 'cl-3', code: 'CRH-6203', item: 'Projector Cart', owner: 'Bea Lim', location: 'Room 204', status: 'ready', recordedAt: '2026-11-19 08:05', claimedAt: null, history: [{ at: '2026-11-19 08:05', actor: 'Room Custodian', action: 'Item registered', detail: 'Cart logged for Room 204.' }] },
    { id: 'cl-4', code: 'CRH-5501', item: 'Accounting Calculator', owner: 'Ana Reyes', location: 'Admin Office', status: 'claimed', recordedAt: '2026-11-05 11:00', claimedAt: '2026-11-06 09:30', history: [{ at: '2026-11-05 11:00', actor: 'Admin Staff', action: 'Item registered', detail: '' }, { at: '2026-11-06 09:30', actor: 'Ana Reyes', action: 'Claim recorded', detail: 'Calculator received.' }] }
  ],
  duties: [
    { id: 'du-1', task: 'Sweep and mop Room 204', room: 'Room 204', assignedTo: 'Ana Reyes', date: '2026-11-20', status: 'submitted', evidence: 'Floor mopped after class; boards wiped.', submittedAt: '2026-11-20 16:40', verifiedAt: null, verifiedBy: '', history: [{ at: '2026-11-20 16:40', actor: 'Ana Reyes', action: 'Completion proof submitted', detail: 'Floor mopped after class; boards wiped.' }] },
    { id: 'du-2', task: 'Arrange chairs in Room 201', room: 'Room 201', assignedTo: 'Ana Reyes', date: '2026-11-22', status: 'pending', evidence: '', submittedAt: null, verifiedAt: null, verifiedBy: '', history: [{ at: '2026-11-18 08:00', actor: 'Admin Staff', action: 'Duty assigned', detail: 'Scheduled for Room 201.' }] },
    { id: 'du-3', task: 'Clean CITE Lab desks', room: 'CITE Lab 1', assignedTo: 'Bea Lim', date: '2026-11-21', status: 'verified', evidence: 'Desks wiped and monitors aligned.', submittedAt: '2026-11-21 15:10', verifiedAt: '2026-11-21 16:05', verifiedBy: 'Staff Supervisor', history: [{ at: '2026-11-21 15:10', actor: 'Bea Lim', action: 'Completion proof submitted', detail: 'Desks wiped and monitors aligned.' }, { at: '2026-11-21 16:05', actor: 'Staff Supervisor', action: 'Proof verified', detail: 'Checked room after submission.' }] }
  ],
  tokens: [
    { id: 'tk-1', code: 'TK-0041', service: 'Registrar', owner: 'Bea Lim', issuedAt: '2026-11-22 08:00', status: 'waiting', calledAt: null, history: [{ at: '2026-11-22 08:00', actor: 'Token Kiosk', action: 'Unique token issued', detail: 'Registrar queue.' }] },
    { id: 'tk-2', code: 'TK-0040', service: 'Registrar', owner: 'Ana Reyes', issuedAt: '2026-11-21 09:10', status: 'served', calledAt: '2026-11-21 09:35', history: [{ at: '2026-11-21 09:10', actor: 'Token Kiosk', action: 'Unique token issued', detail: 'Registrar queue.' }, { at: '2026-11-21 09:35', actor: 'Staff Desk', action: 'Token called', detail: 'Served at counter.' }] },
    { id: 'tk-3', code: 'TK-0039', service: 'Library Counter', owner: 'Ana Reyes', issuedAt: '2026-11-20 13:22', status: 'served', calledAt: '2026-11-20 13:40', history: [{ at: '2026-11-20 13:22', actor: 'Token Kiosk', action: 'Unique token issued', detail: 'Library queue.' }, { at: '2026-11-20 13:40', actor: 'Staff Desk', action: 'Token called', detail: 'Served at counter.' }] }
  ],
  services: ['Registrar', 'Library Counter', 'Guidance Office'],
  quizzes: [
    { id: 'q-1', title: 'Audit Evidence Basics', minutes: 3, questions: [
      { q: 'What makes a record attributable?', options: ['Anonymous entry', 'Actor name and timestamp', 'A verbal promise', 'No details'], answer: 1 },
      { q: 'Why keep partial payment history?', options: ['To confuse the student', 'To give full credit for each payment', 'To hide the balance', 'To avoid records'], answer: 1 },
      { q: 'A claim record should be...', options: ['Editable by anyone', 'Silently deleted', 'Timestamped and retained', 'Ignored'], answer: 2 }
    ] },
    { id: 'q-2', title: 'Fair Queue Rules', minutes: 2, questions: [
      { q: 'What guarantees queue fairness?', options: ['A unique traceable token', 'Whoever shouts loudest', 'Staff memory', 'Random calling'], answer: 0 },
      { q: 'What happens to an expired quiz attempt?', options: ['Answers are erased', 'Answers auto-submit and are graded', 'Score is invented', 'Nothing is saved'], answer: 1 }
    ] }
  ],
  drafts: {},
  attempts: [
    { id: 'at-1', quizId: 'q-1', quizTitle: 'Audit Evidence Basics', owner: 'Ana Reyes', score: 2, total: 3, at: '2026-11-19 15:20', mode: 'submitted', answers: ['1', '1', '0'], draftAt: '2026-11-19 15:19' }
  ],
  obligations: [
    { id: 'ob-1', item: 'Microscope damage fee', amount: 400, paid: 150, date: '2026-11-02', owner: 'Ana Reyes', history: [{ at: '2026-11-05 10:00', amount: 150, actor: 'Ana Reyes' }] },
    { id: 'ob-2', item: 'Library book replacement', amount: 250, paid: 0, date: '2026-11-12', owner: 'Ana Reyes', history: [] },
    { id: 'ob-3', item: 'ID card reprint', amount: 80, paid: 80, date: '2026-10-25', owner: 'Ana Reyes', history: [{ at: '2026-10-26 09:15', amount: 80, actor: 'Ana Reyes' }] },
    { id: 'ob-4', item: 'Club room deposit', amount: 500, paid: 200, date: '2026-11-08', owner: 'Bea Lim', history: [{ at: '2026-11-09 11:00', amount: 200, actor: 'Bea Lim' }] }
  ],
  concerns: [
    { id: 'cs-1', title: 'Midterm grade not reflected', category: 'Academics', details: 'Grade still shows incomplete in the portal.', owner: 'Ana Reyes', created: '2026-11-18', status: 'forwarded', assignedTo: 'Adviser', resolution: '', audit: [
      { at: '2026-11-18 08:30', actor: 'Ana Reyes', action: 'Concern filed', detail: 'Submitted through the help channel.' },
      { at: '2026-11-18 09:15', actor: 'Staff Supervisor', action: 'Status changed to forwarded', detail: 'Routed to Adviser for review.' }
    ] },
    { id: 'cs-2', title: 'Broken faucet in restroom', category: 'Facilities', details: 'Water leaks continuously near the sink.', owner: 'Bea Lim', created: '2026-11-14', status: 'new', assignedTo: '', resolution: '', audit: [
      { at: '2026-11-14 13:05', actor: 'Bea Lim', action: 'Concern filed', detail: 'Facilities concern.' }
    ] },
    { id: 'cs-3', title: 'Library Wi-Fi signal weak', category: 'IT', details: 'Connection drops in the second floor reading area.', owner: 'Ana Reyes', created: '2026-11-06', status: 'resolved', assignedTo: 'IT Support', resolution: 'Router replaced on 2026-11-09.', audit: [
      { at: '2026-11-06 10:10', actor: 'Ana Reyes', action: 'Concern filed', detail: 'IT concern.' },
      { at: '2026-11-06 11:00', actor: 'Staff Supervisor', action: 'Status changed to forwarded', detail: 'Routed to IT Support.' },
      { at: '2026-11-09 15:30', actor: 'IT Support', action: 'Status changed to resolved', detail: 'Router replaced.' }
    ] }
  ],
  notices: [
    { id: 'nt-1', kind: 'audit', text: 'Your concern "Midterm grade not reflected" was forwarded to Adviser.', owner: 'Ana Reyes', at: '2026-11-18 09:15', read: false, key: 'cs-1-forwarded' },
    { id: 'nt-2', kind: 'audit', text: 'Concern "Library Wi-Fi signal weak" resolved: Router replaced on 2026-11-09.', owner: 'Ana Reyes', at: '2026-11-09 15:30', read: false, key: 'cs-3-resolved' }
  ],
  activity: [
    { id: 'ac-1', text: 'Completion proof submitted: Sweep and mop Room 204', module: 'duties', time: 'Today, 16:40' },
    { id: 'ac-2', text: 'Token TK-0041 issued at Registrar', module: 'tokens', time: 'Today, 08:00' },
    { id: 'ac-3', text: 'Audit entry recorded for concern cs-1', module: 'audit', time: 'Nov 18, 2026' }
  ]
};
