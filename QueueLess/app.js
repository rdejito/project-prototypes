/* QueueLess prototype — virtual queues, live board, ETA, notices, and reports. */
(function () {
  let s; // assigned immediately after App.init() below
  const ui = { search: '', ticketFilter: 'all', noticeFilter: 'all' };
  const me = 'Alex Morgan';

  const ROLE_LABELS = { customer: 'Customer', personnel: 'Service Personnel', admin: 'Administrator' };
  const isPersonnel = () => s.role === 'personnel' || s.role === 'admin';
  const isAdmin = () => s.role === 'admin';
  const isCustomer = () => s.role === 'customer' || (!isPersonnel());
  const roleLabel = () => ROLE_LABELS[s.role] || s.role || 'Customer';

  function allServices() {
    return s.establishments.reduce((arr, e) => arr.concat(e.services.map(sv => Object.assign({ establishment: e.name, location: e.location }, sv))), []);
  }
  function service(id) { return allServices().find(x => x.id === id); }
  function seq(t) { return parseInt(String(t.number).split('-')[1], 10) || 0; }
  function waiting(id) { return s.tickets.filter(t => t.serviceId === id && t.status === 'waiting').sort((a, b) => seq(a) - seq(b)); }
  function position(t) { const w = waiting(t.serviceId); return w.findIndex(x => x.id === t.id) + 1; }
  function eta(t) {
    const p = position(t); if (!p) return 0;
    const sv = service(t.serviceId);
    return p * (sv ? sv.duration : 8);
  }
  function nextNumber(sv) {
    const max = s.tickets.filter(t => String(t.number).startsWith(sv.prefix + '-')).reduce((n, t) => Math.max(n, seq(t)), 0);
    return sv.prefix + '-' + String(max + 1).padStart(3, '0');
  }
  function minutesBetween(a, b) {
    if (!a || !b) return 0;
    return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
  }
  function pushNotice(to, kind, text, id) {
    s.notices = s.notices || [];
    s.notices.unshift({ id: id || App.uid('nt'), to: to, kind: kind, text: text, time: 'Today, ' + new Date().toTimeString().slice(0, 5), read: false });
  }
  function log(text, module) { App.activity(text, module); }
  function intro(text) { return App.notice('info', text); }
  function myTickets() { return s.tickets.filter(t => t.name === (s.session.name || me)); }
  function myNotices() {
    if (isAdmin()) return s.notices.slice();
    return s.notices.filter(n => n.to === 'all' || n.to === (s.session.name || me));
  }
  function noticeStack(limit) {
    const list = myNotices().slice(0, limit || 5);
    if (!list.length) return App.empty('No notices', 'Turn alerts and queue updates will appear here.');
    return '<div class="notice-stack">' + list.map(n => '<div class="notice ' + (n.kind === 'near' || n.kind === 'turn' ? 'warn' : 'info') + '">' + App.icon('bell') +
      '<span style="flex:1"><strong>' + App.esc(n.kind.toUpperCase()) + '</strong> · ' + App.esc(n.text) + '<br><small class="muted">' + App.esc(n.time) + (n.read ? ' · read' : ' · unread') + '</small></span>' +
      (n.read ? '' : '<button class="btn btn-outline btn-sm" data-action="mark-read" data-id="' + n.id + '">Read</button>') + '</div>').join('') + '</div>';
  }
  function ticketBadge(t) {
    return App.badge(t.status === 'waiting' ? 'pending' : t.status === 'serving' ? 'active' : 'resolved');
  }
  function etaChip(t) {
    if (t.status !== 'waiting') return '<span class="badge neutral">—</span>';
    return '<span class="badge ' + (position(t) <= 2 ? 'open' : 'pending') + '">#' + position(t) + ' · ~' + eta(t) + ' min</span>';
  }
  function sessionPanel() {
    if (s.session.loggedIn) {
      return '<div class="notice info">' + App.icon('shield') + '<span style="flex:1"><strong>Signed in</strong> as ' + App.esc(s.session.name) +
        ' (' + App.esc(s.session.email) + ') · role switcher controls permissions.</span>' +
        '<button class="btn btn-outline btn-sm" data-action="logout">' + App.icon('logout') + ' Logout</button></div>';
    }
    return '<form id="ql-login-form"><div class="notice warn">' + App.icon('lock') + '<span>Please log in to join a queue or see your tickets.</span></div>' +
      '<div class="detail-grid"><div class="field"><label for="ql-email">Email</label><input class="input" id="ql-email" value="' + App.esc(s.session.email) + '" /></div>' +
      '<div class="field"><label for="ql-pass">Password</label><input class="input" id="ql-pass" type="password" value="demo123" /></div></div>' +
      '<div class="row"><button class="btn btn-primary" data-action="login">' + App.icon('lock') + ' Login</button>' +
      '<button class="btn btn-outline" data-action="register">Register</button></div></form>';
  }

  /* ---------------- Dashboard ---------------- */
  function dashboard() {
    const waiting = s.tickets.filter(t => t.status === 'waiting').length;
    const serving = s.tickets.filter(t => t.status === 'serving').length;
    const served = s.tickets.filter(t => t.status === 'served').length;
    const mine = myTickets();
    const next = mine.filter(t => t.status === 'waiting').sort((a, b) => position(a) - position(b))[0];
    return '<div class="hero"><div class="hero-top"><div><h2>Skip the line, keep your place.</h2>' +
      '<p>QueueLess lets customers join queues remotely, watch their live position and ETA, and get a notice when their turn is near. Personnel call the next ticket; administrators read activity reports.</p></div>' +
      '<div class="hero-ring"><div class="ring" style="--ring:' + Math.round(served / Math.max(1, s.tickets.length) * 100) + '%"><div class="ring-inner">' + Math.round(served / Math.max(1, s.tickets.length) * 100) + '%</div></div><small>Tickets served</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + waiting + '</strong><span>Waiting</span></div>' +
      '<div class="hero-stat"><strong>' + serving + '</strong><span>Serving now</span></div>' +
      '<div class="hero-stat"><strong>' + served + '</strong><span>Served today</span></div>' +
      '<div class="hero-stat"><strong>' + mine.length + '</strong><span>Your tickets</span></div></div></div>' +
      '<div style="margin-top:18px">' + App.card('Your session', 'Registration, login, and logout are simulated locally', sessionPanel()) + '</div>' +
      '<div class="stat-grid" style="margin-top:18px"><div class="card stat-card accent"><span>Your next ticket</span><strong>' + (next ? App.esc(next.number) : '—') + '</strong></div>' +
      '<div class="card stat-card warn"><span>Your queue position</span><strong>' + (next ? '#' + position(next) : '—') + '</strong></div>' +
      '<div class="card stat-card good"><span>Estimated wait</span><strong>' + (next ? eta(next) + ' min' : '—') + '</strong></div></div>' +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Notice center', 'Turn-near and queue alerts', noticeStack(5)) +
      App.card('Quick actions', 'Explore the prototype',
        '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>Browse establishments</strong><span>Find a service and join its queue.</span></div><button class="btn btn-soft btn-sm" data-action="goto" data-id="establishments">Open</button></div>' +
        '<div class="focus-item"><span class="focus-dot" style="background:var(--primary)"></span><div class="txt"><strong>My queue</strong><span>Track position, ETA, and ticket history.</span></div><button class="btn btn-soft btn-sm" data-action="goto" data-id="myqueue">Open</button></div>' +
        '<div class="focus-item"><span class="focus-dot" style="background:var(--done)"></span><div class="txt"><strong>Live board</strong><span>Current ticket numbers per service.</span></div><button class="btn btn-soft btn-sm" data-action="goto" data-id="live">Open</button></div>') + '</div>';
  }

  /* ---------------- Establishments ---------------- */
  function serviceCard(e, sv) {
    const w = waiting(sv.id).length;
    return '<article class="card service-card"><div class="module-top"><span class="module-icon tone-sky">' + App.icon('map') + '</span>' + App.badge('active') + '</div>' +
      '<h3 style="margin:0;font-size:14px">' + App.esc(sv.name) + '</h3><p>' + App.esc(e.name) + ' · ' + App.esc(e.location) + '</p>' +
      '<div class="service-meta"><span>' + App.icon('clock') + '~' + sv.duration + ' min</span><span>' + App.icon('wallet') + (sv.fee ? App.money(sv.fee) : 'Free') + '</span>' +
      '<span>' + App.icon('users') + w + ' waiting</span></div>' +
      '<small class="muted">' + App.esc(sv.description) + '</small>' +
      '<div class="row"><span class="badge neutral">' + App.esc(sv.prefix) + '-###</span>' +
      '<button class="btn btn-primary btn-sm" data-action="join-queue" data-id="' + sv.id + '">' + App.icon('ticket') + ' Join queue</button></div></article>';
  }
  function establishments() {
    const q = (ui.search || '').toLowerCase();
    const cards = [];
    s.establishments.forEach(e => e.services.forEach(sv => {
      if (!q || (sv.name + ' ' + e.name + ' ' + e.location + ' ' + sv.description).toLowerCase().includes(q)) cards.push(serviceCard(e, sv));
    }));
    return intro('Service directory: search establishments and services, then join a queue to receive a unique ticket number.') +
      App.card('Your session', 'Join with an account so notices reach you', sessionPanel()) +
      '<div style="margin-top:18px"><div class="toolbar"><div class="search-box">' + App.icon('search') +
      '<input class="input" id="ql-service-search" placeholder="Search establishments or services" value="' + App.esc(ui.search) + '" /></div>' +
      '<span class="small muted">' + cards.length + ' service(s) found</span></div>' +
      '<h2 class="section-title">' + App.icon('map') + ' Available establishments & services</h2>' +
      '<div class="service-grid">' + (cards.join('') || App.empty('No services found', 'Try another search term.')) + '</div></div>' +
      '<div style="margin-top:18px">' + App.notice('info', 'Ticket numbers are unique per service prefix (e.g. REG-016, REC-007). The next number is generated from the highest existing number.') + '</div>';
  }

  /* ---------------- My queue ---------------- */
  function ticketRow(t) {
    const sv = service(t.serviceId);
    return '<div class="list-row"><span class="activity-icon">' + App.icon('ticket') + '</span><div class="list-main"><strong>' + App.esc(t.number) + ' · ' + App.esc(sv ? sv.name : t.serviceId) + '</strong>' +
      '<div class="meta"><span>' + App.icon('map') + App.esc(sv ? sv.establishment : '—') + '</span><span>' + App.icon('clock') + 'Joined ' + App.esc(t.createdAt) + '</span>' +
      (t.calledAt ? '<span>' + App.icon('bell') + 'Called ' + App.esc(t.calledAt) + '</span>' : '') + '</div></div>' +
      etaChip(t) + ticketBadge(t) + '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="view-ticket" data-id="' + t.id + '">Details</button></div></div>';
  }
  function myqueue() {
    let list = myTickets();
    if (ui.ticketFilter === 'waiting') list = list.filter(t => t.status === 'waiting');
    if (ui.ticketFilter === 'serving') list = list.filter(t => t.status === 'serving');
    if (ui.ticketFilter === 'served') list = list.filter(t => t.status === 'served');
    const next = myTickets().filter(t => t.status === 'waiting').sort((a, b) => position(a) - position(b))[0];
    return intro('My queue: your ticket numbers, live position, estimated waiting time, and all turn notifications.') +
      (next ? App.card('Your next turn', next.number + ' · ' + (service(next.serviceId) || {}).name,
        '<div class="stage-track"><div class="stage done">Joined</div><div class="stage ' + (position(next) <= 2 ? 'current' : '') + '">Position #' + position(next) + '</div>' +
        '<div class="stage">Serving</div><div class="stage">Served</div></div>' +
        '<div class="row spread"><span class="small muted">Estimated wait: <strong>' + eta(next) + ' minutes</strong> · about ' + (service(next.serviceId) || {}).duration + ' min per customer</span>' + etaChip(next) + '</div>') : '') +
      '<div class="toolbar" style="margin-top:18px">' + App.tabs('ticketFilter', [
        { value: 'all', label: 'All tickets', count: myTickets().length },
        { value: 'waiting', label: 'Waiting', count: myTickets().filter(t => t.status === 'waiting').length },
        { value: 'serving', label: 'Serving', count: myTickets().filter(t => t.status === 'serving').length },
        { value: 'served', label: 'Served', count: myTickets().filter(t => t.status === 'served').length }
      ], ui.ticketFilter) + '<button class="btn btn-primary btn-sm" data-action="goto" data-id="establishments">' + App.icon('plus') + ' Join another queue</button></div>' +
      App.card('Your tickets', 'Statuses update instantly when personnel call next', list.length ? list.map(ticketRow).join('') : App.empty('No tickets here', 'Join a service queue to get a number.')) +
      '<div style="margin-top:18px">' + App.card('Queue notifications', 'Alerts when your turn is near', noticeStack(8)) + '</div>';
  }

  /* ---------------- Live board ---------------- */
  function live() {
    const cols = allServices().map(sv => {
      const cur = s.tickets.find(t => t.serviceId === sv.id && t.status === 'serving');
      const wait = waiting(sv.id);
      return '<div class="wall-col"><h3>' + App.esc(sv.name) + '<span class="badge neutral">' + App.esc(sv.prefix) + '</span></h3>' +
        '<div class="wall-card" style="text-align:center"><small class="muted">NOW SERVING</small><strong style="font-size:22px;color:var(--primary)">' + (cur ? App.esc(cur.number) : '—') + '</strong>' +
        '<div class="meta" style="justify-content:center">' + (cur ? App.esc(cur.name) : 'Counter idle') + '</div></div>' +
        '<small class="muted">' + wait.length + ' waiting · next up: ' + (wait[0] ? App.esc(wait[0].number) : '—') + '</small>' +
        wait.slice(0, 4).map((t, idx) => '<div class="wall-card"><strong>' + App.esc(t.number) + ' <span class="tiny muted">#' + (idx + 1) + '</span></strong>' +
          '<div class="meta"><span>' + App.esc(t.name) + '</span><span>~' + ((idx + 1) * sv.duration) + ' min</span></div></div>').join('') +
        (isPersonnel() ? '<div class="row" style="margin-top:8px"><button class="btn btn-primary btn-sm" data-action="call-next" data-id="' + sv.id + '">' + App.icon('arrow') + ' Call next</button>' +
          (cur ? '<button class="btn btn-outline btn-sm" data-action="mark-served" data-id="' + sv.id + '">Done</button>' : '') + '</div>' : '') + '</div>';
    }).join('');
    return intro('Live queue board: a re-rendered snapshot of current tickets per service (no WebSocket needed). ' +
      (isPersonnel() ? 'Use Call next to move Waiting → Serving → Served.' : 'Switch to Service Personnel to call the next ticket.')) +
      (isPersonnel() ? '' : deniedNote()) +
      '<div class="wall" style="margin-top:6px">' + cols + '</div>' +
      '<div style="margin-top:18px">' + App.card('Queue activity', 'Every call and status change is logged', s.activity.slice(0, 6).map(a =>
        '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('')) + '</div>';
  }
  function deniedNote() {
    return App.notice('warn', 'Read-only board for ' + App.esc(roleLabel()) + '. Only personnel and administrators can change queue statuses.');
  }

  /* ---------------- Reports ---------------- */
  function reports() {
    const served = s.tickets.filter(t => t.status === 'served');
    const waits = served.map(t => minutesBetween(t.createdAt, t.servedAt));
    const avg = waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0;
    const maxCount = Math.max(1, ...allServices().map(sv => s.tickets.filter(t => t.serviceId === sv.id).length));
    const bars = allServices().map(sv => {
      const n = s.tickets.filter(t => t.serviceId === sv.id).length;
      return '<div class="bar-row"><span>' + App.esc(sv.name.slice(0, 16)) + '</span><div class="bar-bg"><div style="width:' + Math.round(n / maxCount * 100) + '%"></div></div><strong>' + n + '</strong></div>';
    }).join('');
    const rows = s.tickets.slice().reverse().map(t => {
      const sv = service(t.serviceId);
      return '<tr><td>' + App.esc(t.number) + '</td><td>' + App.esc(sv ? sv.name : '—') + '</td><td>' + App.esc(t.name) + '</td><td>' + App.esc(t.createdAt) + '</td><td>' +
        (t.servedAt ? minutesBetween(t.createdAt, t.servedAt) + ' min' : '—') + '</td><td>' + ticketBadge(t) + '</td></tr>';
    }).join('');
    return intro('Queue activity reports: served today, average wait, and per-service ticket counts. ' +
      (isAdmin() ? 'Administrator view has full access.' : 'Personnel view includes live operational data.')) +
      '<div class="stat-grid"><div class="card stat-card good"><span>Served today</span><strong>' + served.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Average wait</span><strong>' + avg + ' min</strong></div>' +
      '<div class="card stat-card accent"><span>Tickets issued</span><strong>' + s.tickets.length + '</strong></div></div>' +
      '<div style="margin-bottom:18px">' + App.card('Tickets per service', 'Service demand at a glance', '<div style="max-width:640px">' + bars + '</div>') + '</div>' +
      App.card('Queue activity table', 'Every ticket with timestamps and final status',
        '<table class="table"><thead><tr><th>Number</th><th>Service</th><th>Customer</th><th>Joined</th><th>Wait</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>') +
      '<div style="margin-top:18px">' + App.notice('info', 'Average wait is computed from ticket creation to the served timestamp; live tickets are excluded until completed.') + '</div>';
  }

  /* ---------------- App configuration ---------------- */
  App.init({
    slug: 'queueless', title: 'QueueLess', tagline: 'Virtual Queue Management', icon: 'ticket', accent: 'sky',
    roles: ['customer', 'personnel', 'admin'], roleLabels: ROLE_LABELS,
    user: { name: 'Alex Morgan', meta: 'Customer · unified session', initials: 'AM' },
    progressLabel: 'Tickets served', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'WORKSPACE' },
      { id: 'establishments', label: 'Establishments', icon: 'map', group: 'QUEUE' },
      { id: 'myqueue', label: 'My Queue', icon: 'ticket', group: 'QUEUE' },
      { id: 'live', label: 'Live Board', icon: 'monitor', group: 'OPERATIONS' },
      { id: 'reports', label: 'Reports', icon: 'chart', group: 'OPERATIONS' }
    ],
    views: {
      dashboard: { title: 'Dashboard', subtitle: 'Your place in the queue at a glance', render: dashboard },
      establishments: { title: 'Establishments', subtitle: 'Browse services and join a queue', render: establishments },
      myqueue: { title: 'My Queue', subtitle: 'Ticket numbers, position, ETA, and notices', render: myqueue },
      live: { title: 'Live Board', subtitle: 'Current tickets per service', render: live },
      reports: { title: 'Reports', subtitle: 'Queue activity and performance', render: reports }
    }
  });

  s = App.state; // assigned immediately after App.init()

  App.on('filter', d => { if (!d || !d.key) return; ui[d.key] = d.value; App.refresh(); });
  App.onInput('ql-service-search', v => { ui.search = v; App.refresh(); });
  App.on('goto', d => App.go(d.id));

  /* --- Session actions --- */
  App.on('login', () => {
    const el = document.getElementById('ql-email'); if (!el) return;
    s.session.loggedIn = true; s.session.email = el.value || s.session.email;
    log('Customer logged in: ' + s.session.email, 'session'); App.save(); App.refresh(); App.toast('Welcome back!');
  });
  App.on('logout', () => {
    s.session.loggedIn = false; log('Customer logged out', 'session');
    App.save(); App.refresh(); App.toast('Logged out successfully.');
  });
  App.on('register', () => App.modal('Create your account', 'Registration is simulated in this prototype',
    '<form id="ql-register-form"><div class="field"><label for="r-name">Full name</label><input class="input" id="r-name" name="name" required /></div>' +
    '<div class="field"><label for="r-email">Email</label><input class="input" id="r-email" type="email" name="email" required /></div>' +
    '<div class="field"><label for="r-pass">Password</label><input class="input" id="r-pass" type="password" name="password" required /></div></form>',
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-register">Register & login</button>'));
  App.on('save-register', () => {
    const f = document.getElementById('ql-register-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('name') || !d.get('email')) return App.toast('Name and email are required.', 'error');
    s.session = { loggedIn: true, registered: true, name: d.get('name'), email: d.get('email') };
    pushNotice('all', 'info', d.get('name') + ' registered for QueueLess.');
    log('New account: ' + d.get('name'), 'session');
    App.save(); App.closeModal(); App.refresh(); App.toast('Account created and signed in.');
  });

  /* --- Queue actions --- */
  App.on('join-queue', d => {
    const sv = service(d.id); if (!sv) return;
    if (!s.session.loggedIn) return App.toast('Please log in before joining a queue.', 'error');
    const number = nextNumber(sv);
    s.tickets.push({ id: App.uid('tk'), number: number, serviceId: sv.id, name: s.session.name || me, status: 'waiting',
      createdAt: App.stamp(), calledAt: '', servedAt: '' });
    pushNotice(s.session.name || me, 'joined', 'You joined ' + sv.name + '. Your unique number is ' + number + '.');
    log(number + ' joined ' + sv.name, 'tickets'); App.save(); App.refresh(); App.toast('You joined the queue — ticket ' + number + '.');
  });
  function nearNotice(t) {
    const p = position(t);
    if (p < 1 || p > 2) return;
    const id = 'near-' + t.id + '-' + p;
    if (s.notices.some(n => n.id === id)) return;
    pushNotice(t.name, 'near', 'Your turn is near for ' + ((service(t.serviceId) || {}).name || 'your service') + ' — you are #' + p + '.', id);
  }
  App.on('call-next', d => {
    const sv = service(d.id); if (!sv || !isPersonnel()) return;
    const current = s.tickets.find(t => t.serviceId === sv.id && t.status === 'serving');
    if (current) {
      current.status = 'served'; current.servedAt = App.stamp();
      pushNotice(current.name, 'done', 'Your ticket ' + current.number + ' has been served. Thank you!');
      log(current.number + ' marked served at ' + sv.name, 'live');
    }
    const next = waiting(sv.id)[0];
    if (next) {
      next.status = 'serving'; next.calledAt = App.stamp();
      pushNotice(next.name, 'turn', 'It is your turn: ' + next.number + ' is now serving at ' + sv.name + '.');
      waiting(sv.id).slice(0, 2).forEach(nearNotice);
      log(next.number + ' called to counter for ' + sv.name, 'live');
    }
    App.save(); App.refresh(); App.toast(next ? 'Called ' + next.number : 'No waiting tickets for this service.');
  });
  App.on('mark-served', d => {
    const sv = service(d.id); if (!sv || !isPersonnel()) return;
    const cur = s.tickets.find(t => t.serviceId === sv.id && t.status === 'serving');
    if (!cur) return;
    cur.status = 'served'; cur.servedAt = App.stamp();
    pushNotice(cur.name, 'done', 'Your ticket ' + cur.number + ' has been served.');
    log(cur.number + ' served at ' + sv.name, 'live');
    App.save(); App.refresh(); App.toast(cur.number + ' marked as served.');
  });
  App.on('view-ticket', d => {
    const t = s.tickets.find(x => x.id === d.id); if (!t) return;
    const sv = service(t.serviceId);
    App.modal('Ticket ' + t.number, sv ? sv.name : t.serviceId,
      '<div class="detail-grid"><div class="detail"><small>Status</small><strong>' + App.esc(t.status) + '</strong></div>' +
      '<div class="detail"><small>Position / ETA</small><strong>' + (t.status === 'waiting' ? '#' + position(t) + ' · ~' + eta(t) + ' min' : '—') + '</strong></div>' +
      '<div class="detail"><small>Joined</small><strong>' + App.esc(t.createdAt) + '</strong></div>' +
      '<div class="detail"><small>Customer</small><strong>' + App.esc(t.name) + '</strong></div></div>' +
      '<ul class="timeline"><li>Ticket generated<small>' + App.esc(t.createdAt) + '</small></li>' +
      (t.calledAt ? '<li>Called to counter<small>' + App.esc(t.calledAt) + '</small></li>' : '') +
      (t.servedAt ? '<li>Marked served<small>' + App.esc(t.servedAt) + '</small></li>' : '') + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });
  App.on('mark-read', d => {
    const n = s.notices.find(x => x.id === d.id); if (!n) return;
    n.read = true; App.save(); App.refresh();
  });
  App.on('mark-all-read', () => { myNotices().forEach(n => { n.read = true; }); App.save(); App.refresh(); App.toast('All notices marked as read.'); });

  function updateCounts() {
    App.setCounts({
      dashboard: myNotices().filter(n => !n.read).length,
      establishments: s.tickets.filter(t => t.status === 'waiting').length,
      myqueue: myTickets().filter(t => t.status === 'waiting').length,
      live: s.tickets.filter(t => t.status === 'serving').length,
      reports: s.tickets.filter(t => t.status === 'served').length
    });
    App.setProgress(Math.round(s.tickets.filter(t => t.status === 'served').length / Math.max(1, s.tickets.length) * 100), 'Tickets served');
  }
  updateCounts();
  App.go('dashboard');
})();
