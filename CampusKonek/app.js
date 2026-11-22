/* CampusKonek prototype — QR-enabled student companion for campus life. */
(function () {
  let s; // assigned immediately after App.init()
  const me = 'Juan Dela Cruz';
  const ui = { dutyFilter: 'mine', ledgerFilter: 'mine', wallFilter: 'all', noticeFilter: 'all', scanIndex: 0, scanCode: null, quizId: null, quizDeadline: 0 };

  const isStudent = () => s.role === 'student';
  const canStaff = () => s.role === 'staff' || s.role === 'admin';
  const roleName = () => ({ student: 'Student', staff: 'Staff / MH', admin: 'Administrator' }[s.role] || s.role || 'Guest');
  const pad = n => String(n).padStart(2, '0');

  function addNotice(kind, text, owner, key) {
    s.notices = s.notices || [];
    if (key && s.notices.some(n => n.key === key)) return;
    s.notices.unshift({ id: App.uid('nt'), kind, text, owner: owner || 'all', at: App.stamp(), read: false, key: key || '' });
    s.notices = s.notices.slice(0, 24);
  }
  function log(text, module) { App.activity(text, module); }
  function visibleNotices() { return (s.notices || []).filter(n => !isStudent() || n.owner === me || n.owner === 'all'); }
  function unreadCount() { return visibleNotices().filter(n => !n.read).length; }

  function noticeCenter(limit) {
    let list = visibleNotices();
    if (ui.noticeFilter !== 'all') list = list.filter(n => n.kind === ui.noticeFilter);
    list = list.slice(0, limit || 6);
    const body = list.length
      ? '<div class="notice-stack">' + list.map(n =>
          '<div class="notice ' + (n.kind === 'warn' || n.kind === 'escalation' ? 'warn' : 'info') + '">' + App.icon(n.kind === 'turn' ? 'bell' : 'info') +
          '<span><strong>' + App.esc(n.text) + '</strong><br><span class="tiny muted">' + App.esc(n.at) + ' · ' + App.esc(n.kind) + ' notice</span></span></div>').join('') + '</div>'
      : App.empty('No notices yet', 'Turn alerts and resolution notices will appear here.');
    const tabs = App.tabs('noticeFilter', [
      { value: 'all', label: 'All', count: visibleNotices().length },
      { value: 'turn', label: 'Turn alerts' },
      { value: 'resolution', label: 'Resolutions' },
      { value: 'info', label: 'Info' }
    ], ui.noticeFilter);
    return App.card('Notification center', 'One inbox for turn alerts and resolution notices',
      '<div style="padding:16px">' + tabs + '<div style="height:12px"></div>' + body +
      '<div style="margin-top:12px"><button class="btn btn-outline btn-sm" data-action="mark-read">' + App.icon('check') + ' Mark all as read</button></div></div>',
      '<span class="badge ' + (unreadCount() ? 'open' : 'neutral') + '">' + unreadCount() + ' unread</span>');
  }

  function hero(percent, stats) {
    return '<div class="hero"><div class="hero-top"><div><h2>Your campus, connected.</h2>' +
      '<p>Scan and claim items, keep your duties on track, skip the line, practice instantly, and follow every concern to closure.</p></div>' +
      '<div class="hero-ring"><div class="ring" style="--ring:' + percent + '%"><div class="ring-inner">' + percent + '%</div></div><small>Records current</small></div></div>' +
      '<div class="hero-stats">' + stats.map((x, i) => '<div class="hero-stat"><strong>' + x.value + '</strong><span>' + App.esc(x.label) + '</span></div>').join('') + '</div></div>';
  }
  function moduleCard(view, icon, tone, title, desc, meta) {
    return '<article class="card module-card"><div class="module-top"><span class="module-icon tone-' + tone + '">' + App.icon(icon) + '</span><span class="badge neutral">' + App.esc(meta) + '</span></div>' +
      '<h3>' + App.esc(title) + '</h3><p>' + App.esc(desc) + '</p><div class="module-foot"><span class="tiny muted">One tap to open</span>' +
      '<button class="btn btn-soft btn-sm" data-action="nav" data-view="' + view + '">Open ' + App.icon('arrow') + '</button></div></article>';
  }
  function activityFeed() {
    const items = (s.activity || []).slice(0, 6);
    return items.length ? items.map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('')
      : App.empty('No activity yet', 'Actions across modules appear here.');
  }

  /* ---------- Dashboard ---------- */
  function dashboard() {
    const ready = s.items.filter(i => i.owner === me && i.status === 'ready').length;
    const myTicket = s.tickets.find(t => t.owner === me && t.status === 'waiting');
    const pos = myTicket ? queuePos(myTicket) : 0;
    const duties = s.duties.filter(d => d.assignedTo === me && d.status === 'pending').length;
    const open = s.concerns.filter(c => c.owner === me && c.status !== 'resolved').length;
    const totalRecords = s.items.length + s.duties.length + s.concerns.length;
    const current = s.items.filter(i => i.status === 'claimed').length + s.duties.filter(d => d.status === 'done').length + s.concerns.filter(c => c.status === 'resolved').length;
    const percent = totalRecords ? Math.round(current / totalRecords * 100) : 0;
    const stats = [
      { value: ready, label: 'Items to claim' },
      { value: myTicket ? '#' + pos : '—', label: 'Queue position' },
      { value: duties, label: 'Duties pending' },
      { value: open, label: 'Open concerns' }
    ];
    const modules = [
      moduleCard('scan', 'scan', 'sky', 'Scan & Claim', 'Simulate a QR scan, review item details, and claim instantly.', ready + ' to claim'),
      moduleCard('duty', 'broom', 'amber', 'Classroom Duty', 'See your cleaning schedule and submit completion.', duties + ' pending'),
      moduleCard('queue', 'ticket', 'teal', 'Campus Queue', 'Join remotely, see position and ETA, get turn alerts.', myTicket ? '#' + pos : 'Not joined'),
      moduleCard('quiz', 'quiz', 'violet', 'Practice Quiz', 'Timed practice with instant grades and attempt history.', s.attempts.filter(a => a.owner === me).length + ' attempts'),
      moduleCard('ledger', 'wallet', 'rose', 'Student Ledger', 'Itemized obligations with automatically computed balances.', App.money(balanceTotal(me)) + ' due'),
      moduleCard('wall', 'chat', 'indigo', 'Help Wall', 'File a concern once and watch it move to resolved.', open + ' open')
    ];
    return hero(percent, stats) +
      '<h2 class="section-title">' + App.icon('grid') + ' Your modules <span class="tiny muted" style="margin-left:auto">Viewing as ' + App.esc(roleName()) + '</span></h2>' +
      '<div class="module-grid">' + modules.join('') + '</div>' +
      '<div class="dash-bottom" style="margin-top:18px">' + noticeCenter(4) + App.card('Recent activity', 'Latest records across modules', activityFeed()) + '</div>';
  }

  /* ---------- Scan & Claim ---------- */
  function itemRow(i) {
    const mine = i.owner === me;
    const canClaim = i.status === 'ready' && (mine || canStaff());
    return '<div class="list-row"><span class="activity-icon">' + App.icon('box') + '</span><div class="list-main"><strong>' + App.esc(i.name) + '</strong>' +
      '<div class="meta"><span>' + App.icon('scan') + App.esc(i.code) + '</span><span>' + App.icon('map') + App.esc(i.location) + '</span><span>' + App.icon('user') + App.esc(i.owner) + '</span>' +
      '<span>' + App.icon('clock') + 'Logged ' + App.esc(i.recordedAt) + '</span>' + (i.claimedAt ? '<span>' + App.icon('check') + 'Claimed ' + App.esc(i.claimedAt) + '</span>' : '') + '</div></div>' +
      App.badge(i.status) + '<div class="list-actions">' +
      (canClaim ? '<button class="btn btn-success btn-sm" data-action="claim-item" data-id="' + i.id + '">' + App.icon('check') + ' Mark claimed</button>' : '') +
      (canStaff() ? '<button class="btn btn-outline btn-sm" data-action="edit-item" data-id="' + i.id + '">' + App.icon('edit') + ' Review</button>' : '') +
      '</div></div>';
  }
  function scanForm(draft, existingId) {
    const staff = canStaff();
    const v = k => App.esc(draft[k] || '');
    const body = '<form id="scan-form">' +
      '<div class="notice info">' + App.icon('scan') + '<span>Fields below were auto-filled from the simulated code. ' + (staff ? 'Review, edit, then save the item record.' : 'You can request and claim it in one step.') + '</span></div>' +
      '<div class="field"><label for="sf-code">Scanned code</label><input class="input" id="sf-code" name="code" value="' + v('code') + '" required /></div>' +
      '<div class="field"><label for="sf-name">Item name</label><input class="input" id="sf-name" name="name" value="' + v('name') + '" required /></div>' +
      '<div class="detail-grid">' +
      '<div class="field"><label for="sf-type">Type</label><input class="input" id="sf-type" name="type" value="' + v('type') + '" /></div>' +
      '<div class="field"><label for="sf-location">Location</label><input class="input" id="sf-location" name="location" value="' + v('location') + '" /></div></div>' +
      '<div class="field"><label for="sf-owner">Owner / requestor</label><input class="input" id="sf-owner" name="owner" value="' + (draft.owner || me) + '" /></div></form>';
    const footer = '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
      (staff ? '<button class="btn btn-primary" data-action="save-scan" data-id="' + (existingId || '') + '">' + App.icon('check') + ' Save item record</button>'
             : '<button class="btn btn-success" data-action="claim-draft">' + App.icon('scan') + ' Add & claim item</button>');
    App.modal('Scanned item — entry form', 'Code populated automatically from QR / barcode', body, footer, true);
  }
  function scan() {
    const draft = ui.scanCode ? s.fakeCodes.find(c => c.code === ui.scanCode) : null;
    const result = draft
      ? '<div class="notice info">' + App.icon('check') + '<span>Last scanned: <strong class="scan-code">' + App.esc(draft.code) + '</strong> — ' + App.esc(draft.name) + ' at ' + App.esc(draft.location) + '. ' +
        (canStaff() ? 'The entry form is ready for review.' : 'You can claim this item from your list below.') + '</span></div>'
      : App.notice('info', 'No scan yet. Press <strong>Simulate scan</strong> to load a fake code into the item entry form.');
    const list = s.items.length ? s.items.map(itemRow).join('') : App.empty('No item records', 'Simulate a scan to create one.');
    return '<div class="stat-grid"><div class="card stat-card accent"><span>Items recorded</span><strong>' + s.items.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Ready to claim</span><strong>' + s.items.filter(i => i.status === 'ready').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Claimed</span><strong>' + s.items.filter(i => i.status === 'claimed').length + '</strong></div></div>' +
      App.card('QR / barcode scan simulation', 'A simulated scan auto-fills the item entry form',
        '<div style="padding:16px">' + result +
        '<div class="scan-frame">' + App.icon('scan') + '<div><strong>Hold the QR / barcode inside the frame</strong></div>' +
        '<p class="small muted">This prototype simulates the camera read with a fake code.</p>' +
        '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-action="simulate-scan">' + App.icon('scan') + ' Simulate scan</button>' +
        (ui.scanCode ? '<button class="btn btn-outline" data-action="review-scan">' + App.icon('edit') + ' Review last scan</button>' : '') +
        (canStaff() ? '<button class="btn btn-outline" data-action="new-item">' + App.icon('plus') + ' New item entry</button>' : '') + '</div></div></div>') +
      '<div style="margin-top:18px">' + App.card('Item records', 'Statuses update the moment a student claims an item', list) + '</div>';
  }

  /* ---------- Classroom Duty ---------- */
  function dutyRow(d) {
    const mine = d.assignedTo === me;
    const canSubmit = d.status === 'pending' && (mine || canStaff());
    return '<div class="list-row"><span class="activity-icon">' + App.icon('broom') + '</span><div class="list-main"><strong>' + App.esc(d.task) + '</strong>' +
      '<div class="meta"><span>' + App.icon('map') + App.esc(d.room) + '</span><span>' + App.icon('calendar') + App.esc(d.date) + '</span><span>' + App.icon('user') + App.esc(d.assignedTo) + '</span>' +
      (d.submitted ? '<span>' + App.icon('check') + 'Submitted ' + App.esc(d.submitted) + '</span>' : '') + '</div>' +
      (d.note ? '<div class="small muted" style="margin-top:5px">“' + App.esc(d.note) + '”</div>' : '') + '</div>' + App.badge(d.status) +
      '<div class="list-actions">' + (canSubmit ? '<button class="btn btn-primary btn-sm" data-action="submit-duty" data-id="' + d.id + '">' + App.icon('check') + ' Submit completion</button>' : '') + '</div></div>';
  }
  function duty() {
    let list = s.duties.slice();
    if (ui.dutyFilter === 'mine') list = list.filter(d => d.assignedTo === me);
    if (ui.dutyFilter === 'pending' || ui.dutyFilter === 'done') list = list.filter(d => d.status === ui.dutyFilter);
    return '<div class="toolbar">' + App.tabs('dutyFilter', [
      { value: 'mine', label: 'My schedule' },
      { value: 'pending', label: 'Pending', count: s.duties.filter(d => d.status === 'pending').length },
      { value: 'done', label: 'Completed', count: s.duties.filter(d => d.status === 'done').length },
      { value: 'all', label: 'All duties' }
    ], ui.dutyFilter) + (canStaff() ? '<button class="btn btn-primary btn-sm" data-action="add-duty">' + App.icon('plus') + ' Assign duty</button>' : '') + '</div>' +
      App.notice('info', '<strong>Classroom duty schedule:</strong> submit completion once the task is done. Staff can publish new assignments.') +
      App.card('Cleaning schedule', 'Your duties and their live status', list.length ? list.map(dutyRow).join('') : App.empty('No duties here', 'Change the filter above.'));
  }

  /* ---------- Campus Queue ---------- */
  function queuePos(t) { return s.tickets.filter(x => x.status === 'waiting').findIndex(x => x.id === t.id) + 1; }
  function serviceCard(v) {
    const waiting = s.tickets.filter(t => t.service === v.name && t.status === 'waiting').length;
    return '<article class="card service-card"><div class="module-top"><span class="module-icon tone-teal">' + App.icon('ticket') + '</span><span class="badge ' + (waiting ? 'pending' : 'done') + '">' + waiting + ' waiting</span></div>' +
      '<h3 style="margin:0;font-size:14px">' + App.esc(v.name) + '</h3><p>' + App.esc(v.desk) + ' · about ' + v.avg + ' min per turn</p>' +
      '<div class="service-meta"><span>' + App.icon('clock') + 'Live ETA shown after joining</span></div>' +
      '<button class="btn btn-primary btn-sm" data-action="join-queue" data-id="' + v.id + '">' + App.icon('plus') + ' Join queue remotely</button></article>';
  }
  function queue() {
    const mine = s.tickets.filter(t => t.owner === me).slice(-1)[0];
    const waiting = s.tickets.filter(t => t.status === 'waiting');
    let ticketHtml = App.empty('You are not in a queue', 'Join a service above to get a live position and ETA.');
    if (mine) {
      const pos = mine.status === 'waiting' ? queuePos(mine) : 0;
      ticketHtml = '<div style="padding:18px"><div class="row wrap spread"><div><div class="tiny muted">Your ticket</div>' +
        '<div class="scan-code">' + App.esc(mine.code) + '</div><div class="small muted">' + App.esc(mine.service) + ' · joined ' + App.esc(mine.joined) + '</div></div>' +
        '<div class="row" style="gap:26px"><div style="text-align:center"><strong style="font-size:28px">' + (pos || '—') + '</strong><div class="tiny muted">Position</div></div>' +
        '<div style="text-align:center"><strong style="font-size:28px">' + (mine.status === 'waiting' ? mine.eta : 0) + '</strong><div class="tiny muted">ETA (min)</div></div></div></div>' +
        '<div class="mini-track" style="margin-top:14px"><div style="width:' + (mine.status === 'waiting' ? Math.max(8, 100 - mine.eta * 8) : 100) + '%"></div></div>' +
        '<div class="row wrap" style="margin-top:14px">' + App.badge(mine.status) +
        '<button class="btn btn-outline btn-sm" data-action="refresh-eta">' + App.icon('clock') + ' Refresh live status</button>' +
        (mine.status === 'waiting' ? '<button class="btn btn-danger-ghost btn-sm" data-action="leave-queue" data-id="' + mine.id + '">Leave queue</button>' : '') +
        (canStaff() ? '<button class="btn btn-primary btn-sm" data-action="call-next">' + App.icon('bell') + ' Call next</button>' : '') +
        '</div></div>';
    }
    const rows = s.tickets.slice().reverse().map(t => '<tr><td>' + App.esc(t.code) + '</td><td>' + App.esc(t.service) + '</td><td>' + App.esc(t.owner) + '</td><td>' + App.esc(t.joined) + '</td><td>' + App.badge(t.status) + '</td></tr>').join('');
    return '<div class="stat-grid"><div class="card stat-card accent"><span>Active queues</span><strong>' + s.services.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>People waiting</span><strong>' + waiting.length + '</strong></div>' +
      '<div class="card stat-card good"><span>Served</span><strong>' + s.tickets.filter(t => t.status === 'served').length + '</strong></div></div>' +
      '<h2 class="section-title">' + App.icon('ticket') + ' Available services</h2><div class="service-grid">' + s.services.map(serviceCard).join('') + '</div>' +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Your live queue ticket', 'Position, ETA, and turn alerts', ticketHtml) + noticeCenter(4) + '</div>' +
      '<div style="margin-top:18px">' + App.card('Queue activity', 'Recent tickets and their status', '<table class="table"><thead><tr><th>Ticket</th><th>Service</th><th>Owner</th><th>Joined</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>') + '</div>' +
      (canStaff() ? '<div style="margin-top:12px"><button class="btn btn-primary btn-sm" data-action="call-next">' + App.icon('bell') + ' Call next in line</button></div>' : '');
  }

  /* ---------- Practice Quiz ---------- */
  function gradeQuiz(q, answers) {
    let score = 0;
    q.questions.forEach((qq, i) => { if (String(answers[i] || '') === String(qq.answer)) score++; });
    return { score, total: q.questions.length };
  }
  function quizModal(q) {
    ui.quizId = q.id;
    const qs = q.questions.map((qq, i) => '<div class="quiz-question"><p>' + (i + 1) + '. ' + App.esc(qq.q) + '</p>' +
      qq.options.map((o, j) => '<label class="quiz-option"><input type="radio" name="q' + i + '" value="' + j + '" /> ' + App.esc(o) + '</label>').join('') + '</div>').join('');
    const secs = q.minutes * 60;
    App.modal('Practice quiz — ' + q.title, 'Time limit ' + q.minutes + ' minutes · graded instantly on submit',
      '<form id="ck-quiz-form">' + qs + '<div class="notice info">' + App.icon('clock') + '<span>Time remaining: <strong id="ck-timer">' + pad(Math.floor(secs / 60)) + ':' + pad(secs % 60) + '</strong></span></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn-outline" data-action="timeout-quiz">' + App.icon('alert') + ' Simulate expiry</button>' +
      '<button class="btn btn-success" data-action="submit-quiz">' + App.icon('check') + ' Submit & grade</button>', true);
    ui.quizDeadline = Date.now() + secs * 1000;
    const tick = () => {
      const el = document.getElementById('ck-timer');
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
    const form = document.getElementById('ck-quiz-form');
    const data = form ? new FormData(form) : null;
    const answers = q.questions.map((_, i) => data ? String(data.get('q' + i) || '') : '');
    const result = gradeQuiz(q, answers);
    s.attempts.unshift({ id: App.uid('at'), quizId: q.id, quizTitle: q.title, owner: me, score: result.score, total: result.total, at: App.stamp(), mode, answers });
    ui.quizId = null; ui.quizDeadline = 0;
    addNotice('info', 'Quiz graded: ' + q.title + ' — ' + result.score + '/' + result.total + '.', me, '');
    log('Quiz attempt recorded: ' + q.title + ' (' + result.score + '/' + result.total + ')', 'quiz');
    App.save(); App.closeModal(); App.refresh();
    App.toast(mode === 'expired' ? 'Time expired — answers auto-submitted. Score: ' + result.score + '/' + result.total : 'Score: ' + result.score + '/' + result.total);
  }
  function quiz() {
    const mine = s.attempts.filter(a => a.owner === me);
    const rows = mine.map((a, i) => {
      const prev = mine[i + 1];
      const delta = prev ? a.score - prev.score : 0;
      return '<tr><td>' + App.esc(a.at) + '</td><td>' + App.esc(a.quizTitle) + '</td><td><strong>' + a.score + '/' + a.total + '</strong></td>' +
        '<td>' + (a.mode === 'expired' ? 'Auto-submitted' : 'Submitted') + '</td><td>' + (prev ? (delta > 0 ? '<span style="color:var(--done)">+' + delta + ' improvement</span>' : delta < 0 ? '<span style="color:var(--danger)">' + delta + '</span>' : 'Same score') : 'First attempt') + '</td></tr>';
    }).join('');
    const cards = s.quizzes.map(q => {
      const best = mine.filter(a => a.quizId === q.id).reduce((m, a) => Math.max(m, a.score), 0);
      return '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3><div class="quiz-meta"><span>' + App.icon('quiz') + q.questions.length + ' items</span><span>' + App.icon('clock') + q.minutes + ' min</span></div></div>' +
        '<div class="score-pill ' + (best ? '' : 'none') + '">' + (best ? 'Best ' + best + '/' + q.questions.length : 'Not taken') + '</div></div>' +
        '<p class="small muted">Instant grading and a saved attempt history let you see your improvement.</p>' +
        '<button class="btn btn-primary btn-sm" data-action="start-quiz" data-id="' + q.id + '">' + App.icon('quiz') + ' Take quiz</button></article>';
    }).join('');
    return '<div class="stat-grid"><div class="card stat-card accent"><span>Practice sets</span><strong>' + s.quizzes.length + '</strong></div>' +
      '<div class="card stat-card good"><span>Attempts recorded</span><strong>' + mine.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Personal best</span><strong>' + (mine.length ? Math.max.apply(null, mine.map(a => a.score)) : 0) + '</strong></div></div>' +
      '<h2 class="section-title">' + App.icon('quiz') + ' Available quizzes</h2><div class="quiz-grid">' + cards + '</div>' +
      '<div style="margin-top:18px">' + App.card('Attempt history & improvement', 'Every attempt is saved with its score and mode',
        rows ? '<table class="table"><thead><tr><th>When</th><th>Quiz</th><th>Score</th><th>Mode</th><th>Progress</th></tr></thead><tbody>' + rows + '</tbody></table>' : App.empty('No attempts yet', 'Take a quiz to start your history.')) + '</div>';
  }

  /* ---------- Student Ledger ---------- */
  function balanceTotal(owner) { return s.obligations.filter(o => o.owner === owner).reduce((n, o) => n + Math.max(0, o.amount - (o.paid || 0)), 0); }
  function ledgerRows(list) {
    return list.map(o => {
      const bal = Math.max(0, o.amount - (o.paid || 0));
      return '<tr><td>' + App.esc(o.item) + '</td><td>' + App.money(o.amount) + '</td><td>' + App.esc(o.date) + '</td><td>' + App.money(o.paid || 0) + '</td>' +
        '<td><strong>' + App.money(bal) + '</strong></td><td>' + App.badge(bal ? 'pending' : 'done') + '</td>' +
        '<td><button class="btn btn-outline btn-sm" data-action="pay-obligation" data-id="' + o.id + '"' + (bal ? '' : ' disabled') + '>' + App.icon('wallet') + ' Pay</button></td></tr>';
    }).join('');
  }
  function ledger() {
    let list = isStudent() ? s.obligations.filter(o => o.owner === me) : s.obligations.slice();
    if (!isStudent() && ui.ledgerFilter === 'mine') list = list.filter(o => o.owner === me);
    const total = list.reduce((n, o) => n + o.amount, 0);
    const paid = list.reduce((n, o) => n + (o.paid || 0), 0);
    return App.notice('info', isStudent()
      ? '<strong>Access control:</strong> you can view only your own balance and transaction history.'
      : '<strong>Staff view:</strong> ' + App.esc(roleName()) + ' may review authorized records. Use the filter to focus on one student.') +
      '<div class="stat-grid"><div class="card stat-card"><span>Total billed</span><strong>' + App.money(total) + '</strong></div>' +
      '<div class="card stat-card good"><span>Total paid</span><strong>' + App.money(paid) + '</strong></div>' +
      '<div class="card stat-card accent"><span>Remaining balance</span><strong>' + App.money(Math.max(0, total - paid)) + '</strong></div></div>' +
      '<div class="toolbar">' + (isStudent() ? '<span class="badge private">' + App.icon('lock') + ' Private to ' + App.esc(me) + '</span>' : App.tabs('ledgerFilter', [{ value: 'mine', label: 'My records' }, { value: 'all', label: 'All records' }], ui.ledgerFilter)) +
      (canStaff() ? '<button class="btn btn-primary btn-sm" data-action="add-obligation">' + App.icon('plus') + ' Add obligation</button>' : '') + '</div>' +
      App.card('Itemized obligations', 'Balances are computed automatically from every recorded payment',
        list.length ? '<table class="table"><thead><tr><th>Item</th><th>Amount</th><th>Date</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>' + ledgerRows(list) + '</tbody></table>'
          : App.empty('No obligations', 'Nothing is outstanding here.'));
  }

  /* ---------- Help Wall ---------- */
  const WALL = [{ value: 'open', label: 'Open' }, { value: 'inprogress', label: 'In Progress' }, { value: 'forwarded', label: 'Forwarded' }, { value: 'resolved', label: 'Resolved' }];
  function wallBadge(status) {
    const map = { open: 'open', inprogress: 'pending', forwarded: 'public', resolved: 'done' };
    return '<span class="badge ' + (map[status] || 'neutral') + '">' + App.esc(status.replace('inprogress', 'In progress')) + '</span>';
  }
  function concernCard(c) {
    const next = { open: 'inprogress', inprogress: 'forwarded', forwarded: 'resolved' }[c.status];
    const canMove = canStaff() && next;
    const visible = isStudent() ? c.owner === me : (ui.wallFilter === 'all' || c.owner === me);
    if (!visible) return '';
    return '<article class="wall-card"><strong>' + App.esc(c.title) + '</strong>' +
      '<div class="meta"><span>' + App.ageChip(c.created) + '</span><span>' + App.esc(c.category) + '</span><span>' + App.esc(c.owner) + '</span></div>' +
      '<div class="small muted" style="margin:7px 0">' + App.esc(c.details) + '</div>' +
      '<div class="row wrap">' + wallBadge(c.status) + (c.assignedTo ? '<span class="badge neutral">' + App.esc(c.assignedTo) + '</span>' : '') +
      '<span class="tiny muted">' + (c.history || []).length + ' updates</span></div>' +
      (c.resolution ? '<div class="tiny" style="margin-top:7px;color:var(--done)">' + App.icon('check') + ' ' + App.esc(c.resolution) + '</div>' : '') +
      '<div class="row wrap" style="margin-top:9px"><button class="btn btn-outline btn-sm" data-action="concern-detail" data-id="' + c.id + '">Updates</button>' +
      (canMove ? '<button class="btn btn-primary btn-sm" data-action="advance-concern" data-id="' + c.id + '" data-value="' + next + '">' +
        (next === 'resolved' ? 'Resolve' : next === 'forwarded' ? 'Forward' : 'Start') + '</button>' : '') + '</div></article>';
  }
  function wall() {
    const counts = WALL.map(w => s.concerns.filter(c => c.status === w.value).length);
    return '<div class="toolbar"><div class="row wrap">' + App.tabs('wallFilter', [
      { value: 'all', label: 'All concerns', count: s.concerns.length }, { value: 'mine', label: 'My concerns', count: s.concerns.filter(c => c.owner === me).length }
    ], ui.wallFilter) + '</div><button class="btn btn-primary btn-sm" data-action="new-concern">' + App.icon('plus') + ' Submit a concern</button></div>' +
      App.notice('info', 'The wall updates as staff move a concern. Resolution notices are delivered to the notification center automatically.') +
      '<div class="wall">' + WALL.map((w, i) => '<div class="wall-col"><h3>' + w.label + '<span class="badge neutral">' + counts[i] + '</span></h3>' +
        s.concerns.filter(c => c.status === w.value).map(concernCard).join('') +
        (counts[i] ? '' : '<div class="tiny muted" style="padding:8px">Drop a card here as work progresses.</div>') + '</div>').join('') + '</div>' +
      '<div style="margin-top:18px">' + noticeCenter(5) + '</div>';
  }

  App.init({
    slug: 'campuskonek', title: 'CampusKonek', tagline: 'QR-Enabled Student Companion', icon: 'grid', accent: 'sky',
    roles: ['student', 'staff', 'admin'], roleLabels: { student: 'Student view', staff: 'Staff / MH view', admin: 'Administrator view' },
    user: { name: 'Juan Dela Cruz', meta: '2024-00137 · BS IT', initials: 'JD' },
    progressLabel: 'Records up to date', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'scan', label: 'Scan & Claim', icon: 'scan', group: 'MODULES' },
      { id: 'duty', label: 'Classroom Duty', icon: 'broom', group: 'MODULES' },
      { id: 'queue', label: 'Campus Queue', icon: 'ticket', group: 'MODULES' },
      { id: 'quiz', label: 'Practice Quiz', icon: 'quiz', group: 'MODULES' },
      { id: 'ledger', label: 'Student Ledger', icon: 'wallet', group: 'MODULES' },
      { id: 'wall', label: 'Help Wall', icon: 'chat', group: 'SUPPORT' }
    ],
    views: {
      dashboard: { title: 'Overview', subtitle: 'One account for every campus task', render: dashboard },
      scan: { title: 'Scan & Claim', subtitle: 'Scan a code, review the entry, claim the item', render: scan },
      duty: { title: 'Classroom Duty', subtitle: 'Your cleaning schedule and completion submissions', render: duty },
      queue: { title: 'Campus Queue', subtitle: 'Join remotely and see your live position and ETA', render: queue },
      quiz: { title: 'Practice Quiz', subtitle: 'Timed practice with instant grading and attempt history', render: quiz },
      ledger: { title: 'Student Ledger', subtitle: 'Itemized obligations with automatically computed balances', render: ledger },
      wall: { title: 'Help Wall', subtitle: 'Submit a concern and follow it to resolution', render: wall }
    }
  });

  s = App.state; // MUST be after App.init()
  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });

  /* Scan actions */
  App.on('simulate-scan', () => {
    const draft = s.fakeCodes[ui.scanIndex % s.fakeCodes.length];
    ui.scanIndex++; ui.scanCode = draft.code;
    addNotice('info', 'Scanned ' + draft.code + ' — details loaded into the entry form.', me, 'scan-' + draft.code);
    log('QR/barcode simulated: ' + draft.code, 'scan');
    App.save(); App.refresh(); scanForm(draft); App.toast('Scan simulated: ' + draft.code);
  });
  App.on('review-scan', () => { const d = s.fakeCodes.find(c => c.code === ui.scanCode); if (d) scanForm(d); });
  App.on('new-item', () => scanForm({ code: App.uid('QR-CK'), name: '', type: 'Book', location: '', owner: me }));
  App.on('edit-item', d => { const i = s.items.find(x => x.id === d.id); if (i) scanForm(i, i.id); });
  App.on('save-scan', d => {
    const data = new FormData(document.getElementById('scan-form'));
    const code = String(data.get('code') || '').trim();
    if (!code) { App.toast('A scanned code is required.', 'error'); return; }
    const existing = s.items.find(x => x.id === d.id);
    if (existing) {
      ['code', 'name', 'type', 'location', 'owner'].forEach(k => { existing[k] = String(data.get(k) || existing[k]); });
      existing.history = existing.history || [];
      existing.history.push({ at: App.stamp(), actor: roleName(), action: 'Item record reviewed and saved' });
      log('Item record updated: ' + code, 'scan');
    } else {
      s.items.unshift({ id: App.uid('it'), code, name: String(data.get('name') || 'Unnamed item'), type: String(data.get('type') || 'Other'), location: String(data.get('location') || 'Unknown'), owner: String(data.get('owner') || me), status: 'ready', recordedAt: App.stamp(), claimedAt: null, history: [{ at: App.stamp(), actor: roleName(), action: 'Item record created from scan' }] });
      log('Item record created from scan: ' + code, 'scan');
    }
    App.save(); App.closeModal(); App.refresh(); App.toast('Item record saved.');
  });
  App.on('claim-draft', () => {
    const data = new FormData(document.getElementById('scan-form'));
    const code = String(data.get('code') || '').trim();
    if (!code) { App.toast('A scanned code is required.', 'error'); return; }
    const item = { id: App.uid('it'), code, name: String(data.get('name') || 'Unnamed item'), type: String(data.get('type') || 'Other'), location: String(data.get('location') || 'Unknown'), owner: me, status: 'claimed', recordedAt: App.stamp(), claimedAt: App.stamp(), history: [{ at: App.stamp(), actor: roleName(), action: 'Created from scan' }, { at: App.stamp(), actor: me, action: 'Marked as claimed' }] };
    s.items.unshift(item);
    addNotice('info', item.name + ' was claimed. Status updated instantly.', me, '');
    log('Item claimed from scan: ' + code, 'scan');
    App.save(); App.closeModal(); App.refresh(); App.toast('Item claimed — status updated instantly.');
  });
  App.on('claim-item', d => {
    const i = s.items.find(x => x.id === d.id);
    if (!i || i.status !== 'ready') return;
    i.status = 'claimed'; i.claimedAt = App.stamp();
    i.history = i.history || [];
    i.history.push({ at: i.claimedAt, actor: me, action: 'Marked as claimed' });
    addNotice('info', i.name + ' (' + i.code + ') is now marked claimed.', me, 'claim-' + i.id);
    log('Item claimed: ' + i.code, 'scan');
    App.save(); App.refresh(); App.toast('Status updated: claimed.');
  });

  /* Duty actions */
  App.on('submit-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t || t.status !== 'pending') return;
    App.modal('Submit cleaning completion', t.room + ' · ' + t.task,
      '<form id="duty-form"><div class="field"><label for="du-note">Completion note</label><textarea class="textarea" id="du-note" name="note" placeholder="What did you finish?"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-duty" data-id="' + t.id + '">' + App.icon('check') + ' Submit</button>');
  });
  App.on('confirm-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t) return;
    const f = document.getElementById('duty-form');
    t.status = 'done'; t.submitted = App.today(); t.note = (f ? String(new FormData(f).get('note') || '') : '') || t.note;
    log('Duty submitted: ' + t.task + ' (' + t.room + ')', 'duty');
    App.save(); App.closeModal(); App.refresh(); App.toast('Completion submitted.');
  });
  App.on('add-duty', () => {
    App.modal('Assign cleaning duty', 'Publish a new schedule entry',
      '<form id="duty-add-form"><div class="field"><label for="da-room">Room</label><input class="input" id="da-room" name="room" required /></div>' +
      '<div class="field"><label for="da-task">Task</label><input class="input" id="da-task" name="task" required /></div>' +
      '<div class="field"><label for="da-who">Assigned to</label><input class="input" id="da-who" name="who" value="' + App.esc(me) + '" /></div>' +
      '<div class="field"><label for="da-date">Date</label><input class="input" type="date" id="da-date" name="date" value="' + App.today() + '" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-duty">' + App.icon('plus') + ' Assign</button>');
  });
  App.on('save-duty', () => {
    const data = new FormData(document.getElementById('duty-add-form'));
    s.duties.unshift({ id: App.uid('dt'), room: String(data.get('room') || 'Unspecified'), task: String(data.get('task') || 'New duty'), assignedTo: String(data.get('who') || me), date: String(data.get('date') || App.today()), status: 'pending', submitted: null, note: '' });
    log('Cleaning duty assigned', 'duty'); App.save(); App.closeModal(); App.refresh(); App.toast('Duty assigned.');
  });

  /* Queue actions */
  App.on('join-queue', d => {
    const v = s.services.find(x => x.id === d.id); if (!v) return;
    const waiting = s.tickets.filter(t => t.service === v.name && t.status === 'waiting').length;
    const ticket = { id: App.uid('tk'), code: v.name.charAt(0).toUpperCase() + '-' + String(100 + s.tickets.length).slice(-3), service: v.name, owner: me, status: 'waiting', joined: App.stamp(), eta: Math.max(1, waiting * v.avg) };
    s.tickets.push(ticket);
    addNotice('turn', 'Ticket ' + ticket.code + ' for ' + v.name + ' issued. Position #' + (waiting + 1) + ', ETA ' + ticket.eta + ' min.', me, 'ticket-' + ticket.id);
    log('Joined queue: ' + v.name + ' (' + ticket.code + ')', 'queue');
    App.save(); App.refresh(); App.toast('Joined ' + v.name + ' queue remotely.');
  });
  App.on('refresh-eta', () => {
    s.tickets.filter(t => t.status === 'waiting').forEach(t => {
      t.eta = Math.max(1, (t.eta || 4) - 1);
      if (t.eta <= 2) addNotice('turn', 'Your turn is near at ' + t.service + ' — ticket ' + t.code + '.', t.owner, 'near-' + t.id);
    });
    log('Queue positions refreshed', 'queue'); App.save(); App.refresh(); App.toast('Live status refreshed.');
  });
  App.on('call-next', () => {
    const t = s.tickets.find(x => x.status === 'waiting');
    if (!t) { App.toast('No one is waiting.', 'error'); return; }
    t.status = 'served'; t.calledAt = App.stamp();
    addNotice('turn', 'It is your turn at ' + t.service + ' — ticket ' + t.code + '. Please proceed to the counter.', t.owner, 'called-' + t.id);
    log('Ticket called: ' + t.code + ' (' + t.service + ')', 'queue');
    App.save(); App.refresh(); App.toast('Called ' + t.code + '. Turn notice sent.');
  });
  App.on('leave-queue', d => {
    const t = s.tickets.find(x => x.id === d.id); if (!t) return;
    t.status = 'cancelled';
    log('Left queue: ' + t.code, 'queue'); App.save(); App.refresh(); App.toast('You left the queue.');
  });

  /* Quiz actions */
  App.on('start-quiz', d => { const q = s.quizzes.find(x => x.id === d.id); if (q) quizModal(q); });
  App.on('submit-quiz', () => finishQuiz('submitted'));
  App.on('timeout-quiz', () => finishQuiz('expired'));

  /* Ledger actions */
  App.on('pay-obligation', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    const bal = Math.max(0, o.amount - (o.paid || 0));
    if (!bal) { App.toast('This obligation is already paid.', 'error'); return; }
    App.modal('Record a payment', o.item + ' · remaining ' + App.money(bal),
      '<form id="pay-form"><div class="field"><label for="pf-amount">Amount to pay</label><input class="input" type="number" min="1" max="' + bal + '" id="pf-amount" name="amount" value="' + bal + '" /></div>' +
      '<p class="field-hint">Partial payments are accepted and recorded in your history.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-payment" data-id="' + o.id + '">' + App.icon('wallet') + ' Record payment</button>');
  });
  App.on('confirm-payment', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    const f = document.getElementById('pay-form');
    const amount = Math.max(0, Number(f ? new FormData(f).get('amount') : 0) || 0);
    if (!amount) { App.toast('Enter a valid amount.', 'error'); return; }
    o.paid = Math.min(o.amount, (o.paid || 0) + amount);
    o.history = o.history || []; o.history.push({ at: App.stamp(), amount, actor: me });
    log('Payment recorded: ' + App.money(amount) + ' for ' + o.item, 'ledger');
    App.save(); App.closeModal(); App.refresh(); App.toast('Payment recorded. Balance recalculated.');
  });
  App.on('add-obligation', () => {
    App.modal('Add obligation', 'Record an itemized amount and date',
      '<form id="ob-add-form"><div class="field"><label for="oa-item">Item</label><input class="input" id="oa-item" name="item" required /></div>' +
      '<div class="field"><label for="oa-amount">Amount</label><input class="input" type="number" min="1" id="oa-amount" name="amount" required /></div>' +
      '<div class="field"><label for="oa-owner">Owner</label><input class="input" id="oa-owner" name="owner" value="' + App.esc(me) + '" /></div>' +
      '<div class="field"><label for="oa-date">Date</label><input class="input" type="date" id="oa-date" name="date" value="' + App.today() + '" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-obligation">' + App.icon('plus') + ' Add</button>');
  });
  App.on('save-obligation', () => {
    const data = new FormData(document.getElementById('ob-add-form'));
    s.obligations.unshift({ id: App.uid('ob'), item: String(data.get('item') || 'New obligation'), amount: Number(data.get('amount') || 0), paid: 0, date: String(data.get('date') || App.today()), owner: String(data.get('owner') || me), history: [] });
    log('Obligation recorded', 'ledger'); App.save(); App.closeModal(); App.refresh(); App.toast('Obligation added.');
  });

  /* Help Wall actions */
  App.on('new-concern', () => {
    App.modal('Submit a concern', 'It appears on the wall immediately',
      '<form id="concern-form"><div class="field"><label for="cf-title">Title</label><input class="input" id="cf-title" name="title" required /></div>' +
      '<div class="field"><label for="cf-cat">Category</label><select class="select" id="cf-cat" name="category"><option>Facilities</option><option>Library</option><option>IT</option><option>Academics</option><option>Other</option></select></div>' +
      '<div class="field"><label for="cf-details">Details</label><textarea class="textarea" id="cf-details" name="details"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="save-concern">' + App.icon('send') + ' Submit</button>');
  });
  App.on('save-concern', () => {
    const data = new FormData(document.getElementById('concern-form'));
    const c = { id: App.uid('cn'), title: String(data.get('title') || 'Untitled concern'), category: String(data.get('category') || 'Other'), details: String(data.get('details') || ''), owner: me, created: App.today(), status: 'open', assignedTo: '', resolution: '', history: [{ at: App.stamp(), actor: me, action: 'Concern submitted' }] };
    s.concerns.unshift(c);
    addNotice('info', 'Concern received: ' + c.title + '. It is now on the Help Wall.', me, 'received-' + c.id);
    log('Concern submitted: ' + c.title, 'wall');
    App.save(); App.closeModal(); App.refresh(); App.toast('Concern posted to the wall.');
  });
  App.on('advance-concern', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c || !canStaff()) return;
    if (d.value === 'resolved') {
      App.modal('Resolve concern', c.title,
        '<form id="resolve-form"><div class="field"><label for="rs-note">Resolution details</label><textarea class="textarea" id="rs-note" name="note" required></textarea></div></form>',
        '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-resolve" data-id="' + c.id + '">' + App.icon('check') + ' Resolve</button>');
      return;
    }
    const label = d.value === 'inprogress' ? 'Started work' : 'Forwarded to support team';
    c.status = d.value;
    if (d.value === 'forwarded') c.assignedTo = c.category === 'Facilities' ? 'Maintenance' : c.category === 'IT' ? 'IT Support' : 'Campus Support';
    c.history.push({ at: App.stamp(), actor: roleName(), action: label });
    addNotice('info', 'Your concern "' + c.title + '" is now ' + c.status + '.', c.owner, c.id + '-' + c.status);
    log('Concern ' + label.toLowerCase() + ': ' + c.title, 'wall');
    App.save(); App.refresh(); App.toast('Concern moved to ' + c.status + '.');
  });
  App.on('confirm-resolve', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c) return;
    const f = document.getElementById('resolve-form');
    c.resolution = f ? String(new FormData(f).get('note') || '') : 'Resolved';
    c.status = 'resolved';
    c.history.push({ at: App.stamp(), actor: roleName(), action: 'Resolved' });
    addNotice('resolution', 'Your concern "' + c.title + '" was resolved: ' + c.resolution, c.owner, 'resolved-' + c.id);
    log('Concern resolved: ' + c.title, 'wall');
    App.save(); App.closeModal(); App.refresh(); App.toast('Resolution notice sent to the requestor.');
  });
  App.on('concern-detail', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c) return;
    const html = '<div class="detail-grid"><div class="detail"><small>Submitted by</small><strong>' + App.esc(c.owner) + '</strong></div>' +
      '<div class="detail"><small>Category</small><strong>' + App.esc(c.category) + '</strong></div>' +
      '<div class="detail full"><small>Details</small><strong>' + App.esc(c.details) + '</strong></div></div>' +
      '<h4 class="section-title">' + App.icon('history') + ' Status updates</h4><ul class="timeline">' +
      (c.history || []).map(h => '<li><div><strong>' + App.esc(h.action) + '</strong><small>' + App.esc(h.actor) + ' · ' + App.esc(h.at) + '</small></div></li>').join('') + '</ul>';
    App.modal(c.title, c.status + ' · opened ' + c.created, html, '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  });
  App.on('mark-read', () => {
    visibleNotices().forEach(n => { n.read = true; });
    App.save(); App.refresh(); App.toast('All notices marked as read.');
  });

  function updateCounts() {
    App.setCounts({
      dashboard: unreadCount(),
      scan: s.items.filter(i => i.owner === me && i.status === 'ready').length,
      duty: s.duties.filter(d => d.assignedTo === me && d.status === 'pending').length,
      queue: s.tickets.filter(t => t.owner === me && t.status === 'waiting').length,
      quiz: s.attempts.filter(a => a.owner === me).length,
      ledger: s.obligations.filter(o => o.owner === me && (o.paid || 0) < o.amount).length,
      wall: s.concerns.filter(c => c.status !== 'resolved').length
    });
    const total = s.items.length + s.duties.length + s.concerns.length;
    const done = s.items.filter(i => i.status === 'claimed').length + s.duties.filter(d => d.status === 'done').length + s.concerns.filter(c => c.status === 'resolved').length;
    App.setProgress(total ? Math.round(done / total * 100) : 0, 'Records up to date');
  }
  updateCounts();
  App.go('dashboard');
})();
