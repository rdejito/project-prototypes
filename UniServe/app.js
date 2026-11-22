/* UniServe prototype — one system serving staff and service users. */
(function () {
  let s; // assigned immediately after App.init() below
  const ui = {
    itemFilter: 'all', ledgerFilter: 'all', quizFilter: 'published', serviceSearch: '',
    spaceFilter: 'all', requestFilter: 'all', noticeFilter: 'all', scanned: null
  };
  const me = 'Alex Morgan';

  const ROLE_LABELS = {
    admin: 'Administrator', owner: 'Owner', mh: 'Material Handler',
    teacher: 'Teacher / Creator', customer: 'Customer / Requestor'
  };
  const PERMISSIONS = [
    { role: 'Administrator', access: 'All six modules', powers: 'Oversight, notices, requests, publishing, monitoring' },
    { role: 'Owner', access: 'Ledger, Service Desk, Requests', powers: 'Customer CRUD, full/partial payments, send notices' },
    { role: 'Material Handler', access: 'Receiving, Spaces, Requests', powers: 'Scan, review/edit/save items, monitor cage' },
    { role: 'Teacher / Creator', access: 'Quiz, Spaces, Requests', powers: 'Create/publish quizzes, analytics, cleanliness monitoring' },
    { role: 'Customer / Requestor', access: 'Self-service in every module', powers: 'Own items, own balance, take quizzes, file requests, claim' }
  ];

  const isAdmin = () => s.role === 'admin';
  const isOwner = () => s.role === 'owner' || s.role === 'admin';
  const isMh = () => s.role === 'mh' || s.role === 'admin';
  const isTeacher = () => s.role === 'teacher' || s.role === 'admin';
  const isCreator = () => s.role === 'teacher' || s.role === 'owner' || s.role === 'admin';
  const isCustomer = () => s.role === 'customer';
  const label = () => ROLE_LABELS[s.role] || s.role || 'Guest';

  function pushNotice(to, kind, text) {
    s.notices = s.notices || [];
    s.notices.unshift({ id: App.uid('nt'), to: to, kind: kind, text: text, date: App.stamp(), read: false });
  }
  function log(text, module) { App.activity(text, module); }
  function intro(text) { return App.notice('info', text); }
  function accessDenied(module, need) {
    return intro('You are viewing <strong>' + App.esc(label()) + '</strong>. ' + need +
      ' Use the role switcher in the top bar to explore the ' + App.esc(module) + ' staff view.');
  }
  function visibleNotices() {
    if (isAdmin()) return s.notices.slice();
    return s.notices.filter(n => n.to === 'all' || n.to === me || n.to === s.role);
  }
  function noticeStack(limit) {
    const list = visibleNotices().slice(0, limit || 6);
    if (!list.length) return App.empty('No notices', 'New alerts will appear here.');
    return '<div class="notice-stack">' + list.map(n =>
      '<div class="notice ' + (n.read ? 'info' : 'warn') + '">' + App.icon('bell') + '<span style="flex:1">' +
      '<strong>' + App.esc(n.kind.toUpperCase()) + '</strong> · ' + App.esc(n.text) +
      '<br><small class="muted">' + App.esc(n.date) + (n.read ? ' · read' : ' · unread') + '</small></span>' +
      (n.read ? '' : '<button class="btn btn-outline btn-sm" data-action="mark-read" data-id="' + n.id + '">Mark read</button>') +
      '</div>').join('') + '</div>';
  }
  function age(item) { return App.ageChip(item.arrival); }
  function statusTrack(status) {
    const stages = ['Recorded', 'In cage', 'Claimed'];
    const idx = status === 'claimed' ? 2 : 1;
    return '<div class="stage-track">' + stages.map((x, i) =>
      '<div class="stage ' + (i < idx ? 'done' : i === idx ? 'current' : '') + '">' + x + '</div>').join('') + '</div>';
  }

  /* ---------------- Dashboard ---------------- */
  function dashboard() {
    const pendingItems = s.items.filter(i => i.status === 'pending').length;
    const openRequests = s.requests.filter(r => r.status === 'open').length;
    const unread = visibleNotices().filter(n => !n.read).length;
    const claims = s.items.reduce((n, i) => n + i.claimHistory.filter(h => h.by !== 'System').length, 0);
    const hero = '<div class="hero"><div class="hero-top"><div><h2>Welcome back, ' + App.esc(s.session.name.split(' ')[0]) + '.</h2>' +
      '<p>UniServe brings item receiving, customer accounts, quizzes, services, clean spaces, and requests together — one login, one role model, one notice center.</p></div>' +
      '<div class="hero-ring"><div class="ring" style="--ring:' + Math.round(s.requests.filter(r => r.status === 'resolved').length / s.requests.length * 100) + '%"><div class="ring-inner">' +
      Math.round(s.requests.filter(r => r.status === 'resolved').length / s.requests.length * 100) + '%</div></div><small>Requests resolved</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + pendingItems + '</strong><span>Pending items</span></div>' +
      '<div class="hero-stat"><strong>' + s.customers.length + '</strong><span>Customer profiles</span></div>' +
      '<div class="hero-stat"><strong>' + claims + '</strong><span>Recorded claims</span></div>' +
      '<div class="hero-stat"><strong>' + unread + '</strong><span>Unread notices</span></div></div></div>';

    const stats = '<div class="stat-grid" style="margin-top:18px"><div class="card stat-card warn"><span>Open requests</span><strong>' + openRequests + '</strong></div>' +
      '<div class="card stat-card accent"><span>Published quizzes</span><strong>' + s.quizzes.filter(q => q.status === 'published').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Rooms in good condition</span><strong>' + s.rooms.filter(r => r.cleanliness === 'Good').length + '</strong></div></div>';

    const modules = [
      ['receiving', 'box', 'Smart Receiving', 'Scan → review → save; track pending and claimed items.', 'tone-indigo'],
      ['ledger', 'wallet', 'Customer Ledger', 'Profiles, full/partial payments, and own balances.', 'tone-rose'],
      ['quiz', 'quiz', 'Quiz & Analytics', 'Role-based quizzes, attempts, scores and pass rates.', 'tone-violet'],
      ['services', 'chat', 'Service Desk', 'Login, service directory, and the notice center.', 'tone-sky'],
      ['spaces', 'broom', 'Clean Spaces', 'Schedules and teacher cleanliness monitoring.', 'tone-teal'],
      ['requests', 'ticket', 'Request Desk', 'Open / Resolved statuses and resolution notices.', 'tone-amber']
    ];
    const moduleCards = '<div class="module-grid" style="margin-top:18px">' + modules.map(m =>
      '<article class="card module-card"><div class="module-top"><span class="module-icon ' + m[4] + '">' + App.icon(m[1]) + '</span>' +
      App.badge('active') + '</div><h3>' + m[2] + '</h3><p>' + m[3] + '</p><div class="module-foot"><span class="tiny muted">Unified module</span>' +
      '<button class="btn btn-soft btn-sm" data-action="nav" data-view="' + m[0] + '">Open ' + App.icon('arrow') + '</button></div></article>').join('') + '</div>';

    const matrix = '<table class="table"><thead><tr><th>Role</th><th>Module access</th><th>Key powers</th></tr></thead><tbody>' +
      PERMISSIONS.map(p => '<tr><td><span class="badge neutral">' + App.esc(p.role) + '</span></td><td>' + App.esc(p.access) + '</td><td>' + App.esc(p.powers) + '</td></tr>').join('') + '</tbody></table>';
    const act = s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');

    return hero + stats + '<h2 class="section-title">' + App.icon('grid') + ' Six modules, one account</h2>' + moduleCards +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Notice center', 'Latest alerts for ' + label(), noticeStack(5)) +
      App.card('Recent activity', 'Timestamped record of changes', act) + '</div>' +
      '<div style="margin-top:18px">' + App.card('Role & permission matrix', 'Each module checks the active role before allowing an action', matrix) + '</div>';
  }

  /* ---------------- Smart Receiving ---------------- */
  function itemRow(i) {
    const mine = i.requestor === me;
    return '<div class="list-row"><span class="activity-icon">' + App.icon('box') + '</span><div class="list-main"><strong>' + App.esc(i.name) + '</strong>' +
      '<div class="meta"><span>' + App.icon('file') + App.esc(i.code) + '</span><span>' + App.icon('user') + App.esc(i.requestor) + '</span>' +
      '<span>' + App.icon('calendar') + App.esc(i.arrival) + '</span><span>' + App.icon('map') + App.esc(i.location) + '</span>' + age(i) + '</div></div>' +
      App.badge(i.status) + '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="view-item" data-id="' + i.id + '">Details</button>' +
      (isMh() ? '<button class="btn btn-outline btn-sm" data-action="edit-item" data-id="' + i.id + '">' + App.icon('edit') + ' Edit</button>' : '') +
      (isCustomer() && mine && i.status === 'pending' ? '<button class="btn btn-success btn-sm" data-action="claim-item" data-id="' + i.id + '">' + App.icon('check') + ' Claim</button>' : '') +
      '</div></div>';
  }
  function scanFormHtml() {
    const c = ui.scanned;
    if (!c) return intro('Choose a fake scanned code above, then press <strong>Simulate scan</strong>. The item entry form will be populated from the scanned payload.');
    return '<form id="scan-form"><div class="notice info">' + App.icon('scan') + '<span>Form auto-populated from <strong>' + App.esc(c.code) + '</strong>. Review and edit any field before saving.</span></div>' +
      '<div class="detail-grid"><div class="field"><label for="sf-code">Scanned code</label><input class="input" id="sf-code" name="code" value="' + App.esc(c.code) + '" required /></div>' +
      '<div class="field"><label for="sf-name">Item name</label><input class="input" id="sf-name" name="name" value="' + App.esc(c.name) + '" required /></div>' +
      '<div class="field"><label for="sf-cat">Category</label><input class="input" id="sf-cat" name="category" value="' + App.esc(c.category) + '" /></div>' +
      '<div class="field"><label for="sf-supplier">Supplier</label><input class="input" id="sf-supplier" name="supplier" value="' + App.esc(c.supplier) + '" /></div>' +
      '<div class="field"><label for="sf-req">Requestor</label><select class="select" id="sf-req" name="requestor">' + s.customers.map(x => '<option' + (x.name === c.requestor ? ' selected' : '') + '>' + App.esc(x.name) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="sf-cond">Condition</label><select class="select" id="sf-cond" name="condition"><option>Good</option><option>Sealed</option><option>Damaged</option></select></div>' +
      '<div class="field"><label for="sf-loc">Cage location</label><input class="input" id="sf-loc" name="location" value="Cage A-10" /></div></div></form>' +
      '<div class="row"><button class="btn btn-primary" data-action="save-scan">' + App.icon('check') + ' Review & save item</button>' +
      '<button class="btn btn-outline" data-action="clear-scan">Clear form</button></div>';
  }
  function receiving() {
    const mine = s.items.filter(i => i.requestor === me);
    const pendingMine = mine.filter(i => i.status === 'pending');
    const claimedMine = mine.filter(i => i.status === 'claimed');
    if (isMh()) {
      let list = s.items.slice();
      if (ui.itemFilter === 'pending') list = list.filter(i => i.status === 'pending');
      if (ui.itemFilter === 'claimed') list = list.filter(i => i.status === 'claimed');
      return intro('Material Handler view: scanning fills the entry form automatically, then you review, edit, and save the record.') +
        App.card('Scan an arriving item', 'Simulated QR / barcode reader',
          '<div class="scan-frame">' + App.icon('scan') + '<div>Point the reader at the package label, or pick a sample code below.</div>' +
          '<div class="row" style="justify-content:center;margin-top:12px"><select class="select" id="scan-code" style="max-width:320px">' +
          s.scanCodes.map(c => '<option value="' + c.code + '">' + App.esc(c.code) + ' · ' + App.esc(c.name) + '</option>').join('') +
          '</select><button class="btn btn-primary" data-action="simulate-scan">' + App.icon('scan') + ' Simulate scan</button></div></div>' +
          '<div style="margin-top:18px">' + scanFormHtml() + '</div>') +
        '<div style="margin-top:18px"><div class="toolbar">' + App.tabs('itemFilter', [
          { value: 'all', label: 'All items', count: s.items.length },
          { value: 'pending', label: 'Pending', count: s.items.filter(i => i.status === 'pending').length },
          { value: 'claimed', label: 'Claimed', count: s.items.filter(i => i.status === 'claimed').length }
        ], ui.itemFilter) + '</div>' + App.card('Item records', 'Authorized receiving records with claiming history',
          list.length ? list.map(itemRow).join('') : App.empty('No items', 'Adjust the filter above.')) + '</div>';
    }
    if (isCustomer()) {
      return intro('Requestor view: only your own item details, pending items, and claiming history are shown.') +
        '<div class="stat-grid"><div class="card stat-card warn"><span>Your pending items</span><strong>' + pendingMine.length + '</strong></div>' +
        '<div class="card stat-card good"><span>Your claimed items</span><strong>' + claimedMine.length + '</strong></div>' +
        '<div class="card stat-card accent"><span>Total records</span><strong>' + mine.length + '</strong></div></div>' +
        App.card('Your pending items', 'Items waiting at the cage', pendingMine.length ? pendingMine.map(itemRow).join('') : App.empty('Nothing pending', 'All of your items have been claimed.')) +
        '<div style="margin-top:18px">' + App.card('Your claiming history', 'Every claim is timestamped', claimedMine.length ? claimedMine.map(itemRow).join('') : App.empty('No claims yet', 'Claimed items will be listed here.')) + '</div>';
    }
    return accessDenied('Smart Receiving', 'Material Handler access is required to scan and save item records.') +
      App.card('Your item records', 'Read-only view for ' + label(), mine.length ? mine.map(itemRow).join('') : App.empty('No items assigned', 'Switch to Material Handler or Customer to try the workflow.'));
  }

  /* ---------------- Customer Ledger ---------------- */
  function customerRow(c) {
    return '<div class="list-row"><span class="activity-icon">' + App.icon('user') + '</span><div class="list-main"><strong>' + App.esc(c.name) + '</strong>' +
      '<div class="meta"><span>' + App.icon('chat') + App.esc(c.email) + '</span><span>' + App.icon('wallet') + App.money(c.balance) + '</span><span>' + App.icon('history') + c.payments.length + ' payment(s)</span></div></div>' +
      '<div class="balance-figure"><strong>' + App.money(c.balance) + '</strong><span>' + (c.balance > 0 ? 'Outstanding' : 'Settled') + '</span></div>' +
      '<div class="list-actions">' + (isOwner() ? '<button class="btn btn-outline btn-sm" data-action="edit-customer" data-id="' + c.id + '">' + App.icon('edit') + ' Edit</button>' +
        '<button class="btn btn-primary btn-sm" data-action="payment-modal" data-id="' + c.id + '">' + App.icon('wallet') + ' Payment</button>' +
        '<button class="btn btn-danger-ghost btn-sm" data-action="delete-customer" data-id="' + c.id + '">' + App.icon('trash') + '</button>' : '') + '</div></div>';
  }
  function myCustomer() {
    return s.customers.find(c => c.email === s.session.email || c.name === me) || s.customers.find(c => c.name === me) || s.customers[0];
  }
  function ledger() {
    if (isOwner()) {
      let list = s.customers.slice();
      if (ui.ledgerFilter === 'owing') list = list.filter(c => c.balance > 0);
      if (ui.ledgerFilter === 'settled') list = list.filter(c => c.balance === 0);
      const total = s.customers.reduce((n, c) => n + c.balance, 0);
      return intro('Owner view: add, edit, and delete customer profiles and record full or partial payments.') +
        '<div class="stat-grid"><div class="card stat-card"><span>Customers</span><strong>' + s.customers.length + '</strong></div>' +
        '<div class="card stat-card warn"><span>Total receivable</span><strong>' + App.money(total) + '</strong></div>' +
        '<div class="card stat-card good"><span>Payments recorded</span><strong>' + s.customers.reduce((n, c) => n + c.payments.length, 0) + '</strong></div></div>' +
        '<div class="toolbar">' + App.tabs('ledgerFilter', [
          { value: 'all', label: 'All customers', count: s.customers.length },
          { value: 'owing', label: 'With balance' }, { value: 'settled', label: 'Settled' }
        ], ui.ledgerFilter) + '<button class="btn btn-primary btn-sm" data-action="add-customer">' + App.icon('plus') + ' Add customer</button></div>' +
        App.card('Customer accounts', 'Profiles and outstanding balances', list.length ? list.map(customerRow).join('') : App.empty('No customers', 'Add a profile to begin.'));
    }
    const c = myCustomer();
    if (!c) return accessDenied('Customer Ledger', 'No ledger profile is linked to this account.');
    return intro('Customer view: you can see <strong>only your own</strong> balance and payment history.') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Your balance</span><strong>' + App.money(c.balance) + '</strong></div>' +
      '<div class="card stat-card good"><span>Total paid</span><strong>' + App.money(c.payments.reduce((n, p) => n + p.amount, 0)) + '</strong></div>' +
      '<div class="card stat-card"><span>Payment entries</span><strong>' + c.payments.length + '</strong></div></div>' +
      App.card('Your payment history', c.name + ' · ' + c.email,
        c.payments.length ? '<table class="table"><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Note</th></tr></thead><tbody>' +
          c.payments.slice().reverse().map(p => '<tr><td>' + App.esc(p.date) + '</td><td>' + App.money(p.amount) + '</td><td>' + App.esc(p.mode) + '</td><td>' + App.esc(p.note || '—') + '</td></tr>').join('') +
          '</tbody></table>' : App.empty('No payments yet', 'Payments recorded by the owner will appear here.')) +
      '<div style="margin-top:18px">' + App.notice('info', 'Need to correct a balance? Ask the owner to update your profile — customers cannot edit ledger records.') + '</div>';
  }

  /* ---------------- Quiz & Analytics ---------------- */
  function attemptRows(q) {
    return q.attempts.slice().reverse().map(a => '<tr><td>' + App.esc(a.participant) + '</td><td>' + App.esc(a.date) + '</td><td>' + a.score + '%</td><td>' + App.badge(a.passed ? 'published' : 'open') + '</td></tr>').join('');
  }
  function quizAnalytics() {
    const attempts = s.quizzes.reduce((arr, q) => arr.concat(q.attempts.map(a => Object.assign({}, a, { quiz: q.title }))), []);
    const avg = attempts.length ? Math.round(attempts.reduce((n, a) => n + a.score, 0) / attempts.length) : 0;
    const passed = attempts.filter(a => a.passed).length;
    const rate = attempts.length ? Math.round(passed / attempts.length * 100) : 0;
    const perQuiz = s.quizzes.filter(q => q.attempts.length).map(q => {
      const a = Math.round(q.attempts.reduce((n, x) => n + x.score, 0) / q.attempts.length);
      const p = Math.round(q.attempts.filter(x => x.passed).length / q.attempts.length * 100);
      return '<div class="bar-row"><span title="' + App.esc(q.title) + '">' + App.esc(q.title.slice(0, 16)) + '</span><div class="bar-bg"><div style="width:' + a + '%"></div></div><strong>' + a + '%</strong>' +
        '<span class="tiny muted">' + p + '% pass</span></div>';
    }).join('');
    return '<div class="analytics-grid"><div class="card stat-card accent"><span>Average score</span><strong>' + avg + '%</strong></div>' +
      '<div class="card stat-card good"><span>Pass rate</span><strong>' + rate + '%</strong></div>' +
      '<div class="card stat-card"><span>Total attempts</span><strong>' + attempts.length + '</strong></div></div>' +
      '<div style="margin-top:18px">' + App.card('Average score per quiz', 'Creator analytics — updated after every attempt',
        (perQuiz ? '<div style="max-width:620px">' + perQuiz + '</div>' : App.empty('No attempts yet', 'Analytics appear after participants take a quiz.')) +
        '<div style="margin-top:12px">' + (attempts.length ? '<table class="table"><thead><tr><th>Participant</th><th>Quiz</th><th>Date</th><th>Score</th><th>Result</th></tr></thead><tbody>' +
          attempts.slice().reverse().map(a => '<tr><td>' + App.esc(a.participant) + '</td><td>' + App.esc(a.quiz) + '</td><td>' + App.esc(a.date) + '</td><td>' + a.score + '%</td><td>' + App.badge(a.passed ? 'published' : 'open') + '</td></tr>').join('') +
          '</tbody></table>' : '') + '</div>') + '</div>';
  }
  function quiz() {
    if (isCreator()) {
      let list = s.quizzes.slice();
      if (ui.quizFilter === 'published' || ui.quizFilter === 'draft') list = list.filter(q => q.status === ui.quizFilter);
      const cards = list.map(q => '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3>' +
        '<div class="quiz-meta"><span>' + App.icon('user') + App.esc(q.creator) + '</span><span>' + App.icon('quiz') + q.questions.length + ' item(s)</span>' +
        '<span>' + App.icon('star') + 'Pass ' + q.passScore + '%</span><span>' + App.icon('history') + q.attempts.length + ' attempt(s)</span></div></div>' + App.badge(q.status) + '</div>' +
        '<div class="module-foot"><span class="tiny muted">' + (q.attempts.length ? 'Avg ' + Math.round(q.attempts.reduce((n, a) => n + a.score, 0) / q.attempts.length) + '%' : 'No scores yet') + '</span>' +
        '<div class="row">' + (q.status === 'draft' ? '<button class="btn btn-primary btn-sm" data-action="publish-quiz" data-id="' + q.id + '">Publish</button>' : '') +
        '<button class="btn btn-outline btn-sm" data-action="view-quiz" data-id="' + q.id + '">Attempts</button></div></div></article>').join('');
      return intro('Creator view: only administrators, owners, and teachers can create, publish, and analyze quizzes.') +
        '<div class="toolbar">' + App.tabs('quizFilter', [
          { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' },
          { value: 'all', label: 'All quizzes', count: s.quizzes.length }, { value: 'analytics', label: 'Analytics' }
        ], ui.quizFilter) + '<button class="btn btn-primary btn-sm" data-action="create-quiz">' + App.icon('plus') + ' Create quiz</button></div>' +
        (ui.quizFilter === 'analytics' ? quizAnalytics() : '<div class="quiz-grid">' + (cards || App.empty('No quizzes', 'Create a quiz to get started.')) + '</div>') +
        '<div style="margin-top:18px">' + App.notice('info', 'Permission check: participants may take published quizzes but cannot see drafts, edit quizzes, or open analytics.') + '</div>';
    }
    const list = s.quizzes.filter(q => q.status === 'published');
    return intro('Participant view: you can take published quizzes. Drafts and analytics are hidden by role-based access.') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Published quizzes</span><strong>' + list.length + '</strong></div>' +
      '<div class="card stat-card good"><span>Your attempts</span><strong>' + s.quizzes.reduce((n, q) => n + q.attempts.filter(a => a.participant === me).length, 0) + '</strong></div>' +
      '<div class="card stat-card"><span>Passed</span><strong>' + s.quizzes.reduce((n, q) => n + q.attempts.filter(a => a.participant === me && a.passed).length, 0) + '</strong></div></div>' +
      '<div class="quiz-grid">' + (list.map(q => '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3>' +
        '<div class="quiz-meta"><span>' + App.icon('quiz') + q.questions.length + ' item(s)</span><span>' + App.icon('star') + 'Pass ' + q.passScore + '%</span></div></div>' + App.badge('published') + '</div>' +
        '<div class="module-foot"><span class="score-pill ' + (q.attempts.some(a => a.participant === me) ? '' : 'none') + '">' +
        (q.attempts.filter(a => a.participant === me).map(a => a.score + '%').join(', ') || 'Not taken') + '</span>' +
        '<button class="btn btn-primary btn-sm" data-action="take-quiz" data-id="' + q.id + '">Take quiz</button></div></article>').join('') || App.empty('No quizzes available', 'Check back after a creator publishes one.')) + '</div>';
  }

  /* ---------------- Service Desk ---------------- */
  function sessionPanel() {
    if (s.session.loggedIn) {
      return '<div class="notice info">' + App.icon('shield') + '<span style="flex:1"><strong>Signed in</strong> as ' + App.esc(s.session.name) +
        ' (' + App.esc(s.session.email) + ') · identity also controlled by the role switcher.</span>' +
        '<button class="btn btn-outline btn-sm" data-action="logout">' + App.icon('logout') + ' Logout</button></div>';
    }
    return '<form id="login-form"><div class="notice warn">' + App.icon('lock') + '<span>You are logged out. Sign in again to join services or view personal notices.</span></div>' +
      '<div class="detail-grid"><div class="field"><label for="login-email">Email</label><input class="input" id="login-email" type="email" value="' + App.esc(s.session.email) + '" /></div>' +
      '<div class="field"><label for="login-pass">Password</label><input class="input" id="login-pass" type="password" value="demo123" /></div></div>' +
      '<div class="row"><button class="btn btn-primary" data-action="login">' + App.icon('lock') + ' Login</button>' +
      '<button class="btn btn-outline" data-action="register">Create account</button></div></form>';
  }
  function serviceCards() {
    const q = (ui.serviceSearch || '').toLowerCase();
    const out = s.establishments.map(e => {
      const services = e.services.filter(sv => !q || (sv.name + ' ' + sv.description + ' ' + e.name).toLowerCase().includes(q));
      if (!services.length) return '';
      return '<article class="card service-card"><div class="module-top"><span class="module-icon tone-sky">' + App.icon('map') + '</span>' + App.badge('active') + '</div>' +
        '<h3 style="margin:0;font-size:14px">' + App.esc(e.name) + '</h3><p>' + App.esc(e.location) + '</p>' +
        services.map(sv => '<div class="list-row" style="padding:10px 0"><div class="list-main"><strong>' + App.esc(sv.name) + '</strong>' +
          '<div class="meta"><span>' + App.icon('clock') + '~' + sv.duration + ' min</span><span>' + App.icon('wallet') + (sv.fee ? App.money(sv.fee) : 'Free') + '</span></div>' +
          '<small class="muted">' + App.esc(sv.description) + '</small></div>' +
          '<button class="btn btn-soft btn-sm" data-action="subscribe-service" data-id="' + sv.id + '">Notify me</button></div>').join('') + '</article>';
    }).join('');
    return out || App.empty('No services found', 'Try a different search term.');
  }
  function services() {
    return intro('Service Desk: register / login / logout, browse the establishment directory, and receive notices in one place.') +
      App.card('Your session', 'Shared identity across all six modules', sessionPanel()) +
      '<div style="margin-top:18px"><div class="toolbar"><div class="search-box">' + App.icon('search') +
      '<input class="input" id="us-service-search" placeholder="Search establishments or services" value="' + App.esc(ui.serviceSearch) + '" /></div>' +
      (isOwner() ? '<button class="btn btn-primary btn-sm" data-action="send-notice">' + App.icon('send') + ' Send notice</button>' : '') + '</div>' +
      '<h2 class="section-title">' + App.icon('map') + ' Establishment & service directory</h2><div class="service-grid">' + serviceCards() + '</div></div>' +
      '<div style="margin-top:18px">' + App.card('Notice center', 'Alerts for ' + label(), noticeStack(10)) + '</div>' +
      '<div style="margin-top:18px">' + App.notice('info', 'Notifications are simulated in-app: arrivals, payments, service alerts, and request resolutions all land in this center.') + '</div>';
  }

  /* ---------------- Clean Spaces ---------------- */
  function taskRow(t) {
    return '<div class="list-row"><span class="activity-icon">' + App.icon('broom') + '</span><div class="list-main"><strong>' + App.esc(t.task) + '</strong>' +
      '<div class="meta"><span>' + App.icon('map') + App.esc(t.room) + '</span><span>' + App.icon('calendar') + App.esc(t.date) + '</span>' +
      '<span>' + App.icon('user') + App.esc(t.assignedTo) + '</span>' + (t.note ? '<span>' + App.icon('check') + App.esc(t.note) + '</span>' : '') + '</div></div>' +
      App.badge(t.status) + '<div class="list-actions">' + (t.status === 'pending' && (isTeacher() || t.assignedTo === me) ?
        '<button class="btn btn-success btn-sm" data-action="submit-task" data-id="' + t.id + '">' + App.icon('check') + ' Mark done</button>' : '') + '</div></div>';
  }
  function spaces() {
    let rooms = s.rooms.slice();
    if (ui.spaceFilter !== 'all') rooms = rooms.filter(r => r.cleanliness === ui.spaceFilter);
    const roomCards = rooms.map(r => '<article class="card service-card"><div class="module-top"><span class="module-icon ' +
      (r.cleanliness === 'Good' ? 'tone-teal' : r.cleanliness === 'Poor' ? 'tone-rose' : 'tone-amber') + '">' + App.icon('home') + '</span>' +
      '<span class="badge ' + (r.cleanliness === 'Good' ? 'done' : r.cleanliness === 'Poor' ? 'open' : 'pending') + '">' + App.esc(r.cleanliness) + '</span></div>' +
      '<h3 style="margin:0;font-size:14px">' + App.esc(r.name) + '</h3><p>' + App.esc(r.building) + '</p>' +
      '<div class="service-meta"><span>' + App.icon('calendar') + 'Checked ' + App.esc(r.lastChecked) + '</span></div>' +
      (isTeacher() ? '<div class="row"><button class="btn btn-outline btn-sm" data-action="set-clean" data-id="' + r.id + '" data-value="Good">Mark clean</button>' +
        '<button class="btn btn-danger-ghost btn-sm" data-action="set-clean" data-id="' + r.id + '" data-value="Needs attention">Flag issue</button></div>' : '') + '</article>').join('');
    return intro('Clean Spaces: published cleaning schedules plus a teacher monitoring view of classroom cleanliness.') +
      (isTeacher() ? '' : accessDenied('Clean Spaces', 'Teacher access is needed to change cleanliness records.')) +
      '<div class="toolbar">' + App.tabs('spaceFilter', [
        { value: 'all', label: 'All rooms', count: s.rooms.length }, { value: 'Good', label: 'Clean' },
        { value: 'Needs attention', label: 'Needs attention' }, { value: 'Poor', label: 'Poor' }
      ], ui.spaceFilter) + (isTeacher() ? '<button class="btn btn-primary btn-sm" data-action="assign-task">' + App.icon('plus') + ' Assign task</button>' : '') + '</div>' +
      '<div class="service-grid">' + (roomCards || App.empty('No rooms', 'Adjust the filter above.')) + '</div>' +
      '<div style="margin-top:18px">' + App.card('Cleaning schedule', 'Tasks and completion records', s.tasks.map(taskRow).join('')) + '</div>';
  }

  /* ---------------- Request Desk ---------------- */
  function requestRow(r) {
    return '<div class="list-row"><span class="activity-icon">' + App.icon('ticket') + '</span><div class="list-main"><strong>' + App.esc(r.title) + '</strong>' +
      '<div class="meta"><span>' + App.icon('user') + App.esc(r.requestor) + '</span><span>' + App.icon('calendar') + App.esc(r.date) + '</span>' +
      (r.resolvedAt ? '<span>' + App.icon('check') + 'Resolved ' + App.esc(r.resolvedAt) + '</span>' : '') + '</div>' +
      '<small class="muted">' + App.esc(r.description) + (r.note ? ' · Resolution: ' + App.esc(r.note) : '') + '</small></div>' +
      App.badge(r.status) + '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="view-request" data-id="' + r.id + '">Details</button>' +
      (isOwner() && r.status === 'open' ? '<button class="btn btn-success btn-sm" data-action="resolve-request" data-id="' + r.id + '">Resolve</button>' : '') + '</div></div>';
  }
  function requests() {
    let list = s.requests.slice();
    if (isCustomer()) list = list.filter(r => r.requestor === me);
    if (ui.requestFilter === 'open') list = list.filter(r => r.status === 'open');
    if (ui.requestFilter === 'resolved') list = list.filter(r => r.status === 'resolved');
    return intro('Request Desk: every request is Open or Resolved, and the requestor receives a resolution notice automatically.') +
      (isCustomer() ? '' : accessDenied('Request Desk', 'Staff access is needed to resolve requests; filing is open to everyone.')) +
      '<div class="stat-grid"><div class="card stat-card open"><span>Open</span><strong>' + s.requests.filter(r => r.status === 'open').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Resolved</span><strong>' + s.requests.filter(r => r.status === 'resolved').length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Your requests</span><strong>' + s.requests.filter(r => r.requestor === me).length + '</strong></div></div>' +
      '<div class="toolbar">' + App.tabs('requestFilter', [
        { value: 'all', label: 'All' }, { value: 'open', label: 'Open', count: s.requests.filter(r => r.status === 'open').length },
        { value: 'resolved', label: 'Resolved', count: s.requests.filter(r => r.status === 'resolved').length }
      ], ui.requestFilter) + '<button class="btn btn-primary btn-sm" data-action="file-request">' + App.icon('plus') + ' File a request</button></div>' +
      App.card('Requests', isCustomer() ? 'Only your own requests are listed' : 'All service requests', list.length ? list.map(requestRow).join('') : App.empty('No requests', 'File a request to get started.')) +
      '<div style="margin-top:18px">' + App.card('Resolution notices', 'Requestors are notified when a request is closed', noticeStack(6)) + '</div>';
  }

  /* ---------------- App configuration ---------------- */
  App.init({
    slug: 'unserve', title: 'UniServe', tagline: 'Unified Service Management', icon: 'heart', accent: 'rose',
    roles: ['admin', 'owner', 'mh', 'teacher', 'customer'],
    roleLabels: ROLE_LABELS,
    user: { name: 'Alex Morgan', meta: 'Unified account · customer', initials: 'AM' },
    progressLabel: 'Requests resolved', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'receiving', label: 'Smart Receiving', icon: 'box', group: 'SERVICE MODULES' },
      { id: 'ledger', label: 'Customer Ledger', icon: 'wallet', group: 'SERVICE MODULES' },
      { id: 'quiz', label: 'Quiz & Analytics', icon: 'quiz', group: 'SERVICE MODULES' },
      { id: 'services', label: 'Service Desk', icon: 'chat', group: 'SERVICE MODULES' },
      { id: 'spaces', label: 'Clean Spaces', icon: 'broom', group: 'SERVICE MODULES' },
      { id: 'requests', label: 'Request Desk', icon: 'ticket', group: 'SERVICE MODULES' }
    ],
    views: {
      dashboard: { title: 'Overview', subtitle: 'One account across six service modules', render: dashboard },
      receiving: { title: 'Smart Receiving', subtitle: 'Scan, review, save, and claim items', render: receiving },
      ledger: { title: 'Customer Ledger', subtitle: 'Profiles, payments, and personal balances', render: ledger },
      quiz: { title: 'Quiz & Analytics', subtitle: 'Role-based quizzes with creator analytics', render: quiz },
      services: { title: 'Service Desk', subtitle: 'Identity, service directory, and notices', render: services },
      spaces: { title: 'Clean Spaces', subtitle: 'Cleaning schedules and monitoring', render: spaces },
      requests: { title: 'Request Desk', subtitle: 'Open / Resolved requests with notices', render: requests }
    }
  });

  s = App.state; // must be assigned after App.init()

  App.on('filter', d => { if (!d || !d.key) return; ui[d.key] = d.value; App.refresh(); });

  /* --- Receiving actions --- */
  App.on('simulate-scan', d => {
    const sel = document.getElementById('scan-code');
    const code = (sel && sel.value) || d.id;
    ui.scanned = s.scanCodes.find(c => c.code === code) || s.scanCodes[0];
    if (!ui.scanned) return App.toast('No sample code available.', 'error');
    App.refresh(); App.toast('Scanned ' + ui.scanned.code + ' — form populated.');
  });
  App.on('clear-scan', () => { ui.scanned = null; App.refresh(); });
  App.on('save-scan', () => {
    const f = document.getElementById('scan-form'); if (!f) return;
    const d = new FormData(f);
    if (!d.get('name')) return App.toast('Item name is required.', 'error');
    s.items.unshift({ id: App.uid('it'), code: d.get('code') || App.uid('SC'), name: d.get('name'), category: d.get('category') || 'General',
      supplier: d.get('supplier') || '—', requestor: d.get('requestor') || me, arrival: App.today(), status: 'pending',
      condition: d.get('condition') || 'Good', location: d.get('location') || 'Cage A-10',
      claimHistory: [{ by: 'System', date: App.today(), note: 'Recorded from simulated scan and reviewed by MH.' }] });
    pushNotice(d.get('requestor') || me, 'item', 'A scanned item (' + d.get('name') + ') is now pending at receiving.');
    pushNotice('mh', 'item', 'New item saved: ' + d.get('name'));
    log('Scanned item saved: ' + d.get('name'), 'receiving');
    ui.scanned = null; App.save(); App.refresh(); App.toast('Item record saved and requestor notified.');
  });
  App.on('edit-item', d => {
    const i = s.items.find(x => x.id === d.id); if (!i) return;
    App.modal('Review item information', i.code + ' · ' + i.requestor,
      '<form id="item-edit-form"><div class="detail-grid"><div class="field"><label for="ei-name">Item name</label><input class="input" id="ei-name" name="name" value="' + App.esc(i.name) + '" /></div>' +
      '<div class="field"><label for="ei-code">Code</label><input class="input" id="ei-code" name="code" value="' + App.esc(i.code) + '" /></div>' +
      '<div class="field"><label for="ei-cat">Category</label><input class="input" id="ei-cat" name="category" value="' + App.esc(i.category) + '" /></div>' +
      '<div class="field"><label for="ei-cond">Condition</label><input class="input" id="ei-cond" name="condition" value="' + App.esc(i.condition) + '" /></div>' +
      '<div class="field"><label for="ei-loc">Location</label><input class="input" id="ei-loc" name="location" value="' + App.esc(i.location) + '" /></div>' +
      '<div class="field"><label for="ei-req">Requestor</label><input class="input" id="ei-req" name="requestor" value="' + App.esc(i.requestor) + '" /></div></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-item" data-id="' + i.id + '">Save changes</button>');
  });
  App.on('save-item', d => {
    const i = s.items.find(x => x.id === d.id); const f = document.getElementById('item-edit-form');
    if (!i || !f) return;
    const data = new FormData(f);
    ['name', 'code', 'category', 'condition', 'location', 'requestor'].forEach(k => { if (data.get(k)) i[k] = data.get(k); });
    log('MH reviewed and saved item: ' + i.name, 'receiving');
    App.save(); App.closeModal(); App.refresh(); App.toast('Item record updated.');
  });
  App.on('view-item', d => {
    const i = s.items.find(x => x.id === d.id); if (!i) return;
    const timeline = i.claimHistory.map(h => '<li><strong>' + App.esc(h.by) + '</strong> · ' + App.esc(h.date) + '<small>' + App.esc(h.note) + '</small></li>').join('');
    App.modal('Item details', i.code + ' · ' + i.category,
      '<div class="detail-grid"><div class="detail"><small>Status</small><strong>' + App.esc(i.status) + '</strong></div><div class="detail"><small>Age</small><strong>' + App.ageChip(i.arrival) + '</strong></div>' +
      '<div class="detail"><small>Supplier</small><strong>' + App.esc(i.supplier) + '</strong></div><div class="detail"><small>Location</small><strong>' + App.esc(i.location) + '</strong></div>' +
      '<div class="detail full"><small>Requestor</small><strong>' + App.esc(i.requestor) + '</strong></div></div>' + statusTrack(i.status) +
      '<h4 class="section-title">Claiming history</h4><ul class="timeline">' + timeline + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });
  App.on('claim-item', d => {
    const i = s.items.find(x => x.id === d.id);
    if (!i || i.requestor !== me || i.status !== 'pending') return;
    i.status = 'claimed'; i.claimHistory.push({ by: me, date: App.today(), note: 'Claimed by requestor via UniServe.' });
    pushNotice('mh', 'claim', me + ' claimed ' + i.name + ' (' + i.code + ').');
    pushNotice(me, 'claim', 'You claimed ' + i.name + '. The MH has been notified.');
    log('Item claimed: ' + i.name, 'receiving');
    App.save(); App.refresh(); App.toast('Item claimed — MH notified.');
  });

  /* --- Ledger actions --- */
  function customerFormHtml(c) {
    return '<form id="customer-form"><div class="field"><label for="cf-name">Full name</label><input class="input" id="cf-name" name="name" value="' + App.esc(c ? c.name : '') + '" required /></div>' +
      '<div class="field"><label for="cf-email">Email</label><input class="input" id="cf-email" name="email" value="' + App.esc(c ? c.email : '') + '" /></div>' +
      '<div class="field"><label for="cf-phone">Phone</label><input class="input" id="cf-phone" name="phone" value="' + App.esc(c ? c.phone : '') + '" /></div>' +
      '<div class="field"><label for="cf-bal">Starting balance</label><input class="input" type="number" id="cf-bal" name="balance" min="0" value="' + (c ? c.balance : 0) + '" /></div></form>';
  }
  App.on('add-customer', () => App.modal('Add customer profile', 'Owner-only ledger action', customerFormHtml(null),
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-customer">Add customer</button>'));
  App.on('edit-customer', d => {
    const c = s.customers.find(x => x.id === d.id); if (!c) return;
    App.modal('Edit customer profile', c.email, customerFormHtml(c),
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-customer" data-id="' + c.id + '">Save changes</button>');
  });
  App.on('save-customer', d => {
    const f = document.getElementById('customer-form'); if (!f) return;
    const data = new FormData(f); if (!data.get('name')) return App.toast('Name is required.', 'error');
    const c = s.customers.find(x => x.id === d.id);
    if (c) { ['name', 'email', 'phone'].forEach(k => { if (data.get(k)) c[k] = data.get(k); }); c.balance = Number(data.get('balance') || 0); }
    else s.customers.push({ id: App.uid('cu'), name: data.get('name'), email: data.get('email') || '—', phone: data.get('phone') || '—', balance: Number(data.get('balance') || 0), payments: [] });
    log((c ? 'Updated' : 'Added') + ' customer: ' + data.get('name'), 'ledger');
    App.save(); App.closeModal(); App.refresh(); App.toast(c ? 'Profile updated.' : 'Customer added.');
  });
  App.on('delete-customer', d => {
    const c = s.customers.find(x => x.id === d.id); if (!c) return;
    App.modal('Delete customer profile?', c.name, '<p class="small muted">The profile and its payment history will be removed from this prototype.</p>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="confirm-delete-customer" data-id="' + c.id + '">Delete profile</button>');
  });
  App.on('confirm-delete-customer', d => {
    const i = s.customers.findIndex(x => x.id === d.id); if (i < 0) return;
    const name = s.customers[i].name; s.customers.splice(i, 1);
    log('Deleted customer: ' + name, 'ledger'); App.save(); App.closeModal(); App.refresh(); App.toast('Customer profile deleted.');
  });
  App.on('payment-modal', d => {
    const c = s.customers.find(x => x.id === d.id); if (!c) return;
    App.modal('Record payment', c.name + ' · balance ' + App.money(c.balance),
      '<form id="payment-form"><div class="field"><label for="pay-amount-input">Amount</label><input class="input" type="number" id="pay-amount-input" name="amount" min="1" value="' + c.balance + '" /></div>' +
      '<div class="amount-chips"><button type="button" class="chip" data-action="pay-amount" data-value="' + c.balance + '">Full ' + App.money(c.balance) + '</button>' +
      '<button type="button" class="chip" data-action="pay-amount" data-value="500">₱500</button><button type="button" class="chip" data-action="pay-amount" data-value="1000">₱1,000</button>' +
      '<button type="button" class="chip" data-action="pay-amount" data-value="2000">₱2,000</button></div>' +
      '<div class="field" style="margin-top:15px"><label for="pay-mode">Mode</label><select class="select" id="pay-mode" name="mode"><option>Cash</option><option>Online</option><option>Check</option></select></div>' +
      '<div class="field"><label for="pay-note">Note</label><input class="input" id="pay-note" name="note" placeholder="Full or partial payment" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="save-payment" data-id="' + c.id + '">Record payment</button>');
  });
  App.on('pay-amount', d => { const el = document.getElementById('pay-amount-input'); if (el) el.value = d.value; });
  App.on('save-payment', d => {
    const c = s.customers.find(x => x.id === d.id); const f = document.getElementById('payment-form');
    if (!c || !f) return;
    const data = new FormData(f); const amount = Number(data.get('amount') || 0);
    if (amount <= 0) return App.toast('Enter an amount greater than zero.', 'error');
    c.payments.push({ id: App.uid('pm'), date: App.today(), amount: amount, mode: data.get('mode') || 'Cash', note: data.get('note') || (amount >= c.balance ? 'Full payment' : 'Partial payment') });
    c.balance = Math.max(0, c.balance - amount);
    pushNotice(c.name, 'payment', App.money(amount) + ' payment recorded. New balance: ' + App.money(c.balance) + '.');
    log('Payment recorded for ' + c.name + ': ' + App.money(amount), 'ledger');
    App.save(); App.closeModal(); App.refresh(); App.toast('Payment recorded and customer notified.');
  });

  /* --- Quiz actions --- */
  App.on('create-quiz', () => App.modal('Create a quiz', 'Creator-only action',
    '<form id="quiz-form"><div class="field"><label for="qf-title">Title</label><input class="input" id="qf-title" name="title" required /></div>' +
    '<div class="field"><label for="qf-pass">Passing score (%)</label><input class="input" type="number" id="qf-pass" name="pass" min="1" max="100" value="75" /></div>' +
    '<div class="field"><label for="qf-q">First question</label><input class="input" id="qf-q" name="question" value="What is the first step?" /></div>' +
    '<div class="field"><label for="qf-a">Correct answer</label><input class="input" id="qf-a" name="answer" value="Check the posted procedure" /></div>' +
    '<div class="field"><label for="qf-w">A distractor</label><input class="input" id="qf-w" name="wrong" value="Skip the procedure" /></div>' +
    '<p class="field-hint">A second sample question and distractor are added automatically so scoring has two items.</p></form>',
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-quiz">Create draft</button>'));
  App.on('save-quiz', () => {
    const f = document.getElementById('quiz-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('title')) return App.toast('Quiz title is required.', 'error');
    s.quizzes.unshift({ id: App.uid('qz'), title: d.get('title'), creator: me, status: 'draft', passScore: Number(d.get('pass') || 75),
      questions: [
        { q: d.get('question') || 'First question?', options: [d.get('answer') || 'Yes', d.get('wrong') || 'No'], answer: 0 },
        { q: 'Should records be checked before acting?', options: ['Yes', 'No'], answer: 0 }
      ], attempts: [] });
    log('Quiz draft created: ' + d.get('title'), 'quiz');
    App.save(); App.closeModal(); App.refresh(); App.toast('Quiz draft created. Publish it when ready.');
  });
  App.on('publish-quiz', d => {
    const q = s.quizzes.find(x => x.id === d.id); if (!q) return;
    q.status = 'published'; pushNotice('all', 'quiz', 'New quiz published: ' + q.title);
    log('Quiz published: ' + q.title, 'quiz'); App.save(); App.refresh(); App.toast('Quiz published to participants.');
  });
  App.on('view-quiz', d => {
    const q = s.quizzes.find(x => x.id === d.id); if (!q) return;
    App.modal('Attempt history — ' + q.title, 'Average score and pass rate are shown in Analytics',
      q.attempts.length ? '<table class="table"><thead><tr><th>Participant</th><th>Date</th><th>Score</th><th>Result</th></tr></thead><tbody>' + attemptRows(q) + '</tbody></table>' :
        App.empty('No attempts yet', 'Participants have not taken this quiz.'),
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });
  App.on('take-quiz', d => {
    const q = s.quizzes.find(x => x.id === d.id && x.status === 'published'); if (!q) return;
    const body = '<form id="quiz-take-form">' + q.questions.map((qq, qi) =>
      '<div class="quiz-question"><p>' + (qi + 1) + '. ' + App.esc(qq.q) + '</p>' +
      qq.options.map((o, oi) => '<label class="quiz-option"><input type="radio" name="q' + qi + '" value="' + oi + '" />' + App.esc(o) + '</label>').join('') + '</div>').join('') + '</form>';
    App.modal('Take quiz', q.title, body,
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-quiz" data-id="' + q.id + '">Submit answers</button>', true);
  });
  App.on('submit-quiz', d => {
    const q = s.quizzes.find(x => x.id === d.id); const f = document.getElementById('quiz-take-form');
    if (!q || !f) return;
    const data = new FormData(f);
    const correct = q.questions.reduce((n, qq, qi) => n + (String(data.get('q' + qi)) === String(qq.answer) ? 1 : 0), 0);
    const score = Math.round(correct / q.questions.length * 100);
    const passed = score >= q.passScore;
    q.attempts.push({ id: App.uid('at'), participant: s.session.name || me, score: score, date: App.today(), passed: passed });
    pushNotice(q.creator, 'quiz', (s.session.name || me) + ' scored ' + score + '% on ' + q.title + (passed ? ' (passed).' : ' (did not pass).'));
    log('Quiz attempt: ' + q.title + ' — ' + score + '%', 'quiz');
    App.save(); App.closeModal(); App.refresh(); App.toast('Submitted — you scored ' + score + '%' + (passed ? ' (passed).' : '.'));
  });

  /* --- Service Desk actions --- */
  App.onInput('us-service-search', v => { ui.serviceSearch = v; App.refresh(); });
  App.on('login', () => {
    const em = document.getElementById('login-email'); if (!em) return;
    s.session.loggedIn = true; s.session.email = em.value || s.session.email;
    log('User logged in: ' + s.session.email, 'services'); App.save(); App.refresh(); App.toast('Welcome back!');
  });
  App.on('logout', () => {
    s.session.loggedIn = false; log('User logged out', 'services');
    App.save(); App.refresh(); App.toast('You have been logged out.');
  });
  App.on('register', () => App.modal('Create an account', 'Registration is shared by all modules',
    '<form id="register-form"><div class="field"><label for="rg-name">Full name</label><input class="input" id="rg-name" name="name" required /></div>' +
    '<div class="field"><label for="rg-email">Email</label><input class="input" id="rg-email" type="email" name="email" required /></div>' +
    '<div class="field"><label for="rg-pass">Password</label><input class="input" id="rg-pass" type="password" name="password" required /></div></form>',
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-register">Register & login</button>'));
  App.on('save-register', () => {
    const f = document.getElementById('register-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('name') || !d.get('email')) return App.toast('Name and email are required.', 'error');
    s.session = { loggedIn: true, registered: true, name: d.get('name'), email: d.get('email') };
    if (!s.customers.some(c => c.email === d.get('email'))) s.customers.push({ id: App.uid('cu'), name: d.get('name'), email: d.get('email'), phone: '—', balance: 0, payments: [] });
    pushNotice('all', 'service', d.get('name') + ' joined UniServe.');
    log('New account registered: ' + d.get('name'), 'services');
    App.save(); App.closeModal(); App.refresh(); App.toast('Account created and signed in.');
  });
  App.on('subscribe-service', d => {
    const sv = s.establishments.reduce((arr, e) => arr.concat(e.services), []).find(x => x.id === d.id);
    if (!sv) return;
    pushNotice(s.session.name || me, 'service', 'You asked to be notified about ' + sv.name + '. We will alert you before your turn.');
    log('Notice requested: ' + sv.name, 'services'); App.save(); App.refresh(); App.toast('Notification added to your notice center.');
  });
  App.on('send-notice', () => App.modal('Send a notice', 'Owner / administrator broadcast',
    '<form id="notice-form"><div class="field"><label for="nf-to">Recipient</label><select class="select" id="nf-to" name="to"><option value="all">Everyone</option>' +
    s.customers.map(c => '<option value="' + App.esc(c.name) + '">' + App.esc(c.name) + '</option>').join('') + '</select></div>' +
    '<div class="field"><label for="nf-text">Message</label><textarea class="textarea" id="nf-text" name="text" required></textarea></div></form>',
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-notice">Send notice</button>'));
  App.on('save-notice', () => {
    const f = document.getElementById('notice-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('text')) return App.toast('Write a message first.', 'error');
    pushNotice(d.get('to') || 'all', 'service', d.get('text'));
    log('Notice sent to ' + (d.get('to') || 'all'), 'services');
    App.save(); App.closeModal(); App.refresh(); App.toast('Notice delivered to the in-app center.');
  });
  App.on('mark-read', d => {
    const n = s.notices.find(x => x.id === d.id); if (!n) return;
    n.read = true; App.save(); App.refresh();
  });
  App.on('mark-all-read', () => { visibleNotices().forEach(n => { n.read = true; }); App.save(); App.refresh(); App.toast('Notices marked as read.'); });

  /* --- Clean Spaces actions --- */
  App.on('set-clean', d => {
    const r = s.rooms.find(x => x.id === d.id); if (!r) return;
    r.cleanliness = d.value; r.lastChecked = App.today();
    log('Teacher check: ' + r.name + ' → ' + d.value, 'spaces'); App.save(); App.refresh(); App.toast(r.name + ' updated.');
  });
  App.on('assign-task', () => App.modal('Assign cleaning task', 'Publish a task on the cleaning schedule',
    '<form id="task-form"><div class="field"><label for="tf-room">Room</label><select class="select" id="tf-room" name="room">' + s.rooms.map(r => '<option>' + App.esc(r.name) + '</option>').join('') + '</select></div>' +
    '<div class="field"><label for="tf-task">Task</label><input class="input" id="tf-task" name="task" required /></div>' +
    '<div class="field"><label for="tf-who">Assigned to</label><input class="input" id="tf-who" name="who" value="Caretaker" /></div>' +
    '<div class="field"><label for="tf-date">Date</label><input class="input" type="date" id="tf-date" name="date" value="' + App.today() + '" /></div></form>',
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-task">Assign task</button>'));
  App.on('save-task', () => {
    const f = document.getElementById('task-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('task')) return;
    s.tasks.unshift({ id: App.uid('tk'), room: d.get('room'), task: d.get('task'), assignedTo: d.get('who') || 'Caretaker', date: d.get('date') || App.today(), status: 'pending' });
    log('Cleaning task assigned: ' + d.get('task'), 'spaces'); App.save(); App.closeModal(); App.refresh(); App.toast('Task added to the schedule.');
  });
  App.on('submit-task', d => {
    const t = s.tasks.find(x => x.id === d.id); if (!t || t.status !== 'pending') return;
    t.status = 'done'; t.note = 'Marked complete ' + App.today();
    log('Cleaning task completed: ' + t.task, 'spaces'); App.save(); App.refresh(); App.toast('Task marked complete.');
  });

  /* --- Request Desk actions --- */
  App.on('file-request', () => App.modal('File a request', 'New requests start as Open',
    '<form id="request-form"><div class="field"><label for="rf-title">Title</label><input class="input" id="rf-title" name="title" required /></div>' +
    '<div class="field"><label for="rf-desc">Details</label><textarea class="textarea" id="rf-desc" name="description"></textarea></div></form>',
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-request">Submit request</button>'));
  App.on('save-request', () => {
    const f = document.getElementById('request-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('title')) return App.toast('Title is required.', 'error');
    s.requests.unshift({ id: App.uid('rq'), title: d.get('title'), description: d.get('description') || '', requestor: s.session.name || me, date: App.today(), status: 'open', note: '' });
    log('Request filed: ' + d.get('title'), 'requests'); App.save(); App.closeModal(); App.refresh(); App.toast('Request filed as Open.');
  });
  App.on('resolve-request', d => {
    const r = s.requests.find(x => x.id === d.id); if (!r) return;
    App.modal('Resolve request', r.title,
      '<form id="resolve-form"><div class="field"><label for="rv-note">Resolution note</label><textarea class="textarea" id="rv-note" name="note" placeholder="What was done?"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-resolve" data-id="' + r.id + '">Mark resolved & notify</button>');
  });
  App.on('confirm-resolve', d => {
    const r = s.requests.find(x => x.id === d.id); const f = document.getElementById('resolve-form');
    if (!r || !f) return;
    r.status = 'resolved'; r.resolvedAt = App.today(); r.note = new FormData(f).get('note') || 'Issue handled by staff.';
    pushNotice(r.requestor, 'request', 'Your request "' + r.title + '" has been resolved: ' + r.note);
    log('Request resolved: ' + r.title, 'requests'); App.save(); App.closeModal(); App.refresh(); App.toast('Request resolved and requestor notified.');
  });
  App.on('view-request', d => {
    const r = s.requests.find(x => x.id === d.id); if (!r) return;
    App.modal('Request details', r.title,
      '<div class="detail-grid"><div class="detail"><small>Status</small><strong>' + App.esc(r.status) + '</strong></div>' +
      '<div class="detail"><small>Requestor</small><strong>' + App.esc(r.requestor) + '</strong></div>' +
      '<div class="detail"><small>Filed</small><strong>' + App.esc(r.date) + '</strong></div>' +
      '<div class="detail"><small>Resolved</small><strong>' + App.esc(r.resolvedAt || '—') + '</strong></div>' +
      '<div class="detail full"><small>Description</small><strong>' + App.esc(r.description) + '</strong></div>' +
      (r.note ? '<div class="detail full"><small>Resolution notice</small><strong>' + App.esc(r.note) + '</strong></div>' : '') + '</div>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });

  function updateCounts() {
    App.setCounts({
      dashboard: s.requests.filter(r => r.status === 'open').length,
      receiving: s.items.filter(i => i.status === 'pending' && (isMh() || i.requestor === me)).length,
      ledger: isOwner() ? s.customers.filter(c => c.balance > 0).length : 1,
      quiz: s.quizzes.filter(q => q.status === 'published').length,
      services: visibleNotices().filter(n => !n.read).length,
      spaces: s.tasks.filter(t => t.status === 'pending').length,
      requests: s.requests.filter(r => r.status === 'open' && (isCustomer() ? r.requestor === me : true)).length
    });
    App.setProgress(Math.round(s.requests.filter(r => r.status === 'resolved').length / Math.max(1, s.requests.length) * 100), 'Requests resolved');
  }
  updateCounts();
  App.go('dashboard');
})();
