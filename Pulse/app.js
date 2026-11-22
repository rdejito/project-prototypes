/* PULSE prototype — urgent logistics request wall, routing, forwarding, and audit. */
(function () {
  let s; // assigned immediately after App.init(), before any handlers are registered
  const ME = 'Juan Dela Cruz';
  const STATUSES = [
    { id: 'new', label: 'New' }, { id: 'in_progress', label: 'In Progress' },
    { id: 'forwarded', label: 'Forwarded' }, { id: 'resolved', label: 'Resolved' }
  ];
  const ui = {
    wallStatus: 'all', wallTeam: 'all', wallCategory: 'all', wallSearch: '',
    reqStatus: 'all', reqTeam: 'all', reqSearch: ''
  };

  function actor() { return s.role === 'requestor' ? 'Ana Reyes' : ME; }
  function canHandle() { return s.role !== 'requestor'; }
  function req(id) { return (s.requests || []).find(r => r.id === id); }
  function scoped(list) { return s.role === 'requestor' ? list.filter(r => r.requestor === actor()) : list; }
  function statusBadge(st) {
    const map = { new: 'public', in_progress: 'pending', forwarded: 'pending', resolved: 'done' };
    const label = { new: 'New', in_progress: 'In Progress', forwarded: 'Forwarded', resolved: 'Resolved' };
    return '<span class="badge ' + (map[st] || 'neutral') + '">' + App.esc(label[st] || st) + '</span>';
  }
  function auditPush(r, action, detail, by) {
    if (!r) return;
    s.audit = s.audit || [];
    s.audit.unshift({ id: App.uid('au'), requestId: r.id, actor: by || actor(), timestamp: App.stamp(), action: action, detail: detail || '' });
    r.updatedAt = App.stamp();
    App.activity(action + ': ' + r.id + ' · ' + r.requestFor, 'wall');
  }
  function noticePush(type, text, requestId) {
    s.notices = s.notices || [];
    s.notices.unshift({ id: App.uid('nt'), type: type, text: text, requestId: requestId || '', time: App.stamp(), read: false });
  }
  function noticeBadge(type) {
    const map = { new: 'public', forwarded: 'pending', resolved: 'done' };
    return '<span class="badge ' + (map[type] || 'neutral') + '">' + App.esc(type) + '</span>';
  }
  function noticeCenter() {
    const unread = s.notices.filter(n => !n.read);
    const body = unread.length ? unread.map(n => '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>' + App.esc(n.text) + '</strong><span>' + App.esc(n.time) + '</span></div>' + noticeBadge(n.type) + '<button class="btn btn-outline btn-sm" data-action="read-notice" data-id="' + n.id + '">Mark read</button></div>').join('') : App.empty('No new notifications', 'New, forwarded, and resolved requests will appear here.');
    return App.card('Notification center', 'Unread request events', body + (unread.length ? '<div style="padding:10px 20px"><button class="btn btn-outline btn-sm" data-action="read-all-notices">Mark all read</button></div>' : ''));
  }
  function applyFilters(list, pfx) {
    let out = scoped(list);
    const st = ui[pfx + 'Status']; if (st && st !== 'all') out = out.filter(r => r.status === st);
    const tm = ui[pfx + 'Team']; if (tm && tm !== 'all') out = out.filter(r => r.team === tm);
    const cat = ui[pfx + 'Category']; if (cat && cat !== 'all') out = out.filter(r => r.category === cat);
    const q = ui[pfx + 'Search'] || '';
    if (q) {
      const k = q.toLowerCase();
      out = out.filter(r => (r.id + ' ' + r.type + ' ' + r.category + ' ' + r.requestFor + ' ' + r.requestor + ' ' + r.remarks + ' ' + r.team).toLowerCase().indexOf(k) !== -1);
    }
    return out;
  }
  function teamTabs(pfx) {
    return App.tabs(pfx + 'Team', [{ value: 'all', label: 'All teams' }].concat(s.teams.map(t => ({ value: t, label: t }))), ui[pfx + 'Team']);
  }
  function statusTabs(pfx) {
    return App.tabs(pfx + 'Status', [{ value: 'all', label: 'All', count: scoped(s.requests).length }].concat(STATUSES.map(st => ({ value: st.id, label: st.label, count: scoped(s.requests).filter(r => r.status === st.id).length }))), ui[pfx + 'Status']);
  }
  function statCard(label, value, cls) { return '<div class="card stat-card ' + (cls || '') + '"><span>' + App.esc(label) + '</span><strong>' + App.esc(value) + '</strong></div>'; }
  function bar(label, value, max, color) {
    return '<div class="bar-row"><span>' + App.esc(label) + '</span><div class="bar-bg"><div style="width:' + Math.round(value / Math.max(1, max) * 100) + '%' + (color ? ';background:' + color : '') + '"></div></div><strong>' + value + '</strong></div>';
  }

  function dashboard() {
    const list = scoped(s.requests);
    const open = list.filter(r => r.status !== 'resolved');
    const resolved = list.filter(r => r.status === 'resolved');
    const aging = open.filter(r => App.daysSince(r.created) >= 3);
    const rate = list.length ? Math.round(resolved.length / list.length * 100) : 0;
    const focus = aging.length ? aging.slice(0, 5).map(r => '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>' + App.esc(r.id + ' · ' + r.requestFor) + '</strong><span>' + App.esc(r.team) + ' · ' + App.esc(r.category) + ' · ' + App.esc(r.requestor) + '</span></div>' + App.ageChip(r.created) + (canHandle() ? '<button class="btn btn-outline btn-sm" data-action="start-request" data-id="' + r.id + '">Start</button>' : '') + '</div>').join('') : App.empty('No aging open requests', 'Nothing has been open for three days or more.');
    const act = s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
    const stages = STATUSES.map(st => '<div class="stage ' + (st.id === 'resolved' ? 'done' : st.id === 'new' ? 'current' : '') + '">' + st.label + ' (' + list.filter(r => r.status === st.id).length + ')</div>').join('');
    return '<div class="hero"><div class="hero-top"><div><h2>PULSE — Logistics Urgent Wall</h2><p>One wall for urgent requests across Receiving, Shipping, CSR, Kitting, and FPA. Status changes appear instantly.</p></div><div class="hero-ring"><div class="ring" style="--ring:' + rate + '%"><div class="ring-inner">' + rate + '%</div></div><small>Resolved</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + open.length + '</strong><span>Open requests</span></div><div class="hero-stat"><strong>' + resolved.length + '</strong><span>Resolved</span></div><div class="hero-stat"><strong>' + aging.length + '</strong><span>Aging (3d+)</span></div></div></div>' +
      '<div class="stat-grid" style="margin-top:18px">' + statCard('Total requests', list.length, 'accent') + statCard('Urgent open', open.filter(r => r.type === 'Urgent').length, 'warn') + statCard('Forwards made', list.reduce((n, r) => n + (r.forwardCount || 0), 0), 'good') + '</div>' +
      '<h2 class="section-title">' + App.icon('scan') + ' Request pipeline</h2>' + App.card('Workflow stages', 'Counts reflect the current role scope', '<div class="stage-track">' + stages + '</div>') +
      '<h2 class="section-title">' + App.icon('clock') + ' Aging open requests</h2>' + App.card('Needs attention', 'Requests open for three days or more', focus) +
      '<div class="dash-bottom" style="margin-top:18px">' + noticeCenter() + App.card('Recent activity', 'Latest status changes', act) + '</div>';
  }

  function submit() {
    const cats = Object.keys(s.routes || {});
    return '<div class="notice info">' + App.icon('send') + '<span>Requests are routed automatically by category. The assigned team appears on the wall immediately after submission.</span></div>' +
      App.card('Submit an urgent request', 'Capture the request details and let PULSE route it',
        '<form id="request-form">' +
        '<div class="detail-grid"><div class="field"><label for="sr-type">Request Type</label><select class="select" id="sr-type" name="type"><option>Urgent</option><option>Normal</option></select></div>' +
        '<div class="field"><label for="sr-category">Request Category</label><select class="select" id="sr-category" name="category">' + cats.map(c => '<option>' + App.esc(c) + '</option>').join('') + '</select></div></div>' +
        '<div class="detail-grid"><div class="field"><label for="sr-for">Request For</label><input class="input" id="sr-for" name="requestFor" required placeholder="Warehouse A / Order #123" /></div>' +
        '<div class="field"><label for="sr-by">Requestor</label><input class="input" id="sr-by" name="requestor" value="' + App.esc(actor()) + '" required /></div></div>' +
        '<div class="field"><label for="sr-remarks">Remarks</label><textarea class="textarea" id="sr-remarks" name="remarks" placeholder="What happened and what is needed?"></textarea></div>' +
        '<div class="notice info" style="margin-bottom:16px">' + App.icon('arrow') + '<span id="route-preview">Routes to ' + App.esc(s.routes[cats[0]] || 'Receiving') + '</span></div>' +
        '<div class="row"><button type="submit" class="btn btn-primary">' + App.icon('send') + ' Submit request</button><button type="reset" class="btn btn-outline">Clear form</button></div></form>') +
      '<div style="margin-top:18px">' + App.card('Routing map', 'Category → logistics team', '<table class="table"><thead><tr><th>Category</th><th>Assigned team</th></tr></thead><tbody>' + cats.map(c => '<tr><td>' + App.esc(c) + '</td><td>' + App.badge('new') + ' ' + App.esc(s.routes[c]) + '</td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function wallCard(r) {
    return '<article class="wall-card"><strong>' + App.esc(r.type) + ' · ' + App.esc(r.category) + '</strong>' +
      '<div class="meta"><span>' + App.icon('users') + App.esc(r.team) + '</span><span>' + App.icon('box') + App.esc(r.requestFor) + '</span><span>' + App.icon('user') + App.esc(r.requestor) + '</span></div>' +
      '<div class="row wrap" style="margin-top:9px">' + statusBadge(r.status) + App.ageChip(r.created) + '</div>' +
      '<div class="row wrap" style="margin-top:9px"><button class="btn btn-outline btn-sm" data-action="request-detail" data-id="' + r.id + '">Details</button>' +
      (canHandle() && r.status !== 'resolved' ? '<button class="btn btn-primary btn-sm" data-action="start-request" data-id="' + r.id + '">Start</button><button class="btn btn-outline btn-sm" data-action="forward-request" data-id="' + r.id + '">Forward</button><button class="btn btn-success btn-sm" data-action="resolve-request" data-id="' + r.id + '">Resolve</button>' : '') +
      (canHandle() && r.status === 'resolved' ? '<button class="btn btn-outline btn-sm" data-action="reopen-request" data-id="' + r.id + '">Reopen</button>' : '') + '</div></article>';
  }
  function wall() {
    const list = applyFilters(s.requests, 'wall');
    const cats = Object.keys(s.routes || {});
    const cols = STATUSES.map(st => {
      const inCol = list.filter(r => r.status === st.id);
      return '<div class="wall-col"><h3>' + st.label + ' <span class="badge neutral">' + inCol.length + '</span></h3>' + (inCol.length ? inCol.map(wallCard).join('') : '<p class="tiny muted">No requests in this stage.</p>') + '</div>';
    }).join('');
    return '<div class="toolbar"><div class="search-box">' + App.icon('search') + '<input class="input" id="wall-search" placeholder="Search requests..." value="' + App.esc(ui.wallSearch) + '" /></div>' +
      '<select class="select" id="wall-category" style="max-width:220px"><option value="all">All categories</option>' + cats.map(c => '<option value="' + App.esc(c) + '"' + (ui.wallCategory === c ? ' selected' : '') + '>' + App.esc(c) + '</option>').join('') + '</select>' +
      '<button class="btn btn-outline btn-sm" data-action="clear-filters">Clear filters</button></div>' +
      '<div class="toolbar">' + statusTabs('wall') + teamTabs('wall') + '</div>' +
      App.notice('info', 'The wall is a live view: starting, forwarding, and resolving a request moves its card to a new column and appends an audit record.') +
      '<div class="wall">' + cols + '</div>';
  }

  function requests() {
    const list = applyFilters(s.requests, 'req');
    const rows = list.length ? list.map(r => '<div class="list-row"><span class="activity-icon">' + App.icon(r.type === 'Urgent' ? 'alert' : 'file') + '</span><div class="list-main"><strong>' + App.esc(r.id + ' · ' + r.requestFor) + '</strong><div class="meta"><span>' + App.icon('box') + App.esc(r.category) + '</span><span>' + App.icon('users') + App.esc(r.team) + '</span><span>' + App.icon('user') + App.esc(r.requestor) + '</span><span>' + App.icon('calendar') + App.esc(r.created) + '</span></div></div>' +
      App.ageChip(r.created) + statusBadge(r.status) + '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="request-detail" data-id="' + r.id + '">Details</button>' +
      (canHandle() && r.status !== 'resolved' ? '<button class="btn btn-success btn-sm" data-action="resolve-request" data-id="' + r.id + '">Resolve</button>' : '') + '</div></div>').join('') : App.empty('No requests found', 'Adjust your search or filters.');
    return '<div class="toolbar"><div class="search-box">' + App.icon('search') + '<input class="input" id="req-search" placeholder="Search by ID, team, category, requestor..." value="' + App.esc(ui.reqSearch) + '" /></div>' +
      '<button class="btn btn-outline btn-sm" data-action="clear-filters">Clear filters</button></div>' +
      '<div class="toolbar">' + statusTabs('req') + teamTabs('req') + '</div>' +
      App.card('Request history', 'All requests visible to the current role, with aging and status', rows) +
      '<div style="margin-top:18px">' + noticeCenter() + '</div>';
  }

  function reports() {
    const list = scoped(s.requests);
    const open = list.filter(r => r.status !== 'resolved').length;
    const resolved = list.filter(r => r.status === 'resolved').length;
    const aging = list.filter(r => r.status !== 'resolved' && App.daysSince(r.created) >= 3).length;
    const teamMax = Math.max(1, ...s.teams.map(t => list.filter(r => r.team === t).length));
    const typeMax = Math.max(1, ...['Urgent', 'Normal'].map(t => list.filter(r => r.type === t).length));
    const statusMax = Math.max(1, ...STATUSES.map(st => list.filter(r => r.status === st.id).length));
    return '<div class="stat-grid">' + statCard('Requests', list.length, 'accent') + statCard('Open', open, 'warn') + statCard('Resolved', resolved, 'good') + '</div>' +
      '<div class="analytics-grid">' +
      App.card('By logistics team', 'Current owning team', s.teams.map(t => bar(t, list.filter(r => r.team === t).length, teamMax)).join('')) +
      App.card('By request type', 'Urgent vs normal', ['Urgent', 'Normal'].map(t => bar(t, list.filter(r => r.type === t).length, typeMax, '#dc2626')).join('')) +
      App.card('By status', 'Pipeline distribution', STATUSES.map(st => bar(st.label, list.filter(r => r.status === st.id).length, statusMax, '#0d9488')).join('')) +
      '</div>' +
      '<h2 class="section-title">' + App.icon('chart') + ' Aging summary</h2>' + App.card('Overdue watch', 'Open requests older than three days', '<div class="detail-grid"><div class="detail"><small>Aging open</small><strong>' + aging + '</strong></div><div class="detail"><small>Fresh open</small><strong>' + (open - aging) + '</strong></div><div class="detail"><small>Total forwards</small><strong>' + list.reduce((n, r) => n + (r.forwardCount || 0), 0) + '</strong></div><div class="detail"><small>Audit records</small><strong>' + s.audit.length + '</strong></div></div>');
  }

  function audit() {
    const ids = scoped(s.requests).map(r => r.id);
    const list = s.audit.filter(a => ids.indexOf(a.requestId) !== -1);
    const rows = list.length ? list.map(a => '<tr><td>' + App.esc(a.timestamp) + '</td><td>' + App.esc(a.actor) + '</td><td>' + App.esc(a.requestId) + '</td><td><strong>' + App.esc(a.action) + '</strong></td><td class="muted">' + App.esc(a.detail) + '</td></tr>').join('') : '<tr><td colspan="5" class="muted">No audit records yet.</td></tr>';
    return App.notice('info', 'Every creation, status change, forward, and resolution is recorded with an actor and timestamp.') +
      App.card('Audit trail', 'Historical request actions for reporting and review', '<table class="table"><thead><tr><th>Timestamp</th><th>Actor</th><th>Request</th><th>Action</th><th>Detail</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function createRequest(values) {
    const d = values || {};
    const category = d.category && s.routes[d.category] ? d.category : Object.keys(s.routes)[0];
    const team = s.routes[category] || 'Receiving';
    const r = {
      id: App.uid('rq'), type: d.type === 'Normal' ? 'Normal' : 'Urgent', category: category,
      requestFor: String(d.requestFor || 'Unspecified request'), requestor: String(d.requestor || actor()), remarks: String(d.remarks || ''),
      team: team, originalTeam: team, status: 'new', created: App.today(), createdAt: App.stamp(), updatedAt: App.stamp(), forwardCount: 0, resolution: ''
    };
    s.requests.unshift(r);
    auditPush(r, 'Request created', 'Routed to ' + team, r.requestor);
    noticePush('new', 'New ' + r.type.toLowerCase() + ' request ' + r.id + ' routed to ' + team, r.id);
    App.save();
    App.go('wall');
    App.toast('Request ' + r.id + ' created and routed to ' + team + '.');
  }

  App.init({
    slug: 'pulse', title: 'PULSE', tagline: 'Logistics Urgent Wall', icon: 'scan', accent: 'teal',
    roles: ['requestor', 'handler', 'supervisor', 'admin'],
    roleLabels: { requestor: 'Requestor', handler: 'Material handler', supervisor: 'Supervisor', admin: 'Admin' },
    user: { name: ME, meta: 'Logistics · demo account', initials: 'JD' },
    progressLabel: 'Requests resolved', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'WORKSPACE' },
      { id: 'submit', label: 'Submit request', icon: 'send', group: 'REQUESTS' },
      { id: 'wall', label: 'Visual wall', icon: 'scan', group: 'REQUESTS' },
      { id: 'requests', label: 'Request history', icon: 'history', group: 'REQUESTS' },
      { id: 'reports', label: 'Reports', icon: 'chart', group: 'MONITOR' },
      { id: 'audit', label: 'Audit trail', icon: 'shield', group: 'MONITOR' }
    ],
    views: {
      dashboard: { title: 'Dashboard', subtitle: 'Open requests, aging, and notifications', render: dashboard },
      submit: { title: 'Submit request', subtitle: 'Standardized urgent logistics request form', render: submit },
      wall: { title: 'Visual wall', subtitle: 'Live view across New, In Progress, Forwarded, and Resolved', render: wall },
      requests: { title: 'Request history', subtitle: 'Searchable records with status, team, and aging', render: requests },
      reports: { title: 'Reports', subtitle: 'Statistics by team, type, and status', render: reports },
      audit: { title: 'Audit trail', subtitle: 'Actor, timestamp, and action for every request event', render: audit }
    }
  });

  s = App.state; // must happen after App.init()
  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });
  App.onSubmit('request-form', form => {
    const d = new FormData(form);
    createRequest({ type: d.get('type'), category: d.get('category'), requestFor: d.get('requestFor'), requestor: d.get('requestor'), remarks: d.get('remarks') });
  });
  App.onInput('sr-category', value => {
    const el = document.getElementById('route-preview');
    if (el) el.textContent = 'Routes to ' + (s.routes[value] || 'Receiving');
  });
  function bindSearch(id, key) {
    App.onInput(id, value => {
      ui[key] = value;
      App.refresh();
      const el = document.getElementById(id);
      if (el) { el.focus(); if (el.setSelectionRange) { try { el.setSelectionRange(value.length, value.length); } catch (e) {} } }
    });
  }
  bindSearch('wall-search', 'wallSearch');
  bindSearch('req-search', 'reqSearch');
  App.onInput('wall-category', value => { ui.wallCategory = value; App.refresh(); });
  App.on('clear-filters', () => {
    ui.wallStatus = 'all'; ui.wallTeam = 'all'; ui.wallCategory = 'all'; ui.wallSearch = '';
    ui.reqStatus = 'all'; ui.reqTeam = 'all'; ui.reqSearch = '';
    App.refresh(); App.toast('Filters cleared.');
  });

  App.on('start-request', d => {
    if (!canHandle()) return;
    const r = req(d.id);
    if (!r || r.status !== 'new') return;
    r.status = 'in_progress';
    auditPush(r, 'Status updated', 'New → In Progress', actor());
    App.save(); App.refresh(); App.toast(r.id + ' marked In Progress.');
  });
  App.on('forward-request', d => {
    if (!canHandle()) return;
    const r = req(d.id);
    if (!r || r.status === 'resolved') return;
    const options = s.teams.filter(t => t !== r.team).map(t => '<option value="' + App.esc(t) + '">' + App.esc(t) + '</option>').join('');
    App.modal('Forward request', r.id + ' · currently with ' + r.team,
      '<form id="forward-form"><div class="field"><label for="forward-team">Forward to team</label><select class="select" id="forward-team" name="team">' + options + '</select></div><p class="small muted">The move is logged in the audit trail and a notification is created.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="confirm-forward" data-id="' + r.id + '">' + App.icon('send') + ' Forward</button>');
  });
  App.on('confirm-forward', d => {
    if (!canHandle()) return;
    const r = req(d.id); if (!r || r.status === 'resolved') return;
    const sel = document.getElementById('forward-team');
    const team = sel ? sel.value : '';
    if (s.teams.indexOf(team) === -1 || team === r.team) { App.toast('Choose a different logistics team.', 'error'); return; }
    const from = r.team;
    if (!r.originalTeam) r.originalTeam = from;
    r.team = team; r.status = 'forwarded'; r.forwardCount = (r.forwardCount || 0) + 1;
    auditPush(r, 'Request forwarded', from + ' → ' + team, actor());
    noticePush('forwarded', 'Request ' + r.id + ' was forwarded from ' + from + ' to ' + team, r.id);
    App.save(); App.closeModal(); App.refresh(); App.toast(r.id + ' forwarded to ' + team + '.');
  });
  App.on('resolve-request', d => {
    if (!canHandle()) return;
    const r = req(d.id);
    if (!r || r.status === 'resolved') return;
    App.modal('Resolve request', r.id + ' · ' + r.requestFor,
      '<form id="resolve-form"><div class="field"><label for="resolution-note">Resolution details</label><textarea class="textarea" id="resolution-note" name="resolution" placeholder="What was done to resolve this request?"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-resolve" data-id="' + r.id + '">' + App.icon('check') + ' Mark resolved</button>');
  });
  App.on('confirm-resolve', d => {
    if (!canHandle()) return;
    const r = req(d.id); if (!r || r.status === 'resolved') return;
    const el = document.getElementById('resolution-note');
    const note = el && el.value ? el.value : 'Resolved by ' + actor();
    r.status = 'resolved'; r.resolution = String(note); r.resolvedAt = App.stamp();
    auditPush(r, 'Request resolved', String(note), actor());
    noticePush('resolved', 'Request ' + r.id + ' was resolved by ' + actor(), r.id);
    App.save(); App.closeModal(); App.refresh(); App.toast(r.id + ' resolved and requestor notified.');
  });
  App.on('reopen-request', d => {
    if (!canHandle()) return;
    const r = req(d.id); if (!r || r.status !== 'resolved') return;
    r.status = 'in_progress';
    auditPush(r, 'Request reopened', 'Resolved → In Progress', actor());
    App.save(); App.refresh(); App.toast(r.id + ' reopened.');
  });
  App.on('request-detail', d => {
    const r = req(d.id); if (!r) return;
    const timeline = s.audit.filter(a => a.requestId === r.id).map(a => '<li>' + App.icon('history') + '<div><strong>' + App.esc(a.action) + '</strong><small>' + App.esc(a.timestamp) + ' · ' + App.esc(a.actor) + (a.detail ? ' · ' + App.esc(a.detail) : '') + '</small></div></li>').join('');
    App.modal('Request ' + r.id, r.type + ' · ' + r.category,
      '<div class="detail-grid"><div class="detail"><small>Status</small><strong>' + App.esc(r.status) + '</strong></div><div class="detail"><small>Team</small><strong>' + App.esc(r.team) + '</strong></div><div class="detail"><small>Request for</small><strong>' + App.esc(r.requestFor) + '</strong></div><div class="detail"><small>Requestor</small><strong>' + App.esc(r.requestor) + '</strong></div><div class="detail full"><small>Remarks</small><strong>' + App.esc(r.remarks || '—') + '</strong></div><div class="detail full"><small>Resolution</small><strong>' + App.esc(r.resolution || 'Not yet resolved') + '</strong></div></div>' +
      '<h3 class="section-title">' + App.icon('shield') + ' Audit history</h3><ul class="timeline">' + (timeline || '<li>No audit entries.</li>') + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  });
  App.on('read-notice', d => {
    const n = (s.notices || []).find(x => x.id === d.id); if (!n) return;
    n.read = true; App.save(); App.refresh(); App.toast('Notification marked as read.');
  });
  App.on('read-all-notices', () => {
    s.notices.forEach(n => { n.read = true; });
    App.save(); App.refresh(); App.toast('All notifications marked as read.');
  });

  function updateCounts() {
    const open = scoped(s.requests).filter(r => r.status !== 'resolved').length;
    App.setCounts({
      dashboard: open, submit: 0, wall: open, requests: scoped(s.requests).length,
      reports: 0, audit: s.audit.length
    });
    const all = scoped(s.requests);
    App.setProgress(all.length ? Math.round(all.filter(r => r.status === 'resolved').length / all.length * 100) : 0, 'Requests resolved');
  }
  updateCounts();
  App.go('dashboard');
})();
