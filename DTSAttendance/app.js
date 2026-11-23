/* DTS Attendance prototype - dual school/company attendance, reconciliation, compliance. */
(function () {
  let s;
  const TODAY = '2026-11-24';
  const ME = 'st-1';
  const ui = { attFilter: 'all', recFilter: 'attention', leaveFilter: 'all', schedStudent: 'all', reportQuery: '' };
  const staff = () => s.role !== 'student';
  const timeNow = () => new Date().toTimeString().slice(0, 5);

  function student(id) { return s.students.find(x => x.id === id) || s.students[0]; }
  function expected(id) { return s.expected.find(x => x.id === id); }
  function activeRecords() { return s.records.filter(r => r.status !== 'void'); }
  function recsForExpected(id) { return activeRecords().filter(r => r.expectedId === id); }
  function expectedForStudent(id) { return s.expected.filter(e => e.studentId === id).sort((a, b) => a.date.localeCompare(b.date)); }
  function isLate(r) { return r.encodedAt.slice(0, 10) !== r.attendanceDate; }
  function daysOverdue(date) { return Math.max(0, Math.round((new Date(TODAY) - new Date(date)) / 86400000)); }

  function statusOf(ex) {
    const rs = recsForExpected(ex.id);
    if (!rs.length) return { key: 'missing', label: 'No record' };
    if (rs.length > 1) return { key: 'conflict', label: 'Conflict' };
    const r = rs[0];
    if (r.status === 'excused') return { key: 'excused', label: 'Excused' };
    if (r.status === 'absent') return { key: 'absent', label: 'Absent' };
    if (r.status === 'late' || isLate(r)) return r.verified ? { key: 'late', label: 'Late · verified' } : { key: 'late', label: 'Late · pending' };
    return r.verified ? { key: 'ok', label: 'Present' } : { key: 'pending', label: 'Pending verification' };
  }
  function pill(st) { return '<span class="pill ' + st.key + '">' + App.esc(st.label) + '</span>'; }
  function sourceTag(src) { return '<span class="source-tag ' + src + '">' + App.esc(src) + '</span>'; }
  function bar(pct) {
    const cls = pct < 70 ? 'risk' : pct >= 95 ? 'good' : '';
    return '<div class="bar-mini ' + cls + '"><div style="width:' + Math.min(100, pct) + '%"></div></div>';
  }

  function complianceFor(st) {
    const recs = activeRecords().filter(r => r.studentId === st.id && r.verified && (r.status === 'present' || r.status === 'late'));
    const school = recs.filter(r => r.source === 'school').length;
    const hours = recs.filter(r => r.source === 'company').reduce((a, r) => a + Number(r.hours || 0), 0);
    const schoolPct = Math.min(100, Math.round(school / st.requiredSchoolDays * 100));
    const ojtPct = Math.min(100, Math.round(hours / st.requiredOjtHours * 100));
    const overall = Math.round((schoolPct + ojtPct) / 2);
    return { school, hours, schoolPct, ojtPct, overall, atRisk: overall < 70 };
  }

  function attentionItems() {
    const out = [];
    s.expected.forEach(ex => {
      const st = statusOf(ex);
      if (['missing', 'late', 'conflict', 'pending'].indexOf(st.key) !== -1) {
        out.push({ ex, st, stu: student(ex.studentId), overdue: daysOverdue(ex.date) });
      }
    });
    return out.sort((a, b) => b.overdue - a.overdue);
  }

  function updateChrome() {
    const attn = attentionItems();
    const pending = activeRecords().filter(r => !r.verified && (r.status === 'late' || r.status === 'present')).length;
    App.setCounts({
      dashboard: attn.length,
      schedule: s.expected.filter(e => e.studentId === ME && statusOf(e).key === 'missing').length,
      attendance: pending,
      reconciliation: attn.length,
      leave: s.leaves.filter(l => l.status === 'Open').length,
      compliance: 0,
      reports: 0
    });
    const avg = Math.round(s.students.reduce((a, st) => a + complianceFor(st).overall, 0) / s.students.length);
    App.setProgress(avg, staff() ? 'Average compliance' : 'My compliance');
  }

  function activityHtml() {
    return s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
  }

  /* ---------------- views ---------------- */

  function dashboard() {
    updateChrome();
    if (!staff()) {
      const st = student(ME), c = complianceFor(st);
      const mine = expectedForStudent(ME);
      const pending = activeRecords().filter(r => r.studentId === ME && !r.verified);
      const next = mine.filter(e => e.date >= TODAY).slice(0, 4);
      const hero = '<div class="hero"><div class="hero-top"><div><h2>Welcome back, ' + App.esc(st.name.split(' ')[0]) + '</h2>' +
        '<p>Your school day is ' + App.esc(st.schoolDay) + '. Company: ' + App.esc(st.company) + ' · ' + App.esc(st.workRule) + '</p></div>' +
        '<div class="hero-ring"><div class="ring" style="--ring:' + c.overall + '%"><div class="ring-inner">' + c.overall + '%</div></div><small>Compliance</small></div></div>' +
        '<div class="hero-stats"><div class="hero-stat"><strong>' + c.school + '/' + st.requiredSchoolDays + '</strong><span>School days</span></div>' +
        '<div class="hero-stat"><strong>' + c.hours + '/' + st.requiredOjtHours + 'h</strong><span>OJT hours</span></div>' +
        '<div class="hero-stat"><strong>' + pending.length + '</strong><span>Needs verification</span></div></div></div>';
      const notice = c.atRisk ? App.notice('warn', 'Your compliance is below 70%. Encode missing attendance and clear pending verification.') : App.notice('info', 'Your records are on track. Keep encoding on the day of attendance.');
      const rows = next.length ? next.map(e => '<div class="list-row"><span class="activity-icon">' + App.icon(e.source === 'school' ? 'home' : 'box') + '</span><div class="list-main"><strong>' + App.esc(e.date) + ' · ' + App.esc(e.label) + '</strong><div class="meta"><span>' + sourceTag(e.source) + '</span><span>' + App.icon('clock') + App.esc(e.time) + '</span></div></div>' + pill(statusOf(e)) + '</div>').join('') : App.empty('No upcoming days', 'The sample period has ended.');
      const pendHtml = pending.length ? pending.map(r => '<div class="list-row"><span class="activity-icon">' + App.icon('clock') + '</span><div class="list-main"><strong>' + App.esc(r.attendanceDate) + ' · ' + App.esc(expected(r.expectedId).label) + '</strong><div class="meta"><span>Encoded ' + App.esc(r.encodedAt) + '</span><span>' + (isLate(r) ? 'Backdated' : 'Awaiting check') + '</span></div></div>' + pill(statusOf(expected(r.expectedId))) + '</div>').join('') : App.empty('Nothing pending', 'All your entries are verified.');
      return hero + '<div style="height:18px"></div>' + notice +
        App.card('My next expected days', 'Derived from your school day and company work rule', rows) +
        '<div style="height:18px"></div>' + App.card('Records needing verification', 'Backdated entries are not counted until confirmed', pendHtml);
    }

    const attn = attentionItems();
    const avg = Math.round(s.students.reduce((a, st) => a + complianceFor(st).overall, 0) / s.students.length);
    const stats = '<div class="stat-grid"><div class="card stat-card"><span>Students</span><strong>' + s.students.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Needs attention</span><strong>' + attn.length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Avg. compliance</span><strong>' + avg + '%</strong></div></div>';
    const rows = attn.slice(0, 8).map(a => '<tr' + (a.st.key === 'missing' ? ' class="alert-row"' : '') + '><td>' + App.esc(a.ex.date) + '</td><td>' + App.esc(a.stu.name) + '</td><td>' + sourceTag(a.ex.source) + '</td><td>' + pill(a.st) + '</td><td>' + (a.overdue ? a.overdue + 'd' : '-') + '</td></tr>').join('');
    const board = App.card('Attention board', 'No-record, late, pending and conflicting entries', rows ? '<table class="table"><thead><tr><th>Date</th><th>Student</th><th>Source</th><th>Status</th><th>Overdue</th></tr></thead><tbody>' + rows + '</tbody></table>' : App.empty('All clear', 'No attendance issues found.'));
    const students = s.students.map(st => { const c = complianceFor(st); return '<div class="focus-item"><span class="focus-dot" style="background:' + (c.atRisk ? 'var(--danger)' : 'var(--done)') + '"></span><div class="txt"><strong>' + App.esc(st.name) + '</strong><span>' + App.esc(st.company) + '</span></div><div style="width:90px">' + bar(c.overall) + '</div><span class="small bold">' + c.overall + '%</span></div>'; }).join('');
    return stats + App.notice('info', 'Company Supervisor is optional in Phase 1. Adviser and Admin verify company records as proxy.') + board +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Compliance by student', 'Required vs completed school days and OJT hours', students) + App.card('Recent activity', 'Latest attendance changes', activityHtml()) + '</div>';
  }

  function schedule() {
    updateChrome();
    let list = staff() ? (ui.schedStudent === 'all' ? s.expected : s.expected.filter(e => e.studentId === ui.schedStudent)) : expectedForStudent(ME);
    list = list.slice().sort((a, b) => a.date.localeCompare(b.date));
    const tabs = staff() ? App.tabs('schedStudent', [
      { value: 'all', label: 'All students' }, { value: 'st-1', label: 'Juan' }, { value: 'st-2', label: 'Maria' },
      { value: 'st-3', label: 'Pedro' }, { value: 'st-4', label: 'Ana' }
    ], ui.schedStudent) : '';
    const head = staff()
      ? '<button class="btn btn-outline btn-sm" data-action="edit-rule" data-id="' + (ui.schedStudent === 'all' ? ME : ui.schedStudent) + '">' + App.icon('edit') + ' Edit rule</button>'
      : '<button class="btn btn-primary btn-sm" data-action="record-new">' + App.icon('plus') + ' Record attendance</button>';
    const rows = list.map(e => {
      const st = student(e.studentId), stat = statusOf(e);
      return '<tr><td class="nowrap">' + App.esc(e.date) + '</td>' + (staff() ? '<td>' + App.esc(st.name) + '</td>' : '') +
        '<td>' + sourceTag(e.source) + '</td><td>' + App.esc(e.label) + '</td><td class="nowrap">' + App.esc(e.time) + '</td><td>' + pill(stat) + '</td>' +
        '<td class="nowrap">' + (stat.key === 'missing' ? '<button class="btn btn-soft btn-sm" data-action="record-new" data-ex="' + e.id + '">Record</button>' : '-') + '</td></tr>';
    }).join('');
    const table = App.card('Expected attendance calendar', 'Derived from per-student school day and per-company work dates/hours',
      '<table class="table"><thead><tr><th>Date</th>' + (staff() ? '<th>Student</th>' : '') + '<th>Source</th><th>Expectation</th><th>Hours</th><th>Status</th><th>Action</th></tr></thead><tbody>' + rows + '</tbody></table>');
    const ruleStudents = staff() && ui.schedStudent === 'all' ? s.students : [student(staff() ? ui.schedStudent : ME)];
    const rules = ruleStudents.map(st => '<div class="kv-item"><small>' + App.esc(st.name) + '</small><strong>' + App.esc(st.schoolDay) + ' · school</strong><div class="small muted">' + App.esc(st.company) + '</div><div class="small muted">' + App.esc(st.workRule) + '</div>' +
      (staff() ? '<button class="btn btn-outline btn-sm" style="margin-top:8px" data-action="edit-rule" data-id="' + st.id + '">Edit</button>' : '') + '</div>').join('');
    return '<div class="toolbar">' + tabs + head + '</div>' + table + '<div style="height:18px"></div>' + App.card('Schedule rules', 'Different school days and work rules per student', '<div class="kv-grid">' + rules + '</div>');
  }

  function attendance() {
    updateChrome();
    const all = activeRecords();
    const counts = {
      all: all.length,
      mine: all.filter(r => r.studentId === ME).length,
      present: all.filter(r => r.status === 'present' && r.verified).length,
      late: all.filter(r => r.status === 'late').length,
      absent: all.filter(r => r.status === 'absent').length
    };
    let list = all.slice();
    if (ui.attFilter === 'mine') list = list.filter(r => r.studentId === ME);
    if (ui.attFilter === 'present') list = list.filter(r => r.status === 'present' && r.verified);
    if (ui.attFilter === 'late') list = list.filter(r => r.status === 'late' || isLate(r));
    if (ui.attFilter === 'absent') list = list.filter(r => r.status === 'absent');
    const tabs = App.tabs('attFilter', [
      { value: 'all', label: 'All records', count: counts.all }, { value: 'mine', label: 'Mine', count: counts.mine },
      { value: 'present', label: 'Present', count: counts.present }, { value: 'late', label: 'Backdated', count: counts.late },
      { value: 'absent', label: 'Absent', count: counts.absent }
    ], ui.attFilter);
    const head = '<button class="btn btn-primary btn-sm" data-action="record-new">' + App.icon('plus') + ' Record attendance</button>';
    const rows = list.map(r => {
      const ex = expected(r.expectedId), stu = student(r.studentId);
      const actions = '<button class="btn btn-outline btn-sm" data-action="show-history" data-id="' + r.id + '">History</button>' +
        (staff() && !r.verified && r.status !== 'void' ? '<button class="btn btn-success btn-sm" data-action="verify-record" data-id="' + r.id + '">Verify</button>' : '') +
        (staff() && r.status !== 'void' ? '<button class="btn btn-danger-ghost btn-sm" data-action="void-record" data-id="' + r.id + '">Void</button>' : '');
      return '<div class="list-row"><span class="activity-icon">' + App.icon('scan') + '</span><div class="list-main"><strong>' + App.esc(stu.name) + ' · ' + App.esc(ex.label) + '</strong><div class="meta"><span>' + App.icon('calendar') + 'Attended ' + App.esc(r.attendanceDate) + '</span><span>' + App.icon('clock') + 'Encoded ' + App.esc(r.encodedAt) + '</span><span>' + sourceTag(r.source) + '</span><span>' + App.esc(r.method) + '</span></div>' +
        (r.note ? '<div class="small muted" style="margin-top:5px">' + App.esc(r.note) + '</div>' : '') + '</div>' +
        '<span class="pill ' + (r.verified ? 'ok' : 'late') + '">' + (r.verified ? 'Verified' : 'Not verified') + '</span>' + pill(statusOf(ex)) + '<div class="list-actions">' + actions + '</div></div>';
    }).join('');
    return '<div class="toolbar">' + tabs + head + '</div>' + App.notice('info', 'Every entry keeps two dates: the day attended and the exact encoding time. Backdated entries stay "pending" until confirmed.') +
      App.card('Attendance records', 'Check-in/out, source, timestamps, status and verification', rows || App.empty('No records here', 'Adjust the filter or record attendance.'));
  }

  function reconciliation() {
    updateChrome();
    let list = s.expected.slice();
    if (ui.recFilter === 'attention') list = list.filter(e => ['missing', 'late', 'conflict', 'pending'].indexOf(statusOf(e).key) !== -1);
    if (ui.recFilter === 'school') list = list.filter(e => e.source === 'school');
    if (ui.recFilter === 'company') list = list.filter(e => e.source === 'company');
    list.sort((a, b) => a.date.localeCompare(b.date));
    const tabs = App.tabs('recFilter', [
      { value: 'attention', label: 'Needs action', count: attentionItems().length }, { value: 'all', label: 'All dates' },
      { value: 'school', label: 'School' }, { value: 'company', label: 'Company' }
    ], ui.recFilter);
    const rows = list.map(ex => {
      const st = statusOf(ex), stu = student(ex.studentId), rs = recsForExpected(ex.id);
      let action = '<button class="btn btn-outline btn-sm" data-action="show-expected" data-id="' + ex.id + '">View</button>';
      if (st.key === 'late' && rs.length && !rs[0].verified) action += '<button class="btn btn-success btn-sm" data-action="verify-record" data-id="' + rs[0].id + '">Confirm late</button>';
      if (st.key === 'missing') action += '<button class="btn btn-danger-ghost btn-sm" data-action="mark-absent" data-id="' + ex.id + '">Mark absent</button>';
      if (st.key === 'conflict') action += '<button class="btn btn-danger-ghost btn-sm" data-action="resolve-conflict" data-id="' + ex.id + '">Resolve</button>';
      const overdue = daysOverdue(ex.date);
      return '<tr' + (st.key === 'missing' || st.key === 'conflict' ? ' class="alert-row"' : '') + '><td class="nowrap">' + App.esc(ex.date) + '</td><td>' + App.esc(stu.name) + '</td><td>' + sourceTag(ex.source) + '</td><td>' + pill(st) + '</td><td>' + rs.length + '</td><td>' + (overdue && st.key === 'missing' ? overdue + 'd' : '-') + '</td><td class="nowrap">' + action + '</td></tr>';
    }).join('');
    return '<div class="toolbar">' + tabs + '</div>' + App.notice('warn', 'A late or backdated entry does not count until the adviser or administrator confirms it. Conflicts must be resolved before compliance is computed.') +
      App.card('School vs company reconciliation', 'Expected dates compared with recorded sources', '<table class="table"><thead><tr><th>Date</th><th>Student</th><th>Source</th><th>Status</th><th>Records</th><th>Overdue</th><th>Action</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function leave() {
    updateChrome();
    let list = s.leaves.slice();
    if (ui.leaveFilter === 'open') list = list.filter(l => l.status === 'Open');
    if (ui.leaveFilter === 'resolved') list = list.filter(l => l.status === 'Resolved');
    const tabs = App.tabs('leaveFilter', [
      { value: 'all', label: 'All', count: s.leaves.length },
      { value: 'open', label: 'Open', count: s.leaves.filter(l => l.status === 'Open').length },
      { value: 'resolved', label: 'Resolved', count: s.leaves.filter(l => l.status === 'Resolved').length }
    ], ui.leaveFilter);
    const head = '<button class="btn btn-primary btn-sm" data-action="leave-new">' + App.icon('plus') + ' File leave</button>';
    const rows = list.map(l => {
      const stu = student(l.studentId);
      const actions = staff() && l.status === 'Open'
        ? '<button class="btn btn-success btn-sm" data-action="leave-decision" data-id="' + l.id + '" data-outcome="Approved">Approve</button><button class="btn btn-danger-ghost btn-sm" data-action="leave-decision" data-id="' + l.id + '" data-outcome="Rejected">Reject</button>'
        : (l.outcome ? '<span class="pill ' + (l.outcome === 'Approved' ? 'ok' : 'absent') + '">' + App.esc(l.outcome) + '</span>' : '<span class="small muted">Awaiting decision</span>');
      return '<div class="list-row"><span class="activity-icon">' + App.icon('send') + '</span><div class="list-main"><strong>' + App.esc(stu.name) + ' · ' + App.esc(l.date) + '</strong><div class="meta"><span>' + sourceTag(l.source) + '</span><span>' + App.icon('calendar') + 'Affected date</span></div><div class="small muted" style="margin-top:5px">' + App.esc(l.reason) + '</div></div>' +
        '<span class="pill ' + (l.status === 'Open' ? 'late' : 'ok') + '">' + App.esc(l.status) + '</span><div class="list-actions">' + actions + '</div></div>';
    }).join('');
    return '<div class="toolbar">' + tabs + head + '</div>' + App.notice('info', 'Work-date leave is currently approved by the Adviser or Admin. Supervisor approval is reserved for Phase 2.') +
      App.card('Leave and exceptions', 'Requests name the affected date and source, and close with a resolution', rows || App.empty('No leave requests', 'Adjust the filter above.'));
  }

  function compliance() {
    updateChrome();
    if (!staff()) {
      const st = student(ME), c = complianceFor(st);
      const detail = '<div class="kv-grid"><div class="kv-item"><small>Required school days</small><strong>' + st.requiredSchoolDays + '</strong></div>' +
        '<div class="kv-item"><small>Verified school days</small><strong>' + c.school + '</strong></div>' +
        '<div class="kv-item"><small>Required OJT hours</small><strong>' + st.requiredOjtHours + ' h</strong></div>' +
        '<div class="kv-item"><small>Verified OJT hours</small><strong>' + c.hours + ' h</strong></div></div>';
      const bars = '<div style="margin-top:18px"><div class="small bold">School days · ' + c.schoolPct + '%</div>' + bar(c.schoolPct) +
        '<div class="small bold" style="margin-top:14px">OJT hours · ' + c.ojtPct + '%</div>' + bar(c.ojtPct) + '</div>';
      const pend = activeRecords().filter(r => r.studentId === ME && !r.verified);
      return (c.atRisk ? App.notice('warn', 'At risk: compliance is below 70%.') : App.notice('info', 'You are above the 70% compliance threshold.')) +
        App.card('My compliance ledger', 'Only verified records are counted; late entries count after confirmation', detail + bars) +
        '<div style="height:18px"></div>' + App.card('Not counted yet', 'Backdated or unverified entries', pend.length ? pend.map(r => '<div class="list-row"><span class="activity-icon">' + App.icon('clock') + '</span><div class="list-main"><strong>' + App.esc(expected(r.expectedId).label) + '</strong><div class="meta"><span>Attended ' + App.esc(r.attendanceDate) + '</span><span>Encoded ' + App.esc(r.encodedAt) + '</span></div></div>' + pill(statusOf(expected(r.expectedId))) + '</div>').join('') : App.empty('Nothing pending', 'All entries are counted.'));
    }
    const rows = s.students.map(st => {
      const c = complianceFor(st);
      return '<tr><td><strong>' + App.esc(st.name) + '</strong><div class="small muted">' + App.esc(st.company) + '</div></td><td>' + c.school + '/' + st.requiredSchoolDays + '</td><td>' + c.hours + '/' + st.requiredOjtHours + 'h</td>' +
        '<td style="min-width:120px">' + bar(c.overall) + '<span class="small">' + c.overall + '%</span></td><td><span class="pill ' + (c.atRisk ? 'absent' : 'ok') + '">' + (c.atRisk ? 'At risk' : 'On track') + '</span></td></tr>';
    }).join('');
    return App.notice('info', 'Compliance = verified school days and verified OJT hours against each student\'s own requirement. Excused absences are not penalized.') +
      App.card('Compliance ledger', 'Required vs completed, per student', '<table class="table"><thead><tr><th>Student</th><th>School days</th><th>OJT hours</th><th>Overall</th><th>Flag</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function reports() {
    updateChrome();
    const q = ui.reportQuery.toLowerCase();
    let list = activeRecords().slice().reverse();
    if (q) list = list.filter(r => {
      const stu = student(r.studentId), ex = expected(r.expectedId);
      return (stu.name + ' ' + stu.company + ' ' + ex.label + ' ' + r.status + ' ' + r.source).toLowerCase().indexOf(q) !== -1;
    });
    const rows = list.map(r => '<tr><td>' + App.esc(r.attendanceDate) + '</td><td>' + App.esc(student(r.studentId).name) + '</td><td>' + App.esc(student(r.studentId).company) + '</td><td>' + sourceTag(r.source) + '</td><td>' + App.esc(r.encodedAt) + '</td><td>' + pill(statusOf(expected(r.expectedId))) + '</td></tr>').join('');
    const byCompany = s.students.map(st => { const c = complianceFor(st); return '<div class="focus-item"><span class="focus-dot" style="background:' + (c.atRisk ? 'var(--danger)' : 'var(--done)') + '"></span><div class="txt"><strong>' + App.esc(st.company) + '</strong><span>' + App.esc(st.name) + ' · ' + c.school + ' days, ' + c.hours + ' h</span></div><span class="small bold">' + c.overall + '%</span></div>'; }).join('');
    const notices = s.notices.map(n => '<div class="notice ' + n.tone + '">' + App.icon(n.tone === 'warn' ? 'alert' : 'info') + '<span>' + App.esc(n.text) + '</span></div>').join('');
    const search = '<form id="report-search-form" class="row" style="margin-bottom:16px"><div class="search-box"><span>' + App.icon('search') + '</span><input class="input" id="report-q" placeholder="Search student, company, source, status" value="' + App.esc(ui.reportQuery) + '" /></div><button class="btn btn-primary btn-sm" data-action="run-search">Search</button></form>';
    return search + App.card('Attendance report', 'Filtered records across school and company sources', rows ? '<table class="table"><thead><tr><th>Attended</th><th>Student</th><th>Company</th><th>Source</th><th>Encoded</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>' : App.empty('No matching records', 'Try a different search term.')) +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('By company', 'Summary of verified progress', byCompany) + App.card('Notices', 'Reminders and system notes', '<div style="padding:12px 16px">' + notices + '</div>') + '</div>';
  }

  /* ---------------- shared framework setup ---------------- */

  App.init({
    slug: 'dtsattendance', title: 'DTS Attendance', tagline: 'Dual Training System Attendance & Compliance',
    icon: 'scan', accent: 'teal',
    roles: ['student', 'adviser', 'admin'],
    roleLabels: { student: 'Student view', adviser: 'Adviser view', admin: 'Administrator view' },
    user: { name: 'Juan Dela Cruz', meta: '2024-00137 · BS IT', initials: 'JD' },
    progressLabel: 'Average compliance',
    seed: SEED,
    viewAccess: { reconciliation: ['adviser', 'admin'], reports: ['adviser', 'admin'] },
    nav: [
      { id: 'dashboard', label: 'Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'schedule', label: 'Schedule Rules', icon: 'calendar', group: 'WORKSPACE' },
      { id: 'attendance', label: 'Attendance Records', icon: 'scan', group: 'ATTENDANCE' },
      { id: 'reconciliation', label: 'Reconciliation', icon: 'shield', group: 'ATTENDANCE' },
      { id: 'leave', label: 'Leave & Exceptions', icon: 'send', group: 'ATTENDANCE' },
      { id: 'compliance', label: 'Compliance', icon: 'chart', group: 'REPORTS' },
      { id: 'reports', label: 'Reports & Notices', icon: 'file', group: 'REPORTS' }
    ],
    views: {
      dashboard: { title: 'Overview', subtitle: 'Attendance and compliance at a glance', render: dashboard },
      schedule: { title: 'Schedule Rules', subtitle: 'Different school days and company work dates', render: schedule },
      attendance: { title: 'Attendance Records', subtitle: 'Capture, timestamp, verify and audit every entry', render: attendance },
      reconciliation: { title: 'Reconciliation', subtitle: 'School source vs company source against expected dates', render: reconciliation },
      leave: { title: 'Leave & Exceptions', subtitle: 'Requests with affected date and resolution', render: leave },
      compliance: { title: 'Compliance', subtitle: 'Required vs completed school days and OJT hours', render: compliance },
      reports: { title: 'Reports & Notices', subtitle: 'Search records, summaries and reminders', render: reports }
    }
  });

  s = App.state;

  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });

  App.on('run-search', () => { ui.reportQuery = (document.getElementById('report-q') || {}).value || ''; App.refresh(); });

  App.on('record-new', d => {
    const scope = (d && d.ex) ? [expected(d.ex)] : (staff() ? s.expected : expectedForStudent(ME));
    const opts = scope.map(e => '<option value="' + e.id + '"' + (d && d.ex === e.id ? ' selected' : '') + '>' + App.esc(student(e.studentId).name + ' · ' + e.date + ' · ' + e.source) + '</option>').join('');
    App.modal('Record attendance', 'QR scan auto-fills; manual entry supports backdated encoding (C-04)',
      '<form id="record-form"><div class="field"><label for="rec-ex">Expected date</label><select class="select" id="rec-ex" name="ex">' + opts + '</select></div>' +
      '<div class="field"><label for="rec-method">Method</label><select class="select" id="rec-method" name="method"><option value="QR">QR scan - same-day</option><option value="Manual">Manual - may be backdated</option></select></div>' +
      '<div class="field"><label for="rec-note">Note</label><textarea class="textarea" id="rec-note" name="note" placeholder="Why is this entry late?"></textarea></div>' +
      '<p class="field-hint">Attendance date is taken from the expected date. Encoding time is recorded automatically. If the dates differ, the entry becomes "Pending verification".</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-record">' + App.icon('check') + ' Save entry</button>');
  });

  App.on('save-record', () => {
    const f = document.getElementById('record-form'), d = new FormData(f);
    const ex = expected(d.get('ex')); if (!ex) return;
    if (!staff() && ex.studentId !== ME) return App.toast('Students can only record their own attendance.', 'error');
    const method = d.get('method');
    const sameDay = ex.date === TODAY;
    const late = !sameDay || method === 'Manual';
    const encodedAt = TODAY + ' ' + timeNow();
    const rec = {
      id: App.uid('r'), studentId: ex.studentId, expectedId: ex.id, source: ex.source,
      attendanceDate: ex.date, encodedAt, status: late ? 'late' : 'present',
      verified: !late, method, hours: ex.hours, note: d.get('note') || '',
      history: [{ at: encodedAt, by: 'Student', action: late ? 'Backdated entry recorded - pending verification' : 'Created by QR check-in' }]
    };
    s.records.push(rec);
    App.activity('Attendance recorded for ' + student(ex.studentId).name + ' (' + ex.date + ')', 'attendance');
    App.save(); App.closeModal(); App.refresh();
    App.toast(late ? 'Backdated entry saved. Waiting for verification.' : 'Check-in recorded and verified.');
  });

  App.on('verify-record', d => {
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    r.verified = true;
    r.history.push({ at: TODAY + ' ' + timeNow(), by: staff() ? 'Adviser/Admin' : 'Student', action: 'Entry verified and counted' });
    App.activity('Verified attendance entry for ' + student(r.studentId).name, 'attendance');
    App.save(); App.refresh(); App.toast('Entry verified and now counted in compliance.');
  });

  App.on('void-record', d => {
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    r.status = 'void';
    r.history.push({ at: TODAY + ' ' + timeNow(), by: 'Adviser/Admin', action: 'Record voided after correction' });
    App.activity('Attendance record voided for ' + student(r.studentId).name, 'attendance');
    App.save(); App.refresh(); App.toast('Record voided. The change is kept in history.');
  });

  App.on('mark-absent', d => {
    const ex = expected(d.id); if (!ex) return;
    const at = TODAY + ' ' + timeNow();
    s.records.push({ id: App.uid('r'), studentId: ex.studentId, expectedId: ex.id, source: ex.source,
      attendanceDate: ex.date, encodedAt: at, status: 'absent', verified: true, method: 'Manual', hours: 0,
      note: 'Marked absent by adviser/admin.', history: [{ at, by: 'Adviser/Admin', action: 'Marked absent' }] });
    App.activity('Marked absent: ' + student(ex.studentId).name + ' on ' + ex.date, 'attendance');
    App.save(); App.refresh(); App.toast('Expected day marked absent.');
  });

  App.on('resolve-conflict', d => {
    const rs = recsForExpected(d.id); if (rs.length < 2) return;
    const keep = rs.find(r => r.verified) || rs[0];
    keep.verified = true;
    rs.filter(r => r.id !== keep.id).forEach(r => {
      r.status = 'void';
      r.history.push({ at: TODAY + ' ' + timeNow(), by: 'Adviser/Admin', action: 'Voided during conflict resolution' });
    });
    App.activity('Conflict resolved for ' + expected(d.id).date, 'attendance');
    App.save(); App.refresh(); App.toast('Conflict resolved. Voided records remain in history.');
  });

  App.on('show-expected', d => {
    const ex = expected(d.id); if (!ex) return;
    const rs = recsForExpected(ex.id);
    const body = '<dl class="kv"><dt>Student</dt><dd>' + App.esc(student(ex.studentId).name) + '</dd><dt>Expected date</dt><dd>' + App.esc(ex.date) + '</dd>' +
      '<dt>Source</dt><dd>' + App.esc(ex.source) + '</dd><dt>Time / hours</dt><dd>' + App.esc(ex.time) + (ex.hours ? ' · ' + ex.hours + ' h' : '') + '</dd>' +
      '<dt>Status</dt><dd>' + pill(statusOf(ex)) + '</dd><dt>Records</dt><dd>' + rs.length + '</dd></dl>' +
      (rs.length ? '<div style="margin-top:14px">' + rs.map(r => '<div class="detail" style="margin-bottom:8px"><small>' + App.esc(r.source) + ' · encoded ' + App.esc(r.encodedAt) + '</small><strong>' + App.esc(r.status) + (r.verified ? ' · verified' : ' · not verified') + '</strong></div>').join('') + '</div>' : App.empty('No records', 'This expected day has no attendance entry.'));
    App.modal('Expected day details', ex.label, body, '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });

  App.on('show-history', d => {
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    const items = r.history.map(h => '<li><div><strong>' + App.esc(h.action) + '</strong><small>' + App.esc(h.by) + ' · ' + App.esc(h.at) + '</small></div></li>').join('');
    App.modal('Record audit trail', 'Attended ' + r.attendanceDate + ' · encoded ' + r.encodedAt,
      '<div class="kv-grid"><div class="kv-item"><small>Source</small><strong>' + App.esc(r.source) + '</strong></div><div class="kv-item"><small>Method</small><strong>' + App.esc(r.method) + '</strong></div></div><ul class="timeline" style="margin-top:16px">' + items + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });

  App.on('leave-new', () => {
    const opts = (staff() ? s.students : [student(ME)]).map(st => '<option value="' + st.id + '">' + App.esc(st.name) + '</option>').join('');
    App.modal('File leave / exception', 'Name the affected date and source (C-06)',
      '<form id="leave-form"><div class="field"><label for="lv-student">Student</label><select class="select" id="lv-student" name="student">' + opts + '</select></div>' +
      '<div class="field"><label for="lv-date">Affected date</label><input class="input" type="date" id="lv-date" name="date" value="' + TODAY + '" required /></div>' +
      '<div class="field"><label for="lv-source">Source</label><select class="select" id="lv-source" name="source"><option value="school">School day</option><option value="company">Company work day</option></select></div>' +
      '<div class="field"><label for="lv-reason">Reason</label><textarea class="textarea" id="lv-reason" name="reason" required></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-leave">Submit request</button>');
  });

  App.on('save-leave', () => {
    const d = new FormData(document.getElementById('leave-form'));
    if (!staff() && d.get('student') !== ME) return App.toast('Students can only file for themselves.', 'error');
    s.leaves.unshift({ id: App.uid('lv'), studentId: d.get('student'), date: d.get('date'), source: d.get('source'), reason: d.get('reason'), status: 'Open', outcome: '' });
    App.activity('Leave request filed for ' + d.get('date'), 'leave');
    App.save(); App.closeModal(); App.refresh(); App.toast('Leave request submitted as Open.');
  });

  App.on('leave-decision', d => {
    const l = s.leaves.find(x => x.id === d.id); if (!l) return;
    l.status = 'Resolved'; l.outcome = d.outcome;
    if (d.outcome === 'Approved') {
      const ex = s.expected.find(e => e.studentId === l.studentId && e.date === l.date && e.source === l.source);
      if (ex && !recsForExpected(ex.id).length) {
        const at = TODAY + ' ' + timeNow();
        s.records.push({ id: App.uid('r'), studentId: l.studentId, expectedId: ex.id, source: ex.source, attendanceDate: ex.date, encodedAt: at,
          status: 'excused', verified: true, method: 'Manual', hours: 0, note: 'Approved leave.',
          history: [{ at, by: 'Adviser/Admin', action: 'Approved leave - marked excused' }] });
      }
    }
    App.activity('Leave ' + d.outcome.toLowerCase() + ' for ' + student(l.studentId).name, 'leave');
    App.save(); App.refresh(); App.toast('Leave request marked ' + d.outcome + '.');
  });

  App.on('edit-rule', d => {
    const st = student(d.id);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    App.modal('Edit profile & schedule rule', st.name + ' · C-02 and C-03',
      '<form id="rule-form"><div class="field"><label for="ru-school">School day</label><select class="select" id="ru-school" name="school">' + days.map(x => '<option' + (x === st.schoolDay ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="ru-company">Assigned company</label><input class="input" id="ru-company" name="company" value="' + App.esc(st.company) + '" required /></div>' +
      '<div class="field"><label for="ru-sup">Supervisor contact (Phase 2)</label><input class="input" id="ru-sup" name="supervisor" value="' + App.esc(st.supervisor) + '" /></div>' +
      '<div class="field"><label for="ru-work">Company work rule</label><input class="input" id="ru-work" name="workRule" value="' + App.esc(st.workRule) + '" required /></div>' +
      '<div class="row"><div class="field" style="flex:1"><label for="ru-days">Required school days</label><input class="input" type="number" id="ru-days" name="requiredSchoolDays" value="' + st.requiredSchoolDays + '" /></div>' +
      '<div class="field" style="flex:1"><label for="ru-hours">Required OJT hours</label><input class="input" type="number" id="ru-hours" name="requiredOjtHours" value="' + st.requiredOjtHours + '" /></div></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-rule" data-id="' + st.id + '">Save rule</button>');
  });

  App.on('save-rule', d => {
    const st = student(d.id), f = new FormData(document.getElementById('rule-form'));
    st.schoolDay = f.get('school'); st.company = f.get('company'); st.supervisor = f.get('supervisor');
    st.workRule = f.get('workRule'); st.requiredSchoolDays = Number(f.get('requiredSchoolDays')); st.requiredOjtHours = Number(f.get('requiredOjtHours'));
    App.activity('Schedule rule updated for ' + st.name, 'schedule');
    App.save(); App.closeModal(); App.refresh(); App.toast('Profile and schedule rule updated.');
  });

  App.go('dashboard');
})();
