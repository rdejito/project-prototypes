/* LearnLoop prototype seed data — more study time, less stress */
const SEED = {
  role: 'student',
  studySaved: 145,
  routes: { Facilities: 'Maintenance', IT: 'IT Support', Academics: 'Adviser', Library: 'Library Staff', Other: 'General Services' },
  materials: [
    { id: 'mt-1', title: 'Organic Chemistry Notes', type: 'Notes', source: 'Library Reserve', location: 'Library Counter', arrived: '2026-11-18', due: '2026-11-20', status: 'pending', owner: 'Mia Santos', claimedAt: null, history: [{ at: '2026-11-18 08:30', action: 'Material arrived at Library Reserve', actor: 'Library Staff' }] },
    { id: 'mt-2', title: 'Psychology Statistics Workbook', type: 'Workbook', source: 'Department Office', location: 'Psychology Office', arrived: '2026-11-19', due: '2026-11-21', status: 'ready', owner: 'Mia Santos', claimedAt: null, history: [{ at: '2026-11-19 10:15', action: 'Material ready for pickup', actor: 'Department Staff' }] },
    { id: 'mt-3', title: 'Lab Manual — Experiment 4', type: 'Manual', source: 'Science Lab', location: 'Science Lab 2', arrived: '2026-11-16', due: '2026-11-18', status: 'claimed', owner: 'Mia Santos', claimedAt: '2026-11-16 15:20', history: [{ at: '2026-11-16 09:00', action: 'Material arrived', actor: 'Lab Attendant' }, { at: '2026-11-16 15:20', action: 'Claimed by student', actor: 'Mia Santos' }] },
    { id: 'mt-4', title: 'Research Methods Reference', type: 'Book', source: 'Library', location: 'Library Counter', arrived: '2026-11-20', due: '2026-11-22', status: 'pending', owner: 'Leo Garcia', claimedAt: null, history: [{ at: '2026-11-20 11:45', action: 'Material arrived', actor: 'Library Staff' }] }
  ],
  notices: [
    { id: 'nt-1', kind: 'turn', text: 'Your ticket B-022 is ready at the Library Counter.', owner: 'Mia Santos', at: '2026-11-21 09:40', read: false, key: 'tk-2-called' },
    { id: 'nt-2', kind: 'help', text: 'Your concern "Broken air conditioner" was forwarded to Maintenance.', owner: 'Mia Santos', at: '2026-11-20 11:05', read: false, key: 'hp-1-forwarded' }
  ],
  rooms: [
    { id: 'rm-1', name: 'Room 301', building: 'Building A', capacity: 40, cleanliness: 'Clean', lastChecked: '2026-11-21', checker: 'Teacher Ramos', checks: [{ at: '2026-11-21 08:00', actor: 'Teacher Ramos', result: 'Clean' }] },
    { id: 'rm-2', name: 'Study Lounge', building: 'Library', capacity: 30, cleanliness: 'Needs attention', lastChecked: '2026-11-18', checker: '', checks: [{ at: '2026-11-18 14:00', actor: 'Library Staff', result: 'Needs attention' }] },
    { id: 'rm-3', name: 'CITE Lab 2', building: 'CITE Building', capacity: 25, cleanliness: 'Clean', lastChecked: '2026-11-22', checker: 'Teacher Lim', checks: [{ at: '2026-11-22 07:45', actor: 'Teacher Lim', result: 'Clean' }] }
  ],
  duties: [
    { id: 'dt-1', room: 'Study Lounge', task: 'Tidy tables and dispose of trash', assignedTo: 'Mia Santos', date: '2026-11-22', status: 'pending', submitted: null, note: '' },
    { id: 'dt-2', room: 'Room 301', task: 'Wipe boards and align chairs', assignedTo: 'Mia Santos', date: '2026-11-20', status: 'done', submitted: '2026-11-20', note: 'Done after class.' },
    { id: 'dt-3', room: 'CITE Lab 2', task: 'Arrange computer chairs', assignedTo: 'Leo Garcia', date: '2026-11-22', status: 'pending', submitted: null, note: '' }
  ],
  services: [
    { id: 'svc-1', name: 'Registrar', desk: 'Admin Building', avg: 4 },
    { id: 'svc-2', name: 'Library Counter', desk: 'Library', avg: 3 },
    { id: 'svc-3', name: 'Guidance Office', desk: 'Student Center', avg: 6 }
  ],
  tickets: [
    { id: 'tk-1', code: 'A-014', service: 'Registrar', owner: 'Leo Garcia', status: 'waiting', joined: '2026-11-22 08:10', eta: 8 },
    { id: 'tk-2', code: 'B-022', service: 'Library Counter', owner: 'Mia Santos', status: 'served', joined: '2026-11-21 09:20', eta: 0, calledAt: '2026-11-21 09:40' }
  ],
  quizzes: [
    { id: 'q-1', title: 'Study Habits Refresh', minutes: 3, questions: [
      { q: 'What should you do when a material arrives?', options: ['Ignore the notice', 'Check the pending list and claim it', 'Ask a classmate to check', 'Wait one week'], answer: 1 },
      { q: 'Why does the queue show an ETA?', options: ['To make students wait outside', 'So students can keep studying until their turn', 'To hide the position', 'None of these'], answer: 1 },
      { q: 'What happens to quiz answers at timeout?', options: ['They are erased', 'They auto-submit and are saved', 'They are reset to zero', 'They are emailed'], answer: 1 }
    ] },
    { id: 'q-2', title: 'Stress-Free Campus Basics', minutes: 2, questions: [
      { q: 'How are concerns routed?', options: ['Student must visit every office', 'Automatically by category to the right team', 'By random draw', 'They are not routed'], answer: 1 },
      { q: 'A partial payment should...', options: ['Be forgotten', 'Be recorded and deducted from the balance', 'Double the balance', 'Close the account'], answer: 1 }
    ] }
  ],
  drafts: {},
  attempts: [
    { id: 'at-1', quizId: 'q-1', quizTitle: 'Study Habits Refresh', owner: 'Mia Santos', score: 2, total: 3, at: '2026-11-19 20:10', mode: 'submitted', answers: ['1', '0', '1'] },
    { id: 'at-2', quizId: 'q-1', quizTitle: 'Study Habits Refresh', owner: 'Mia Santos', score: 3, total: 3, at: '2026-11-20 20:05', mode: 'submitted', answers: ['1', '1', '1'] }
  ],
  obligations: [
    { id: 'ob-1', item: 'Lab manual replacement', amount: 180, paid: 80, date: '2026-11-04', owner: 'Mia Santos', history: [{ at: '2026-11-08 15:00', amount: 80, actor: 'Mia Santos' }] },
    { id: 'ob-2', item: 'Student organization fee', amount: 120, paid: 0, date: '2026-11-10', owner: 'Mia Santos', history: [] },
    { id: 'ob-3', item: 'Printing credits', amount: 50, paid: 50, date: '2026-10-29', owner: 'Mia Santos', history: [{ at: '2026-10-29 12:20', amount: 50, actor: 'Mia Santos' }] },
    { id: 'ob-4', item: 'Event deposit', amount: 300, paid: 100, date: '2026-11-12', owner: 'Leo Garcia', history: [{ at: '2026-11-13 09:00', amount: 100, actor: 'Leo Garcia' }] }
  ],
  concerns: [
    { id: 'hp-1', title: 'Broken air conditioner', category: 'Facilities', team: 'Maintenance', stage: 'forwarded', owner: 'Mia Santos', created: '2026-11-20', resolution: '', history: [
      { at: '2026-11-20 08:40', stage: 'new', actor: 'Mia Santos', note: 'Received and auto-routed to Maintenance.' },
      { at: '2026-11-20 11:05', stage: 'forwarded', actor: 'Support Staff', note: 'Forwarded to Maintenance for action.' }
    ] },
    { id: 'hp-2', title: 'Cannot access online module', category: 'IT', team: 'IT Support', stage: 'new', owner: 'Leo Garcia', created: '2026-11-22', resolution: '', history: [
      { at: '2026-11-22 07:50', stage: 'new', actor: 'Leo Garcia', note: 'Received and auto-routed to IT Support.' }
    ] },
    { id: 'hp-3', title: 'Missing lecture handout', category: 'Academics', team: 'Adviser', stage: 'resolved', owner: 'Mia Santos', created: '2026-11-12', resolution: 'Handout reprinted and placed at the department desk.', history: [
      { at: '2026-11-12 09:10', stage: 'new', actor: 'Mia Santos', note: 'Received and auto-routed to Adviser.' },
      { at: '2026-11-12 10:00', stage: 'forwarded', actor: 'Support Staff', note: 'Forwarded to Adviser.' },
      { at: '2026-11-13 14:30', stage: 'resolved', actor: 'Adviser', note: 'Handout reprinted and placed at the department desk.' }
    ] }
  ],
  activity: [
    { id: 'ac-1', text: 'Study time saved: 8 min — concern auto-routed to Maintenance', module: 'help', time: 'Today, 08:40' },
    { id: 'ac-2', text: 'Material nudge generated for Organic Chemistry Notes', module: 'materials', time: 'Today, 08:00' },
    { id: 'ac-3', text: 'Practice attempt: 3/3 on Study Habits Refresh', module: 'practice', time: 'Nov 20, 2026' }
  ]
};
