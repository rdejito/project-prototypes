/* LearnLoop prototype — maximize study time, minimize student stress. */
(function () {
  let s; // assigned immediately after App.init()
  const me = 'Mia Santos';
  const ui = { materialFilter: 'pending', noticeFilter: 'all', helpFilter: 'all', quizId: null, quizDeadline: 0 };
  const isStudent = () => s.role === 'student';
  const canTeacher = () => s.role === 'teacher' || s.role === 'admin';
  const roleName = () => ({ student: 'Student', teacher: 'Teacher', admin: 'Administrator' }[s.role] || s.role || 'Guest');
  const pad = n => String(n).padStart(2, '0');
  const fmtTime = min => Math.floor((min || 0) / 60) + 'h ' + ((min || 0) % 60) + 'm';

  function addNudge(kind, text, owner, key, at) {
    s.notices = s.notices || [];
    if (key && s.notices.some(n => n.key === key)) return;
    s.notices.unshift({ id: App.uid('nt'), kind, text, owner: owner || 'all', at: at || App.stamp(), read: false, key: key || '' });
    s.notices = s.notices.slice(0, 30);
  }
  function log(text, module) { App.activity(text, module); }
  function bumpStudy(minutes, reason) {
    s.studySaved = (s.studySaved || 0) + minutes;
    log('Study time saved: ' + minutes + ' min — ' + reason, 'savings');
  }
  function syncNudges() {
    s.materials.forEach(m => {
      if (m.status === 'claimed') return;
      if (App.today() >= m.arrived) {
        addNudge('arrival', 'Arrived: ' + m.title + ' is waiting at ' + m.source + '.', m.owner, m.id + '-arrival', m.arrived);
      }
      const reminder = App.addDays(m.arrived, 1);
      if (App.today() >= reminder && App.daysSince(reminder) >= 0) {
        addNudge('reminder', '24h reminder: ' + m.title + ' is still unclaimed. Pick it up at ' + m.location + '.', m.owner, m.id + '-reminder', reminder);
      }
      const escalation = App.addDays(m.arrived, 2);
      if (App.today() >= escalation && App.daysSince(escalation) >= 0) {
        addNudge('escalation', '48h escalation: ' + m.title + ' has been waiting ' + App.daysSince(escalation) + ' days. Please follow up.', m.owner, m.id + '-escalation', escalation);
      }
    });
  }
  function visibleNotices() { return (s.notices || []).filter(n => !isStudent() || n.owner === me || n.owner === 'all'); }
  function nudgeCenter(limit) {
    let list = visibleNotices();
    if (ui.noticeFilter !== 'all') list = list.filter(n => n.kind === ui.noticeFilter);
    list = list.slice(0, limit || 6);
    const body = list.length ? '<div class="notice-stack">' + list.map(n =>
      '<div class="notice ' + (n.kind === 'escalation' ? 'warn' : 'info') + '">' + App.icon(n.kind === 'turn' ? 'bell' : n.kind === 'escalation' ? 'alert' : 'info') +
      '<span><strong>' + App.esc(n.text) + '</strong><br><span class="tiny muted">' + App.esc(n.at) + ' · ' + App.esc(n.kind) + '</span></span></div>').join('') + '</div>'
      : App.empty('No nudges yet', 'Arrival, reminder, turn, and help notices appear here.');
    return App.card('Notifications / nudges', 'Simulated arrival, 24h reminder, 48h escalation, turn, and help notices',
      '<div style="padding:16px">' + App.tabs('noticeFilter', [
        { value: 'all', label: 'All', count: visibleNotices().length }, { value: 'arrival', label: 'Arrivals' },
        { value: 'reminder', label: '24h reminders' }, { value: 'escalation', label: '48h escalations' },
        { value: 'turn', label: 'Turn alerts' }, { value: 'help', label: 'Help updates' }
      ], ui.noticeFilter) + '<div style="height:12px"></div>' + body +
      '<div class="row wrap" style="margin-top:12px"><button class="btn btn-outline btn-sm" data-action="sync-nudges">' + App.icon('bell') + ' Generate nudges</button>' +
      '<button class="btn btn-outline btn-sm" data-action="mark-read">' + App.icon('check') + ' Mark all read</button></div></div>',
      '<span class="badge ' + (visibleNotices().filter(n => !n.read).length ? 'open' : 'neutral') + '">' + visibleNotices().filter(n => !n.read).length + ' unread</span>');
  }
  function hero(percent, stats) {
    return '<div class="hero"><div class="hero-top"><div><h2>More study time. Less stress.</h2>' +
      '<p>LearnLoop nudges you about materials, prepares your space, saves your queue place, protects your quiz work, and routes concerns for you.</p></div>' +
      '<div class="hero-ring"><div class="ring" style="--ring:' + percent + '%"><div class="ring-inner">' + percent + '%</div></div><small>On track</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong style="color:#a7f3d0">' + fmtTime(s.studySaved) + '</strong><span>Study time saved</span></div>' +
      stats.map(x => '<div class="hero-stat"><strong>' + x.value + '</strong><span>' + App.esc(x.label) + '</span></div>').join('') + '</div></div>';
  }
  function moduleCard(view, icon, tone, title, desc, meta) {
    return '<article class="card module-card"><div class="module-top"><span class="module-icon tone-' + tone + '">' + App.icon(icon) + '</span><span class="badge neutral">' + App.esc(meta) + '</span></div>' +
      '<h3>' + App.esc(title) + '</h3><p>' + App.esc(desc) + '</p><div class="module-foot"><span class="tiny muted">One tap to open</span>' +
      '<button class="btn btn-soft btn-sm" data-action="nav" data-view="' + view + '">Open ' + App.icon('arrow') + '</button></div></article>';
  }

  /* ---------- Dashboard ---------- */
  function dashboard() {
    const pending = s.materials.filter(m => m.owner === me && m.status !== 'claimed').length;
    const myTicket = s.tickets.find(t => t.owner === me && t.status === 'waiting');
    const clean = s.rooms.filter(r => r.cleanliness === 'Clean').length;
    const openHelp = s.concerns.filter(c => c.owner === me && c.stage !== 'resolved').length;
    const totalTasks = s.duties.length + s.materials.length + s.concerns.length;
    const doneTasks = s.duties.filter(d => d.status === 'done').length + s.materials.filter(m => m.status === 'claimed').length + s.concerns.filter(c => c.stage === 'resolved').length;
    const percent = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0;
    const stats = [
      { value: pending, label: 'Materials pending' },
      { value: myTicket ? myTicket.eta + ' min' : '—', label: 'Queue ETA' },
      { value: clean + '/' + s.rooms.length, label: 'Clean spaces' },
      { value: openHelp, label: 'Open concerns' }
    ];
    const modules = [
      moduleCard('materials', 'box', 'sky', 'Material Nudges', 'Arrival, 24h, and 48h notices with a pending-items list.', pending + ' pending'),
      moduleCard('space', 'home', 'teal', 'Study-Space Readiness', 'Cleaning schedules and teacher cleanliness checks.', clean + ' clean'),
      moduleCard('queue', 'ticket', 'amber', 'Time-Saver Queue', 'See your position and ETA, then come back only when called.', myTicket ? '#' + queuePos(myTicket) : 'Not joined'),
      moduleCard('practice', 'quiz', 'violet', 'Never-Lose-Progress Practice', 'Autosaved answers, expired attempts, and progress history.', s.attempts.filter(a => a.owner === me).length + ' attempts'),
      moduleCard('balance', 'wallet', 'rose', 'Stress-Free Balance', 'Itemized obligations and an exact remaining balance.', App.money(balanceTotal(me)) + ' left'),
      moduleCard('help', 'chat', 'indigo', 'Rapid Help Channel', 'Auto-routed concerns with staged updates until resolved.', openHelp + ' open')
    ];
    const activity = (s.activity || []).slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('clock') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
    return hero(percent, stats) +
      App.notice('info', '<strong>Time back in your day:</strong> ' + fmtTime(s.studySaved) + ' saved so far through fewer trips, shorter waits, and self-service updates.') +
      '<h2 class="section-title">' + App.icon('grid') + ' Your study loop <span class="tiny muted" style="margin-left:auto">Viewing as ' + App.esc(roleName()) + '</span></h2>' +
      '<div class="module-grid">' + modules.join('') + '</div>' +
      '<div class="dash-bottom" style="margin-top:18px">' + nudgeCenter(4) + App.card('Recent savings & activity', 'Every action is logged', activity || App.empty('No activity', 'Actions appear here.')) + '</div>';
  }

  /* ---------- Material Arrival Nudges ---------- */
  function materialRow(m) {
    const mine = m.owner === me;
    return '<div class="list-row"><span class="activity-icon">' + App.icon('book') + '</span><div class="list-main"><strong>' + App.esc(m.title) + '</strong>' +
      '<div class="meta"><span>' + App.icon('box') + App.esc(m.type) + '</span><span>' + App.icon('map') + App.esc(m.location) + '</span><span>' + App.icon('calendar') + 'Arrived ' + App.esc(m.arrived) + '</span><span>' + App.icon('clock') + 'Due ' + App.esc(m.due) + '</span><span>' + App.icon('user') + App.esc(m.owner) + '</span></div>' +
      (m.claimedAt ? '<div class="tiny muted">Claimed ' + App.esc(m.claimedAt) + '</div>' : '') + '</div>' + App.badge(m.status) +
      '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="material-detail" data-id="' + m.id + '">Details</button>' +
      (mine && m.status !== 'claimed' ? '<button class="btn btn-success btn-sm" data-action="claim-material" data-id="' + m.id + '">' + App.icon('check') + ' Claim</button>' : '') + '</div></div>';
  }
  function materials() {
    let list = isStudent() ? s.materials.filter(m => m.owner === me) : s.materials.slice();
    if (ui.materialFilter === 'pending') list = list.filter(m => m.status !== 'claimed');
    if (ui.materialFilter === 'claimed') list = list.filter(m => m.status === 'claimed');
    return '<div class="stat-grid"><div class="card stat-card warn"><span>Pending items</span><strong>' + s.materials.filter(m => m.owner === me && m.status !== 'claimed').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Claimed</span><strong>' + s.materials.filter(m => m.owner === me && m.status === 'claimed').length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Nudges generated</span><strong>' + visibleNotices().filter(n => ['arrival', 'reminder', 'escalation'].indexOf(n.kind) >= 0).length + '</strong></div></div>' +
      App.notice('info', 'Nudges are generated from material dates: arrival, +1 day reminder, and +2 day escalation. No repeated trips to the counter.') +
      '<div class="toolbar">' + App.tabs('materialFilter', [
        { value: 'pending', label: 'Pending', count: s.materials.filter(m => m.status !== 'claimed').length },
        { value: 'claimed', label: 'Claimed', count: s.materials.filter(m => m.status === 'claimed').length },
        { value: 'all', label: 'All' }
      ], ui.materialFilter) + (canTeacher() ? '<button class="btn btn-primary btn-sm" data-action="add-material">' + App.icon('plus') + ' Add material</button>' : '') + '</div>' +
      App.card('My pending materials', 'Item details, claiming history, and instant claim actions',
        list.length ? list.map(materialRow).join('') : App.empty('Nothing here', 'Change the filter above.')) +
      '<div style="margin-top:18px">' + nudgeCenter(7) + '</div>';
  }

  /* ---------- Study-Space Readiness ---------- */
  function roomCard(r) {
    const clean = r.cleanliness === 'Clean';
    return '<article class="card service-card"><div class="module-top"><span class="module-icon tone-' + (clean ? 'teal' : 'rose') + '">' + App.icon('home') + '</span>' +
      '<span class="badge ' + (clean ? 'done' : 'open') + '">' + App.esc(r.cleanliness) + '</span></div>' +
      '<h3 style="margin:0;font-size:14px">' + App.esc(r.name) + '</h3><p>' + App.esc(r.building) + (r.capacity ? ' · seats ' + r.capacity : '') + '</p>' +
      '<div class="service-meta"><span>' + App.icon('calendar') + 'Checked ' + App.esc(r.lastChecked) + '</span>' +
      '<span>' + App.icon('user') + App.esc(r.checker || 'Not yet checked') + '</span></div>' +
      '<div class="tiny muted">' + (r.checks || []).length + ' cleanliness checks recorded</div>' +
      (canTeacher() ? '<div class="row"><button class="btn btn-success btn-sm" data-action="set-clean" data-id="' + r.id + '" data-value="Clean">Mark clean</button>' +
        '<button class="btn btn-danger-ghost btn-sm" data-action="set-clean" data-id="' + r.id + '" data-value="Needs attention">Needs attention</button>' +
        '<button class="btn btn-outline btn-sm" data-action="room-checks" data-id="' + r.id + '">Checks</button></div>' : '') + '</article>';
  }
  function dutyRow(d) {
    return '<div class="list-row"><span class="activity-icon">' + App.icon('broom') + '</span><div class="list-main"><strong>' + App.esc(d.task) + '</strong>' +
      '<div class="meta"><span>' + App.icon('map') + App.esc(d.room) + '</span><span>' + App.icon('calendar') + App.esc(d.date) + '</span><span>' + App.icon('user') + App.esc(d.assignedTo) + '</span></div>' +
      (d.note ? '<div class="small muted" style="margin-top:4px">' + App.esc(d.note) + '</div>' : '') + '</div>' + App.badge(d.status) +
      '<div class="list-actions">' + (d.assignedTo === me && d.status === 'pending' ? '<button class="btn btn-primary btn-sm" data-action="submit-duty" data-id="' + d.id + '">' + App.icon('check') + ' Submit completion</button>' : '') + '</div></div>';
  }
  function space() {
    return '<div class="stat-grid"><div class="card stat-card good"><span>Clean spaces</span><strong>' + s.rooms.filter(r => r.cleanliness === 'Clean').length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Needs attention</span><strong>' + s.rooms.filter(r => r.cleanliness !== 'Clean').length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Duties pending</span><strong>' + s.duties.filter(d => d.status === 'pending').length + '</strong></div></div>' +
      App.notice('info', '<strong>Teacher monitoring:</strong> teachers mark rooms clean or needing attention. Each check is recorded with actor and date.') +
      '<h2 class="section-title">' + App.icon('home') + ' Study spaces</h2><div class="service-grid">' + s.rooms.map(roomCard).join('') + '</div>' +
      '<div style="margin-top:18px">' + App.card('Cleaning schedule', 'Published tasks and one-tap completion', s.duties.length ? s.duties.map(dutyRow).join('') : App.empty('No duties', 'The schedule is empty.')) + '</div>';
  }

  /* ---------- Time-Saver Queue ---------- */
  function queuePos(t) { return s.tickets.filter(x => x.status === 'waiting').findIndex(x => x.id === t.id) + 1; }
  function serviceCard(v) {
    const waiting = s.tickets.filter(t => t.service === v.name && t.status === 'waiting').length;
    return '<article class="card service-card"><div class="module-top"><span class="module-icon tone-amber">' + App.icon('ticket') + '</span><span class="badge ' + (waiting ? 'pending' : 'done') + '">' + waiting + ' waiting</span></div>' +
      '<h3 style="margin:0;font-size:14px">' + App.esc(v.name) + '</h3><p>' + App.esc(v.desk) + ' · ~' + v.avg + ' min per turn</p>' +
      '<button class="btn btn-primary btn-sm" data-action="join-queue" data-id="' + v.id + '">' + App.icon('plus') + ' Join remotely</button></article>';
  }
  function queue() {
    const mine = s.tickets.filter(t => t.owner === me).slice(-1)[0];
    let ticketHtml = App.empty('Not in a queue', 'Join a service and keep studying — we will alert you when your turn is near.');
    if (mine) {
      const pos = mine.status === 'waiting' ? queuePos(mine) : 0;
      ticketHtml = '<div style="padding:18px"><div class="row wrap spread"><div><div class="tiny muted">Your ticket</div><div class="scan-code">' + App.esc(mine.code) +
        '</div><div class="small muted">' + App.esc(mine.service) + ' · joined ' + App.esc(mine.joined) + '</div></div>' +
        '<div class="row" style="gap:24px"><div style="text-align:center"><strong style="font-size:26px">' + (pos || '—') + '</strong><div class="tiny muted">Position</div></div>' +
        '<div style="text-align:center"><strong style="font-size:26px">' + (mine.status === 'waiting' ? mine.eta : 0) + '</strong><div class="tiny muted">ETA (min)</div></div></div></div>' +
        '<div class="mini-track" style="margin-top:12px"><div style="width:' + (mine.status === 'waiting' ? Math.max(8, 100 - mine.eta * 7) : 100) + '%"></div></div>' +
        '<div class="row wrap" style="margin-top:12px">' + App.badge(mine.status) +
        '<button class="btn btn-outline btn-sm" data-action="refresh-eta">' + App.icon('clock') + ' Refresh ETA</button>' +
        (mine.status === 'waiting' ? '<button class="btn btn-danger-ghost btn-sm" data-action="leave-queue" data-id="' + mine.id + '">Leave queue</button>' : '') +
        (canTeacher() ? '<button class="btn btn-primary btn-sm" data-action="call-next">' + App.icon('bell') + ' Call next</button>' : '') + '</div></div>';
    }
    const rows = s.tickets.slice().reverse().map(t => '<tr><td>' + App.esc(t.code) + '</td><td>' + App.esc(t.service) + '</td><td>' + App.esc(t.owner) + '</td><td>' + App.esc(t.joined) + '</td><td>' + App.badge(t.status) + '</td></tr>').join('');
    return '<div class="stat-grid"><div class="card stat-card accent"><span>Active services</span><strong>' + s.services.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>People waiting</span><strong>' + s.tickets.filter(t => t.status === 'waiting').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Study time saved</span><strong>' + fmtTime(s.studySaved) + '</strong></div></div>' +
      '<h2 class="section-title">' + App.icon('ticket') + ' Join without leaving your desk</h2><div class="service-grid">' + s.services.map(serviceCard).join('') + '</div>' +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Your time-saver ticket', 'Position, ETA, and turn alerts', ticketHtml) + nudgeCenter(4) + '</div>' +
      '<div style="margin-top:18px">' + App.card('Queue activity', 'Recent tickets and status', '<table class="table"><thead><tr><th>Ticket</th><th>Service</th><th>Owner</th><th>Joined</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>') + '</div>' +
      (canTeacher() ? '<div style="margin-top:12px"><button class="btn btn-primary btn-sm" data-action="call-next">' + App.icon('bell') + ' Call next in line</button></div>' : '');
  }

  /* ---------- Never-Lose-Progress Practice ---------- */
  function gradeQuiz(q, answers) {
    let score = 0;
    q.questions.forEach((qq, i) => { if (String(answers[i] || '') === String(qq.answer)) score++; });
    return { score, total: q.questions.length };
  }
  function quizModal(q) {
    ui.quizId = q.id;
    const draft = (s.drafts && s.drafts[q.id]) || {};
    const qs = q.questions.map((qq, i) => '<div class="quiz-question"><p>' + (i + 1) + '. ' + App.esc(qq.q) + '</p>' +
      qq.options.map((o, j) => '<label class="quiz-option"><input type="radio" id="llq-' + q.id + '-' + i + '-' + j + '" data-quiz="' + q.id + '" data-q="' + i + '" name="q' + i + '" value="' + j + '"' + (String(draft[i]) === String(j) ? ' checked' : '') + ' /> ' + App.esc(o) + '</label>').join('') + '</div>').join('');
    const secs = q.minutes * 60;
    App.modal('Practice — ' + q.title, 'Answers autosave as you work · expired attempts are submitted automatically',
      '<form id="ll-quiz-form">' + qs + '<div class="notice info">' + App.icon('check') + '<span><strong id="ll-draft-status">Draft autosaved at ' + App.esc(draft.at || App.stamp()) + '</strong><br>Time remaining: <span id="ll-timer">' + pad(Math.floor(secs / 60)) + ':' + pad(secs % 60) + '</span></span></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn-outline" data-action="expire-quiz">' + App.icon('alert') + ' Simulate expiry</button>' +
      '<button class="btn btn-success" data-action="submit-quiz">' + App.icon('check') + ' Submit</button>', true);
    ui.quizDeadline = Date.now() + secs * 1000;
    const tick = () => {
      const el = document.getElementById('ll-timer');
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
    const form = document.getElementById('ll-quiz-form');
    const data = form ? new FormData(form) : null;
    const answers = q.questions.map((_, i) => {
      const dv = draft[i];
      const fv = data ? String(data.get('q' + i) || '') : '';
      return String(dv != null && dv !== '' ? dv : fv || '');
    });
    const result = gradeQuiz(q, answers);
    s.attempts.unshift({ id: App.uid('at'), quizId: q.id, quizTitle: q.title, owner: me, score: result.score, total: result.total, at: App.stamp(), mode, answers });
    if (s.drafts) delete s.drafts[q.id];
    ui.quizId = null; ui.quizDeadline = 0;
    bumpStudy(6, 'practice attempt saved');
    log('Practice attempt: ' + result.score + '/' + result.total + ' on ' + q.title, 'practice');
    App.save(); App.closeModal(); App.refresh();
    App.toast(mode === 'expired' ? 'Time expired — saved answers auto-submitted: ' + result.score + '/' + result.total : 'Score saved: ' + result.score + '/' + result.total);
  }
  function practice() {
    const mine = s.attempts.filter(a => a.owner === me);
    const cards = s.quizzes.map(q => {
      const draft = (s.drafts && s.drafts[q.id]) || {};
      const recovered = Object.keys(draft).some(k => k !== 'at' && draft[k] !== '');
      return '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3><div class="quiz-meta"><span>' + App.icon('quiz') + q.questions.length + ' items</span><span>' + App.icon('clock') + q.minutes + ' min</span></div></div>' +
        '<span class="badge ' + (recovered ? 'pending' : 'neutral') + '">' + (recovered ? 'Draft recovered' : 'Ready') + '</span></div>' +
        '<p class="small muted">Answers autosave on every change. Even if time runs out, your work is submitted and graded.</p>' +
        '<button class="btn btn-primary btn-sm" data-action="start-quiz" data-id="' + q.id + '">' + App.icon('quiz') + (recovered ? ' Resume' : ' Start practice') + '</button></article>';
    }).join('');
    const ordered = mine.slice().reverse();
    const max = Math.max(1, ...mine.map(a => a.total));
    const trend = ordered.map(a => '<div class="bar-row"><span>' + App.esc(a.at.slice(5, 10)) + '</span><div class="bar-bg"><div style="width:' + Math.round(a.score / max * 100) + '%"></div></div><strong>' + a.score + '/' + a.total + '</strong></div>').join('');
    const rows = mine.slice().reverse().map((a, i, arr) => {
      const prev = arr[i - 1];
      const delta = prev ? a.score - prev.score : 0;
      return '<tr><td>' + App.esc(a.at) + '</td><td>' + App.esc(a.quizTitle) + '</td><td><strong>' + a.score + '/' + a.total + '</strong></td>' +
        '<td>' + (a.mode === 'expired' ? 'Auto-submitted' : 'Submitted') + '</td><td>' + (prev ? (delta > 0 ? '<span style="color:var(--done)">+' + delta + ' better</span>' : delta < 0 ? '<span style="color:var(--danger)">' + delta + '</span>' : 'Same') : 'First') + '</td></tr>';
    }).join('');
    return '<div class="stat-grid"><div class="card stat-card accent"><span>Attempts</span><strong>' + mine.length + '</strong></div>' +
      '<div class="card stat-card good"><span>Personal best</span><strong>' + (mine.length ? Math.max.apply(null, mine.map(a => a.score)) : 0) + '</strong></div>' +
      '<div class="card stat-card warn"><span>Saved drafts</span><strong>' + Object.keys(s.drafts || {}).length + '</strong></div></div>' +
      '<h2 class="section-title">' + App.icon('quiz') + ' Practice sets</h2><div class="quiz-grid">' + cards + '</div>' +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Score progress', 'Each attempt adds to your visible trend', trend || App.empty('No attempts', 'Your trend appears after the first attempt.')) +
      App.card('Result history', 'Nothing is lost, even on timeout', rows ? '<table class="table"><thead><tr><th>When</th><th>Quiz</th><th>Score</th><th>Mode</th><th>Progress</th></tr></thead><tbody>' + rows + '</tbody></table>' : App.empty('No results', 'Take a practice set to begin.')) + '</div>';
  }

  /* ---------- Stress-Free Balance ---------- */
  function balanceTotal(owner) { return s.obligations.filter(o => o.owner === owner).reduce((n, o) => n + Math.max(0, o.amount - (o.paid || 0)), 0); }
  function balanceRows(list) {
    return list.map(o => {
      const bal = Math.max(0, o.amount - (o.paid || 0));
      return '<tr><td>' + App.esc(o.item) + '</td><td>' + App.money(o.amount) + '</td><td>' + App.esc(o.date) + '</td><td>' + App.money(o.paid || 0) + '</td>' +
        '<td><strong>' + App.money(bal) + '</strong></td><td>' + App.badge(bal ? 'pending' : 'done') + '</td>' +
        '<td><button class="btn btn-outline btn-sm" data-action="pay-obligation" data-id="' + o.id + '"' + (bal ? '' : ' disabled') + '>Pay</button></td></tr>';
    }).join('');
  }
  function balance() {
    const list = isStudent() ? s.obligations.filter(o => o.owner === me) : s.obligations.slice();
    const total = list.reduce((n, o) => n + o.amount, 0);
    const paid = list.reduce((n, o) => n + (o.paid || 0), 0);
    const history = [];
    list.forEach(o => (o.history || []).forEach(h => history.push({ item: o.item, at: h.at, amount: h.amount, actor: h.actor })));
    return App.notice('info', isStudent() ? '<strong>Privacy:</strong> only your own obligations and payment history are shown here.' : '<strong>Admin view:</strong> all itemized obligations are visible for management.') +
      '<div class="stat-grid"><div class="card stat-card"><span>Total billed</span><strong>' + App.money(total) + '</strong></div>' +
      '<div class="card stat-card good"><span>Total paid</span><strong>' + App.money(paid) + '</strong></div>' +
      '<div class="card stat-card accent"><span>Remaining balance</span><strong>' + App.money(Math.max(0, total - paid)) + '</strong></div></div>' +
      App.card('Itemized obligations', 'Item, amount, and date — balance computed automatically',
        list.length ? '<table class="table"><thead><tr><th>Item</th><th>Amount</th><th>Date</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>' + balanceRows(list) + '</tbody></table>'
          : App.empty('No obligations', 'Nothing to worry about.')) +
      '<div style="margin-top:18px">' + App.card('Payment history', 'Every payment is recorded, including partial payments',
        history.length ? '<ul class="timeline">' + history.map(h => '<li><div><strong>' + App.money(h.amount) + ' — ' + App.esc(h.item) + '</strong><small>' + App.esc(h.actor) + ' · ' + App.esc(h.at) + '</small></div></li>').join('') + '</ul>' : App.empty('No payments yet', 'Recorded payments appear here.')) + '</div>';
  }

  /* ---------- Rapid Help Channel ---------- */
  const STAGES = [{ value: 'new', label: 'New' }, { value: 'forwarded', label: 'Forwarded' }, { value: 'resolved', label: 'Resolved' }];
  function stageTrack(stage) {
    const idx = STAGES.findIndex(x => x.value === stage);
    return '<div class="stage-track">' + STAGES.map((st, i) => '<div class="stage ' + (i < idx ? 'done' : i === idx ? 'current' : '') + '">' + (i < idx ? '✓ ' : '') + st.label + '</div>').join('') + '</div>';
  }
  function helpCard(c) {
    const visible = isStudent() ? c.owner === me : (ui.helpFilter === 'all' || c.owner === me);
    if (!visible) return '';
    return '<article class="card" style="padding:16px"><div class="row spread wrap"><div><h3 style="margin:0;font-size:14px">' + App.esc(c.title) + '</h3>' +
      '<div class="small muted">' + App.esc(c.category) + ' · opened ' + App.esc(c.created) + ' · ' + App.ageChip(c.created) + '</div></div>' +
      '<span class="badge ' + (c.stage === 'resolved' ? 'done' : c.stage === 'forwarded' ? 'pending' : 'public') + '">' + App.esc(c.stage) + '</span></div>' +
      '<p class="small muted" style="margin:10px 0 0">' + App.esc(c.details || 'No additional details.') + '</p>' +
      '<div class="notice info" style="margin:8px 0">' + App.icon('send') + '<span>Auto-routed to <strong>' + App.esc(c.team) + '</strong></span></div>' +
      stageTrack(c.stage) +
      (c.resolution ? '<div class="small" style="color:var(--done)">' + App.icon('check') + ' ' + App.esc(c.resolution) + '</div>' : '') +
      '<div class="row wrap" style="margin-top:8px"><button class="btn btn-outline btn-sm" data-action="help-detail" data-id="' + c.id + '">Updates (' + (c.history || []).length + ')</button>' +
      (canTeacher() && c.stage === 'new' ? '<button class="btn btn-primary btn-sm" data-action="forward-help" data-id="' + c.id + '">Forward to ' + App.esc(c.team) + '</button>' : '') +
      (canTeacher() && c.stage === 'forwarded' ? '<button class="btn btn-success btn-sm" data-action="resolve-help" data-id="' + c.id + '">Resolve</button>' : '') + '</div></article>';
  }
  function help() {
    const list = isStudent() ? s.concerns.filter(c => c.owner === me) : s.concerns.slice();
    return '<div class="stat-grid"><div class="card stat-card accent"><span>Concerns in scope</span><strong>' + list.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Awaiting action</span><strong>' + list.filter(c => c.stage !== 'resolved').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Resolved</span><strong>' + list.filter(c => c.stage === 'resolved').length + '</strong></div></div>' +
      App.notice('info', 'Concerns are routed automatically by category: Facilities → Maintenance, IT → IT Support, Academics → Adviser, Library → Library Staff.') +
      '<div class="toolbar">' + (isStudent() ? '<span class="badge private">' + App.icon('lock') + ' My concerns only</span>' : App.tabs('helpFilter', [
        { value: 'all', label: 'All', count: list.length }, { value: 'mine', label: 'My concerns' }
      ], ui.helpFilter)) + '<button class="btn btn-primary btn-sm" data-action="new-concern">' + App.icon('plus') + ' Get help fast</button></div>' +
      '<div class="stack">' + (list.length ? list.map(helpCard).join('') : App.empty('No concerns', 'Submit one and it will be routed automatically.')) + '</div>' +
      '<div style="margin-top:18px">' + nudgeCenter(5) + '</div>';
  }

  App.init({
    slug: 'learnloop', title: 'LearnLoop', tagline: 'Study-Time Maximizer & Student Support', icon: 'book', accent: 'violet',
    roles: ['student', 'teacher', 'admin'], roleLabels: { student: 'Student view', teacher: 'Teacher view', admin: 'Administrator view' },
    user: { name: 'Mia Santos', meta: '2024-02218 · BS Psychology', initials: 'MS' },
    progressLabel: 'Study loop on track', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'materials', label: 'Material Nudges', icon: 'box', group: 'MODULES' },
      { id: 'space', label: 'Study Space', icon: 'home', group: 'MODULES' },
      { id: 'queue', label: 'Time-Saver Queue', icon: 'ticket', group: 'MODULES' },
      { id: 'practice', label: 'Practice', icon: 'quiz', group: 'MODULES' },
      { id: 'balance', label: 'Balance', icon: 'wallet', group: 'MODULES' },
      { id: 'help', label: 'Rapid Help', icon: 'chat', group: 'SUPPORT' }
    ],
    views: {
      dashboard: { title: 'Overview', subtitle: 'Protecting your study time and peace of mind', render: dashboard },
      materials: { title: 'Material Arrival Nudges', subtitle: 'Arrival, 24h, and 48h notices with a pending-items view', render: materials },
      space: { title: 'Study-Space Readiness', subtitle: 'Cleaning schedules and teacher cleanliness monitoring', render: space },
      queue: { title: 'Time-Saver Queue', subtitle: 'Live position, ETA, and turn alerts so you only leave your desk when needed', render: queue },
      practice: { title: 'Never-Lose-Progress Practice', subtitle: 'Autosaved answers, expired attempts, and visible improvement', render: practice },
      balance: { title: 'Stress-Free Balance', subtitle: 'Itemized obligations with an automatically computed remaining balance', render: balance },
      help: { title: 'Rapid Help Channel', subtitle: 'Auto-routed concerns with staged notifications until resolved', render: help }
    }
  });

  s = App.state; // MUST be after App.init()
  s.drafts = s.drafts || {};
  syncNudges();
  App.save();

  /* Autosave quiz drafts on every input change. */
  s.quizzes.forEach(q => q.questions.forEach((qq, i) => {
    App.onInput('llq-' + q.id + '-' + i, (value, el) => {
      const qid = el && el.dataset && el.dataset.quiz ? el.dataset.quiz : q.id;
      const idx = el && el.dataset && el.dataset.q != null ? Number(el.dataset.q) : i;
      s.drafts[qid] = s.drafts[qid] || {};
      s.drafts[qid][idx] = value;
      s.drafts[qid].at = App.stamp();
      const status = document.getElementById('ll-draft-status');
      if (status) status.textContent = 'Draft autosaved at ' + s.drafts[qid].at;
      App.save();
    });
  }));

  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });

  /* Nudges */
  App.on('sync-nudges', () => { syncNudges(); App.save(); App.refresh(); App.toast('Nudges generated from material dates.'); });
  App.on('mark-read', () => { visibleNotices().forEach(n => { n.read = true; }); App.save(); App.refresh(); App.toast('All nudges read.'); });

  /* Materials */
  App.on('claim-material', d => {
    const m = s.materials.find(x => x.id === d.id);
    if (!m || m.status === 'claimed' || m.owner !== me) return;
    m.status = 'claimed'; m.claimedAt = App.stamp();
    m.history.push({ at: m.claimedAt, action: 'Claimed by student', actor: me });
    addNudge('arrival', 'You claimed ' + m.title + '. Enjoy the extra study time.', me, 'claimed-' + m.id);
    bumpStudy(5, 'material claimed without a counter trip');
    log('Material claimed: ' + m.title, 'materials');
    App.save(); App.refresh(); App.toast('Material claimed instantly.');
  });
  App.on('material-detail', d => {
    const m = s.materials.find(x => x.id === d.id); if (!m) return;
    const html = '<dl class="kv"><dt>Source</dt><dd>' + App.esc(m.source) + '</dd><dt>Location</dt><dd>' + App.esc(m.location) + '</dd>' +
      '<dt>Arrived</dt><dd>' + App.esc(m.arrived) + '</dd><dt>Due</dt><dd>' + App.esc(m.due) + '</dd><dt>Owner</dt><dd>' + App.esc(m.owner) + '</dd></dl>' +
      '<h4 class="section-title">' + App.icon('history') + ' Claiming history</h4><ul class="timeline">' + (m.history || []).map(h =>
        '<li><div><strong>' + App.esc(h.action) + '</strong><small>' + App.esc(h.actor) + ' · ' + App.esc(h.at) + '</small></div></li>').join('') + '</ul>';
    App.modal(m.title, m.status + (m.claimedAt ? ' · claimed ' + m.claimedAt : ''), html, '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  });
  App.on('add-material', () => {
    App.modal('Add material record', 'Nudges will be generated from its dates',
      '<form id="ll-material-form"><div class="field"><label for="lm-title">Title</label><input class="input" id="lm-title" name="title" required /></div>' +
      '<div class="field"><label for="lm-source">Source</label><input class="input" id="lm-source" name="source" /></div>' +
      '<div class="field"><label for="lm-location">Pickup location</label><input class="input" id="lm-location" name="location" /></div>' +
      '<div class="detail-grid"><div class="field"><label for="lm-arrived">Arrived</label><input class="input" type="date" id="lm-arrived" name="arrived" value="' + App.today() + '" /></div>' +
      '<div class="field"><label for="lm-due">Due</label><input class="input" type="date" id="lm-due" name="due" value="' + App.addDays(App.today(), 2) + '" /></div></div>' +
      '<div class="field"><label for="lm-owner">Owner</label><input class="input" id="lm-owner" name="owner" value="' + App.esc(me) + '" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-material">' + App.icon('plus') + ' Add</button>');
  });
  App.on('save-material', () => {
    const data = new FormData(document.getElementById('ll-material-form'));
    const arrived = String(data.get('arrived') || App.today());
    s.materials.unshift({ id: App.uid('mt'), title: String(data.get('title') || 'New material'), type: 'Material', source: String(data.get('source') || 'Office'), location: String(data.get('location') || 'Counter'), arrived, due: String(data.get('due') || App.addDays(arrived, 2)), status: 'pending', owner: String(data.get('owner') || me), claimedAt: null, history: [{ at: App.stamp(), action: 'Material record created', actor: roleName() }] });
    syncNudges(); log('Material added', 'materials'); App.save(); App.closeModal(); App.refresh(); App.toast('Material added; nudges generated.');
  });

  /* Space */
  App.on('set-clean', d => {
    const r = s.rooms.find(x => x.id === d.id); if (!r || !canTeacher()) return;
    r.cleanliness = d.value; r.lastChecked = App.today(); r.checker = roleName();
    r.checks = r.checks || []; r.checks.push({ at: App.stamp(), actor: roleName(), result: d.value });
    log(r.name + ' marked ' + d.value, 'space'); App.save(); App.refresh(); App.toast(r.name + ' updated.');
  });
  App.on('room-checks', d => {
    const r = s.rooms.find(x => x.id === d.id); if (!r) return;
    proofModal(r.name + ' — cleanliness checks', r.cleanliness + ' · last checked ' + r.lastChecked,
      (r.checks || []).map(c => ({ action: 'Marked ' + c.result, actor: c.actor, at: c.at, detail: '' })));
  });
  function proofModal(title, subtitle, entries) {
    const html = entries && entries.length ? '<ul class="timeline">' + entries.map(e => '<li><div><strong>' + App.esc(e.action) + '</strong><small>' + App.esc(e.actor || '') + ' · ' + App.esc(e.at) + '</small></div></li>').join('') + '</ul>' : App.empty('No checks yet', 'Checks are recorded here.');
    App.modal(title, subtitle, html, '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  }
  App.on('submit-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t || t.status !== 'pending' || t.assignedTo !== me) return;
    App.modal('Submit cleaning completion', t.room + ' · ' + t.task,
      '<form id="ll-duty-form"><div class="field"><label for="ld-note">Completion note</label><textarea class="textarea" id="ld-note" name="note"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-duty" data-id="' + t.id + '">' + App.icon('check') + ' Submit</button>');
  });
  App.on('confirm-duty', d => {
    const t = s.duties.find(x => x.id === d.id); if (!t) return;
    const f = document.getElementById('ll-duty-form');
    t.note = f ? String(new FormData(f).get('note') || '') : '';
    t.status = 'done'; t.submitted = App.today();
    bumpStudy(10, 'duty completed in one step');
    log('Duty completed: ' + t.task, 'space'); App.save(); App.closeModal(); App.refresh(); App.toast('Completion submitted.');
  });

  /* Queue */
  App.on('join-queue', d => {
    const v = s.services.find(x => x.id === d.id); if (!v) return;
    const waiting = s.tickets.filter(t => t.service === v.name && t.status === 'waiting').length;
    const t = { id: App.uid('tk'), code: v.name.charAt(0).toUpperCase() + '-' + String(100 + s.tickets.length).slice(-3), service: v.name, owner: me, status: 'waiting', joined: App.stamp(), eta: Math.max(1, waiting * v.avg) };
    s.tickets.push(t);
    addNudge('turn', 'Ticket ' + t.code + ' for ' + v.name + ' issued. Position #' + (waiting + 1) + ', ETA ' + t.eta + ' min.', me, 'ticket-' + t.id);
    bumpStudy(12, 'joined queue remotely');
    log('Joined queue remotely: ' + v.name, 'queue');
    App.save(); App.refresh(); App.toast('Joined ' + v.name + ' — keep studying.');
  });
  App.on('refresh-eta', () => {
    s.tickets.filter(t => t.status === 'waiting').forEach(t => {
      t.eta = Math.max(1, (t.eta || 4) - 1);
      if (t.eta <= 2) addNudge('turn', 'Almost your turn at ' + t.service + ' — ticket ' + t.code + '.', t.owner, 'near-' + t.id);
    });
    log('Queue ETAs refreshed', 'queue'); App.save(); App.refresh(); App.toast('Live ETA refreshed.');
  });
  App.on('call-next', () => {
    const t = s.tickets.find(x => x.status === 'waiting');
    if (!t) { App.toast('No one is waiting.', 'error'); return; }
    t.status = 'served'; t.calledAt = App.stamp();
    addNudge('turn', 'It is your turn at ' + t.service + ' — ticket ' + t.code + '.', t.owner, 'called-' + t.id);
    log('Ticket called: ' + t.code, 'queue'); App.save(); App.refresh(); App.toast('Called ' + t.code + '.');
  });
  App.on('leave-queue', d => {
    const t = s.tickets.find(x => x.id === d.id); if (!t) return;
    t.status = 'cancelled'; log('Left queue: ' + t.code, 'queue'); App.save(); App.refresh(); App.toast('You left the queue.');
  });

  /* Practice */
  App.on('start-quiz', d => { const q = s.quizzes.find(x => x.id === d.id); if (q) quizModal(q); });
  App.on('submit-quiz', () => finishQuiz('submitted'));
  App.on('expire-quiz', () => finishQuiz('expired'));

  /* Balance */
  App.on('pay-obligation', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    const bal = Math.max(0, o.amount - (o.paid || 0));
    if (!bal) { App.toast('Already paid.', 'error'); return; }
    App.modal('Record a payment', o.item + ' · ' + App.money(bal) + ' remaining',
      '<form id="ll-pay-form"><div class="field"><label for="lp-amount">Amount</label><input class="input" type="number" min="1" max="' + bal + '" id="lp-amount" name="amount" value="' + bal + '" /></div>' +
      '<p class="field-hint">Partial payments are recorded and deducted immediately.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-payment" data-id="' + o.id + '">' + App.icon('wallet') + ' Record</button>');
  });
  App.on('confirm-payment', d => {
    const o = s.obligations.find(x => x.id === d.id); if (!o) return;
    const f = document.getElementById('ll-pay-form');
    const amount = Math.max(0, Number(f ? new FormData(f).get('amount') : 0) || 0);
    if (!amount) { App.toast('Enter a valid amount.', 'error'); return; }
    o.paid = Math.min(o.amount, (o.paid || 0) + amount);
    o.history.push({ at: App.stamp(), amount, actor: roleName() });
    bumpStudy(4, 'balance settled without worrying');
    log('Payment recorded: ' + App.money(amount) + ' · ' + o.item, 'balance');
    App.save(); App.closeModal(); App.refresh(); App.toast('Payment recorded; balance recalculated.');
  });

  /* Rapid Help Channel */
  App.on('new-concern', () => {
    App.modal('Get help fast', 'We route it for you automatically',
      '<form id="ll-help-form"><div class="field"><label for="lh-title">Concern</label><input class="input" id="lh-title" name="title" required /></div>' +
      '<div class="field"><label for="lh-cat">Category</label><select class="select" id="lh-cat" name="category">' + Object.keys(s.routes).map(k => '<option>' + App.esc(k) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="lh-details">Details</label><textarea class="textarea" id="lh-details" name="details"></textarea></div>' +
      '<p class="field-hint">Facilities → Maintenance · IT → IT Support · Academics → Adviser · Library → Library Staff</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="save-concern">' + App.icon('send') + ' Send concern</button>');
  });
  App.on('save-concern', () => {
    const data = new FormData(document.getElementById('ll-help-form'));
    const cat = String(data.get('category') || 'Other');
    const team = s.routes[cat] || 'General Services';
    const c = { id: App.uid('hp'), title: String(data.get('title') || 'Untitled concern'), category: cat, team, stage: 'new', owner: me, created: App.today(), resolution: '', history: [{ at: App.stamp(), stage: 'new', actor: me, note: 'Received and auto-routed to ' + team + '.' }] };
    s.concerns.unshift(c);
    addNudge('help', 'We received "' + c.title + '" and routed it to ' + team + '.', me, 'new-' + c.id);
    bumpStudy(8, 'concern auto-routed');
    log('Concern auto-routed to ' + team + ': ' + c.title, 'help');
    App.save(); App.closeModal(); App.refresh(); App.toast('Concern routed to ' + team + '.');
  });
  App.on('forward-help', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c || !canTeacher() || c.stage !== 'new') return;
    c.stage = 'forwarded';
    c.history.push({ at: App.stamp(), stage: 'forwarded', actor: roleName(), note: 'Forwarded to ' + c.team + ' for action.' });
    addNudge('help', 'Your concern "' + c.title + '" was forwarded to ' + c.team + '.', c.owner, 'forwarded-' + c.id);
    bumpStudy(5, 'staged help update received');
    log('Concern forwarded: ' + c.title, 'help'); App.save(); App.refresh(); App.toast('Forwarded to ' + c.team + '.');
  });
  App.on('resolve-help', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c || !canTeacher() || c.stage !== 'forwarded') return;
    App.modal('Resolve concern', c.title,
      '<form id="ll-resolve-form"><div class="field"><label for="lr-note">Resolution note</label><textarea class="textarea" id="lr-note" name="note" required></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-resolve" data-id="' + c.id + '">' + App.icon('check') + ' Resolve</button>');
  });
  App.on('confirm-resolve', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c) return;
    const f = document.getElementById('ll-resolve-form');
    c.resolution = f ? String(new FormData(f).get('note') || '') : 'Resolved';
    c.stage = 'resolved';
    c.history.push({ at: App.stamp(), stage: 'resolved', actor: roleName(), note: c.resolution });
    addNudge('help', 'Resolved: "' + c.title + '" — ' + c.resolution, c.owner, 'resolved-' + c.id);
    bumpStudy(10, 'concern resolved with closure notice');
    log('Concern resolved: ' + c.title, 'help'); App.save(); App.closeModal(); App.refresh(); App.toast('Resolution notice sent.');
  });
  App.on('help-detail', d => {
    const c = s.concerns.find(x => x.id === d.id); if (!c) return;
    const html = '<dl class="kv"><dt>Category</dt><dd>' + App.esc(c.category) + '</dd><dt>Routed to</dt><dd>' + App.esc(c.team) + '</dd>' +
      '<dt>Opened</dt><dd>' + App.esc(c.created) + '</dd><dt>Stage</dt><dd>' + App.esc(c.stage) + '</dd></dl>' +
      stageTrack(c.stage) + '<h4 class="section-title">' + App.icon('history') + ' Staged updates</h4><ul class="timeline">' + (c.history || []).map(h =>
        '<li><div><strong>' + App.esc(h.stage) + ' — ' + App.esc(h.note) + '</strong><small>' + App.esc(h.actor) + ' · ' + App.esc(h.at) + '</small></div></li>').join('') + '</ul>';
    App.modal(c.title, 'Auto-routed to ' + c.team, html, '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  });

  function updateCounts() {
    App.setCounts({
      dashboard: visibleNotices().filter(n => !n.read).length,
      materials: s.materials.filter(m => m.owner === me && m.status !== 'claimed').length,
      space: s.duties.filter(d => d.assignedTo === me && d.status === 'pending').length,
      queue: s.tickets.filter(t => t.owner === me && t.status === 'waiting').length,
      practice: Object.keys(s.drafts || {}).length,
      balance: s.obligations.filter(o => o.owner === me && (o.paid || 0) < o.amount).length,
      help: s.concerns.filter(c => c.owner === me && c.stage !== 'resolved').length
    });
    const total = s.duties.length + s.materials.length + s.concerns.length;
    const done = s.duties.filter(d => d.status === 'done').length + s.materials.filter(m => m.status === 'claimed').length + s.concerns.filter(c => c.stage === 'resolved').length;
    App.setProgress(total ? Math.round(done / total * 100) : 0, 'Study loop on track');
  }
  updateCounts();
  App.go('dashboard');
})();
