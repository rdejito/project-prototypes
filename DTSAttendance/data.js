/* DTS Attendance prototype seed data */
const SEED = {
  role: 'student',
  demoToday: '2026-11-24',

  students: [
    { id: 'st-1', name: 'Juan Dela Cruz', initials: 'JD', program: 'BS Information Technology',
      schoolDay: 'Monday', company: 'TechNova Solutions', supervisor: 'Engr. Rivera',
      workRule: 'Tue, Wed, Fri · 08:00-17:00', requiredSchoolDays: 8, requiredOjtHours: 60 },
    { id: 'st-2', name: 'Maria Santos', initials: 'MS', program: 'BS Accountancy',
      schoolDay: 'Thursday', company: 'GreenField Agri', supervisor: 'Mr. Villanueva',
      workRule: 'Mon, Wed, Fri · 07:00-16:00', requiredSchoolDays: 8, requiredOjtHours: 60 },
    { id: 'st-3', name: 'Pedro Reyes', initials: 'PR', program: 'BS Operations Management',
      schoolDay: 'Tuesday', company: 'Chelsea Logistics', supervisor: 'Ms. Dizon',
      workRule: 'Mon-Thu · 09:00-18:00', requiredSchoolDays: 8, requiredOjtHours: 60 },
    { id: 'st-4', name: 'Ana Lim', initials: 'AL', program: 'BS Hospitality',
      schoolDay: 'Wednesday', company: 'Bayad Center', supervisor: 'Mrs. Torres',
      workRule: 'Tue, Thu, Sat · 08:00-12:00', requiredSchoolDays: 8, requiredOjtHours: 40 }
  ],

  expected: [
    { id: 'ex-1',  studentId: 'st-1', date: '2026-11-16', source: 'school',  label: 'School day - Room 301', time: '08:00-17:00', hours: 0 },
    { id: 'ex-2',  studentId: 'st-1', date: '2026-11-17', source: 'company', label: 'TechNova - regular shift', time: '08:00-17:00', hours: 9 },
    { id: 'ex-3',  studentId: 'st-1', date: '2026-11-18', source: 'company', label: 'TechNova - regular shift', time: '08:00-17:00', hours: 9 },
    { id: 'ex-4',  studentId: 'st-1', date: '2026-11-20', source: 'company', label: 'TechNova - regular shift', time: '08:00-17:00', hours: 9 },
    { id: 'ex-5',  studentId: 'st-1', date: '2026-11-23', source: 'school',  label: 'School day - Room 301', time: '08:00-17:00', hours: 0 },
    { id: 'ex-6',  studentId: 'st-1', date: '2026-11-24', source: 'company', label: 'TechNova - regular shift', time: '08:00-17:00', hours: 9 },

    { id: 'ex-7',  studentId: 'st-2', date: '2026-11-16', source: 'company', label: 'GreenField - early shift', time: '07:00-16:00', hours: 9 },
    { id: 'ex-8',  studentId: 'st-2', date: '2026-11-18', source: 'company', label: 'GreenField - early shift', time: '07:00-16:00', hours: 9 },
    { id: 'ex-9',  studentId: 'st-2', date: '2026-11-19', source: 'school',  label: 'School day - Room 204', time: '08:00-17:00', hours: 0 },
    { id: 'ex-10', studentId: 'st-2', date: '2026-11-20', source: 'company', label: 'GreenField - early shift', time: '07:00-16:00', hours: 9 },
    { id: 'ex-11', studentId: 'st-2', date: '2026-11-23', source: 'company', label: 'GreenField - early shift', time: '07:00-16:00', hours: 9 },

    { id: 'ex-12', studentId: 'st-3', date: '2026-11-16', source: 'company', label: 'Chelsea - logistics shift', time: '09:00-18:00', hours: 9 },
    { id: 'ex-13', studentId: 'st-3', date: '2026-11-17', source: 'school',  label: 'School day - Room 302', time: '08:00-17:00', hours: 0 },
    { id: 'ex-14', studentId: 'st-3', date: '2026-11-18', source: 'company', label: 'Chelsea - logistics shift', time: '09:00-18:00', hours: 9 },
    { id: 'ex-15', studentId: 'st-3', date: '2026-11-19', source: 'company', label: 'Chelsea - logistics shift', time: '09:00-18:00', hours: 9 },
    { id: 'ex-16', studentId: 'st-3', date: '2026-11-23', source: 'company', label: 'Chelsea - logistics shift', time: '09:00-18:00', hours: 9 },
    { id: 'ex-17', studentId: 'st-3', date: '2026-11-24', source: 'school',  label: 'School day - Room 302', time: '08:00-17:00', hours: 0 },

    { id: 'ex-18', studentId: 'st-4', date: '2026-11-17', source: 'company', label: 'Bayad - half day', time: '08:00-12:00', hours: 4 },
    { id: 'ex-19', studentId: 'st-4', date: '2026-11-18', source: 'school',  label: 'School day - Room 201', time: '08:00-17:00', hours: 0 },
    { id: 'ex-20', studentId: 'st-4', date: '2026-11-19', source: 'company', label: 'Bayad - half day', time: '08:00-12:00', hours: 4 },
    { id: 'ex-21', studentId: 'st-4', date: '2026-11-21', source: 'company', label: 'Bayad - half day', time: '08:00-12:00', hours: 4 },
    { id: 'ex-22', studentId: 'st-4', date: '2026-11-24', source: 'company', label: 'Bayad - half day', time: '08:00-12:00', hours: 4 }
  ],

  records: [
    { id: 'r-1', studentId: 'st-1', expectedId: 'ex-1', source: 'school', attendanceDate: '2026-11-16', encodedAt: '2026-11-16 08:05', status: 'present', verified: true,  method: 'QR', hours: 0, note: 'Scanned school QR.',
      history: [{ at: '2026-11-16 08:05', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-2', studentId: 'st-1', expectedId: 'ex-2', source: 'company', attendanceDate: '2026-11-17', encodedAt: '2026-11-17 08:12', status: 'present', verified: true,  method: 'QR', hours: 9, note: 'Scanned company QR.',
      history: [{ at: '2026-11-17 08:12', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-3', studentId: 'st-1', expectedId: 'ex-5', source: 'school', attendanceDate: '2026-11-23', encodedAt: '2026-11-24 08:40', status: 'late', verified: false, method: 'Manual', hours: 0, note: 'Did not log for 2 days; filled several forms at once.',
      history: [{ at: '2026-11-24 08:40', by: 'Student', action: 'Backdated entry recorded - pending verification' }] },
    { id: 'r-4', studentId: 'st-1', expectedId: 'ex-4', source: 'company', attendanceDate: '2026-11-20', encodedAt: '2026-11-20 17:02', status: 'present', verified: true, method: 'Manual', hours: 9, note: 'Encoded after shift.',
      history: [{ at: '2026-11-20 17:02', by: 'Student', action: 'Created by manual entry' }] },

    { id: 'r-5', studentId: 'st-2', expectedId: 'ex-7', source: 'company', attendanceDate: '2026-11-16', encodedAt: '2026-11-16 07:10', status: 'present', verified: true, method: 'QR', hours: 9, note: '',
      history: [{ at: '2026-11-16 07:10', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-6', studentId: 'st-2', expectedId: 'ex-9', source: 'school', attendanceDate: '2026-11-19', encodedAt: '2026-11-19 08:01', status: 'present', verified: true, method: 'QR', hours: 0, note: '',
      history: [{ at: '2026-11-19 08:01', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-7', studentId: 'st-2', expectedId: 'ex-10', source: 'company', attendanceDate: '2026-11-20', encodedAt: '2026-11-23 10:15', status: 'late', verified: false, method: 'Manual', hours: 9, note: 'Encoded 3 days late from memory.',
      history: [{ at: '2026-11-23 10:15', by: 'Student', action: 'Backdated entry recorded - pending verification' }] },
    { id: 'r-8', studentId: 'st-2', expectedId: 'ex-8', source: 'company', attendanceDate: '2026-11-18', encodedAt: '2026-11-18 17:00', status: 'absent', verified: true, method: 'Manual', hours: 0, note: 'No show recorded by adviser.',
      history: [{ at: '2026-11-18 17:00', by: 'Adviser', action: 'Marked absent' }] },

    { id: 'r-9', studentId: 'st-3', expectedId: 'ex-12', source: 'company', attendanceDate: '2026-11-16', encodedAt: '2026-11-16 09:04', status: 'present', verified: true, method: 'QR', hours: 9, note: '',
      history: [{ at: '2026-11-16 09:04', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-10', studentId: 'st-3', expectedId: 'ex-13', source: 'school', attendanceDate: '2026-11-17', encodedAt: '2026-11-17 08:07', status: 'present', verified: true, method: 'QR', hours: 0, note: '',
      history: [{ at: '2026-11-17 08:07', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-11', studentId: 'st-3', expectedId: 'ex-15', source: 'company', attendanceDate: '2026-11-19', encodedAt: '2026-11-19 18:10', status: 'present', verified: true, method: 'Manual', hours: 9, note: 'Company shift completed.',
      history: [{ at: '2026-11-19 18:10', by: 'Student', action: 'Created by manual entry' }] },
    { id: 'r-12', studentId: 'st-3', expectedId: 'ex-15', source: 'school', attendanceDate: '2026-11-19', encodedAt: '2026-11-20 07:30', status: 'present', verified: false, method: 'Manual', hours: 0, note: 'Duplicate entry from wrong source.',
      history: [{ at: '2026-11-20 07:30', by: 'Student', action: 'Duplicate entry recorded - conflict' }] },

    { id: 'r-13', studentId: 'st-4', expectedId: 'ex-18', source: 'company', attendanceDate: '2026-11-17', encodedAt: '2026-11-17 08:02', status: 'present', verified: true, method: 'QR', hours: 4, note: '',
      history: [{ at: '2026-11-17 08:02', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-14', studentId: 'st-4', expectedId: 'ex-20', source: 'company', attendanceDate: '2026-11-19', encodedAt: '2026-11-19 10:00', status: 'excused', verified: true, method: 'Manual', hours: 0, note: 'Approved medical leave.',
      history: [{ at: '2026-11-19 10:00', by: 'Adviser', action: 'Approved leave - marked excused' }] }
  ],

  leaves: [
    { id: 'lv-1', studentId: 'st-1', date: '2026-11-18', source: 'company', reason: 'Company site closed for inventory; confirmation emailed to adviser.', status: 'Open', outcome: '' },
    { id: 'lv-2', studentId: 'st-4', date: '2026-11-19', source: 'company', reason: 'Medical certificate submitted.', status: 'Resolved', outcome: 'Approved' },
    { id: 'lv-3', studentId: 'st-3', date: '2026-11-24', source: 'school', reason: 'Family event.', status: 'Open', outcome: '' }
  ],

  notices: [
    { id: 'nt-1', tone: 'warn', text: 'Encode your Nov 23 school attendance before the grace period ends.' },
    { id: 'nt-2', tone: 'info', text: '2 backdated entries are waiting for adviser verification.' },
    { id: 'nt-3', tone: 'warn', text: 'Pedro Reyes has no record for the Nov 24 school day.' },
    { id: 'nt-4', tone: 'info', text: 'Company Supervisor is optional in Phase 1. The adviser verifies company records as proxy.' }
  ],

  activity: [
    { id: 'ac-1', text: 'Backdated school entry for Juan Dela Cruz is pending verification', module: 'attendance', time: 'Today, 08:40' },
    { id: 'ac-2', text: 'Duplicate company record flagged for Pedro Reyes', module: 'attendance', time: 'Nov 20, 2026' },
    { id: 'ac-3', text: 'Medical leave approved for Ana Lim', module: 'leave', time: 'Nov 19, 2026' }
  ]
};
