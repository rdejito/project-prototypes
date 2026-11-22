/* ScholarGuard prototype — trust through timestamped, access-controlled proof. */
(function () {
  let s; // assigned immediately after App.init()
  const me = 'Ana Reyes';
  const ui = { quizId: null, quizDeadline: 0, auditFilter: 'all', noticeFilter: 'all' };
  const isStudent = () => s.role === 'student';
  const canStaff = () => s.role === 'staff' || s.role === 'admin';
  const isAuditor = () => s.role === 'auditor';
  const roleName = () => ({ student: 'Student', staff: 'Service Staff', admin: 'Administrator', auditor: 'Auditor' }[s.role] || s.role || 'Guest');
  const pad = n => String(n).padStart(2, '0');
  const scope = (list, field) => isStudent() ? list.filter(x => x[field] === me) : list.slice();

  function addNotice(kind, text, owner, key) {
    s.notices = s.notices || [];
    if (key && s.notices.some(n => n.key === key)) return;
    s.notices.unshift({ id: App.uid('nt'), kind, text, owner: owner || 'all', at: App.stamp(), read: false, key: key || '' });
    s.notices = s.notices.slice(0, 24);
  }
  function log(text, module) { App.activity(text, module); }
  function visibleNotices() { return (s.notices || []).filter(n => !isStudent() || n.owner === me || n.owner === 'all'); }
  function proofList(entries) {
    if (!entries || !entries.length) return App.empty('No proof entries yet', 'Actions on this record are logged here.');
    return '<ul class="timeline">' + entries.map(e => '<li><div><strong>' + App.esc(e.action) + '</strong>' +
      '<small>' + App.esc(e.actor || 'System') + ' · ' + App.esc(e.at || '') + '</small>' +
      (e.detail ? '<div class="tiny muted">' + App.esc(e.detail) + '</div>' : '') + '</div></li>').join('') + '</ul>';
  }
  function proofModal(title, subtitle, entries) {
    App.modal(title, subtitle, proofList(entries), '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  }
  function accessNotice(module) {
    return App.notice('info', isStudent()
      ? '<strong>Access control:</strong> students can view only their own ' + module + ' records. Every entry is timestamped and retained.'
      : isAuditor()
        ? '<strong>Auditor mode:</strong> authorized records are visible read-only; every status change remains in the audit trail.'
        : '<strong>Authorized staff view:</strong> ' + App.esc(roleName()) + ' can review records, and each change is attributed with an actor and timestamp.');
  }
  function noticeCenter(limit) {
    const list = visibleNotices().slice(0, limit || 5);
    return App.card('Escalation & resolution notices', 'In-app proof notices — no external email needed',
      '<div style="padding:16px">' + (list.length ? '<div class="notice-stack">' + list.map(n =>
        '<div class="notice info">' + App.icon('shield') + '<span><strong>' + App.esc(n.text) + '</strong><br><span class="tiny muted">' + App.esc(n.at) + '</span></span></div>').join('') + '</div>'
        : App.empty('No notices', 'Audit events appear here.')) +
      '<div style="margin-top:12px"><button class="btn btn-outline btn-sm" data-action="mark-read">' + App.icon('check') + ' Mark all read</button></div></div>');
  }
  function hero(stats) {
    return '<div class="hero"><div class="hero-top"><div><h2>Proof for everything you do.</h2>' +
      '<p>Every claim, duty, token, quiz answer, payment, and concern leaves a timestamped record. Your effort is provable, private, and fair.</p></div>' +
      '<div class="hero-ring"><div class="ring" style="--ring:100%"><div class="ring-inner">' + App.icon('shield') + '</div></div><small>Verified</small></div></div>' +
      '<div class="hero-stats">' + stats.map(x => '<div class="hero-stat"><strong>' + x.value + '</strong><span>' + App.esc(x.label) + '</span></div>').join('') + '</div></div>';
  }

  /* ---------- Dashboard ---------- */
  function proofCounts() {
    const sum = (arr, key) => (arr || []).reduce((n, x) => n + ((x[key] || []).length), 0);
    return [
      { label: 'Claim events', value: sum(s.claims, 'history') },
      { label: 'Duty proof', value: sum(s.duties, 'history') },
      { label: 'Token events', value: sum(s.tokens, 'history') },
      { label: 'Quiz attempts', value: s.attempts.length },
      { label: 'Payments', value: sum(s.obligations, 'history') },
      { label: 'Audit entries', value: sum(s.concerns, 'audit') }
    ];
  }
  function dashboard() {
    const counts = proofCounts();
    const totalEvents = counts.reduce((n, c) => n + c.value, 0);
    const aging = s.concerns.filter(c => c.status !== 'resolved' && App.daysSince(c.created) > 3).length;
    const bars = (() => {
      const max = Math.max(1, ...counts.map(c => c.value));
      return '<div class="analytics-grid">' + counts.map(c => '<div class="card" style="padding:14px"><div class="bar-row"><span>' + App.esc(c.label) +
        '</span><div class="bar-bg"><div style="width:' + Math.round(c.value / max * 100) + '%"></div></div><strong>' + c.value + '</strong></div></div>').join('') + '</div>';
    })();
    const recent = (s.activity || []).slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('shield') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
    return hero([
      { value: totalEvents, label: 'Proof events' },
      { value: s.duties.filter(d => d.status === 'verified').length, label: 'Verified duties' },
      { value: s.tokens.length, label: 'Fair tokens' },
      { value: aging, label: 'Aging concerns' }
    ]) + accessNotice('account') +
      '<h2 class="section-title">' + App.icon('chart') + ' Proof by module</h2>' + bars +
      '<div class="dash-bottom" style="margin-top:18px">' + noticeCenter(4) + App.card('Recently recorded', 'Every entry is attributable', recent || App.empty('No activity', 'Actions will appear here.')) + '</div>' +
      '<div style="margin-top:18px">' + App.card('Trust principles', 'How ScholarGuard protects students',
        '<div class="hub-grid">' + [
          ['Immutable-style history', 'Claim and duty records keep every status change; nothing is silently rewritten.'],
          ['Attribution', 'Each submission and verification stores the actor and timestamp.'],
          ['Least privilege', 'Students see only their own claims, balances, and history.'],
          ['Consistent grading', 'Answers are graded by one rule set, including auto-submitted expired attempts.']
        ].map(x => '<div class="hub-card"><span class="tag">Principle</span><h3 style="margin:0;font-size:14px">' + x[0] + '</h3><p>' + x[1] + '</p></div>').join('') + '</div>') + '</div>';
  }

  /* ---------- Verified Claim Log ---------- */
  function claimRow(c) {
    const mine = c.owner === me;
    return '<tr><td>' + App.esc(c.code) + '</td><td>' + App.esc(c.item) + '</td><td>' + App.esc(c.owner) + '</td><td>' + App.esc(c.location) + '</td>' +
      '<td>' + App.badge(c.status) + '</td><td>' + App.esc(c.claimedAt || '—') + '</td><td>' + (c.history || []).length + '</td>' +
      '<td><div class="row" style="gap:5px"><button class="btn btn-outline btn-sm" data-action="claim-proof" data-id="' + c.id + '">Proof</button>' +
      (mine && c.status === 'ready' && !isAuditor() ? '<button class="btn btn-success btn-sm" data-action="claim-item" data-id="' + c.id + '">Claim</button>' : '') + '</div></td></tr>';
  }
  function claims() {
    const list = scope(s.claims, 'owner');
    return accessNotice('item') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Records in scope</span><strong>' + list.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Ready</span><strong>' + list.filter(c => c.status === 'ready').length + '</strong></div>' +
      '<div class="card stat-card good"><span>With claim proof</span><strong>' + list.filter(c => c.status === 'claimed').length + '</strong></div></div>' +
      '<div class="toolbar"><span class="small muted">Claim events are appended — never overwritten.</span>' +
      (canStaff() ? '<button class="btn btn-primary btn-sm" data-action="new-claim">' + App.icon('plus') + ' Register item</button>' : '') + '</div>' +
      App.card('Verified claim log', 'Timestamped claiming history with restricted access',
        list.length ? '<table class="table"><thead><tr><th>Code</th><th>Item</th><th>Owner</th><th>Location</th><th>Status</th><th>Claimed at</th><th>Proof</th><th></th></tr></thead><tbody>' + list.map(claimRow).join('') + '</tbody></table>'
          : App.empty('No claim records', 'Authorized records will appear here.'));
  }

  /* ---------- Duty Proof Board ---------- */
  function dutyRow(d) {
    const mine = d.assignedTo === me;
    return '<div class="list-row"><span class="activity-icon">' + App.icon('broom') + '</span><div class="list-main"><strong>' + App.esc(d.task) + '</strong>' +
      '<div class="meta"><span>' + App.icon('map') + App.esc(d.room) + '</span><span>' + App.icon('calendar') + App.esc(d.date) + '</span><span>' + App.icon('user') + App.esc(d.assignedTo) + '</span>' + App.ageChip(d.date) + '</div>' +
      (d.evidence ? '<div class="small muted" style="margin-top:5px">Evidence: “' + App.esc(d.evidence) + '”</div>' : '') +
      (d.submittedAt ? '<div class="tiny muted">Submitted ' + App.esc(d.submittedAt) + (d.verifiedBy ? ' · verified by ' + App.esc(d.verifiedBy) + ' at ' + App.esc(d.verifiedAt) : '') + '</div>' : '') +
      '</div>' + App.badge(d.status) + '<div class="list-actions">' +
      '<button class="btn btn-outline btn-sm" data-action="duty-proof" data-id="' + d.id + '">Proof (' + (d.history || []).length + ')</button>' +
      (mine && d.status === 'pending' && !isAuditor() ? '<button class="btn btn-primary btn-sm" data-action="submit-duty" data-id="' + d.id + '">' + App.icon('edit') + ' Submit proof</button>' : '') +
      (canStaff() && d.status === 'submitted' ? '<button class="btn btn-success btn-sm" data-action="verify-duty" data-id="' + d.id + '">' + App.icon('check') + ' Verify</button>' : '') +
      '</div></div>';
  }
  function duties() {
    const list = scope(s.duties, 'assignedTo');
    const mine = list.filter(d => d.assignedTo === me);
    return accessNotice('duty') +
      '<div class="stat-grid"><div class="card stat-card warn"><span>Pending</span><strong>' + list.filter(d => d.status === 'pending').length + '</strong></div>' +
      '<div class="card stat-card"><span>Proof submitted</span><strong>' + list.filter(d => d.status === 'submitted').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Verified</span><strong>' + list.filter(d => d.status === 'verified').length + '</strong></div></div>' +
      App.card('Duty proof board', 'Students submit their own evidence; staff verification is attributed',
        list.length ? list.map(dutyRow).join('') : App.empty('No duties in scope', 'Authorized records will appear here.')) +
      '<div style="margin-top:18px">' + App.card('My proof queue', 'Your submissions remain on record for review',
        mine.length ? mine.map(dutyRow).join('') : App.empty('No personal duties', 'Your assigned duties appear here.')) + '</div>';
  }

  /* ---------- Fair Token & Activity Report ---------- */
  function tokenRow(t) {
    return '<tr><td>' + App.esc(t.code) + '</td><td>' + App.esc(t.issuedAt) + '</td><td>' + App.esc(t.service) + '</td><td>' + App.esc(t.owner) + '</td>' +
      '<td>' + App.badge(t.status) + '</td><td>' + App.esc(t.calledAt || '—') + '</td><td><button class="btn btn-outline btn-sm" data-action="token-proof" data-id="' + t.id + '">Proof</button>' +
      (t.owner === me && t.status === 'waiting' && !isAuditor() ? ' <button class="btn btn-danger-ghost btn-sm" data-action="cancel-token" data-id="' + t.id + '">Cancel</button>' : '') + '</td></tr>';
  }
  function tokens() {
    const report = s.tokens.slice().reverse();
    const counts = s.services.map(v => ({ label: v, value: s.tokens.filter(t => t.service === v).length }));
    const max = Math.max(1, ...counts.map(c => c.value));
    return accessNotice('queue') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Tokens issued</span><strong>' + s.tokens.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Waiting</span><strong>' + s.tokens.filter(t => t.status === 'waiting').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Served</span><strong>' + s.tokens.filter(t => t.status === 'served').length + '</strong></div></div>' +
      '<div class="toolbar"><span class="small muted">Unique, traceable tokens — every issue and call is logged.</span>' +
      (isAuditor() ? '' : '<button class="btn btn-primary btn-sm" data-action="take-token">' + App.icon('ticket') + ' Take a token</button>') +
      (canStaff() ? '<button class="btn btn-outline btn-sm" data-action="call-next">' + App.icon('bell') + ' Call next</button>' : '') + '</div>' +
      '<div class="analytics-grid">' + counts.map(c => '<div class="card" style="padding:14px"><div class="bar-row"><span>' + App.esc(c.label) +
        '</span><div class="bar-bg"><div style="width:' + Math.round(c.value / max * 100) + '%"></div></div><strong>' + c.value + '</strong></div></div>').join('') + '</div>' +
      '<div style="margin-top:18px">' + App.card('Queue activity report', 'Generated ' + App.stamp() + ' · every token with time, service, and status',
        report.length ? '<table class="table"><thead><tr><th>Token</th><th>Issued</th><th>Service</th><th>Owner</th><th>Status</th><th>Called</th><th></th></tr></thead><tbody>' + report.map(tokenRow).join('') + '</tbody></table>'
          : App.empty('No tokens issued', 'Take a token to start the report.')) + '</div>';
  }

  /* ---------- Tamper-Resistant Quiz Record ---------- */
  function gradeQuiz(q, answers) {
    let score = 0;
    q.questions.forEach((qq, i) => { if (String(answers[i] || '') === String(qq.answer)) score++; });
    return { score, total: q.questions.length };
  }
  function quizModal(q) {
    ui.quizId = q.id;
    const draft = (s.drafts && s.drafts[q.id]) || {};
    const qs = q.questions.map((qq, i) => '<div class="quiz-question"><p>' + (i + 1) + '. ' + App.esc(qq.q) + '</p>' +
      qq.options.map((o, j) => '<label class="quiz-option"><input type="radio" id="sgq-' + q.id + '-' + i + '-' + j + '" data-quiz="' + q.id + '" data-q="' + i + '" name="q' + i + '" value="' + j + '"' + (String(draft[i]) === String(j) ? ' checked' : '') + ' /> ' + App.esc(o) + '</label>').join('') + '</div>').join('');
    const secs = q.minutes * 60;
    App.modal('Quiz record — ' + q.title, 'Answers autosave on every change · consistent auto-grading',
      '<form id="sg-quiz-form">' + qs +
      '<div class="notice info">' + App.icon('lock') + '<span><strong id="sg-draft-status">Draft autosaved at ' + App.esc(draft.at || App.stamp()) + '</strong><br>Time remaining: <span id="sg-timer">' + pad(Math.floor(secs / 60)) + ':' + pad(secs % 60) + '</span></span></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn-outline" data-action="expire-quiz">' + App.icon('alert') + ' Simulate expired attempt</button>' +
      '<button class="btn btn-success" data-action="submit-quiz">' + App.icon('check') + ' Submit & grade</button>', true);
    ui.quizDeadline = Date.now() + secs * 1000;
    const tick = () => {
      const el = document.getElementById('sg-timer');
      if (!el || !ui.quizDeadline) return;
      const left = Math.max(0, Math.ceil((ui.quizDeadline - Date.now()) / 1000));
      el.textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60);
      if (left > 0) setTimeout(tick, 1000);
    };
    tick();
  }
  function finishQuiz(mode) {
    const q = s.quizzes.find(x => x.id === ui.quizId);
    if (!q) return;
    const draft = (s.drafts && s.drafts[q.id]) || {};
    const form = document.getElementById('sg-quiz-form');
    const data = form ? new FormData(form) : null;
    const answers = q.questions.map((_, i) => {
      const dv = draft[i];
      const fv = data ? String(data.get('q' + i) || '') : '';
      return String(dv != null && dv !== '' ? dv : fv || '');
    });
    const result = gradeQuiz(q, answers);
    s.attempts.unshift({ id: App.uid('at'), quizId: q.id, quizTitle: q.title, owner: me, score: result.score, total: result.total, at: App.stamp(), mode, answers, draftAt: draft.at || '' });
    if (s.drafts) delete s.drafts[q.id];
    ui.quizId = null; ui.quizDeadline = 0;
    log('Quiz graded: ' + q.title + ' (' + result.score + '/' + result.total + ', ' + mode + ')', 'quizzes');
    App.save(); App.closeModal(); App.refresh();
    App.toast(mode === 'expired' ? 'Expired attempt auto-submitted. Score: ' + result.score + '/' + result.total : 'Graded consistently: ' + result.score + '/' + result.total);
  }
  function quizzes() {
    const mine = s.attempts.filter(a => a.owner === me);
    const cards = s.quizzes.map(q => {
      const draft = (s.drafts && s.drafts[q.id]) || {};
      const recovered = Object.keys(draft).some(k => k !== 'at' && draft[k] !== '');
      return '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3><div class="quiz-meta"><span>' + App.icon('quiz') + q.questions.length + ' items</span><span>' + App.icon('clock') + q.minutes + ' min</span></div></div>' +
        '<span class="badge ' + (recovered ? 'pending' : 'neutral') + '">' + (recovered ? 'Draft saved' : 'No draft') + '</span></div>' +
        '<p class="small muted">Answers autosave on each change. Expired attempts are submitted with saved answers and graded by the same rule set.</p>' +
        '<button class="btn btn-primary btn-sm" data-action="start-quiz" data-id="' + q.id + '">' + App.icon('quiz') + (recovered ? ' Resume quiz' : ' Take quiz') + '</button></article>';
    }).join('');
    const rows = mine.map(a => '<tr><td>' + App.esc(a.at) + '</td><td>' + App.esc(a.quizTitle) + '</td><td><strong>' + a.score + '/' + a.total + '</strong></td>' +
      '<td>' + (a.mode === 'expired' ? 'Auto-submitted' : 'Submitted') + '</td><td>' + App.esc(a.draftAt || '—') + '</td>' +
      '<td><button class="btn btn-outline btn-sm" data-action="attempt-proof" data-id="' + a.id + '">Grading proof</button></td></tr>').join('');
    return accessNotice('quiz') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Practice sets</span><strong>' + s.quizzes.length + '</strong></div>' +
      '<div class="card stat-card good"><span>Recorded attempts</span><strong>' + mine.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Saved drafts</span><strong>' + Object.keys(s.drafts || {}).length + '</strong></div></div>' +
      '<h2 class="section-title">' + App.icon('quiz') + ' Tamper-resistant practice</h2><div class="quiz-grid">' + cards + '</div>' +
      '<div style="margin-top:18px">' + App.card('Quiz record history', 'Each attempt keeps answers, mode, time, and score',
        rows ? '<table class="table"><thead><tr><th>When</th><th>Quiz</th><th>Score</th><th>Mode</th><th>Draft saved</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>'
          : App.empty('No attempts recorded', 'Take a quiz to create a record.')) + '</div>';
  }

  /* ---------- Transparent Obligation Ledger ---------- */
  function obligationRows(list) {
    return list.map(o => {
      const bal = Math.max(0, o.amount - (o.paid || 0));
      return '<tr><td>' + App.esc(o.item) + '</td><td>' + App.esc(o.date) + '</td><td>' + App.money(o.amount) + '</td><td>' + App.money(o.paid || 0) + '</td>' +
        '<td><strong>' + App.money(bal) + '</strong></td><td>' + App.badge(bal ? 'pending' : 'done') + '</td><td>' + (o.history || []).length + '</td>' +
        '<td><div class="row" style="gap:5px"><button class="btn btn-outline btn-sm" data-action="payment-proof" data-id="' + o.id + '">History</button>' +
        (bal && !isAuditor() ? '<button class="btn btn-success btn-sm" data-action="pay-obligation" data-id="' + o.id + '">Pay</button>' : '') + '</div></td></tr>';
    }).join('');
  }
  function ledger() {
    const list = scope(s.obligations, 'owner');
    const total = list.reduce((n, o) => n + o.amount, 0);
    const paid = list.reduce((n, o) => n + (o.paid || 0), 0);
    return accessNotice('balance') +
      '<div class="stat-grid"><div class="card stat-card"><span>Total billed</span><strong>' + App.money(total) + '</strong></div>' +
      '<div class="card stat-card good"><span>Total credited</span><strong>' + App.money(paid) + '</strong></div>' +
      '<div class="card stat-card accent"><span>Remaining</span><strong>' + App.money(Math.max(0, total - paid)) + '</strong></div></div>' +
      App.card('Transparent obligation ledger', 'Every partial payment is recorded with actor and timestamp',
        list.length ? '<table class="table"><thead><tr><th>Item</th><th>Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Payments</th><th></th></tr></thead><tbody>' + obligationRows(list) + '</tbody></table>'
          : App.empty('No obligations in scope', 'Authorized records appear here.'));
  }

  /* ---------- Escalation & Resolution Audit ---------- */
  function auditLine(c, action, detail) {
    c.audit = c.audit || [];
    c.audit.push({ at: App.stamp(), actor: roleName(), action, detail: detail || '' });
    const kind = action.toLowerCase().indexOf('resolved') >= 0 ? 'resolution' : 'audit';
    addNotice(kind, 'Concern "' + c.title + '" — ' + action + '.', c.owner, c.id + '-' + c.audit.length + '-' + action);
    log(action + ': ' + c.title, 'audit');
  }
  function concernRow(c) {
    const aging = c.status !== 'resolved' && App.daysSince(c.created) > 3;
    return '<tr><td>' + App.esc(c.title) + '</td><td>' + App.esc(c.category) + '</td><td>' + App.esc(c.owner) + '</td><td>' + App.ageChip(c.created) + '</td>' +
      '<td>' + App.badge(c.status) + '</td><td>' + (aging ? '<span class="badge open">' + App.icon('alert') + ' Escalate</span>' : '—') + '</td>' +
      '<td>' + (c.audit || []).length + '</td><td><div class="row" style="gap:5px"><button class="btn btn-outline btn-sm" data-action="audit-trail" data-id="' + c.id + '">Audit trail</button>' +
      (canStaff() && c.status === 'new' ? '<button class="btn btn-primary btn-sm" data-action="escalate-concern" data-id="' + c.id + '">Forward</button>' : '') +
      (canStaff() && c.status === 'forwarded' ? '<button class="btn btn-success btn-sm" data-action="resolve-concern" data-id="' + c.id + '">Resolve</button>' : '') + '</div></td></tr>';
  }
  function audit() {
    const list = scope(s.concerns, 'owner');
    const allAudit = [];
    list.forEach(c => (c.audit || []).forEach(a => allAudit.push(Object.assign({}, a, { concern: c.title }))));
    let shown = list;
    if (!isStudent() && ui.auditFilter !== 'all') shown = list.filter(c => c.status === ui.auditFilter);
    return accessNotice('concern') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Concerns</span><strong>' + list.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Aging &gt; 3 days</span><strong>' + list.filter(c => c.status !== 'resolved' && App.daysSince(c.created) > 3).length + '</strong></div>' +
      '<div class="card stat-card good"><span>Audit entries</span><strong>' + allAudit.length + '</strong></div></div>' +
      '<div class="toolbar">' + (isStudent() ? '<span class="badge private">' + App.icon('lock') + ' My concerns only</span>' : App.tabs('auditFilter', [
        { value: 'all', label: 'All', count: list.length }, { value: 'new', label: 'New' }, { value: 'forwarded', label: 'Forwarded' }, { value: 'resolved', label: 'Resolved' }
      ], ui.auditFilter)) + (isAuditor() ? '' : '<button class="btn btn-primary btn-sm" data-action="new-concern">' + App.icon('plus') + ' File concern</button>') + '</div>' +
      App.card('Escalation & resolution register', 'Request aging is visible; every status change is retained',
        shown.length ? '<table class="table"><thead><tr><th>Concern</th><th>Category</th><th>Owner</th><th>Age</th><th>Status</th><th>Escalation</th><th>Audit</th><th></th></tr></thead><tbody>' + shown.map(concernRow).join('') + '</tbody></table>'
          : App.empty('No concerns here', 'Adjust the filter above.')) +
      '<div class="dash-bottom" style="margin-top:18px">' + noticeCenter(4) +
      App.card('Audit register', 'Actor + timestamp + action for every change', allAudit.length ? '<ul class="timeline">' + allAudit.slice(0, 10).map(a =>
        '<li><div><strong>' + App.esc(a.action) + '</strong><small>' + App.esc(a.actor) + ' · ' + App.esc(a.at) + '</small><div class="tiny muted">' + App.esc(a.concern) + '</div></div></li>').join('') + '</ul>' : App.empty('No audit entries', 'Status changes will be logged here.')) + '</div>';
  }

  App.init({
    slug: 'scholarguard', title: 'ScholarGuard', tagline: 'Student Accountability & Verified Records', icon: 'shield', accent: 'teal',
    roles: ['student', 'staff', 'admin', 'auditor'], roleLabels: { student: 'Student view', staff: 'Service Staff', admin: 'Administrator', auditor: 'Auditor (read-only)' },
    user: { name: 'Ana Reyes', meta: '2023-01422 · BS Accountancy', initials: 'AR' },
    progressLabel: 'Proof events retained', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Trust Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'claims', label: 'Verified Claims', icon: 'box', group: 'PROOF MODULES' },
      { id: 'duties', label: 'Duty Proof Board', icon: 'broom', group: 'PROOF MODULES' },
      { id: 'tokens', label: 'Fair Tokens', icon: 'ticket', group: 'PROOF MODULES' },
      { id: 'quizzes', label: 'Quiz Records', icon: 'quiz', group: 'PROOF MODULES' },
      { id: 'ledger', label: 'Transparent Ledger', icon: 'wallet', group: 'PROOF MODULES' },
      { id: 'audit', label: 'Escalation Audit', icon: 'history', group: 'OVERSIGHT' }
    ],
    views: {
      dashboard: { title: 'Trust Overview', subtitle: 'Every student action leaves provable, access-controlled evidence', render: dashboard },
      claims: { title: 'Verified Claim Log', subtitle: 'Timestamped item records and claiming history', render: claims },
      duties: { title: 'Duty Proof Board', subtitle: 'Student-submitted completion evidence with staff verification', render: duties },
      tokens: { title: 'Fair Tokens & Activity Report', subtitle: 'Unique queue tokens with a complete activity report', render: tokens },
      quizzes: { title: 'Tamper-Resistant Quiz Record', subtitle: 'Autosaved answers, expired attempts, and consistent grading', render: quizzes },
      ledger: { title: 'Transparent Obligation Ledger', subtitle: 'Partial payments and full history, visible only to the student', render: ledger },
      audit: { title: 'Escalation & Resolution Audit', subtitle: 'Request aging plus an audit trail of every status change', render: audit }
    }
  });

  s = App.state; // MUST be after App.init()
  s.drafts = s.drafts || {};

  /* Draft autosave: one App.onInput registration per quiz question. */
  s.quizzes.forEach(q => q.questions.forEach((qq, i) => {
    App.onInput('sgq-' + q.id + '-' + i, (value, el) => {
      const qid = el && el.dataset && el.dataset.quiz ? el.dataset.quiz : q.id;
      const idx = el && el.dataset && el.dataset.q != null ? Number(el.dataset.q) : i;
      s.drafts[qid] = s.drafts[qid] || {};
      s.drafts[qid][idx] = value;
      s.drafts[qid].at = App.stamp();
      const status = document.getElementById('sg-draft-status');
      if (status) status.textContent = 'Draft autosaved at ' + s.drafts[qid].at;
      App.save();
    });
  }));

  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });

  /* Claims */
  App.on('new-claim', () => {
    App.modal('Register item record', 'The first entry of its proof history',
      '<form id="claim-add-form"><div class="field"><label for="ca-code">Item code</label><input class="input" id="ca-code" name="code" value="' + App.uid('CRH') + '" /></div>' +
      '<div class="field"><label for="ca-item">Item</label><input class="input" id="ca-item" name="item" required /></div>' +
      '<div class="field"><label for="ca-owner">Owner</label><input class="input" id="ca-owner" name="owner" value="' + App.esc(me) + '" /></div>' +
      '<div class="field"><label for="ca-location">Location</label><input class="input" id="ca-location" name="location" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-claim">' + App.icon('plus') + ' Register</button>');
  });
  App.on('save-claim', () => {
    const data = new FormData(document.getElementById('claim-add-form'));
    s.claims.unshift({ id: App.uid('cl'), code: String(data.get('code') || App.uid('CRH')), item: String(data.get('item') || 'Unnamed item'), owner: String(data.get('owner') || me), location: String(data.get('location') || 'Unspecified'), status: 'ready', recordedAt: App.stamp(), claimedAt: null, history: [{ at: App.stamp(), actor: roleName(), action: 'Item registered', detail: 'Initial record created.' }] });
    log('Item record registered', 'claims'); App.save(); App.closeModal(); App.refresh(); App.toast('Item registered with proof history.');
  });
  App.on('claim-item', d => {
    const c = s.claims.find(x => x.id === d.id);
    if (!c || c.status !== 'ready' || c.owner !== me || isAuditor()) return;
    c.status = 'claimed'; c.claimedAt = App.stamp();
    c.history.push({ at: c.claimedAt, actor: me, action: 'Claim recorded', detail: 'Status changed from ready to claimed.' });
    addNotice('audit', 'Claim recorded for ' + c.item + ' at ' + c.claimedAt + '.', me, 'claim-' + c.id);
    log('Claim recorded: ' + c.code, 'claims');
    App.save(); App.refresh(); App.toast('Claim recorded with timestamp.');
  });
  App.on('claim-proof', d => {
    const c = s.claims.find(x => x.id === d.id); if (!c) return;
    proofModal(c.item, c.code + ' · ' + c.status, c.history);
  });

  /* Duties */
  App.on('submit-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t || t.status !== 'pending') return;
    App.modal('Submit completion proof', t.room + ' · ' + t.task,
      '<form id="sg-duty-form"><div class="field"><label for="sd-evidence">Evidence note</label><textarea class="textarea" id="sd-evidence" name="evidence" required placeholder="Describe exactly what you completed."></textarea></div>' +
      '<p class="field-hint">Your name, the timestamp, and this note become a permanent proof entry.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-duty" data-id="' + t.id + '">' + App.icon('check') + ' Submit proof</button>');
  });
  App.on('confirm-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t) return;
    const f = document.getElementById('sg-duty-form');
    t.evidence = f ? String(new FormData(f).get('evidence') || '') : '';
    t.status = 'submitted'; t.submittedAt = App.stamp();
    t.history.push({ at: t.submittedAt, actor: me, action: 'Completion proof submitted', detail: t.evidence });
    log('Completion proof submitted: ' + t.task, 'duties');
    App.save(); App.closeModal(); App.refresh(); App.toast('Proof submitted and attributed to you.');
  });
  App.on('verify-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t || t.status !== 'submitted') return;
    t.status = 'verified'; t.verifiedAt = App.stamp(); t.verifiedBy = roleName();
    t.history.push({ at: t.verifiedAt, actor: roleName(), action: 'Proof verified', detail: 'Checked by ' + roleName() + '.' });
    log('Duty proof verified: ' + t.task, 'duties');
    App.save(); App.refresh(); App.toast('Verification recorded in the proof board.');
  });
  App.on('duty-proof', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t) return;
    proofModal(t.task, t.room + ' · ' + t.status + (t.verifiedAt ? ' · verified ' + t.verifiedAt : ''), t.history);
  });

  /* Tokens */
  App.on('take-token', () => {
    let n = 42 + s.tokens.length, code;
    do { code = 'TK-' + String(n++).padStart(4, '0'); } while (s.tokens.some(t => t.code === code));
    const t = { id: App.uid('tk'), code, service: s.services[s.tokens.length % s.services.length], owner: me, issuedAt: App.stamp(), status: 'waiting', calledAt: null, history: [{ at: App.stamp(), actor: roleName(), action: 'Unique token issued', detail: 'Token ' + code + ' generated.' }] };
    s.tokens.push(t);
    addNotice('audit', 'Token ' + code + ' issued for ' + t.service + '.', me, 'issued-' + code);
    log('Unique token issued: ' + code, 'tokens');
    App.save(); App.refresh(); App.toast('Token ' + code + ' issued and logged.');
  });
  App.on('call-next', () => {
    const t = s.tokens.find(x => x.status === 'waiting');
    if (!t) { App.toast('No waiting tokens.', 'error'); return; }
    t.status = 'served'; t.calledAt = App.stamp();
    t.history.push({ at: t.calledAt, actor: roleName(), action: 'Token called', detail: 'Served at ' + t.service + '.' });
    addNotice('audit', 'Your token ' + t.code + ' was called at ' + t.service + '.', t.owner, 'called-' + t.id);
    log('Token called: ' + t.code, 'tokens');
    App.save(); App.refresh(); App.toast('Called ' + t.code + '.');
  });
  App.on('cancel-token', d => {
    const t = s.tokens.find(x => x.id === d.id); if (!t || t.status !== 'waiting') return;
    t.status = 'cancelled';
    t.history.push({ at: App.stamp(), actor: me, action: 'Token cancelled', detail: 'Cancelled by owner.' });
    log('Token cancelled: ' + t.code, 'tokens'); App.save(); App.refresh(); App.toast('Token cancelled and logged.');
  });
  App.on('token-proof', d => {
    const t = s.tokens.find(x => x.id === d.id); if (!t) return;
    proofModal('Token ' + t.code, t.service + ' · issued ' + t.issuedAt, t.history);
  });

  /* Quiz */
  App.on('start-quiz', d => { const q = s.quizzes.find(x => x.id === d.id); if (q) quizModal(q); });
  App.on('submit-quiz', () => finishQuiz('submitted'));
  App.on('expire-quiz', () => finishQuiz('expired'));
  App.on('attempt-proof', d => {
    const a = s.attempts.find(x => x.id === d.id); if (!a) return;
    const q = s.quizzes.find(x => x.id === a.quizId);
    const html = '<div class="detail-grid"><div class="detail"><small>Score (rule set v1)</small><strong>' + a.score + '/' + a.total + '</strong></div>' +
      '<div class="detail"><small>Mode</small><strong>' + App.esc(a.mode) + '</strong></div>' +
      '<div class="detail"><small>Recorded at</small><strong>' + App.esc(a.at) + '</strong></div>' +
      '<div class="detail"><small>Draft saved at</small><strong>' + App.esc(a.draftAt || '—') + '</strong></div></div>' +
      '<h4 class="section-title">' + App.icon('quiz') + ' Answer check</h4>' +
      (q ? '<table class="table"><thead><tr><th>#</th><th>Your answer</th><th>Key</th><th>Result</th></tr></thead><tbody>' + q.questions.map((qq, i) => {
        const chosen = a.answers && a.answers[i] != null ? qq.options[Number(a.answers[i])] : 'No answer';
        const ok = String(a.answers && a.answers[i]) === String(qq.answer);
        return '<tr><td>' + (i + 1) + '</td><td>' + App.esc(chosen || 'No answer') + '</td><td>' + App.esc(qq.options[qq.answer]) + '</td><td>' + App.badge(ok ? 'done' : 'open') + '</td></tr>';
      }).join('') + '</tbody></table>' : '<p class="small muted">Question set no longer available.</p>') +
      '<p class="tiny muted" style="margin-top:12px">Grading is deterministic: identical answers always produce the same score, including expired auto-submissions.</p>';
    App.modal('Grading proof — ' + a.quizTitle, 'Rule set v1 · reproducible result', html, '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  });

  /* Ledger */
  App.on('pay-obligation', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    const bal = Math.max(0, o.amount - (o.paid || 0));
    if (!bal) { App.toast('Already fully paid.', 'error'); return; }
    App.modal('Record payment', o.item + ' · remaining ' + App.money(bal),
      '<form id="sg-pay-form"><div class="field"><label for="sp-amount">Amount</label><input class="input" type="number" min="1" max="' + bal + '" id="sp-amount" name="amount" value="' + bal + '" /></div>' +
      '<p class="field-hint">Partial payments are credited immediately and appended to the history.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-payment" data-id="' + o.id + '">' + App.icon('wallet') + ' Record</button>');
  });
  App.on('confirm-payment', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    const f = document.getElementById('sg-pay-form');
    const amount = Math.max(0, Number(f ? new FormData(f).get('amount') : 0) || 0);
    if (!amount) { App.toast('Enter a valid amount.', 'error'); return; }
    o.paid = Math.min(o.amount, (o.paid || 0) + amount);
    o.history.push({ at: App.stamp(), amount, actor: roleName() });
    log('Payment credited: ' + App.money(amount) + ' · ' + o.item, 'ledger');
    App.save(); App.closeModal(); App.refresh(); App.toast('Payment credited with proof entry.');
  });
  App.on('payment-proof', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    proofModal(o.item, App.money(o.paid || 0) + ' paid of ' + App.money(o.amount),
      (o.history || []).map(h => ({ action: 'Payment of ' + App.money(h.amount), actor: h.actor, at: h.at, detail: 'Balance recalculated after credit.' })));
  });

  /* Audit */
  App.on('new-concern', () => {
    App.modal('File a concern', 'An audit entry is created immediately',
      '<form id="sg-concern-form"><div class="field"><label for="sc-title">Title</label><input class="input" id="sc-title" name="title" required /></div>' +
      '<div class="field"><label for="sc-cat">Category</label><select class="select" id="sc-cat" name="category"><option>Academics</option><option>Facilities</option><option>IT</option><option>Other</option></select></div>' +
      '<div class="field"><label for="sc-details">Details</label><textarea class="textarea" id="sc-details" name="details"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="save-concern">' + App.icon('send') + ' File concern</button>');
  });
  App.on('save-concern', () => {
    const data = new FormData(document.getElementById('sg-concern-form'));
    const c = { id: App.uid('cs'), title: String(data.get('title') || 'Untitled concern'), category: String(data.get('category') || 'Other'), details: String(data.get('details') || ''), owner: me, created: App.today(), status: 'new', assignedTo: '', resolution: '', audit: [] };
    c.audit.push({ at: App.stamp(), actor: me, action: 'Concern filed', detail: c.category + ' concern submitted.' });
    s.concerns.unshift(c);
    addNotice('audit', 'Concern received: ' + c.title + '.', me, 'filed-' + c.id);
    log('Concern filed: ' + c.title, 'audit');
    App.save(); App.closeModal(); App.refresh(); App.toast('Concern filed and logged.');
  });
  App.on('escalate-concern', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c || !canStaff()) return;
    c.status = 'forwarded';
    c.assignedTo = c.category === 'Facilities' ? 'Maintenance' : c.category === 'IT' ? 'IT Support' : c.category === 'Academics' ? 'Adviser' : 'Campus Support';
    auditLine(c, 'Status changed to forwarded', 'Routed to ' + c.assignedTo + '.');
    App.save(); App.refresh(); App.toast('Forwarded to ' + c.assignedTo + '.');
  });
  App.on('resolve-concern', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c || !canStaff()) return;
    App.modal('Resolve concern', c.title,
      '<form id="sg-resolve-form"><div class="field"><label for="sr-note">Resolution details</label><textarea class="textarea" id="sr-note" name="note" required></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-resolution" data-id="' + c.id + '">' + App.icon('check') + ' Resolve</button>');
  });
  App.on('confirm-resolution', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c) return;
    const f = document.getElementById('sg-resolve-form');
    c.resolution = f ? String(new FormData(f).get('note') || '') : 'Resolved';
    c.status = 'resolved';
    auditLine(c, 'Status changed to resolved', c.resolution);
    App.save(); App.closeModal(); App.refresh(); App.toast('Resolution recorded and notice sent.');
  });
  App.on('audit-trail', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c) return;
    proofModal(c.title, c.status + ' · opened ' + c.created + ' · ' + App.ageChip(c.created).replace(/<[^>]+>/g, ''),
      (c.audit || []).map(a => ({ action: a.action, actor: a.actor + ' · ' + a.at, detail: a.detail })));
  });
  App.on('mark-read', () => { visibleNotices().forEach(n => { n.read = true; }); App.save(); App.refresh(); App.toast('Notices marked as read.'); });

  function updateCounts() {
    App.setCounts({
      dashboard: visibleNotices().filter(n => !n.read).length,
      claims: scope(s.claims, 'owner').filter(c => c.status === 'ready').length,
      duties: scope(s.duties, 'assignedTo').filter(d => d.status !== 'verified').length,
      tokens: s.tokens.filter(t => t.status === 'waiting').length,
      quizzes: Object.keys(s.drafts || {}).length,
      ledger: scope(s.obligations, 'owner').filter(o => (o.paid || 0) < o.amount).length,
      audit: scope(s.concerns, 'owner').filter(c => c.status !== 'resolved').length
    });
    const proof = proofCounts().reduce((n, c) => n + c.value, 0);
    App.setProgress(Math.min(100, proof), 'Proof events retained');
  }
  updateCounts();
  App.go('dashboard');
})();
