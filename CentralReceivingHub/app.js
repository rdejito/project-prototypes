/* Central Receiving Hub prototype — scan, monitor, notify, and claim items. */
(function () {
  let s; // assigned immediately after App.init() below
  const ui = { itemFilter: 'all', noticeFilter: 'all', monitorFilter: 'all', historyFilter: 'all', scanned: null };
  const me = 'Alex Morgan';

  const ROLE_LABELS = { mh: 'Material Handler', requestor: 'Requestor', supervisor: 'Supervisor / Manager', admin: 'System Administrator' };
  const isMh = () => s.role === 'mh' || s.role === 'admin';
  const isSupervisor = () => s.role === 'supervisor' || s.role === 'admin';
  const isAdmin = () => s.role === 'admin';
  const isRequestor = () => s.role === 'requestor' || (!isMh() && !isSupervisor());
  const roleLabel = () => ROLE_LABELS[s.role] || s.role || 'Requestor';
  const statusOf = i => i.status === 'claimed' ? 'Claimed' : 'Pending';

  function pushNotice(to, kind, text, id) {
    s.notifications = s.notifications || [];
    s.notifications.unshift({ id: id || App.uid('nt'), to: to, kind: kind, text: text, date: App.stamp(), read: false });
  }
  function log(text, module) { App.activity(text, module); }
  function intro(text) { return App.notice('info', text); }
  function denied(module, need) {
    return intro('Active role: <strong>' + App.esc(roleLabel()) + '</strong>. ' + need +
      ' Switch roles in the top bar to explore the ' + App.esc(module) + ' workflow.');
  }

  /* Arrival / 24-hour / 48-hour notices derived from item dates. */
  function ensureNotices() {
    let changed = false;
    s.items.filter(i => i.status === 'pending').forEach(i => {
      const age = App.daysSince(i.arrival);
      if (age >= 1 && !s.notifications.some(n => n.id === 'rm-' + i.id)) {
        pushNotice(i.requestor, 'reminder', '24-hour reminder: ' + i.name + ' (' + i.code + ') is still unclaimed in ' + i.location + '. Arrival was ' + i.arrival + '.', 'rm-' + i.id);
        changed = true;
      }
      if (age >= 2 && !s.notifications.some(n => n.id === 'es-' + i.id)) {
        pushNotice('supervisor', 'escalation', '48-hour escalation: ' + i.name + ' (' + i.code + ') for ' + i.requestor + ' remains unclaimed (' + age + ' days).', 'es-' + i.id);
        changed = true;
      }
    });
    if (changed) App.save();
  }

  function myItems() {
    return isRequestor() ? s.items.filter(i => i.requestor === me) : s.items.slice();
  }
  function myNotices() {
    if (isAdmin()) return s.notifications.slice();
    if (isMh()) return s.notifications.filter(n => n.to === 'mh' || n.to === 'all');
    if (isSupervisor()) return s.notifications.filter(n => n.to === 'supervisor' || n.to === 'all');
    return s.notifications.filter(n => n.to === me || n.to === 'all');
  }
  function noticeList(limit) {
    const list = myNotices().slice(0, limit || 6);
    if (!list.length) return App.empty('No notices', 'Arrival, reminder, escalation, and claim notices appear here.');
    return '<div class="notice-stack">' + list.map(n => '<div class="notice ' + (n.kind === 'escalation' ? 'warn' : n.read ? 'info' : 'warn') + '">' + App.icon(n.kind === 'claim' ? 'check' : 'bell') +
      '<span style="flex:1"><strong>' + App.esc(n.kind.toUpperCase()) + '</strong> · ' + App.esc(n.text) + '<br><small class="muted">' + App.esc(n.date) + (n.read ? ' · read' : ' · unread') + '</small></span>' +
      (n.read ? '' : '<button class="btn btn-outline btn-sm" data-action="mark-read" data-id="' + n.id + '">Read</button>') + '</div>').join('') + '</div>';
  }
  function stageTrack(item) {
    const age = App.daysSince(item.arrival);
    const step = item.status === 'claimed' ? 3 : age >= 2 ? 2 : age >= 1 ? 1 : 0;
    const stages = ['Arrived', '24h reminder', '48h escalation', 'Claimed'];
    return '<div class="stage-track">' + stages.map((x, i) => '<div class="stage ' + (i < step ? 'done' : i === step ? 'current' : '') + '">' + x + '</div>').join('') + '</div>';
  }
  function itemRow(i) {
    return '<div class="list-row"><span class="activity-icon">' + App.icon('box') + '</span><div class="list-main"><strong>' + App.esc(i.name) + '</strong>' +
      '<div class="meta"><span>' + App.icon('file') + App.esc(i.code) + '</span><span>' + App.icon('user') + App.esc(i.requestor) + '</span>' +
      '<span>' + App.icon('map') + App.esc(i.location) + '</span>' + App.ageChip(i.arrival) + '</div></div>' +
      App.badge(i.status) + '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="view-item" data-id="' + i.id + '">Details</button>' +
      ((isMh() || isSupervisor()) ? '<button class="btn btn-outline btn-sm" data-action="edit-item" data-id="' + i.id + '">' + App.icon('edit') + ' Edit</button>' : '') +
      (isRequestor() && i.requestor === me && i.status === 'pending' ? '<button class="btn btn-success btn-sm" data-action="claim-item" data-id="' + i.id + '">' + App.icon('check') + ' Mark claimed</button>' : '') +
      '</div></div>';
  }

  /* ---------------- Dashboard ---------------- */
  function dashboard() {
    const pending = s.items.filter(i => i.status === 'pending');
    const claimed = s.items.filter(i => i.status === 'claimed');
    const escalated = pending.filter(i => App.daysSince(i.arrival) >= 2);
    const mine = s.items.filter(i => i.requestor === me);
    const hero = '<div class="hero"><div class="hero-top"><div><h2>Central Receiving Hub</h2>' +
      '<p>Automated item receiving, monitoring, and claiming for the End User Cage. Scan once, notify automatically, and keep a complete claiming history.</p></div>' +
      '<div class="hero-ring"><div class="ring" style="--ring:' + Math.round(claimed.length / s.items.length * 100) + '%"><div class="ring-inner">' + Math.round(claimed.length / s.items.length * 100) + '%</div></div><small>Items claimed</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + pending.length + '</strong><span>Pending</span></div>' +
      '<div class="hero-stat"><strong>' + claimed.length + '</strong><span>Claimed</span></div>' +
      '<div class="hero-stat"><strong>' + escalated.length + '</strong><span>Escalated</span></div>' +
      '<div class="hero-stat"><strong>' + myNotices().filter(n => !n.read).length + '</strong><span>Unread notices</span></div></div></div>';

    const sample = pending[0] || s.items[0];
    const track = sample ? '<h2 class="section-title">' + App.icon('clock') + ' Automated workflow — ' + App.esc(sample.code) + '</h2>' +
      App.card('From arrival to claim', 'Dates drive the reminder and escalation notices', stageTrack(sample) +
        '<p class="small muted">Arrived ' + App.esc(sample.arrival) + ' · ' + App.daysSince(sample.arrival) + ' day(s) in the cage · ' + App.esc(sample.location) + '</p>') : '';

    const focus = (isRequestor() ? mine.filter(i => i.status === 'pending') : pending).slice(0, 5).map(i =>
      '<div class="focus-item"><span class="focus-dot" style="background:' + (App.daysSince(i.arrival) >= 2 ? 'var(--danger)' : 'var(--pending)') + '"></span>' +
      '<div class="txt"><strong>' + App.esc(i.name) + '</strong><span>' + App.esc(i.code) + ' · ' + App.esc(i.requestor) + '</span></div>' + App.ageChip(i.arrival) + '</div>').join('') || App.empty('Nothing pending', 'All items have been claimed.');
    const act = s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');

    return hero + '<div class="stat-grid" style="margin-top:18px"><div class="card stat-card warn"><span>Your visible records</span><strong>' + myItems().length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Automated notices</span><strong>' + myNotices().length + '</strong></div>' +
      '<div class="card stat-card good"><span>Claims recorded</span><strong>' + s.items.reduce((n, i) => n + i.claimHistory.filter(h => h.by !== 'System').length, 0) + '</strong></div></div>' + track +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Items needing attention', 'Pending items in your scope', focus) + App.card('Notice center', 'Latest automated alerts', noticeList(5)) + '</div>' +
      '<div style="margin-top:18px">' + App.card('Recent activity', 'Timestamped receiving events', act) + '</div>' +
      '<div style="margin-top:18px">' + App.notice('info', 'Access control: requestors see only their own records; supervisors see their team; unauthorized item records are hidden automatically.') + '</div>';
  }

  /* ---------------- Items ---------------- */
  function items() {
    let list = myItems();
    if (ui.itemFilter === 'pending') list = list.filter(i => i.status === 'pending');
    if (ui.itemFilter === 'claimed') list = list.filter(i => i.status === 'claimed');
    const head = isMh() ? '<button class="btn btn-primary btn-sm" data-action="goto-scan">' + App.icon('scan') + ' Scan an item</button>' : '';
    return intro(isRequestor()
      ? 'Requestor view: your item details, pending items, and claiming history — no need to ask the MH.'
      : 'Authorized staff view: only records you are permitted to see are listed. Unauthorized records are hidden.') +
      '<div class="toolbar">' + App.tabs('itemFilter', [
        { value: 'all', label: 'All items', count: myItems().length },
        { value: 'pending', label: 'Pending', count: myItems().filter(i => i.status === 'pending').length },
        { value: 'claimed', label: 'Claimed', count: myItems().filter(i => i.status === 'claimed').length }
      ], ui.itemFilter) + head + '</div>' +
      App.card('Item records', (isRequestor() ? 'Items assigned to ' + me : 'Monitored items with full claiming history'),
        list.length ? list.map(itemRow).join('') : App.empty('No items found', 'Adjust the filter or scan a new arrival.')) +
      '<div style="margin-top:18px">' + App.notice('warn', 'Security: clicking Details never reveals an item outside your authorization scope. Switch roles to compare what each actor can see.') + '</div>';
  }

  /* ---------------- Scan ---------------- */
  function scanFormHtml() {
    const c = ui.scanned;
    if (!c) return intro('Pick a sample barcode / QR payload, then simulate the scan. The entry form is filled automatically and remains editable for MH review.');
    return '<form id="scan-form"><div class="notice info">' + App.icon('scan') + '<span>Payload <strong>' + App.esc(c.code) + '</strong> decoded. Fields below were auto-populated — review before saving.</span></div>' +
      '<div class="detail-grid">' +
      '<div class="field"><label for="sf-code">Scanned code</label><input class="input" id="sf-code" name="code" value="' + App.esc(c.code) + '" /></div>' +
      '<div class="field"><label for="sf-serial">Serial number</label><input class="input" id="sf-serial" name="serial" value="' + App.esc(c.serial) + '" /></div>' +
      '<div class="field"><label for="sf-name">Item name</label><input class="input" id="sf-name" name="name" value="' + App.esc(c.name) + '" required /></div>' +
      '<div class="field"><label for="sf-cat">Category</label><input class="input" id="sf-cat" name="category" value="' + App.esc(c.category) + '" /></div>' +
      '<div class="field"><label for="sf-supplier">Supplier</label><input class="input" id="sf-supplier" name="supplier" value="' + App.esc(c.supplier) + '" /></div>' +
      '<div class="field"><label for="sf-dept">Department</label><input class="input" id="sf-dept" name="department" value="' + App.esc(c.department) + '" /></div>' +
      '<div class="field"><label for="sf-req">Requestor</label><select class="select" id="sf-req" name="requestor">' +
      ['Alex Morgan', 'Priya Shah', 'Diego Reyes'].map(n => '<option' + (n === 'Alex Morgan' ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="sf-loc">Cage location</label><input class="input" id="sf-loc" name="location" value="' + App.esc(c.location) + '" /></div>' +
      '<div class="field"><label for="sf-cond">Condition</label><select class="select" id="sf-cond" name="condition"><option>Good</option><option>Sealed</option><option>Damaged</option></select></div>' +
      '<div class="field"><label for="sf-arrival">Arrival date</label><input class="input" type="date" id="sf-arrival" name="arrival" value="' + App.today() + '" /></div></div></form>' +
      '<div class="row"><button class="btn btn-primary" data-action="save-scan">' + App.icon('check') + ' Review & save item</button>' +
      '<button class="btn btn-outline" data-action="clear-scan">Clear form</button></div>';
  }
  function scan() {
    const reader = '<div class="scan-frame">' + App.icon('scan') +
      '<div class="scan-code">' + (ui.scanned ? App.esc(ui.scanned.code) : 'AWAITING SCAN') + '</div>' +
      '<p class="small muted">Simulated barcode / QR reader · no camera or internet needed</p>' +
      '<div class="row" style="justify-content:center"><select class="select" id="scan-code" style="max-width:340px">' +
      s.scanCodes.map(c => '<option value="' + c.code + '">' + App.esc(c.code) + ' · ' + App.esc(c.name) + '</option>').join('') +
      '</select><button class="btn btn-primary" data-action="simulate-scan">' + App.icon('scan') + ' Simulate scan</button></div></div>';
    if (!isMh()) {
      return intro('Scanning is restricted to Material Handlers. This simulated reader is shown read-only for other roles.') +
        App.card('Barcode / QR reader', 'MH-only action', reader) +
        '<div style="margin-top:18px">' + App.card('What happens after a scan', 'Automated receiving workflow',
          '<ul class="timeline"><li>Scan decodes the payload and auto-fills the item form.<small>MH reviews and edits before saving.</small></li>' +
          '<li>Arrival notice is generated for the requestor.<small>24-hour reminder follows from the arrival date.</small></li>' +
          '<li>At 48 hours the supervisor receives an escalation.<small>Claiming updates the item instantly.</small></li></ul>') + '</div>';
    }
    return intro('MH view: the scan auto-populates the item entry form. You can edit every field, then save the record and trigger arrival notices.') +
      App.card('Barcode / QR reader', 'Simulated scan with fake code picker', reader) +
      '<div style="margin-top:18px">' + App.card('Item entry form', 'Auto-populated — review, edit, and save', scanFormHtml()) + '</div>' +
      '<div style="margin-top:18px">' + App.notice('info', 'After saving: an arrival email is generated for the requestor; reminders and escalations are derived from the arrival date.') + '</div>';
  }

  /* ---------------- Notifications ---------------- */
  function notifications() {
    let list = myNotices();
    if (ui.noticeFilter === 'unread') list = list.filter(n => !n.read);
    if (['arrival', 'reminder', 'escalation', 'claim'].includes(ui.noticeFilter)) list = list.filter(n => n.kind === ui.noticeFilter);
    const counts = {
      arrival: myNotices().filter(n => n.kind === 'arrival').length,
      reminder: myNotices().filter(n => n.kind === 'reminder').length,
      escalation: myNotices().filter(n => n.kind === 'escalation').length,
      claim: myNotices().filter(n => n.kind === 'claim').length
    };
    return intro('Notification center: arrival email simulation, 24-hour reminders, 48-hour escalations, and claim notices are all generated from item dates and actions.') +
      '<div class="stat-grid"><div class="card stat-card accent"><span>Arrival notices</span><strong>' + counts.arrival + '</strong></div>' +
      '<div class="card stat-card warn"><span>24h reminders</span><strong>' + counts.reminder + '</strong></div>' +
      '<div class="card stat-card"><span>48h escalations</span><strong>' + counts.escalation + '</strong></div></div>' +
      '<div class="toolbar">' + App.tabs('noticeFilter', [
        { value: 'all', label: 'All', count: myNotices().length },
        { value: 'unread', label: 'Unread', count: myNotices().filter(n => !n.read).length },
        { value: 'arrival', label: 'Arrival', count: counts.arrival }, { value: 'reminder', label: 'Reminder', count: counts.reminder },
        { value: 'escalation', label: 'Escalation', count: counts.escalation }, { value: 'claim', label: 'Claim', count: counts.claim }
      ], ui.noticeFilter) + '<button class="btn btn-outline btn-sm" data-action="mark-all-read">Mark all read</button></div>' +
      App.card('In-app notification center', 'Delivered to ' + roleLabel(), list.length ?
        '<div class="notice-stack">' + list.map(n => '<div class="notice ' + (n.kind === 'escalation' ? 'warn' : n.read ? 'info' : 'warn') + '">' +
          App.icon(n.kind === 'claim' ? 'check' : 'bell') + '<span style="flex:1"><strong>' + App.esc(n.kind.toUpperCase()) + '</strong> · ' + App.esc(n.text) +
          '<br><small class="muted">' + App.esc(n.date) + ' · to ' + App.esc(n.to) + '</small></span>' +
          (n.read ? App.badge('done') : '<button class="btn btn-outline btn-sm" data-action="mark-read" data-id="' + n.id + '">Mark read</button>') + '</div>').join('') + '</div>' :
        App.empty('No notices in this filter', 'Try another tab.')) +
      '<div style="margin-top:18px">' + App.notice('info', 'Automated schedule: arrival at intake, reminder at ' + App.addDays(App.today(), 1) + ' (24 hours), escalation at ' + App.addDays(App.today(), 2) + ' (48 hours).') + '</div>';
  }

  /* ---------------- Monitor ---------------- */
  function monitor() {
    if (isRequestor()) {
      const mine = s.items.filter(i => i.requestor === me);
      return intro('Requestor monitoring: you can track only your own items. Pending items and claiming history are shown below.') +
        '<div class="stat-grid"><div class="card stat-card warn"><span>Your pending</span><strong>' + mine.filter(i => i.status === 'pending').length + '</strong></div>' +
        '<div class="card stat-card good"><span>Your claimed</span><strong>' + mine.filter(i => i.status === 'claimed').length + '</strong></div>' +
        '<div class="card stat-card accent"><span>Your notices</span><strong>' + myNotices().length + '</strong></div></div>' +
        App.card('Your monitored records', 'Unauthorized records are hidden', mine.map(itemRow).join('') || App.empty('No records', 'No items are assigned to you.'));
    }
    let list = s.items.slice();
    if (ui.monitorFilter === 'pending') list = list.filter(i => i.status === 'pending');
    if (ui.monitorFilter === 'claimed') list = list.filter(i => i.status === 'claimed');
    const escalations = s.items.filter(i => i.status === 'pending' && App.daysSince(i.arrival) >= 2);
    const rows = list.map(i => '<tr><td>' + App.esc(i.code) + '</td><td>' + App.esc(i.name) + '</td><td>' + App.esc(i.requestor) + '</td><td>' + App.esc(i.department) + '</td><td>' + App.ageChip(i.arrival) + '</td><td>' + App.badge(i.status) + '</td><td><button class="btn btn-outline btn-sm" data-action="view-item" data-id="' + i.id + '">Open</button></td></tr>').join('');
    return intro('MH / Supervisor monitoring: authorized item records only. Aging chips show which arrivals need follow-up.') +
      '<div class="stat-grid"><div class="card stat-card warn"><span>Pending items</span><strong>' + s.items.filter(i => i.status === 'pending').length + '</strong></div>' +
      '<div class="card stat-card good"><span>Claimed items</span><strong>' + s.items.filter(i => i.status === 'claimed').length + '</strong></div>' +
      '<div class="card stat-card accent"><span>Escalated (48h+)</span><strong>' + escalations.length + '</strong></div></div>' +
      (isSupervisor() ? '<div style="margin-bottom:18px">' + App.card('Supervisor escalation list', 'Items unclaimed for 48 hours or more',
        escalations.length ? escalations.map(i => '<div class="list-row"><div class="list-main"><strong>' + App.esc(i.name) + '</strong><div class="meta"><span>' + App.esc(i.requestor) + '</span>' + App.ageChip(i.arrival) + '</div></div>' + App.badge('high') + '</div>').join('') :
          App.empty('No escalations', 'All pending items are within 48 hours.')) + '</div>' : '') +
      '<div class="toolbar">' + App.tabs('monitorFilter', [
        { value: 'all', label: 'All', count: s.items.length },
        { value: 'pending', label: 'Pending', count: s.items.filter(i => i.status === 'pending').length },
        { value: 'claimed', label: 'Claimed', count: s.items.filter(i => i.status === 'claimed').length }
      ], ui.monitorFilter) + '</div>' +
      App.card('Authorized item records', 'Unauthorized records are hidden by access control',
        '<table class="table"><thead><tr><th>Code</th><th>Item</th><th>Requestor</th><th>Department</th><th>Age</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>') +
      '<div style="margin-top:18px">' + App.notice('warn', 'Access-control notice: data is filtered by role. Requestors cannot open another person’s item record; only MH, supervisors, and administrators see monitored records.') + '</div>';
  }

  /* ---------------- History ---------------- */
  function history() {
    let list = myItems();
    if (ui.historyFilter === 'claimed') list = list.filter(i => i.status === 'claimed');
    if (ui.historyFilter === 'pending') list = list.filter(i => i.status === 'pending');
    const rows = [];
    list.forEach(i => i.claimHistory.forEach(h => rows.push({ item: i, event: h })));
    const shown = ui.historyFilter === 'all' ? rows.slice().reverse() : rows.filter(r => (ui.historyFilter === 'claimed') === (r.event.by !== 'System')).reverse();
    return intro('Item records preserve a timestamped claiming history. Claim events update the item status instantly and notify the MH.') +
      '<div class="toolbar">' + App.tabs('historyFilter', [
        { value: 'all', label: 'All events', count: rows.length },
        { value: 'claimed', label: 'Claims', count: rows.filter(r => r.event.by !== 'System').length },
        { value: 'pending', label: 'Arrivals', count: rows.filter(r => r.event.by === 'System').length }
      ], ui.historyFilter) + '</div>' +
      App.card('Claiming history', isRequestor() ? 'Your own records only' : 'All authorized item histories',
        shown.length ? '<table class="table"><thead><tr><th>Code</th><th>Item</th><th>Event</th><th>By</th><th>Date</th><th>Status</th></tr></thead><tbody>' +
          shown.map(r => '<tr><td>' + App.esc(r.item.code) + '</td><td>' + App.esc(r.item.name) + '</td><td>' + App.esc(r.event.note) + '</td><td>' + App.esc(r.event.by) + '</td><td>' + App.esc(r.event.date) + '</td><td>' + App.badge(r.item.status) + '</td></tr>').join('') +
          '</tbody></table>' : App.empty('No history events', 'Try another filter.')) +
      '<div style="margin-top:18px">' + App.card('How records stay accurate', 'Every transition is timestamped',
        '<ul class="timeline"><li>Scan → form → saved item record<small>MH reviews scanned data before it becomes official.</small></li>' +
        '<li>Arrival / 24h / 48h notices<small>Generated from the arrival date, not manual email composition.</small></li>' +
        '<li>Requestor marks claimed<small>Status updates instantly and the MH receives a claim notice.</small></li></ul>') + '</div>';
  }

  /* ---------------- App configuration ---------------- */
  App.init({
    slug: 'crh', title: 'Central Receiving Hub', tagline: 'Receiving · Monitoring · Claiming', icon: 'box', accent: 'indigo',
    roles: ['mh', 'requestor', 'supervisor', 'admin'], roleLabels: ROLE_LABELS,
    viewAccess: { scan: ['mh', 'admin'], monitor: ['mh', 'supervisor', 'admin'] },
    user: { name: me, meta: 'Operations · unified access', initials: 'AM' },
    progressLabel: 'Items claimed', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'WORKSPACE' },
      { id: 'items', label: 'Items', icon: 'box', group: 'RECEIVING' },
      { id: 'scan', label: 'Scan', icon: 'scan', group: 'RECEIVING' },
      { id: 'notifications', label: 'Notifications', icon: 'bell', group: 'RECEIVING' },
      { id: 'monitor', label: 'Monitor', icon: 'monitor', group: 'OVERSIGHT' },
      { id: 'history', label: 'History', icon: 'history', group: 'OVERSIGHT' }
    ],
    views: {
      dashboard: { title: 'Dashboard', subtitle: 'Item receiving at a glance', render: dashboard },
      items: { title: 'Items', subtitle: 'Pending items, details, and claiming history', render: items },
      scan: { title: 'Scan', subtitle: 'Barcode / QR auto-populated entry form', render: scan },
      notifications: { title: 'Notifications', subtitle: 'Arrival, reminder, escalation, and claim notices', render: notifications },
      monitor: { title: 'Monitor', subtitle: 'Authorized item records and escalations', render: monitor },
      history: { title: 'History', subtitle: 'Timestamped item and claim history', render: history }
    }
  });

  s = App.state; // assigned immediately after App.init()
  ensureNotices();

  App.on('filter', d => { if (!d || !d.key) return; ui[d.key] = d.value; App.refresh(); });
  App.on('goto-scan', () => App.go('scan'));

  /* --- Scan & item record actions --- */
  App.on('simulate-scan', d => {
    const sel = document.getElementById('scan-code');
    const code = (sel && sel.value) || d.id;
    ui.scanned = s.scanCodes.find(c => c.code === code) || s.scanCodes[0];
    if (!ui.scanned) return App.toast('No sample code available.', 'error');
    App.refresh(); App.toast('Scanned ' + ui.scanned.code + ' — form auto-populated.');
  });
  App.on('clear-scan', () => { ui.scanned = null; App.refresh(); });
  App.on('save-scan', () => {
    const f = document.getElementById('scan-form'); if (!f) return;
    const d = new FormData(f); if (!d.get('name')) return App.toast('Item name is required.', 'error');
    const arrival = d.get('arrival') || App.today();
    s.items.unshift({ id: App.uid('it'), code: d.get('code') || App.uid('CRH'), name: d.get('name'), category: d.get('category') || 'General',
      supplier: d.get('supplier') || '—', department: d.get('department') || 'Operations', serial: d.get('serial') || '—',
      requestor: d.get('requestor') || me, arrival: arrival, status: 'pending', condition: d.get('condition') || 'Good',
      location: d.get('location') || 'Cage A-01',
      claimHistory: [{ by: 'System', date: arrival, note: 'Scanned arrival; arrival email generated automatically.' }] });
    pushNotice(d.get('requestor') || me, 'arrival', 'Arrival email: ' + d.get('name') + ' (' + (d.get('code') || '') + ') is pending in ' + (d.get('location') || 'the cage') + '.');
    log('Scanned item saved: ' + d.get('name'), 'scan');
    ui.scanned = null; ensureNotices(); App.save(); App.refresh(); App.toast('Item saved; arrival notice sent.');
  });
  App.on('edit-item', d => {
    const i = s.items.find(x => x.id === d.id); if (!i) return;
    App.modal('Review / edit item information', i.code,
      '<form id="crh-item-form"><div class="detail-grid">' +
      '<div class="field"><label for="ef-name">Item name</label><input class="input" id="ef-name" name="name" value="' + App.esc(i.name) + '" /></div>' +
      '<div class="field"><label for="ef-code">Code</label><input class="input" id="ef-code" name="code" value="' + App.esc(i.code) + '" /></div>' +
      '<div class="field"><label for="ef-req">Requestor</label><input class="input" id="ef-req" name="requestor" value="' + App.esc(i.requestor) + '" /></div>' +
      '<div class="field"><label for="ef-loc">Cage location</label><input class="input" id="ef-loc" name="location" value="' + App.esc(i.location) + '" /></div>' +
      '<div class="field"><label for="ef-cond">Condition</label><input class="input" id="ef-cond" name="condition" value="' + App.esc(i.condition) + '" /></div>' +
      '<div class="field"><label for="ef-arrival">Arrival date</label><input class="input" type="date" id="ef-arrival" name="arrival" value="' + App.esc(i.arrival) + '" /></div></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-item" data-id="' + i.id + '">Save item</button>');
  });
  App.on('save-item', d => {
    const i = s.items.find(x => x.id === d.id); const f = document.getElementById('crh-item-form');
    if (!i || !f) return;
    const data = new FormData(f);
    ['name', 'code', 'requestor', 'location', 'condition', 'arrival'].forEach(k => { if (data.get(k)) i[k] = data.get(k); });
    log('MH saved item record: ' + i.name, 'items'); ensureNotices();
    App.save(); App.closeModal(); App.refresh(); App.toast('Item information saved.');
  });
  App.on('view-item', d => {
    const i = s.items.find(x => x.id === d.id);
    if (!i || (isRequestor() && i.requestor !== me)) return;
    const timeline = i.claimHistory.map(h => '<li><strong>' + App.esc(h.by) + '</strong> · ' + App.esc(h.date) + '<small>' + App.esc(h.note) + '</small></li>').join('');
    App.modal('Item details', i.code + ' · ' + i.status,
      '<div class="detail-grid"><div class="detail"><small>Item</small><strong>' + App.esc(i.name) + '</strong></div>' +
      '<div class="detail"><small>Category</small><strong>' + App.esc(i.category) + '</strong></div>' +
      '<div class="detail"><small>Supplier</small><strong>' + App.esc(i.supplier) + '</strong></div>' +
      '<div class="detail"><small>Serial</small><strong>' + App.esc(i.serial) + '</strong></div>' +
      '<div class="detail"><small>Requestor</small><strong>' + App.esc(i.requestor) + '</strong></div>' +
      '<div class="detail"><small>Location</small><strong>' + App.esc(i.location) + '</strong></div></div>' + stageTrack(i) +
      '<h4 class="section-title">Claiming history</h4><ul class="timeline">' + timeline + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>', true);
  });
  App.on('claim-item', d => {
    const i = s.items.find(x => x.id === d.id);
    if (!i || !isRequestor() || i.requestor !== me || i.status !== 'pending') return;
    i.status = 'claimed'; i.claimHistory.push({ by: me, date: App.today(), note: 'Marked claimed by requestor; MH notified.' });
    pushNotice('mh', 'claim', me + ' claimed ' + i.name + ' (' + i.code + '). Update the cage record.');
    pushNotice(me, 'claim', 'You marked ' + i.name + ' as claimed. The MH has been notified.');
    log('Claim recorded: ' + i.name, 'items');
    App.save(); App.refresh(); App.toast('Item claimed — MH notified instantly.');
  });

  /* --- Notification actions --- */
  App.on('mark-read', d => {
    const n = s.notifications.find(x => x.id === d.id); if (!n) return;
    n.read = true; App.save(); App.refresh();
  });
  App.on('mark-all-read', () => { myNotices().forEach(n => { n.read = true; }); App.save(); App.refresh(); App.toast('Notices marked as read.'); });

  function updateCounts() {
    App.setCounts({
      dashboard: myNotices().filter(n => !n.read).length,
      items: myItems().filter(i => i.status === 'pending').length,
      scan: isMh() ? 1 : 0,
      notifications: myNotices().filter(n => !n.read).length,
      monitor: s.items.filter(i => i.status === 'pending' && App.daysSince(i.arrival) >= 2).length,
      history: s.items.reduce((n, i) => n + i.claimHistory.filter(h => h.by !== 'System').length, 0)
    });
    App.setProgress(Math.round(s.items.filter(i => i.status === 'claimed').length / Math.max(1, s.items.length) * 100), 'Items claimed');
  }
  ensureNotices();
  updateCounts();
  App.go('dashboard');
})();
