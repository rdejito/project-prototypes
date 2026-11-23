/* DTS Attendance prototype - seed data generated from schedule rules. */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* Stable IDs let expected dates survive rule edits and date regeneration. */
function expectedId(studentId, date, source) {
  return 'ex-' + studentId + '-' + date + '-' + source;
}

function eachDate(start, end) {
  const out = [];
  const d = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  let guard = 0;
  while (d <= last && guard++ < 400) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* School day takes precedence over a company work day on the same date. */
function buildExpected(settings, students) {
  const out = [];
  eachDate(settings.periodStart, settings.periodEnd).forEach(date => {
    const dow = new Date(date + 'T00:00:00').getDay();
    students.forEach(st => {
      if (dow === st.schoolDayIdx) {
        out.push({
          id: expectedId(st.id, date, 'school'), studentId: st.id, date, source: 'school',
          label: 'School day - ' + st.program.replace('BS ', ''), time: '08:00-17:00', hours: 0
        });
      } else if ((st.workDays || []).indexOf(dow) !== -1) {
        out.push({
          id: expectedId(st.id, date, 'company'), studentId: st.id, date, source: 'company',
          label: st.company + ' shift', time: st.workTime, hours: Number(st.workHours || 0)
        });
      }
    });
  });
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.studentId.localeCompare(b.studentId));
}

const SEED = {
  role: 'student',
  settings: {
    demoToday: '2026-11-24',
    periodStart: '2026-11-16',
    periodEnd: '2026-11-28',
    atRisk: 70,
    graceDays: 1
  },

  students: [
    { id: 'st-1', name: 'Juan Dela Cruz', initials: 'JD', program: 'BS Information Technology',
      schoolDayIdx: 1, company: 'TechNova Solutions', supervisor: 'Engr. Rivera',
      workDays: [2, 3, 5], workTime: '08:00-17:00', workHours: 9,
      requiredSchoolDays: 8, requiredOjtHours: 60 },
    { id: 'st-2', name: 'Maria Santos', initials: 'MS', program: 'BS Accountancy',
      schoolDayIdx: 4, company: 'GreenField Agri', supervisor: 'Mr. Villanueva',
      workDays: [1, 3, 5], workTime: '07:00-16:00', workHours: 9,
      requiredSchoolDays: 8, requiredOjtHours: 60 },
    { id: 'st-3', name: 'Pedro Reyes', initials: 'PR', program: 'BS Operations Management',
      schoolDayIdx: 2, company: 'Chelsea Logistics', supervisor: 'Ms. Dizon',
      workDays: [1, 3, 4], workTime: '09:00-18:00', workHours: 9,
      requiredSchoolDays: 8, requiredOjtHours: 60 },
    { id: 'st-4', name: 'Ana Lim', initials: 'AL', program: 'BS Hospitality',
      schoolDayIdx: 3, company: 'Bayad Center', supervisor: 'Mrs. Torres',
      workDays: [2, 4, 6], workTime: '08:00-12:00', workHours: 4,
      requiredSchoolDays: 8, requiredOjtHours: 40 }
  ],

  expected: [],

  records: [
    { id: 'r-1', studentId: 'st-1', expectedId: '', source: 'school', attendanceDate: '2026-11-16', encodedAt: '2026-11-16 08:05', status: 'present', backdated: false, verified: true, method: 'QR', hours: 0, note: 'Scanned school QR.',
      history: [{ at: '2026-11-16 08:05', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-2', studentId: 'st-1', expectedId: '', source: 'company', attendanceDate: '2026-11-17', encodedAt: '2026-11-17 08:12', status: 'present', backdated: false, verified: true, method: 'QR', hours: 9, note: 'Scanned company QR.',
      history: [{ at: '2026-11-17 08:12', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-3', studentId: 'st-1', expectedId: '', source: 'company', attendanceDate: '2026-11-20', encodedAt: '2026-11-20 17:02', status: 'present', backdated: false, verified: true, method: 'Manual', hours: 9, note: 'Encoded after shift.',
      history: [{ at: '2026-11-20 17:02', by: 'Student', action: 'Created by manual entry' }] },
    { id: 'r-4', studentId: 'st-1', expectedId: '', source: 'school', attendanceDate: '2026-11-23', encodedAt: '2026-11-24 08:40', status: 'present', backdated: true, verified: false, method: 'Manual', hours: 0, note: 'Did not log for 2 days; filled several forms at once.',
      history: [{ at: '2026-11-24 08:40', by: 'Student', action: 'Backdated entry recorded - pending verification' }] },

    { id: 'r-5', studentId: 'st-2', expectedId: '', source: 'company', attendanceDate: '2026-11-16', encodedAt: '2026-11-16 07:10', status: 'present', backdated: false, verified: true, method: 'QR', hours: 9, note: '',
      history: [{ at: '2026-11-16 07:10', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-6', studentId: 'st-2', expectedId: '', source: 'school', attendanceDate: '2026-11-19', encodedAt: '2026-11-19 08:01', status: 'present', backdated: false, verified: true, method: 'QR', hours: 0, note: '',
      history: [{ at: '2026-11-19 08:01', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-7', studentId: 'st-2', expectedId: '', source: 'company', attendanceDate: '2026-11-20', encodedAt: '2026-11-23 10:15', status: 'present', backdated: true, verified: false, method: 'Manual', hours: 9, note: 'Encoded 3 days late from memory.',
      history: [{ at: '2026-11-23 10:15', by: 'Student', action: 'Backdated entry recorded - pending verification' }] },
    { id: 'r-8', studentId: 'st-2', expectedId: '', source: 'company', attendanceDate: '2026-11-18', encodedAt: '2026-11-18 17:00', status: 'absent', backdated: false, verified: true, method: 'Manual', hours: 0, note: 'No show recorded by adviser.',
      history: [{ at: '2026-11-18 17:00', by: 'Adviser', action: 'Marked absent' }] },

    { id: 'r-9', studentId: 'st-3', expectedId: '', source: 'company', attendanceDate: '2026-11-16', encodedAt: '2026-11-16 09:04', status: 'present', backdated: false, verified: true, method: 'QR', hours: 9, note: '',
      history: [{ at: '2026-11-16 09:04', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-10', studentId: 'st-3', expectedId: '', source: 'school', attendanceDate: '2026-11-17', encodedAt: '2026-11-17 08:07', status: 'present', backdated: false, verified: true, method: 'QR', hours: 0, note: '',
      history: [{ at: '2026-11-17 08:07', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-11', studentId: 'st-3', expectedId: '', source: 'company', attendanceDate: '2026-11-19', encodedAt: '2026-11-19 18:10', status: 'present', backdated: false, verified: true, method: 'Manual', hours: 9, note: 'Company shift completed.',
      history: [{ at: '2026-11-19 18:10', by: 'Student', action: 'Created by manual entry' }] },
    { id: 'r-12', studentId: 'st-3', expectedId: '', source: 'company', attendanceDate: '2026-11-19', encodedAt: '2026-11-20 07:30', status: 'present', backdated: true, verified: false, method: 'Manual', hours: 0, note: 'Duplicate entry from the wrong source.',
      history: [{ at: '2026-11-20 07:30', by: 'Student', action: 'Duplicate entry recorded - conflict' }] },

    { id: 'r-13', studentId: 'st-4', expectedId: '', source: 'company', attendanceDate: '2026-11-17', encodedAt: '2026-11-17 08:02', status: 'present', backdated: false, verified: true, method: 'QR', hours: 4, note: '',
      history: [{ at: '2026-11-17 08:02', by: 'Student', action: 'Created by QR check-in' }] },
    { id: 'r-14', studentId: 'st-4', expectedId: '', source: 'company', attendanceDate: '2026-11-19', encodedAt: '2026-11-19 10:00', status: 'excused', backdated: false, verified: true, method: 'Manual', hours: 0, note: 'Approved medical leave.',
      history: [{ at: '2026-11-19 10:00', by: 'Adviser', action: 'Approved leave - marked excused' }] }
  ],

  leaves: [
    { id: 'lv-1', studentId: 'st-1', date: '2026-11-18', source: 'company', reason: 'Company site closed for inventory; confirmation emailed to adviser.', status: 'Open', outcome: '', decisionNote: '', decidedBy: '' },
    { id: 'lv-2', studentId: 'st-4', date: '2026-11-19', source: 'company', reason: 'Medical certificate submitted.', status: 'Resolved', outcome: 'Approved', decisionNote: 'Certificate verified.', decidedBy: 'Adviser' },
    { id: 'lv-3', studentId: 'st-3', date: '2026-11-24', source: 'school', reason: 'Family event.', status: 'Open', outcome: '', decisionNote: '', decidedBy: '' }
  ],

  notices: [
    { id: 'nt-1', tone: 'warn', audience: 'student', text: 'Encode your Nov 23 school attendance before the grace period ends.', read: false, created: '2026-11-24' },
    { id: 'nt-2', tone: 'info', audience: 'staff', text: 'Backdated entries are waiting for adviser verification.', read: false, created: '2026-11-24' },
    { id: 'nt-3', tone: 'warn', audience: 'staff', text: 'Pedro Reyes has no record for the Nov 24 school day.', read: false, created: '2026-11-24' },
    { id: 'nt-4', tone: 'info', audience: 'all', text: 'Company Supervisor is optional in Phase 1. The adviser verifies company records as proxy.', read: true, created: '2026-11-20' }
  ],

  activity: [
    { id: 'ac-1', text: 'Backdated school entry for Juan Dela Cruz is pending verification', module: 'attendance', time: 'Today, 08:40' },
    { id: 'ac-2', text: 'Duplicate company record flagged for Pedro Reyes', module: 'attendance', time: 'Nov 20, 2026' },
    { id: 'ac-3', text: 'Medical leave approved for Ana Lim', module: 'leave', time: 'Nov 19, 2026' }
  ]
};

/* Link records to generated expected dates and build the initial calendar. */
SEED.expected = buildExpected(SEED.settings, SEED.students);
SEED.records.forEach(r => { r.expectedId = expectedId(r.studentId, r.attendanceDate, r.source); });

/* Helpers used by app.js when the calendar or rules change. */
const DTS = {
  DAY_NAMES: DAY_NAMES,
  eachDate: eachDate,
  expectedId: expectedId,
  buildExpected: buildExpected
};
