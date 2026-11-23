/* DTS Attendance prototype - complete browser-only flows for C-01 to C-10. */
(function () {
  let s;
  const ui = {
    schedStudent: 'all', schedStatus: 'all',
    attStatus: 'all', attStudent: 'all', attSource: 'all', attQuery: '',
    recStatus: 'attention', recStudent: 'all',
    leaveStatus: 'all',
    reportStudent: 'all', reportCompany: 'all', reportSource: 'all', reportStatus: 'all', reportQuery: ''
  };

  const TODAY = () => s.settings.demoToday;
  const ME = () => s.students.some(x => x.id === 'st-1') ? 'st-1' : ((s.students[0] || {}).id || '');
  const stampNow = () => TODAY() + ' ' + new Date().toTimeString().slice(0, 5);
  const isStudent = () => s.role === 'student';
  const isStaff = () => s.role === 'adviser' || s.role === 'admin';
  const isAdmin = () => s.role === 'admin';
  const actor = () => s.role === 'admin' ? 'Administrator' : s.role === 'adviser' ? 'Adviser' : 'Student';

  function needStaff() {
    if (isStaff()) return true;
    App.toast('This action is not available in the Student view.', 'error');
    return false;
  }
  function needAdmin() {
    if (isAdmin()) return true;
    App.toast('Administrator access is required for this action.', 'error');
    return false;
  }
  function need(cond, msg) {
    if (cond) return true;
    App.toast(msg, 'error');
    return false;
  }
  function val(id) { return ((document.getElementById(id) || {}).value || '').trim(); }
  function fd(id) { return new FormData(document.getElementById(id)); }

  /* ---------------- data helpers ---------------- */

  function student(id) { return s.students.find(x => x.id === id) || s.students[0] || { id: '', name: 'Unknown', company: '-' }; }
  function expected(id) { return s.expected.find(x => x.id === id); }
  function activeRecords() { return s.records.filter(r => r.status !== 'void'); }
  function recsForExpected(id) { return activeRecords().filter(r => r.expectedId === id); }
  function expectedForStudent(id) { return s.expected.filter(e => e.studentId === id).sort((a, b) => a.date.localeCompare(b.date)); }
  function backdated(r) { return !!r.backdated || r.encodedAt.slice(0, 10) > r.attendanceDate; }
  function daysOverdue(date) { return Math.max(0, Math.round((new Date(TODAY() + 'T00:00:00') - new Date(date + 'T00:00:00')) / 86400000)); }
  function addHistory(r, action, by) {
    r.history = r.history || [];
    r.history.push({ at: stampNow(), by: by || actor(), action: action });
  }
  function log(text, module) { App.activity(text, module); }

  function statusOf(ex) {
    const rs = recsForExpected(ex.id);
    if (!rs.length) return { key: 'missing', label: 'No record' };
    if (rs.length > 1) return { key: 'conflict', label: 'Conflict' };
    const r = rs[0];
    if (r.status === 'excused') return { key: 'excused', label: 'Excused' };
    if (r.status === 'absent') return { key: 'absent', label: 'Absent' };
    if (backdated(r)) return r.verified ? { key: 'late', label: 'Late - verified' } : { key: 'late', label: 'Backdated - pending' };
    return r.verified ? { key: 'ok', label: 'Present' } : { key: 'pending', label: 'Pending verification' };
  }

  function pill(st) { return '<span class="pill ' + st.key + '">' + App.esc(st.label) + '</span>'; }
  function sourceTag(src) { return '<span class="source-tag ' + src + '">' + App.esc(src) + '</span>'; }
  function bar(pct) {
    const cls = pct < 70 ? 'risk' : pct >= 95 ? 'good' : '';
    return '<div class="bar-mini ' + cls + '"><div style="width:' + Math.min(100, Math.max(0, pct)) + '%"></div></div>';
  }

  function complianceFor(st) {
    const recs = activeRecords().filter(r => r.studentId === st.id);
    const counted = recs.filter(r => r.verified && r.status === 'present');
    const excused = recs.filter(r => r.verified && r.status === 'excused');
    const school = counted.filter(r => r.source === 'school').length;
    const hours = counted.filter(r => r.source === 'company').reduce((a, r) => a + Number(r.hours || 0), 0);
    const excSchool = excused.filter(r => r.source === 'school').length;
    const excHours = excused.filter(r => r.source === 'company').reduce((a, r) => a + Number(r.hours || 0), 0);
    const reqSchool = Math.max(0, Number(st.requiredSchoolDays || 0) - excSchool);
    const reqOjt = Math.max(0, Number(st.requiredOjtHours || 0) - excHours);
    const schoolPct = reqSchool ? Math.min(100, Math.round(school / reqSchool * 100)) : 100;
    const ojtPct = reqOjt ? Math.min(100, Math.round(hours / reqOjt * 100)) : 100;
    const overall = Math.round((schoolPct + ojtPct) / 2);
    return {
      school: school, hours: hours, reqSchool: reqSchool, reqOjt: reqOjt,
      excSchool: excSchool, excHours: excHours, schoolPct: schoolPct, ojtPct: ojtPct,
      overall: overall, atRisk: overall < Number(s.settings.atRisk || 70)
    };
  }

  function attentionItems() {
    const out = [];
    s.expected.forEach(ex => {
      const stat = statusOf(ex);
      if (['missing', 'late', 'conflict', 'pending'].indexOf(stat.key) !== -1) {
        out.push({ ex: ex, st: stat, stu: student(ex.studentId), overdue: daysOverdue(ex.date) });
      }
    });
    return out.sort((a, b) => b.overdue - a.overdue || a.ex.date.localeCompare(b.ex.date));
  }

  function noticesForMe() {
    return s.notices.filter(n => n.audience === 'all' ||
      (n.audience === 'student' && isStudent()) || (n.audience === 'staff' && isStaff()));
  }

  function noticeHtml(limit) {
    const list = noticesForMe().slice(0, limit || 5);
    if (!list.length) return App.empty('No notices', 'You are all caught up.');
    return list.map(n => '<div class="notice ' + n.tone + '">' + App.icon(n.tone === 'warn' ? 'alert' : 'info') +
      '<span>' + App.esc(n.text) + '</span>' +
      (!n.read ? '<button class="btn btn-outline btn-sm" data-action="notice-read" data-id="' + n.id + '">Mark read</button>' : '') +
      '</div>').join('');
  }

  function rebuildExpected() {
    const fresh = DTS.buildExpected(s.settings, s.students);
    const map = {};
    fresh.forEach(e => { map[e.id] = e; });
    s.expected = fresh;
    s.records.forEach(r => {
      const ex = map[r.expectedId];
      if (!ex) {
        if (r.status !== 'void') { addHistory(r, 'Expected date removed by schedule change', 'System'); r.status = 'void'; }
      } else if (r.source !== ex.source) {
        addHistory(r, 'Source changed to ' + ex.source + ' by schedule change', 'System');
        r.source = ex.source; r.hours = ex.hours;
      }
    });
  }

  /* ---------------- export helpers ---------------- */

  function csvCell(v) {
    const t = String(v == null ? '' : v);
    return /[",\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  }
  function toCsv(rows) { return rows.map(r => r.map(csvCell).join(',')).join('\r\n'); }
  function download(name, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }
  function recordRows(list) {
    return [['Attended', 'Encoded', 'Student', 'Company', 'Source', 'Status', 'Verified', 'Backdated', 'Hours', 'Method', 'Note']]
      .concat(list.map(r => {
        const st = student(r.studentId), ex = expected(r.expectedId);
        return [r.attendanceDate, r.encodedAt, st.name, st.company, r.source,
          ex ? statusOf(ex).label : 'Orphaned', r.verified ? 'Yes' : 'No', backdated(r) ? 'Yes' : 'No',
          r.hours, r.method, r.note];
      }));
  }

  function updateChrome() {
    const attn = attentionItems();
    const pending = activeRecords().filter(r => !r.verified && r.status === 'present').length;
    const minePending = activeRecords().filter(r => r.studentId === ME() && !r.verified && r.status === 'present').length;
    const atRisk = s.students.filter(st => complianceFor(st).atRisk).length;
    App.setCounts({
      dashboard: isStaff() ? attn.length : minePending,
      students: s.students.length,
      schedule: expectedForStudent(ME()).filter(e => statusOf(e).key === 'missing').length,
      attendance: pending,
      reconciliation: attn.length,
      leave: s.leaves.filter(l => l.status === 'Open').length,
      compliance: atRisk,
      reports: noticesForMe().filter(n => !n.read).length
    });
    const pct = isStaff()
      ? Math.round(s.students.reduce((a, st) => a + complianceFor(st).overall, 0) / Math.max(1, s.students.length))
      : complianceFor(student(ME())).overall;
    App.setProgress(pct, isStaff() ? 'Average compliance' : 'My compliance');
  }

  function activityHtml() {
    return s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' +
      App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
  }

  /* ---------------- views ---------------- */

  function dashboard() {
    updateChrome();
    if (isStudent()) {
      const st = student(ME()), c = complianceFor(st);
      const mine = expectedForStudent(ME());
      const pending = activeRecords().filter(r => r.studentId === ME() && !r.verified && r.status === 'present');
      const missing = mine.filter(e => e.date <= TODAY() && statusOf(e).key === 'missing');
      const next = mine.filter(e => e.date >= TODAY()).slice(0, 5);
      const hero = '<div class="hero"><div class="hero-top"><div><h2>Welcome back, ' + App.esc(st.name.split(' ')[0]) + '</h2>' +
        '<p>School day: ' + App.esc(DAY_NAMES[st.schoolDayIdx]) + ' · Company: ' + App.esc(st.company) + ' (' + App.esc(st.workTime) + ')</p></div>' +
        '<div class="hero-ring"><div class="ring" style="--ring:' + c.overall + '%"><div class="ring-inner">' + c.overall + '%</div></div><small>Compliance</small></div></div>' +
        '<div class="hero-stats"><div class="hero-stat"><strong>' + c.school + '/' + c.reqSchool + '</strong><span>School days</span></div>' +
        '<div class="hero-stat"><strong>' + c.hours + '/' + c.reqOjt + 'h</strong><span>OJT hours</span></div>' +
        '<div class="hero-stat"><strong>' + pending.length + '</strong><span>Needs verification</span></div>' +
        '<div class="hero-stat"><strong>' + missing.length + '</strong><span>Missing days</span></div></div></div>';
      const banner = c.atRisk
        ? App.notice('warn', 'Your compliance is below ' + s.settings.atRisk + '%. Encode missing days and clear pending verification.')
        : App.notice('info', 'Your records are on track. Keep encoding on the day of attendance.');
      const nextRows = next.length ? next.map(e => '<div class="list-row"><span class="activity-icon">' + App.icon(e.source === 'school' ? 'home' : 'box') + '</span>' +
        '<div class="list-main"><strong>' + App.esc(e.date) + ' · ' + App.esc(e.label) + '</strong><div class="meta"><span>' + sourceTag(e.source) +
        '</span><span>' + App.icon('clock') + App.esc(e.time) + '</span></div></div>' + pill(statusOf(e)) + '</div>').join('')
        : App.empty('No upcoming days', 'The sample period has ended.');
      const pendRows = pending.length ? pending.map(r => '<div class="list-row"><span class="activity-icon">' + App.icon('clock') + '</span>' +
        '<div class="list-main"><strong>' + App.esc(r.attendanceDate) + ' · ' + App.esc(expected(r.expectedId).label) + '</strong><div class="meta"><span>Encoded ' +
        App.esc(r.encodedAt) + '</span><span>' + (backdated(r) ? 'Backdated' : 'Awaiting check') + '</span></div></div>' + pill(statusOf(expected(r.expectedId))) + '</div>').join('')
        : App.empty('Nothing pending', 'All your entries are verified.');
      const quick = missing.length
        ? '<button class="btn btn-primary btn-sm" data-action="record-new" data-ex="' + missing[0].id + '">' + App.icon('plus') + ' Encode ' + missing[0].date + '</button>'
        : '<button class="btn btn-primary btn-sm" data-action="record-new">' + App.icon('plus') + ' Record attendance</button>';
      return hero + '<div style="height:18px"></div>' + banner +
        '<div class="toolbar">' + quick + '</div>' +
        App.card('My next expected days', 'Derived from your school day and company work rule', nextRows) +
        '<div style="height:18px"></div>' +
        App.card('Records needing verification', 'Backdated entries are not counted until confirmed', pendRows) +
        '<div style="height:18px"></div>' + App.card('Notices for you', 'Reminders and system notes', '<div style="padding:12px 16px">' + noticeHtml(4) + '</div>');
    }

    const attn = attentionItems();
    const pending = activeRecords().filter(r => !r.verified && r.status === 'present').length;
    const avg = Math.round(s.students.reduce((a, st) => a + complianceFor(st).overall, 0) / Math.max(1, s.students.length));
    const stats = '<div class="stat-grid">' +
      '<div class="card stat-card"><span>Students</span><strong>' + s.students.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Needs attention</span><strong>' + attn.length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Pending verification</span><strong>' + pending + '</strong></div>' +
      '<div class="card stat-card"><span>Avg. compliance</span><strong>' + avg + '%</strong></div></div>';
    const rows = attn.slice(0, 8).map(a => '<tr' + (a.st.key === 'missing' ? ' class="alert-row"' : '') + '><td class="nowrap">' + App.esc(a.ex.date) + '</td><td>' + App.esc(a.stu.name) +
      '</td><td>' + sourceTag(a.ex.source) + '</td><td>' + pill(a.st) + '</td><td>' + (a.overdue ? a.overdue + 'd' : '-') + '</td></tr>').join('');
    const board = App.card('Attention board', 'No-record, backdated, pending and conflicting entries',
      rows ? '<table class="table"><thead><tr><th>Date</th><th>Student</th><th>Source</th><th>Status</th><th>Overdue</th></tr></thead><tbody>' + rows + '</tbody></table>'
        : App.empty('All clear', 'No attendance issues found.'));
    const students = s.students.map(st => { const c = complianceFor(st); return '<div class="focus-item"><span class="focus-dot" style="background:' +
      (c.atRisk ? 'var(--danger)' : 'var(--done)') + '"></span><div class="txt"><strong>' + App.esc(st.name) + '</strong><span>' + App.esc(st.company) +
      '</span></div><div style="width:90px">' + bar(c.overall) + '</div><span class="small bold">' + c.overall + '%</span></div>'; }).join('');
    return stats + App.notice('info', 'Company Supervisor is optional in Phase 1. Adviser and Admin verify company records as proxy.') + board +
      '<div class="dash-bottom" style="margin-top:18px">' +
      App.card('Compliance by student', 'Verified progress against each student requirement', students) +
      App.card('Recent activity', 'Latest attendance changes', activityHtml()) + '</div>' +
      '<div style="height:18px"></div>' + App.card('Notices', 'Reminders and system notes', '<div style="padding:12px 16px">' + noticeHtml(4) + '</div>');
  }

  function studentsView() {
    updateChrome();
    const head = '<button class="btn btn-primary btn-sm" data-action="student-new">' + App.icon('plus') + ' Add student</button>';
    const rows = s.students.map(st => {
      const c = complianceFor(st);
      return '<tr><td><strong>' + App.esc(st.name) + '</strong><div class="small muted">' + App.esc(st.program) + '</div></td>' +
        '<td>' + App.esc(DAY_NAMES[st.schoolDayIdx]) + '</td><td>' + App.esc(st.company) + '<div class="small muted">' + App.esc(st.supervisor) + '</div></td>' +
        '<td>' + (st.workDays || []).map(d => DAY_NAMES[d].slice(0, 3)).join(' ') + '<div class="small muted">' + App.esc(st.workTime) + ' · ' + st.workHours + 'h</div></td>' +
        '<td>' + st.requiredSchoolDays + 'd / ' + st.requiredOjtHours + 'h</td>' +
        '<td style="min-width:100px">' + bar(c.overall) + '<span class="small">' + c.overall + '%</span></td>' +
        '<td class="nowrap"><button class="btn btn-outline btn-sm" data-action="edit-student" data-id="' + st.id + '">' + App.icon('edit') + '</button> ' +
        '<button class="btn btn-danger-ghost btn-sm" data-action="delete-student" data-id="' + st.id + '">' + App.icon('trash') + '</button></td></tr>';
    }).join('');
    return '<div class="toolbar">' + head + '</div>' + App.notice('info', 'Profiles store the company, supervisor contact and each student\'s own requirements (C-02).') +
      App.card('Students and rules', 'School day, company work days and required attendance',
        '<table class="table"><thead><tr><th>Student</th><th>School day</th><th>Company / contact</th><th>Work days</th><th>Required</th><th>Progress</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function schedule() {
    updateChrome();
    const mine = expectedForStudent(ME());
    let list = isStudent() ? mine : (ui.schedStudent === 'all' ? s.expected : expectedForStudent(ui.schedStudent));
    if (ui.schedStatus === 'missing') list = list.filter(e => statusOf(e).key === 'missing');
    if (ui.schedStatus === 'pending') list = list.filter(e => ['pending', 'late'].indexOf(statusOf(e).key) !== -1);
    if (ui.schedStatus === 'conflict') list = list.filter(e => statusOf(e).key === 'conflict');
    list = list.slice().sort((a, b) => a.date.localeCompare(b.date));
    const tabs = App.tabs('schedStatus', [
      { value: 'all', label: 'All dates', count: s.expected.length },
      { value: 'missing', label: 'Missing' },
      { value: 'pending', label: 'Backdated / pending' },
      { value: 'conflict', label: 'Conflicts' }
    ], ui.schedStatus);
    const studentSelect = isStudent() ? '' : '<select class="select" id="sched-student-select"><option value="all">All students</option>' +
      s.students.map(st => '<option value="' + st.id + '"' + (ui.schedStudent === st.id ? ' selected' : '') + '>' + App.esc(st.name) + '</option>').join('') + '</select>' +
      '<button class="btn btn-outline btn-sm" data-action="apply-sched-filter">Apply</button>';
    const head = (isStaff() ? '<button class="btn btn-outline btn-sm" data-action="regen-expected">' + App.icon('reset') + ' Regenerate dates</button>' : '') + studentSelect;
    const rows = list.map(e => {
      const st = student(e.studentId), stat = statusOf(e), count = recsForExpected(e.id).length;
      const canRecord = !isStudent() || e.studentId === ME();
      return '<tr><td class="nowrap">' + App.esc(e.date) + '</td>' + (isStudent() ? '' : '<td>' + App.esc(st.name) + '</td>') +
        '<td>' + sourceTag(e.source) + '</td><td>' + App.esc(e.label) + '</td><td class="nowrap">' + App.esc(e.time) + (e.hours ? ' · ' + e.hours + 'h' : '') + '</td>' +
        '<td>' + pill(stat) + '</td><td>' + count + '</td><td class="nowrap">' + (stat.key === 'missing' && canRecord
          ? '<button class="btn btn-soft btn-sm" data-action="record-new" data-ex="' + e.id + '">Record</button>' : '-') + '</td></tr>';
    }).join('');
    const table = App.card('Expected attendance calendar', 'Generated from ' + s.settings.periodStart + ' to ' + s.settings.periodEnd,
      '<table class="table"><thead><tr><th>Date</th>' + (isStudent() ? '' : '<th>Student</th>') +
      '<th>Source</th><th>Expectation</th><th>Time</th><th>Status</th><th>Rec</th><th>Action</th></tr></thead><tbody>' + rows + '</tbody></table>');
    const ruleStudents = isStudent() ? [student(ME())] : (ui.schedStudent === 'all' ? s.students : [student(ui.schedStudent)]);
    const rules = ruleStudents.map(st => '<div class="kv-item"><small>' + App.esc(st.name) + '</small><strong>' + App.esc(DAY_NAMES[st.schoolDayIdx]) + ' · school</strong>' +
      '<div class="small muted">' + App.esc(st.company) + '</div><div class="small muted">' + (st.workDays || []).map(d => DAY_NAMES[d].slice(0, 3)).join(' ') + ' · ' + App.esc(st.workTime) + '</div>' +
      (isAdmin() ? '<button class="btn btn-outline btn-sm" style="margin-top:8px" data-action="edit-student" data-id="' + st.id + '">Edit rule</button>' : '') + '</div>').join('');
    return '<div class="toolbar">' + tabs + head + '</div>' + table + '<div style="height:18px"></div>' +
      App.card('Schedule rules', 'School day takes precedence when it falls on a company work day', '<div class="kv-grid">' + rules + '</div>');
  }

  function attendance() {
    updateChrome();
    const all = activeRecords();
    const counts = {
      all: all.length,
      mine: all.filter(r => r.studentId === ME()).length,
      present: all.filter(r => r.status === 'present' && r.verified && !backdated(r)).length,
      backdated: all.filter(r => backdated(r) && r.status === 'present').length,
      pending: all.filter(r => !r.verified && r.status === 'present').length,
      absent: all.filter(r => r.status === 'absent').length,
      excused: all.filter(r => r.status === 'excused').length
    };
    let list = all.slice();
    if (ui.attStatus === 'mine') list = list.filter(r => r.studentId === ME());
    if (ui.attStatus === 'present') list = list.filter(r => r.status === 'present' && r.verified && !backdated(r));
    if (ui.attStatus === 'backdated') list = list.filter(r => backdated(r) && r.status === 'present');
    if (ui.attStatus === 'pending') list = list.filter(r => !r.verified && r.status === 'present');
    if (ui.attStatus === 'absent') list = list.filter(r => r.status === 'absent');
    if (ui.attStatus === 'excused') list = list.filter(r => r.status === 'excused');
    if (isStudent()) list = list.filter(r => r.studentId === ME());
    if (ui.attStudent !== 'all') list = list.filter(r => r.studentId === ui.attStudent);
    if (ui.attSource !== 'all') list = list.filter(r => r.source === ui.attSource);
    if (ui.attQuery) {
      const q = ui.attQuery.toLowerCase();
      list = list.filter(r => (student(r.studentId).name + ' ' + student(r.studentId).company + ' ' + r.note + ' ' + r.encodedAt).toLowerCase().indexOf(q) !== -1);
    }
    list.sort((a, b) => b.encodedAt.localeCompare(a.encodedAt));
    const tabs = App.tabs('attStatus', [
      { value: 'all', label: 'All', count: counts.all }, { value: 'mine', label: 'Mine', count: counts.mine },
      { value: 'present', label: 'Present', count: counts.present }, { value: 'backdated', label: 'Backdated', count: counts.backdated },
      { value: 'pending', label: 'Pending', count: counts.pending }, { value: 'absent', label: 'Absent', count: counts.absent },
      { value: 'excused', label: 'Excused', count: counts.excused }
    ], ui.attStatus);
    const filters = (isStudent() ? '' : '<select class="select" id="att-student-select"><option value="all">All students</option>' +
      s.students.map(st => '<option value="' + st.id + '"' + (ui.attStudent === st.id ? ' selected' : '') + '>' + App.esc(st.name) + '</option>').join('') + '</select>') +
      '<select class="select" id="att-source-select"><option value="all">All sources</option>' +
      ['school', 'company'].map(x => '<option value="' + x + '"' + (ui.attSource === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>' +
      '<form id="att-search-form" class="row" style="margin:0"><div class="search-box"><span>' + App.icon('search') + '</span>' +
      '<input class="input" id="att-q" placeholder="Search name, company, note" value="' + App.esc(ui.attQuery) + '" /></div>' +
      '<button class="btn btn-outline btn-sm" data-action="apply-att-filters">Apply</button></form>' +
      '<button class="btn btn-primary btn-sm" data-action="record-new">' + App.icon('plus') + ' Record attendance</button>' +
      '<button class="btn btn-outline btn-sm" data-action="export-records">' + App.icon('file') + ' CSV</button>';
    const rows = list.map(r => {
      const ex = expected(r.expectedId), stu = student(r.studentId);
      const actions = '<button class="btn btn-outline btn-sm" data-action="show-history" data-id="' + r.id + '">History</button>' +
        (isStaff() ? '<button class="btn btn-outline btn-sm" data-action="edit-record" data-id="' + r.id + '">' + App.icon('edit') + '</button>' +
          (r.verified ? '<button class="btn btn-outline btn-sm" data-action="unverify-record" data-id="' + r.id + '">Unverify</button>'
            : '<button class="btn btn-success btn-sm" data-action="verify-record" data-id="' + r.id + '">Verify</button>') +
          '<button class="btn btn-danger-ghost btn-sm" data-action="void-record" data-id="' + r.id + '">Void</button>' : '');
      return '<div class="list-row"><span class="activity-icon">' + App.icon('scan') + '</span><div class="list-main"><strong>' + App.esc(stu.name) + ' · ' +
        App.esc(ex ? ex.label : 'Date no longer expected') + '</strong><div class="meta"><span>' + App.icon('calendar') + 'Attended ' + App.esc(r.attendanceDate) +
        '</span><span>' + App.icon('clock') + 'Encoded ' + App.esc(r.encodedAt) + '</span><span>' + sourceTag(r.source) + '</span><span>' + App.esc(r.method) + '</span></div>' +
        (r.note ? '<div class="small muted" style="margin-top:5px">' + App.esc(r.note) + '</div>' : '') + '</div>' +
        '<span class="pill ' + (r.verified ? 'ok' : 'late') + '">' + (r.verified ? 'Verified' : 'Not verified') + '</span>' +
        (backdated(r) ? '<span class="pill late">Backdated</span>' : '') +
        (ex ? pill(statusOf(ex)) : '') + '<div class="list-actions">' + actions + '</div></div>';
    }).join('');
    return '<div class="toolbar">' + tabs + filters + '</div>' +
      App.notice('info', 'Each entry stores two timestamps: the day attended and the exact encoding time. Backdated entries stay "pending" until confirmed.') +
      App.card('Attendance records', 'Capture, edit, verify, void and audit every entry', rows || App.empty('No matching records', 'Adjust the filters or record attendance.'));
  }

  function reconciliation() {
    updateChrome();
    let list = s.expected.slice();
    if (ui.recStatus === 'attention') list = list.filter(e => ['missing', 'late', 'conflict', 'pending'].indexOf(statusOf(e).key) !== -1);
    if (ui.recStatus === 'missing') list = list.filter(e => statusOf(e).key === 'missing');
    if (ui.recStatus === 'school') list = list.filter(e => e.source === 'school');
    if (ui.recStatus === 'company') list = list.filter(e => e.source === 'company');
    if (ui.recStudent !== 'all') list = list.filter(e => e.studentId === ui.recStudent);
    list.sort((a, b) => a.date.localeCompare(b.date));
    const tabs = App.tabs('recStatus', [
      { value: 'attention', label: 'Needs action', count: attentionItems().length },
      { value: 'missing', label: 'Missing' }, { value: 'all', label: 'All dates' },
      { value: 'school', label: 'School' }, { value: 'company', label: 'Company' }
    ], ui.recStatus);
    const head = '<select class="select" id="rec-student-select"><option value="all">All students</option>' +
      s.students.map(st => '<option value="' + st.id + '"' + (ui.recStudent === st.id ? ' selected' : '') + '>' + App.esc(st.name) + '</option>').join('') + '</select>' +
      '<button class="btn btn-outline btn-sm" data-action="apply-rec-filter">Apply</button>' +
      '<button class="btn btn-danger-ghost btn-sm" data-action="bulk-absent">Mark overdue as absent</button>';
    const rows = list.map(ex => {
      const stat = statusOf(ex), stu = student(ex.studentId), rs = recsForExpected(ex.id), overdue = daysOverdue(ex.date);
      let action = '<button class="btn btn-outline btn-sm" data-action="show-expected" data-id="' + ex.id + '">View</button>';
      if (stat.key === 'late') action += '<button class="btn btn-success btn-sm" data-action="verify-record" data-id="' + rs[0].id + '">Confirm late</button>';
      if (stat.key === 'missing') action += '<button class="btn btn-danger-ghost btn-sm" data-action="mark-absent" data-id="' + ex.id + '">Mark absent</button>';
      if (stat.key === 'conflict') action += '<button class="btn btn-danger-ghost btn-sm" data-action="resolve-conflict" data-id="' + ex.id + '">Resolve</button>';
      return '<tr' + (stat.key === 'missing' || stat.key === 'conflict' ? ' class="alert-row"' : '') + '><td class="nowrap">' + App.esc(ex.date) + '</td><td>' + App.esc(stu.name) +
        '</td><td>' + sourceTag(ex.source) + '</td><td>' + pill(stat) + '</td><td>' + rs.length + '</td><td>' + (overdue ? overdue + 'd' : '-') + '</td><td class="nowrap">' + action + '</td></tr>';
    }).join('');
    return '<div class="toolbar">' + tabs + head + '</div>' +
      App.notice('warn', 'A backdated entry does not count until the adviser or administrator confirms it. Conflicts must be resolved before compliance is computed.') +
      App.card('School vs company reconciliation', 'Expected dates compared with recorded sources',
        '<table class="table"><thead><tr><th>Date</th><th>Student</th><th>Source</th><th>Status</th><th>Records</th><th>Overdue</th><th>Action</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function leave() {
    updateChrome();
    let list = s.leaves.slice();
    if (ui.leaveStatus === 'open') list = list.filter(l => l.status === 'Open');
    if (ui.leaveStatus === 'resolved') list = list.filter(l => l.status === 'Resolved');
    if (isStudent()) list = list.filter(l => l.studentId === ME());
    list.sort((a, b) => b.date.localeCompare(a.date));
    const tabs = App.tabs('leaveStatus', [
      { value: 'all', label: 'All', count: s.leaves.length },
      { value: 'open', label: 'Open', count: s.leaves.filter(l => l.status === 'Open').length },
      { value: 'resolved', label: 'Resolved', count: s.leaves.filter(l => l.status === 'Resolved').length }
    ], ui.leaveStatus);
    const rows = list.map(l => {
      const stu = student(l.studentId);
      const actions = isStaff() && l.status === 'Open'
        ? '<button class="btn btn-success btn-sm" data-action="leave-decision-prompt" data-id="' + l.id + '">Decide</button>'
        : (!isStaff() && l.studentId === ME() && l.status === 'Open'
          ? '<button class="btn btn-outline btn-sm" data-action="edit-leave" data-id="' + l.id + '">Edit</button> <button class="btn btn-danger-ghost btn-sm" data-action="withdraw-leave" data-id="' + l.id + '">Withdraw</button>'
          : (l.outcome ? '<span class="pill ' + (l.outcome === 'Approved' ? 'ok' : 'absent') + '">' + App.esc(l.outcome) + '</span>' : '<span class="small muted">Awaiting decision</span>'));
      return '<div class="list-row"><span class="activity-icon">' + App.icon('send') + '</span><div class="list-main"><strong>' + App.esc(stu.name) + ' · ' + App.esc(l.date) +
        '</strong><div class="meta"><span>' + sourceTag(l.source) + '</span><span>' + App.icon('calendar') + 'Affected date</span>' +
        (l.decidedBy ? '<span>By ' + App.esc(l.decidedBy) + '</span>' : '') + '</div>' +
        '<div class="small muted" style="margin-top:5px">' + App.esc(l.reason) + (l.decisionNote ? ' · Decision: ' + App.esc(l.decisionNote) : '') + '</div></div>' +
        '<span class="pill ' + (l.status === 'Open' ? 'late' : 'ok') + '">' + App.esc(l.status) + '</span><div class="list-actions">' + actions + '</div></div>';
    }).join('');
    return '<div class="toolbar">' + tabs + '<button class="btn btn-primary btn-sm" data-action="leave-new">' + App.icon('plus') + ' File leave</button></div>' +
      App.notice('info', 'Work-date leave is approved by the Adviser or Admin. Supervisor approval is reserved for Phase 2.') +
      App.card('Leave and exceptions', 'Each request names the affected date and source, and closes with a decision', rows || App.empty('No leave requests', 'Adjust the filter above.'));
  }

  function compliance() {
    updateChrome();
    if (isStudent()) {
      const st = student(ME()), c = complianceFor(st);
      const detail = '<div class="kv-grid"><div class="kv-item"><small>Required school days</small><strong>' + st.requiredSchoolDays + '</strong></div>' +
        '<div class="kv-item"><small>Verified school days</small><strong>' + c.school + '</strong></div>' +
        '<div class="kv-item"><small>Required OJT hours</small><strong>' + st.requiredOjtHours + ' h</strong></div>' +
        '<div class="kv-item"><small>Verified OJT hours</small><strong>' + c.hours + ' h</strong></div>' +
        '<div class="kv-item"><small>Excused days / hours</small><strong>' + c.excSchool + ' d / ' + c.excHours + ' h</strong></div></div>';
      const bars = '<div style="margin-top:18px"><div class="small bold">School days · ' + c.schoolPct + '% (target ' + c.reqSchool + ')</div>' + bar(c.schoolPct) +
        '<div class="small bold" style="margin-top:14px">OJT hours · ' + c.ojtPct + '% (target ' + c.reqOjt + ' h)</div>' + bar(c.ojtPct) + '</div>';
      const pend = activeRecords().filter(r => r.studentId === ME() && !r.verified && r.status === 'present');
      const miss = expectedForStudent(ME()).filter(e => e.date <= TODAY() && statusOf(e).key === 'missing');
      return (c.atRisk ? App.notice('warn', 'At risk: compliance is below ' + s.settings.atRisk + '%.') : App.notice('info', 'You are above the ' + s.settings.atRisk + '% threshold.')) +
        App.card('My compliance ledger', 'Only verified records count; approved leave reduces the target', detail + bars) +
        '<div style="height:18px"></div>' + App.card('Not counted yet', 'Backdated or unverified entries',
          pend.length ? pend.map(r => '<div class="list-row"><span class="activity-icon">' + App.icon('clock') + '</span><div class="list-main"><strong>' +
            App.esc(expected(r.expectedId).label) + '</strong><div class="meta"><span>Attended ' + App.esc(r.attendanceDate) + '</span><span>Encoded ' + App.esc(r.encodedAt) +
            '</span></div></div>' + pill(statusOf(expected(r.expectedId))) + '</div>').join('') : App.empty('Nothing pending', 'All entries are counted.')) +
        '<div style="height:18px"></div>' + App.card('Missing expected days', 'No record on a school or company date',
          miss.length ? miss.map(e => '<div class="list-row"><span class="activity-icon">' + App.icon('alert') + '</span><div class="list-main"><strong>' + App.esc(e.date) + ' · ' +
            App.esc(e.label) + '</strong><div class="meta"><span>' + sourceTag(e.source) + '</span><span>' + daysOverdue(e.date) + ' days overdue</span></div></div>' +
            '<button class="btn btn-soft btn-sm" data-action="record-new" data-ex="' + e.id + '">Record</button></div>').join('')
          : App.empty('No missing days', 'All expected dates have a record.'));
    }
    const rows = s.students.map(st => {
      const c = complianceFor(st);
      return '<tr><td><strong>' + App.esc(st.name) + '</strong><div class="small muted">' + App.esc(st.company) + '</div></td>' +
        '<td>' + c.school + '/' + c.reqSchool + '</td><td>' + c.hours + '/' + c.reqOjt + 'h</td>' +
        '<td>' + c.excSchool + 'd / ' + c.excHours + 'h</td>' +
        '<td style="min-width:120px">' + bar(c.overall) + '<span class="small">' + c.overall + '%</span></td>' +
        '<td><span class="pill ' + (c.atRisk ? 'absent' : 'ok') + '">' + (c.atRisk ? 'At risk' : 'On track') + '</span></td></tr>';
    }).join('');
    return '<div class="toolbar"><button class="btn btn-outline btn-sm" data-action="export-compliance">' + App.icon('file') + ' Export compliance CSV</button></div>' +
      App.notice('info', 'Compliance uses verified records only. Approved leave reduces the target; at-risk is below ' + s.settings.atRisk + '%.') +
      App.card('Compliance ledger', 'Required vs completed school days and OJT hours, per student',
        '<table class="table"><thead><tr><th>Student</th><th>School days</th><th>OJT hours</th><th>Excused</th><th>Overall</th><th>Flag</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function reports() {
    updateChrome();
    let list = activeRecords().slice().reverse();
    if (ui.reportStudent !== 'all') list = list.filter(r => r.studentId === ui.reportStudent);
    if (ui.reportCompany !== 'all') list = list.filter(r => student(r.studentId).company === ui.reportCompany);
    if (ui.reportSource !== 'all') list = list.filter(r => r.source === ui.reportSource);
    if (ui.reportQuery) {
      const q = ui.reportQuery.toLowerCase();
      list = list.filter(r => (student(r.studentId).name + ' ' + student(r.studentId).company + ' ' + (expected(r.expectedId) || {}).label + ' ' + r.status + ' ' + r.source).toLowerCase().indexOf(q) !== -1);
    }
    const rows = list.map(r => {
      const ex = expected(r.expectedId);
      return '<tr><td class="nowrap">' + App.esc(r.attendanceDate) + '</td><td>' + App.esc(student(r.studentId).name) + '</td><td>' + App.esc(student(r.studentId).company) +
        '</td><td>' + sourceTag(r.source) + '</td><td class="nowrap">' + App.esc(r.encodedAt) + '</td><td>' +
        pill(ex ? statusOf(ex) : { key: 'neutral', label: 'Orphaned' }) + '</td></tr>';
    }).join('');
    const byCompany = s.students.map(st => { const c = complianceFor(st); return '<div class="focus-item"><span class="focus-dot" style="background:' +
      (c.atRisk ? 'var(--danger)' : 'var(--done)') + '"></span><div class="txt"><strong>' + App.esc(st.company) + '</strong><span>' + App.esc(st.name) + ' · ' + c.school +
      ' days, ' + c.hours + ' h</span></div><span class="small bold">' + c.overall + '%</span></div>'; }).join('');
    const companies = [];
    s.students.forEach(st => { if (companies.indexOf(st.company) === -1) companies.push(st.company); });
    const filters = '<form id="report-search-form" class="row" style="margin-bottom:16px"><div class="search-box"><span>' + App.icon('search') + '</span>' +
      '<input class="input" id="report-q" placeholder="Search student, company, source, status" value="' + App.esc(ui.reportQuery) + '" /></div>' +
      '<select class="select" id="report-student"><option value="all">All students</option>' + s.students.map(st => '<option value="' + st.id + '"' +
        (ui.reportStudent === st.id ? ' selected' : '') + '>' + App.esc(st.name) + '</option>').join('') + '</select>' +
      '<select class="select" id="report-company"><option value="all">All companies</option>' + companies.map(c => '<option value="' + App.esc(c) + '"' +
        (ui.reportCompany === c ? ' selected' : '') + '>' + App.esc(c) + '</option>').join('') + '</select>' +
      '<select class="select" id="report-source"><option value="all">All sources</option>' + ['school', 'company'].map(x => '<option value="' + x + '"' +
        (ui.reportSource === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>' +
      '<button class="btn btn-primary btn-sm" data-action="report-search">Search</button></form>';
    const noticeRows = s.notices.map(n => '<div class="notice ' + n.tone + '">' + App.icon(n.tone === 'warn' ? 'alert' : 'info') + '<span>' + App.esc(n.text) +
      '</span><span class="small muted">' + App.esc(n.audience) + '</span>' +
      '<button class="btn btn-danger-ghost btn-sm" data-action="delete-notice" data-id="' + n.id + '">' + App.icon('trash') + '</button></div>').join('');
    const noticeCard = App.card('Manage notices', 'Add reminders; audience controls who sees them',
      '<div class="toolbar" style="padding:12px 16px"><button class="btn btn-primary btn-sm" data-action="notice-new">' + App.icon('plus') + ' Add notice</button></div>' +
      '<div style="padding:0 16px 16px">' + (noticeRows || App.empty('No notices', 'Add one above.')) + '</div>');
    return filters +
      '<div class="toolbar"><button class="btn btn-outline btn-sm" data-action="export-report">' + App.icon('file') + ' Export report CSV</button>' +
      '<button class="btn btn-outline btn-sm" data-action="print-report">' + App.icon('file') + ' Print</button></div>' +
      App.card('Attendance report', 'Filtered records across school and company sources',
        rows ? '<table class="table"><thead><tr><th>Attended</th><th>Student</th><th>Company</th><th>Source</th><th>Encoded</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : App.empty('No matching records', 'Try a different search.')) +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('By company', 'Summary of verified progress', byCompany) + noticeCard + '</div>';
  }

  function settings() {
    updateChrome();
    const cfg = s.settings;
    const form = '<form id="settings-form"><div class="kv-grid">' +
      '<div class="field"><label for="set-today">Demo today</label><input class="input" type="date" id="set-today" value="' + App.esc(cfg.demoToday) + '" /></div>' +
      '<div class="field"><label for="set-start">Period start</label><input class="input" type="date" id="set-start" value="' + App.esc(cfg.periodStart) + '" /></div>' +
      '<div class="field"><label for="set-end">Period end</label><input class="input" type="date" id="set-end" value="' + App.esc(cfg.periodEnd) + '" /></div>' +
      '<div class="field"><label for="set-risk">At-risk threshold (%)</label><input class="input" type="number" min="1" max="100" id="set-risk" value="' + cfg.atRisk + '" /></div>' +
      '<div class="field"><label for="set-grace">Grace period (days)</label><input class="input" type="number" min="0" max="30" id="set-grace" value="' + cfg.graceDays + '" /></div>' +
      '</div><p class="field-hint">Changing the period regenerates expected dates. Records for removed dates are voided but kept in history.</p></form>';
    const backup = '<div class="kv-grid"><div class="kv-item"><small>Backup</small><strong>Export state as JSON</strong>' +
      '<button class="btn btn-outline btn-sm" style="margin-top:8px" data-action="export-backup">Download backup</button></div>' +
      '<div class="kv-item"><small>Restore</small><strong>Import saved state</strong>' +
      '<input class="input" type="file" id="import-file" accept="application/json" style="margin:8px 0" />' +
      '<button class="btn btn-outline btn-sm" data-action="import-backup">Restore from file</button></div></div>';
    return App.notice('info', 'Browser-only prototype: data is stored in localStorage. The role dropdown simulates C-01 access control; no real passwords are used.') +
      App.card('Period and thresholds', 'Used to generate expected dates and flag at-risk students', form,
        '<button class="btn btn-primary btn-sm" data-action="save-settings">Save settings</button>') +
      '<div style="height:18px"></div>' + App.card('Backup and restore', 'Port the full prototype state between browsers', backup);
  }

  /* ---------------- shared framework setup ---------------- */

  App.init({
    slug: 'dtsattendance', title: 'DTS Attendance', tagline: 'Dual Training System Attendance & Compliance',
    icon: 'scan', accent: 'teal',
    roles: ['student', 'adviser', 'admin'],
    roleLabels: { student: 'Student view', adviser: 'Adviser view', admin: 'Administrator view' },
    user: { name: 'Juan Dela Cruz', meta: '2024-00137 · BS IT', initials: 'JD' },
    progressLabel: 'Compliance',
    seed: SEED,
    viewAccess: {
      students: ['adviser', 'admin'], reconciliation: ['adviser', 'admin'],
      reports: ['adviser', 'admin'], settings: ['admin']
    },
    onRoleChange: function () {
      ui.schedStudent = 'all'; ui.attStudent = 'all'; ui.recStudent = 'all';
    },
    nav: [
      { id: 'dashboard', label: 'Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'students', label: 'Students & Rules', icon: 'users', group: 'WORKSPACE' },
      { id: 'schedule', label: 'Expected Schedule', icon: 'calendar', group: 'WORKSPACE' },
      { id: 'attendance', label: 'Attendance Records', icon: 'scan', group: 'ATTENDANCE' },
      { id: 'reconciliation', label: 'Reconciliation', icon: 'shield', group: 'ATTENDANCE' },
      { id: 'leave', label: 'Leave & Exceptions', icon: 'send', group: 'ATTENDANCE' },
      { id: 'compliance', label: 'Compliance', icon: 'chart', group: 'REPORTS' },
      { id: 'reports', label: 'Reports & Notices', icon: 'file', group: 'REPORTS' },
      { id: 'settings', label: 'System Settings', icon: 'edit', group: 'SYSTEM' }
    ],
    views: {
      dashboard: { title: 'Overview', subtitle: 'Attendance and compliance at a glance', render: dashboard },
      students: { title: 'Students & Rules', subtitle: 'Profiles, companies and per-student requirements', render: studentsView },
      schedule: { title: 'Expected Schedule', subtitle: 'Derived from school days and company work dates', render: schedule },
      attendance: { title: 'Attendance Records', subtitle: 'Capture, timestamp, verify, void and audit every entry', render: attendance },
      reconciliation: { title: 'Reconciliation', subtitle: 'School source vs company source against expected dates', render: reconciliation },
      leave: { title: 'Leave & Exceptions', subtitle: 'Requests with affected date and resolution', render: leave },
      compliance: { title: 'Compliance', subtitle: 'Required vs completed school days and OJT hours', render: compliance },
      reports: { title: 'Reports & Notices', subtitle: 'Search, export and reminders', render: reports },
      settings: { title: 'System Settings', subtitle: 'Period, thresholds and backup', render: settings }
    }
  });

  s = App.state;
  /* Migrate state saved by the earlier click-only version of this prototype. */
  if (!s.settings || !Array.isArray(s.expected) || !Array.isArray(s.students) || !s.students.length ||
      s.students.some(x => typeof x.workDayIdx !== 'number')) {
    App.reset();
  }

  /* ---------------- filters and simple actions ---------------- */

  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });
  App.on('apply-sched-filter', () => { ui.schedStudent = val('sched-student-select') || 'all'; App.refresh(); });
  App.on('apply-att-filters', () => {
    ui.attStudent = val('att-student-select') || 'all';
    ui.attSource = val('att-source-select') || 'all';
    ui.attQuery = val('att-q');
    App.refresh();
  });
  App.on('apply-rec-filter', () => { ui.recStudent = val('rec-student-select') || 'all'; App.refresh(); });
  App.on('report-search', () => {
    ui.reportQuery = val('report-q');
    ui.reportStudent = val('report-student') || 'all';
    ui.reportCompany = val('report-company') || 'all';
    ui.reportSource = val('report-source') || 'all';
    App.refresh();
  });
  App.on('notice-read', d => {
    const n = s.notices.find(x => x.id === d.id); if (!n) return;
    n.read = true; App.save(); App.refresh(); App.toast('Notice marked as read.');
  });
  App.on('export-records', () => { download('dts-attendance-records.csv', toCsv(recordRows(activeRecords())), 'text/csv'); App.toast('Records exported as CSV.'); });
  App.on('export-report', () => { download('dts-attendance-report.csv', toCsv(recordRows(activeRecords())), 'text/csv'); App.toast('Report exported as CSV.'); });
  App.on('export-compliance', () => {
    if (!needStaff()) return;
    const rows = [['Student', 'Company', 'Verified school days', 'Required school days', 'Verified OJT hours', 'Required OJT hours', 'Excused days', 'Excused hours', 'Overall %', 'Flag']];
    s.students.forEach(st => { const c = complianceFor(st); rows.push([st.name, st.company, c.school, c.reqSchool, c.hours, c.reqOjt, c.excSchool, c.excHours, c.overall, c.atRisk ? 'At risk' : 'On track']); });
    download('dts-compliance.csv', toCsv(rows), 'text/csv'); App.toast('Compliance exported as CSV.');
  });
  App.on('print-report', () => { window.print(); });
  App.on('export-backup', () => {
    if (!needAdmin()) return;
    download('dts-attendance-backup.json', JSON.stringify(s, null, 2), 'application/json');
    App.toast('Backup downloaded.');
  });
  App.on('import-backup', () => {
    if (!needAdmin()) return;
    const input = document.getElementById('import-file');
    if (!input || !input.files || !input.files[0]) return App.toast('Choose a JSON backup file first.', 'error');
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        if (!data.settings || !Array.isArray(data.students) || !Array.isArray(data.records) || !Array.isArray(data.expected)) throw new Error('invalid');
        Object.keys(s).forEach(k => delete s[k]);
        Object.assign(s, data);
        s.settings = s.settings || {};
        App.save();
        const roleEl = document.getElementById('role-select');
        if (roleEl) roleEl.value = s.role || 'student';
        App.go('settings'); App.toast('Backup restored successfully.');
      } catch (e) { App.toast('Invalid backup file.', 'error'); }
    };
    reader.readAsText(input.files[0]);
  });

  /* ---------------- attendance handlers ---------------- */

  App.on('record-new', d => {
    const scope = d && d.ex ? [expected(d.ex)].filter(Boolean) : (isStudent() ? expectedForStudent(ME()) : s.expected);
    if (!scope.length) return App.toast('No expected dates available.', 'error');
    const opts = scope.map(e => '<option value="' + e.id + '"' + (d && d.ex === e.id ? ' selected' : '') + '>' +
      App.esc(student(e.studentId).name + ' · ' + e.date + ' · ' + e.source) + '</option>').join('');
    App.modal('Record attendance', 'C-04: attendance date vs encoding time',
      '<form id="record-form"><div class="field"><label for="rec-ex">Expected date</label><select class="select" id="rec-ex" name="ex">' + opts + '</select></div>' +
      '<div class="field"><label for="rec-method">Method</label><select class="select" id="rec-method" name="method">' +
      '<option value="QR">QR scan - same day only</option><option value="Manual">Manual - allows backdated entry</option></select></div>' +
      '<div class="field"><label for="rec-note">Note (required when backdated)</label><textarea class="textarea" id="rec-note" name="note" placeholder="Why is this entry late?"></textarea></div>' +
      '<p class="field-hint">The attendance date comes from the expected date. The encoding time is recorded automatically. Backdated entries become "Pending verification".</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-record">' + App.icon('check') + ' Save entry</button>');
  });

  App.on('save-record', () => {
    const d = fd('record-form');
    const ex = expected(d.get('ex'));
    if (!need(ex, 'Select a valid expected date.')) return;
    if (!isStaff() && ex.studentId !== ME()) return App.toast('Students can only record their own attendance.', 'error');
    if (ex.date > TODAY()) return App.toast('Future dates cannot be encoded.', 'error');
    if (recsForExpected(ex.id).length) return App.toast('This date already has a record. Edit or void it instead.', 'error');
    const method = d.get('method'), backdated = ex.date !== TODAY(), note = String(d.get('note') || '').trim();
    if (method === 'QR' && backdated) return App.toast('QR scan is only for same-day check-in. Use Manual for backdated entries.', 'error');
    if (backdated && !note) return App.toast('A reason is required for a backdated entry.', 'error');
    const at = stampNow();
    const rec = {
      id: App.uid('r'), studentId: ex.studentId, expectedId: ex.id, source: ex.source,
      attendanceDate: ex.date, encodedAt: at, status: 'present', backdated: backdated,
      verified: !backdated, method: method, hours: ex.hours, note: note,
      history: [{ at: at, by: actor(), action: backdated ? 'Backdated entry recorded - pending verification' : 'Created by ' + (method === 'QR' ? 'QR check-in' : 'manual entry') }]
    };
    s.records.push(rec);
    log('Attendance recorded for ' + student(ex.studentId).name + ' (' + ex.date + ')', 'attendance');
    App.save(); App.closeModal(); App.refresh();
    App.toast(backdated ? 'Backdated entry saved. Waiting for verification.' : 'Check-in recorded and verified.');
  });

  App.on('verify-record', d => {
    if (!needStaff()) return;
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    r.verified = true;
    addHistory(r, 'Entry verified and counted', actor());
    log('Verified attendance entry for ' + student(r.studentId).name, 'attendance');
    App.save(); App.refresh(); App.toast('Entry verified and now counted in compliance.');
  });

  App.on('unverify-record', d => {
    if (!needStaff()) return;
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    r.verified = false;
    addHistory(r, 'Verification removed', actor());
    App.save(); App.refresh(); App.toast('Verification removed. Entry is no longer counted.');
  });

  App.on('void-record', d => {
    if (!needStaff()) return;
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    App.modal('Void this record?', 'Attended ' + r.attendanceDate + ' · ' + student(r.studentId).name,
      '<form id="void-form"><div class="field"><label for="void-reason">Reason for voiding</label><textarea class="textarea" id="void-reason" name="reason" required></textarea></div>' +
      '<p class="field-hint">The record stays in the audit trail with its full history.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="save-void" data-id="' + r.id + '">Void record</button>');
  });

  App.on('save-void', d => {
    if (!needStaff()) return;
    const r = s.records.find(x => x.id === d.id), reason = val('void-reason');
    if (!r || !need(reason, 'A reason is required.')) return;
    addHistory(r, 'Voided: ' + reason, actor());
    r.status = 'void';
    log('Attendance record voided for ' + student(r.studentId).name, 'attendance');
    App.save(); App.closeModal(); App.refresh(); App.toast('Record voided. History retained.');
  });

  App.on('edit-record', d => {
    if (!needStaff()) return;
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    App.modal('Edit attendance record', 'Attended ' + r.attendanceDate + ' · encoded ' + r.encodedAt,
      '<form id="edit-record-form"><div class="field"><label for="er-status">Outcome</label><select class="select" id="er-status" name="status">' +
      ['present', 'absent', 'excused'].map(x => '<option value="' + x + '"' + (r.status === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="er-hours">OJT hours</label><input class="input" type="number" min="0" max="24" step="0.5" id="er-hours" name="hours" value="' + Number(r.hours || 0) + '" /></div>' +
      '<div class="field"><label for="er-note">Note / correction reason</label><textarea class="textarea" id="er-note" name="note" required>' + App.esc(r.note) + '</textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-edit-record" data-id="' + r.id + '">Save correction</button>');
  });

  App.on('save-edit-record', d => {
    if (!needStaff()) return;
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    const f = fd('edit-record-form'), note = String(f.get('note') || '').trim(), hours = Number(f.get('hours'));
    if (!need(note, 'A correction reason is required.')) return;
    if (!need(hours >= 0 && hours <= 24, 'Hours must be between 0 and 24.')) return;
    const changes = [];
    if (r.status !== f.get('status')) { changes.push('status ' + r.status + ' -> ' + f.get('status')); r.status = f.get('status'); }
    if (Number(r.hours || 0) !== hours) { changes.push('hours ' + r.hours + ' -> ' + hours); r.hours = hours; }
    if (r.note !== note) { changes.push('note updated'); r.note = note; }
    addHistory(r, 'Correction: ' + (changes.length ? changes.join('; ') : 'no field changed'), actor());
    App.save(); App.closeModal(); App.refresh(); App.toast('Correction saved with audit history.');
  });

  App.on('mark-absent', d => {
    if (!needStaff()) return;
    const ex = expected(d.id); if (!ex) return;
    App.modal('Mark expected day absent', ex.date + ' · ' + student(ex.studentId).name,
      '<form id="absent-form"><div class="field"><label for="absent-reason">Reason</label><textarea class="textarea" id="absent-reason" name="reason" required></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="save-mark-absent" data-id="' + ex.id + '">Mark absent</button>');
  });

  App.on('save-mark-absent', d => {
    if (!needStaff()) return;
    const ex = expected(d.id), reason = val('absent-reason');
    if (!ex || !need(reason, 'A reason is required.')) return;
    if (recsForExpected(ex.id).length) return App.toast('This date already has a record.', 'error');
    const at = stampNow();
    s.records.push({ id: App.uid('r'), studentId: ex.studentId, expectedId: ex.id, source: ex.source,
      attendanceDate: ex.date, encodedAt: at, status: 'absent', backdated: false, verified: true, method: 'Manual',
      hours: 0, note: reason, history: [{ at: at, by: actor(), action: 'Marked absent: ' + reason }] });
    log('Marked absent: ' + student(ex.studentId).name + ' on ' + ex.date, 'attendance');
    App.save(); App.closeModal(); App.refresh(); App.toast('Expected day marked absent.');
  });

  App.on('resolve-conflict', d => {
    if (!needStaff()) return;
    const rs = recsForExpected(d.id); if (rs.length < 2) return;
    const ex = expected(d.id);
    const opts = rs.map((r, i) => '<label class="detail" style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">' +
      '<input type="radio" name="keep" value="' + r.id + '"' + (i === 0 ? ' checked' : '') + ' /> <span><strong>' + App.esc(r.source) + ' · ' + App.esc(r.status) +
      '</strong><br><small>Encoded ' + App.esc(r.encodedAt) + ' · ' + App.esc(r.note || 'no note') + '</small></span></label>').join('');
    App.modal('Resolve conflicting records', ex.date + ' · ' + student(ex.studentId).name,
      '<p class="small muted">Choose the record to keep. The others are voided but remain in the audit trail.</p>' + opts,
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="save-resolve-conflict" data-id="' + ex.id + '">Keep selected</button>');
  });

  App.on('save-resolve-conflict', d => {
    if (!needStaff()) return;
    const rs = recsForExpected(d.id), checked = document.querySelector('input[name="keep"]:checked');
    const keepId = checked && checked.value ? checked.value : (rs[0] || {}).id;
    const keep = rs.find(r => r.id === keepId);
    if (!rs.length || !keep) return;
    if (keep.status === 'present' && keep.verified) { /* already countable */ }
    else { keep.verified = true; addHistory(keep, 'Kept as correct record during conflict resolution', actor()); }
    rs.filter(r => r.id !== keep.id).forEach(r => { addHistory(r, 'Voided during conflict resolution', actor()); r.status = 'void'; });
    log('Conflict resolved for ' + expected(d.id).date, 'attendance');
    App.save(); App.closeModal(); App.refresh(); App.toast('Conflict resolved. Voided records remain in history.');
  });

  App.on('bulk-absent', d => {
    if (!needStaff()) return;
    const list = s.expected.filter(e => statusOf(e).key === 'missing' && daysOverdue(e.date) > 0);
    if (!list.length) return App.toast('No overdue missing days to mark.', 'error');
    App.modal('Mark ' + list.length + ' overdue days absent?', 'All missing expected dates before today will be marked absent',
      '<p class="small muted">Each record keeps a reason and audit entry. Open leave requests are not affected.</p>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="confirm-bulk-absent">Mark all absent</button>');
  });

  App.on('confirm-bulk-absent', () => {
    if (!needStaff()) return;
    const list = s.expected.filter(e => statusOf(e).key === 'missing' && daysOverdue(e.date) > 0);
    list.forEach(ex => {
      const at = stampNow();
      s.records.push({ id: App.uid('r'), studentId: ex.studentId, expectedId: ex.id, source: ex.source,
        attendanceDate: ex.date, encodedAt: at, status: 'absent', backdated: false, verified: true, method: 'Manual',
        hours: 0, note: 'Bulk marked absent after grace period.', history: [{ at: at, by: actor(), action: 'Bulk marked absent after grace period' }] });
    });
    log(list.length + ' overdue days marked absent', 'attendance');
    App.save(); App.closeModal(); App.refresh(); App.toast(list.length + ' days marked absent.');
  });

  App.on('show-expected', d => {
    const ex = expected(d.id); if (!ex) return;
    const rs = recsForExpected(ex.id);
    const body = '<dl class="kv"><dt>Student</dt><dd>' + App.esc(student(ex.studentId).name) + '</dd><dt>Expected date</dt><dd>' + App.esc(ex.date) +
      '</dd><dt>Source</dt><dd>' + App.esc(ex.source) + '</dd><dt>Time / hours</dt><dd>' + App.esc(ex.time) + (ex.hours ? ' · ' + ex.hours + ' h' : '') +
      '</dd><dt>Status</dt><dd>' + pill(statusOf(ex)) + '</dd><dt>Records</dt><dd>' + rs.length + '</dd><dt>Overdue</dt><dd>' + daysOverdue(ex.date) + ' day(s)</dd></dl>' +
      (rs.length ? '<div style="margin-top:14px">' + rs.map(r => '<div class="detail" style="margin-bottom:8px"><small>' + App.esc(r.source) + ' · encoded ' + App.esc(r.encodedAt) +
        '</small><strong>' + App.esc(r.status) + (r.verified ? ' · verified' : ' · not verified') + '</strong></div>').join('') + '</div>'
        : App.empty('No records', 'This expected day has no attendance entry.'));
    App.modal('Expected day details', ex.label, body, '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });

  App.on('show-history', d => {
    const r = s.records.find(x => x.id === d.id); if (!r) return;
    const items = (r.history || []).map(h => '<li><div><strong>' + App.esc(h.action) + '</strong><small>' + App.esc(h.by) + ' · ' + App.esc(h.at) + '</small></div></li>').join('');
    App.modal('Record audit trail', 'Attended ' + r.attendanceDate + ' · encoded ' + r.encodedAt,
      '<div class="kv-grid"><div class="kv-item"><small>Source</small><strong>' + App.esc(r.source) + '</strong></div>' +
      '<div class="kv-item"><small>Method</small><strong>' + App.esc(r.method) + '</strong></div>' +
      '<div class="kv-item"><small>Status</small><strong>' + App.esc(r.status) + '</strong></div></div>' +
      '<ul class="timeline" style="margin-top:16px">' + items + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });

  /* ---------------- leave handlers ---------------- */

  App.on('leave-new', () => {
    const opts = (isStaff() ? s.students : [student(ME())]).map(st => '<option value="' + st.id + '">' + App.esc(st.name) + '</option>').join('');
    App.modal('File leave / exception', 'C-06: name the affected date and source',
      '<form id="leave-form"><div class="field"><label for="lv-student">Student</label><select class="select" id="lv-student" name="student">' + opts + '</select></div>' +
      '<div class="field"><label for="lv-date">Affected date</label><input class="input" type="date" id="lv-date" name="date" value="' + TODAY() + '" required /></div>' +
      '<div class="field"><label for="lv-source">Source</label><select class="select" id="lv-source" name="source"><option value="school">School day</option><option value="company">Company work day</option></select></div>' +
      '<div class="field"><label for="lv-reason">Reason</label><textarea class="textarea" id="lv-reason" name="reason" required></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-leave">Submit request</button>');
  });

  App.on('save-leave', () => {
    const d = fd('leave-form');
    if (!isStaff() && d.get('student') !== ME()) return App.toast('Students can only file for themselves.', 'error');
    if (!need(d.get('date'), 'Choose an affected date.')) return;
    if (!need(String(d.get('reason') || '').trim(), 'A reason is required.')) return;
    if (!s.expected.some(e => e.studentId === d.get('student') && e.date === d.get('date') && e.source === d.get('source'))) {
      return App.toast('There is no expected ' + d.get('source') + ' date for this student on ' + d.get('date') + '.', 'error');
    }
    if (s.leaves.some(l => l.studentId === d.get('student') && l.date === d.get('date') && l.source === d.get('source') && l.status === 'Open')) {
      return App.toast('An open leave already exists for that date.', 'error');
    }
    s.leaves.unshift({ id: App.uid('lv'), studentId: d.get('student'), date: d.get('date'), source: d.get('source'),
      reason: String(d.get('reason')).trim(), status: 'Open', outcome: '', decisionNote: '', decidedBy: '' });
    log('Leave request filed for ' + d.get('date'), 'leave');
    App.save(); App.closeModal(); App.refresh(); App.toast('Leave request submitted as Open.');
  });

  App.on('edit-leave', d => {
    const l = s.leaves.find(x => x.id === d.id); if (!l) return;
    if (!isStaff() && l.studentId !== ME()) return App.toast('Not your request.', 'error');
    App.modal('Edit leave request', 'Affected date ' + l.date,
      '<form id="edit-leave-form"><div class="field"><label for="el-date">Affected date</label><input class="input" type="date" id="el-date" name="date" value="' + l.date + '" required /></div>' +
      '<div class="field"><label for="el-reason">Reason</label><textarea class="textarea" id="el-reason" name="reason" required>' + App.esc(l.reason) + '</textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-edit-leave" data-id="' + l.id + '">Save changes</button>');
  });

  App.on('save-edit-leave', d => {
    const l = s.leaves.find(x => x.id === d.id), f = fd('edit-leave-form');
    if (!l || !need(String(f.get('reason') || '').trim(), 'A reason is required.')) return;
    l.date = f.get('date'); l.reason = String(f.get('reason')).trim();
    App.save(); App.closeModal(); App.refresh(); App.toast('Leave request updated.');
  });

  App.on('withdraw-leave', d => {
    const l = s.leaves.find(x => x.id === d.id); if (!l) return;
    if (!isStaff() && l.studentId !== ME()) return App.toast('Not your request.', 'error');
    App.modal('Withdraw this leave request?', l.date + ' · ' + student(l.studentId).name,
      '<p class="small muted">The request is removed. No attendance record is created.</p>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="confirm-withdraw-leave" data-id="' + l.id + '">Withdraw</button>');
  });

  App.on('confirm-withdraw-leave', d => {
    const i = s.leaves.findIndex(x => x.id === d.id); if (i === -1) return;
    s.leaves.splice(i, 1);
    App.save(); App.closeModal(); App.refresh(); App.toast('Leave request withdrawn.');
  });

  App.on('leave-decision-prompt', d => {
    if (!needStaff()) return;
    const l = s.leaves.find(x => x.id === d.id); if (!l) return;
    App.modal('Decide leave request', student(l.studentId).name + ' · ' + l.date + ' · ' + l.source,
      '<form id="decision-form"><div class="field"><label for="dc-outcome">Decision</label><select class="select" id="dc-outcome" name="outcome">' +
      '<option value="Approved">Approve</option><option value="Rejected">Reject</option></select></div>' +
      '<div class="field"><label for="dc-note">Decision note (required when rejecting)</label><textarea class="textarea" id="dc-note" name="note"></textarea></div>' +
      '<p class="field-hint">Approval marks the affected expected date as Excused when no record exists yet.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-leave-decision" data-id="' + l.id + '">Save decision</button>');
  });

  App.on('save-leave-decision', d => {
    if (!needStaff()) return;
    const l = s.leaves.find(x => x.id === d.id), f = fd('decision-form');
    if (!l || l.status !== 'Open') return;
    const outcome = f.get('outcome'), note = String(f.get('note') || '').trim();
    if (outcome === 'Rejected' && !note) return App.toast('A note is required when rejecting.', 'error');
    l.status = 'Resolved'; l.outcome = outcome; l.decisionNote = note; l.decidedBy = actor();
    if (outcome === 'Approved') {
      const ex = s.expected.find(e => e.studentId === l.studentId && e.date === l.date && e.source === l.source);
      if (ex && !recsForExpected(ex.id).length) {
        const at = stampNow();
        s.records.push({ id: App.uid('r'), studentId: l.studentId, expectedId: ex.id, source: ex.source,
          attendanceDate: ex.date, encodedAt: at, status: 'excused', backdated: false, verified: true, method: 'Manual',
          hours: 0, note: 'Approved leave: ' + l.reason, history: [{ at: at, by: actor(), action: 'Approved leave - marked excused' }] });
      }
    }
    log('Leave ' + String(outcome).toLowerCase() + ' for ' + student(l.studentId).name, 'leave');
    App.save(); App.closeModal(); App.refresh(); App.toast('Leave request marked ' + outcome + '.');
  });

  /* ---------------- student and settings handlers ---------------- */

  App.on('student-new', () => studentForm(null));
  App.on('edit-student', d => studentForm(d.id));
  function studentForm(id) {
    if (!needAdmin()) return;
    const st = id ? student(id) : null;
    const days = DAY_NAMES.map((n, i) => '<option value="' + i + '"' + (st && st.schoolDayIdx === i ? ' selected' : '') + '>' + n + '</option>').join('');
    const checks = DAY_NAMES.map((n, i) => '<label style="display:inline-flex;gap:4px;align-items:center;margin-right:10px;font-size:12px">' +
      '<input type="checkbox" name="workDays" value="' + i + '"' + (st && (st.workDays || []).indexOf(i) !== -1 ? ' checked' : '') + ' /> ' + n.slice(0, 3) + '</label>').join('');
    App.modal(st ? 'Edit student profile' : 'Add student', 'C-02 and C-03',
      '<form id="student-form"><div class="row"><div class="field" style="flex:1"><label for="sf-name">Full name</label><input class="input" id="sf-name" name="name" value="' + App.esc(st ? st.name : '') + '" required /></div>' +
      '<div class="field" style="flex:1"><label for="sf-program">Program</label><input class="input" id="sf-program" name="program" value="' + App.esc(st ? st.program : '') + '" required /></div></div>' +
      '<div class="field"><label for="sf-school">School day</label><select class="select" id="sf-school" name="school">' + days + '</select></div>' +
      '<div class="row"><div class="field" style="flex:1"><label for="sf-company">Assigned company</label><input class="input" id="sf-company" name="company" value="' + App.esc(st ? st.company : '') + '" required /></div>' +
      '<div class="field" style="flex:1"><label for="sf-supervisor">Supervisor contact (Phase 2)</label><input class="input" id="sf-supervisor" name="supervisor" value="' + App.esc(st ? st.supervisor : '') + '" /></div></div>' +
      '<div class="field"><label>Company work days</label><div>' + checks + '</div></div>' +
      '<div class="row"><div class="field" style="flex:1"><label for="sf-time">Work time</label><input class="input" id="sf-time" name="workTime" value="' + App.esc(st ? st.workTime : '08:00-17:00') + '" required /></div>' +
      '<div class="field" style="flex:1"><label for="sf-hours">Hours per work day</label><input class="input" type="number" min="1" max="24" step="0.5" id="sf-hours" name="workHours" value="' + (st ? st.workHours : 8) + '" /></div></div>' +
      '<div class="row"><div class="field" style="flex:1"><label for="sf-reqdays">Required school days</label><input class="input" type="number" min="1" id="sf-reqdays" name="requiredSchoolDays" value="' + (st ? st.requiredSchoolDays : 8) + '" /></div>' +
      '<div class="field" style="flex:1"><label for="sf-reqhours">Required OJT hours</label><input class="input" type="number" min="1" id="sf-reqhours" name="requiredOjtHours" value="' + (st ? st.requiredOjtHours : 60) + '" /></div></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-student" data-id="' + (st ? st.id : '') + '">Save student</button>', true);
  }

  App.on('save-student', d => {
    if (!needAdmin()) return;
    const f = fd('student-form');
    const name = String(f.get('name') || '').trim(), program = String(f.get('program') || '').trim(), company = String(f.get('company') || '').trim();
    const wd = f.getAll('workDays').map(Number);
    const wh = Number(f.get('workHours')), rd = Number(f.get('requiredSchoolDays')), rh = Number(f.get('requiredOjtHours'));
    if (!need(name && program && company, 'Name, program and company are required.')) return;
    if (!need(wd.length > 0, 'Select at least one company work day.')) return;
    if (!need(wh > 0 && wh <= 24 && rd > 0 && rh > 0, 'Check the numeric fields.')) return;
    let st = d.id ? s.students.find(x => x.id === d.id) : null;
    if (!st) { st = { id: App.uid('st') }; s.students.push(st); }
    st.name = name; st.program = program; st.company = company;
    st.supervisor = String(f.get('supervisor') || '').trim();
    st.schoolDayIdx = Number(f.get('school'));
    st.workDays = wd.sort((a, b) => a - b);
    st.workTime = String(f.get('workTime') || '').trim();
    st.workHours = wh; st.requiredSchoolDays = rd; st.requiredOjtHours = rh;
    st.initials = name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
    rebuildExpected();
    log((d.id ? 'Updated' : 'Added') + ' student profile: ' + st.name, 'schedule');
    App.save(); App.closeModal(); App.refresh(); App.toast(d.id ? 'Profile and rule updated. Calendar regenerated.' : 'Student added. Calendar generated.');
  });

  App.on('delete-student', d => {
    if (!needAdmin()) return;
    const st = student(d.id);
    App.modal('Delete ' + st.name + '?', 'Their expected dates will be removed',
      '<p class="small muted">Their attendance records will be voided but kept in the audit trail. Leave requests remain for reference.</p>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="confirm-delete-student" data-id="' + st.id + '">Delete student</button>');
  });

  App.on('confirm-delete-student', d => {
    if (!needAdmin()) return;
    if (s.students.length <= 1) return App.toast('At least one student must remain.', 'error');
    const i = s.students.findIndex(x => x.id === d.id); if (i === -1) return;
    const name = s.students[i].name;
    s.students.splice(i, 1);
    rebuildExpected();
    log('Deleted student profile: ' + name, 'schedule');
    App.save(); App.closeModal(); App.refresh(); App.toast('Student deleted. Their records were voided and retained.');
  });

  App.on('regen-expected', () => {
    if (!needStaff()) return;
    const before = s.expected.length;
    rebuildExpected();
    log('Expected calendar regenerated', 'schedule');
    App.save(); App.refresh();
    App.toast('Calendar regenerated: ' + before + ' -> ' + s.expected.length + ' expected dates.');
  });

  App.on('save-settings', () => {
    if (!needAdmin()) return;
    const today = val('set-today'), start = val('set-start'), end = val('set-end');
    const risk = Number(val('set-risk')), grace = Number(val('set-grace'));
    if (!need(today && start && end, 'Fill in all dates.')) return;
    if (!need(start <= end, 'Period start must be on or before period end.')) return;
    if (!need(risk >= 1 && risk <= 100, 'Threshold must be 1-100.')) return;
    if (!need(grace >= 0 && grace <= 30, 'Grace period must be 0-30 days.')) return;
    s.settings.demoToday = today; s.settings.periodStart = start; s.settings.periodEnd = end;
    s.settings.atRisk = risk; s.settings.graceDays = grace;
    rebuildExpected();
    log('System settings updated', 'schedule');
    App.save(); App.refresh(); App.toast('Settings saved and expected dates regenerated.');
  });

  /* ---------------- notices ---------------- */

  App.on('notice-new', () => {
    if (!needStaff()) return;
    App.modal('Add notice', 'Reminder shown on the overview',
      '<form id="notice-form"><div class="field"><label for="nt-tone">Tone</label><select class="select" id="nt-tone" name="tone"><option value="info">Info</option><option value="warn">Warning</option></select></div>' +
      '<div class="field"><label for="nt-audience">Audience</label><select class="select" id="nt-audience" name="audience"><option value="all">All users</option><option value="student">Students only</option><option value="staff">Adviser and Admin</option></select></div>' +
      '<div class="field"><label for="nt-text">Message</label><textarea class="textarea" id="nt-text" name="text" required></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-notice">Add notice</button>');
  });

  App.on('save-notice', () => {
    if (!needStaff()) return;
    const f = fd('notice-form'), text = String(f.get('text') || '').trim();
    if (!need(text, 'A message is required.')) return;
    s.notices.unshift({ id: App.uid('nt'), tone: f.get('tone'), audience: f.get('audience'), text: text, read: false, created: TODAY() });
    log('Notice added: ' + text.slice(0, 40), 'notice');
    App.save(); App.closeModal(); App.refresh(); App.toast('Notice added.');
  });

  App.on('delete-notice', d => {
    if (!needStaff()) return;
    App.modal('Delete this notice?', 'It will disappear for its audience',
      '<p class="small muted">This cannot be undone without restoring a backup.</p>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="confirm-delete-notice" data-id="' + d.id + '">Delete notice</button>');
  });

  App.on('confirm-delete-notice', d => {
    if (!needStaff()) return;
    const i = s.notices.findIndex(x => x.id === d.id); if (i === -1) return;
    s.notices.splice(i, 1);
    App.save(); App.closeModal(); App.refresh(); App.toast('Notice deleted.');
  });

  App.go('dashboard');
})();
