/* ClearPass interactive prototype — vanilla JS, no build step. */

/* ------------------------------------------------------------------ icons */
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  broom: '<path d="M14 4l6 6"/><path d="M15 9l-7.5 7.5-4-4L11 5z"/><path d="M4 21l5-5 4 4-5 1z"/>',
  ticket: '<path d="M4 7h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V8a1 1 0 0 1 1-1z"/><path d="M14 7v2M14 12v2M14 17v2"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2 1-1.2 1.8v.3"/><path d="M12 16.5h.01"/>',
  wallet: '<path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 7V6a2 2 0 0 1 2-2h12"/><path d="M16 12h4"/>',
  chat: '<path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M18 6L6 18M6 6l12 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/>',
  heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  map: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  star: '<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9L12 3z"/>',
  alert: '<path d="M12 3L2 20h20L12 3z"/><path d="M12 9v5M12 17h.01"/>'
};
function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.info) + '</svg>';
}

/* --------------------------------------------------------------- state io */
const STORAGE_KEY = 'clearpass_prototype_v1';
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.concerns)) return parsed;
    }
  } catch (e) { /* fall back to seed */ }
  return JSON.parse(JSON.stringify(CLEARPASS_SEED));
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
}
let state = loadState();
const ui = {
  view: 'dashboard',
  itemsTab: 'pending',
  dutiesTab: 'pending',
  quizFilter: 'all',
  balanceTab: 'unpaid',
  concernStatus: 'all',
  concernQuery: '',
  serviceQuery: ''
};

const PAGES = {
  dashboard: ['Overview', 'Everything you still need to take care of, in one place.'],
  items: ['Item Clearance', 'View pending items, details, and your claiming history.'],
  duties: ['Duty Clearance', 'Track cleaning tasks and submit your completion.'],
  services: ['Service Clearance', 'Browse campus services and take a queue token.'],
  quizzes: ['Quiz Clearance', 'See available practice quizzes, results, and attempts.'],
  balances: ['Financial Clearance', 'Record payments and keep unpaid balances in view.'],
  concerns: ['Concern Clearance', 'Search, filter, and close out your concerns.']
};
const ROLE_ACTIONS = {
  student: ['claimItem', 'submitDuty', 'takeToken', 'takeQuiz', 'recordPayment', 'fileConcern', 'resolveConcern'],
  staff: ['verifyDuty', 'resolveConcern'],
  admin: ['addService']
};
function can(action) { return (ROLE_ACTIONS[state.role] || []).includes(action); }

/* --------------------------------------------------------------- utilities */
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}
function money(n) { return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function balanceOf(b) { return Math.max(0, b.total - b.paid); }
function uid(prefix) { return prefix + '-' + Date.now().toString(36).slice(-5) + Math.floor(Math.random() * 90 + 10); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowStamp() {
  const d = new Date();
  return todayStr() + ' ' + d.toTimeString().slice(0, 5);
}
function addActivity(text, module) {
  const d = new Date();
  state.activity.unshift({
    id: uid('ac'), text, module,
    time: 'Today, ' + d.toTimeString().slice(0, 5)
  });
  state.activity = state.activity.slice(0, 12);
}
function toast(message, type) {
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML = icon(type === 'error' ? 'alert' : 'check') + '<span>' + esc(message) + '</span>';
  document.getElementById('toast-root').appendChild(el);
  setTimeout(() => el.remove(), 3400);
}
function counts() {
  const itemsPending = state.items.filter(i => i.status === 'pending').length;
  const dutiesPending = state.duties.filter(d => d.status === 'pending').length;
  const waitingTokens = state.tokens.filter(t => t.status === 'Waiting').length;
  const quizPending = state.quizzes.filter(q => q.attempts.length === 0).length;
  const unpaid = state.balances.filter(b => balanceOf(b) > 0).length;
  const openConcerns = state.concerns.filter(c => c.status === 'open').length;
  const total = state.items.length + state.duties.length + state.quizzes.length + state.balances.length + state.concerns.length;
  const pending = itemsPending + dutiesPending + quizPending + unpaid + openConcerns;
  const cleared = total - pending;
  return {
    itemsPending, dutiesPending, waitingTokens, quizPending, unpaid, openConcerns,
    total, pending, cleared, percent: total ? Math.round(cleared / total * 100) : 0
  };
}
function roleNotice() {
  if (state.role === 'staff') return '<div class="notice info">' + icon('shield') + '<span><strong>Staff view.</strong> You can verify submitted duties and resolve concerns. Student self-service actions are hidden.</span></div>';
  if (state.role === 'admin') return '<div class="notice info">' + icon('shield') + '<span><strong>Admin view.</strong> You can manage campus services and inspect all checklist modules. Switch to Student view to try self-service actions.</span></div>';
  return '';
}
function emptyState(message, hint) {
  return '<div class="empty">' + icon('check') + '<strong>' + esc(message) + '</strong><span>' + esc(hint) + '</span></div>';
}
function statusBadge(status) {
  const map = { pending: 'pending', claimed: 'done', done: 'done', open: 'open', resolved: 'resolved' };
  const label = { pending: 'Pending', claimed: 'Claimed', done: 'Done', open: 'Open', resolved: 'Resolved' };
  return '<span class="badge ' + (map[status] || 'neutral') + '">' + (label[status] || esc(status)) + '</span>';
}
function tabs(key, items) {
  return '<div class="tabs">' + items.map(t =>
    '<button class="tab' + (ui[key] === t.value ? ' active' : '') + '" data-action="filter" data-key="' + key + '" data-value="' + t.value + '">' +
    esc(t.label) + (t.count != null ? ' (' + t.count + ')' : '') + '</button>'
  ).join('') + '</div>';
}
function card(title, subtitle, body, extraHead) {
  return '<section class="card"><div class="card-head"><div><h2>' + esc(title) + '</h2>' +
    (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div>' + (extraHead || '') + '</div>' +
    '<div class="card-body" style="padding:0">' + body + '</div></section>';
}

/* ----------------------------------------------------------- render: shell */
function render() {
  const c = counts();
  const page = PAGES[ui.view] || PAGES.dashboard;
  document.getElementById('page-title').textContent = page[0];
  document.getElementById('page-subtitle').textContent = page[1];
  document.getElementById('role-select').value = state.role;
  document.getElementById('side-percent').textContent = c.percent + '%';
  document.getElementById('side-progress').style.width = c.percent + '%';

  const navCounts = {
    items: c.itemsPending, duties: c.dutiesPending, services: c.waitingTokens,
    quizzes: c.quizPending, balances: c.unpaid, concerns: c.openConcerns
  };
  document.querySelectorAll('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === ui.view));
  document.querySelectorAll('[data-count]').forEach(el => {
    const n = navCounts[el.dataset.count] || 0;
    el.textContent = n;
    el.classList.toggle('zero', n === 0);
  });

  const views = {
    dashboard: renderDashboard, items: renderItems, duties: renderDuties,
    services: renderServices, quizzes: renderQuizzes, balances: renderBalances,
    concerns: renderConcerns
  };
  document.getElementById('content').innerHTML = (views[ui.view] || renderDashboard)();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* -------------------------------------------------------- render: dashboard */
function renderDashboard() {
  const c = counts();
  const modules = [
    { view: 'items', title: 'Item Clearance', source: 'Central Receiving Hub', icon: 'box', tone: 'indigo', pending: c.itemsPending, total: state.items.length, desc: 'Pending items, details, and claiming history.' },
    { view: 'duties', title: 'Duty Clearance', source: 'CleanClass', icon: 'broom', tone: 'amber', pending: c.dutiesPending, total: state.duties.length, desc: 'Cleaning tasks with pending or done status.' },
    { view: 'services', title: 'Service Clearance', source: 'QueueLess', icon: 'ticket', tone: 'sky', pending: c.waitingTokens, total: Math.max(state.tokens.length, 1), desc: 'Available campus services and queue tokens.' },
    { view: 'quizzes', title: 'Quiz Clearance', source: 'QuizForge', icon: 'quiz', tone: 'violet', pending: c.quizPending, total: state.quizzes.length, desc: 'Practice quizzes, results, and attempts.' },
    { view: 'balances', title: 'Financial Clearance', source: 'SariCredit', icon: 'wallet', tone: 'rose', pending: c.unpaid, total: state.balances.length, desc: 'Partial payments credited, unpaid balances listed.' },
    { view: 'concerns', title: 'Concern Clearance', source: 'PULSE', icon: 'chat', tone: 'teal', pending: c.openConcerns, total: state.concerns.length, desc: 'Open or resolved concerns, searchable and filterable.' }
  ];

  const moduleCards = modules.map(m => {
    const progress = Math.max(0, Math.min(100, Math.round((m.total - m.pending) / m.total * 100)));
    return '<article class="card module-card">' +
      '<div class="module-top"><span class="module-icon tone-' + m.tone + '">' + icon(m.icon) + '</span>' +
      (m.pending > 0 ? '<span class="badge pending">' + m.pending + ' pending</span>' : '<span class="badge done">All clear</span>') + '</div>' +
      '<div><h3>' + m.title + '</h3><div class="source">' + m.source + '</div></div>' +
      '<p>' + m.desc + '</p>' +
      '<div class="mini-track"><div style="width:' + progress + '%"></div></div>' +
      '<div class="module-foot"><span class="tiny muted">' + progress + '% complete</span>' +
      '<button class="btn btn-soft btn-sm" data-action="nav" data-view="' + m.view + '">Open ' + icon('arrow') + '</button></div>' +
      '</article>';
  }).join('');

  const focus = [];
  state.items.filter(i => i.status === 'pending').forEach(i => focus.push({ label: i.name, sub: 'Item · ' + i.location, icon: 'box', view: 'items' }));
  state.duties.filter(d => d.status === 'pending').forEach(d => focus.push({ label: d.title, sub: 'Duty · ' + d.location, icon: 'broom', view: 'duties' }));
  state.balances.filter(b => balanceOf(b) > 0).forEach(b => focus.push({ label: b.name, sub: 'Balance · ' + money(balanceOf(b)) + ' remaining', icon: 'wallet', view: 'balances' }));
  state.concerns.filter(x => x.status === 'open').forEach(x => focus.push({ label: x.title, sub: 'Concern · ' + x.category, icon: 'chat', view: 'concerns' }));
  state.quizzes.filter(q => q.attempts.length === 0).forEach(q => focus.push({ label: q.title, sub: 'Quiz · no attempt yet', icon: 'quiz', view: 'quizzes' }));

  const focusHtml = focus.length
    ? focus.slice(0, 6).map(f => '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>' + esc(f.label) + '</strong><span>' + esc(f.sub) + '</span></div><button class="btn btn-outline btn-sm" data-action="nav" data-view="' + f.view + '">Open</button></div>').join('')
    : emptyState('You are all clear!', 'No pending tasks across your checklist.');

  const activityHtml = state.activity.length
    ? state.activity.slice(0, 6).map(a => '<div class="activity-item"><span class="activity-icon">' + icon(({ items: 'box', duties: 'broom', services: 'ticket', quizzes: 'quiz', balances: 'wallet', concerns: 'chat' })[a.module] || 'info') + '</span><div><p>' + esc(a.text) + '</p><small>' + esc(a.time) + '</small></div></div>').join('')
    : emptyState('No activity yet', 'Actions you take will appear here.');

  return roleNotice() +
    '<section class="hero"><div class="hero-top"><div><h2>Good day, Juan 👋</h2>' +
    '<p>Here is your complete clearance status. Clear what is pending and keep every school touchpoint in one place.</p></div>' +
    '<div class="hero-ring"><div class="ring" style="--ring:' + c.percent + '%"><div class="ring-inner">' + c.percent + '%</div></div><small>Cleared</small></div></div>' +
    '<div class="hero-stats"><div class="hero-stat"><strong>' + c.total + '</strong><span>checklist items</span></div>' +
    '<div class="hero-stat"><strong>' + c.cleared + '</strong><span>cleared</span></div>' +
    '<div class="hero-stat"><strong>' + c.pending + '</strong><span>still pending</span></div>' +
    '<div class="hero-stat"><strong>' + state.tokens.length + '</strong><span>queue tokens taken</span></div></div></section>' +
    '<h2 class="section-title">' + icon('grid') + ' Your six clearance modules</h2>' +
    '<div class="module-grid">' + moduleCards + '</div>' +
    '<div class="dash-bottom" style="margin-top:18px">' +
    card('Today’s focus', 'The first pending items across your checklist', focusHtml) +
    card('Recent activity', 'Latest status changes', activityHtml) + '</div>';
}

/* ------------------------------------------------------------ render: items */
function renderItems() {
  const pending = state.items.filter(i => i.status === 'pending').length;
  let list = state.items.slice();
  if (ui.itemsTab === 'pending') list = list.filter(i => i.status === 'pending');
  if (ui.itemsTab === 'history') list = list.filter(i => i.status === 'claimed');

  const rows = list.length ? list.map(i =>
    '<div class="list-row"><span class="activity-icon">' + icon('box') + '</span>' +
    '<div class="list-main"><strong>' + esc(i.name) + '</strong><div class="meta">' +
    '<span>' + icon('file') + esc(i.code) + '</span><span>' + icon('map') + esc(i.location) + '</span>' +
    '<span>' + icon('calendar') + 'Requested ' + esc(i.requested) + '</span></div></div>' +
    statusBadge(i.status) +
    '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="item-details" data-id="' + i.id + '">Details</button>' +
    (i.status === 'pending' && can('claimItem') ? '<button class="btn btn-primary btn-sm" data-action="claim-item" data-id="' + i.id + '">' + icon('check') + ' Mark as claimed</button>' : '') +
    '</div></div>'
  ).join('') : emptyState(ui.itemsTab === 'pending' ? 'No pending items' : 'No claimed items', ui.itemsTab === 'pending' ? 'Everything from the receiving hub is claimed.' : 'Claimed items will appear in your history.');

  return '<div class="toolbar">' + tabs('itemsTab', [
    { value: 'pending', label: 'Pending', count: pending },
    { value: 'history', label: 'Claiming history', count: state.items.length - pending },
    { value: 'all', label: 'All items' }
  ]) + '</div>' + card('Items assigned to you', 'Mark an item as claimed and its status updates automatically.', rows);
}

/* ----------------------------------------------------------- render: duties */
function renderDuties() {
  const pending = state.duties.filter(d => d.status === 'pending').length;
  let list = state.duties.slice();
  if (ui.dutiesTab === 'pending') list = list.filter(d => d.status === 'pending');
  if (ui.dutiesTab === 'completed') list = list.filter(d => d.status === 'done');

  const rows = list.length ? list.map(d =>
    '<div class="list-row"><span class="activity-icon">' + icon('broom') + '</span>' +
    '<div class="list-main"><strong>' + esc(d.title) + '</strong><div class="meta">' +
    '<span>' + icon('map') + esc(d.location) + '</span><span>' + icon('calendar') + 'Assigned ' + esc(d.assigned) + '</span>' +
    (d.submitted ? '<span>' + icon('check') + 'Submitted ' + esc(d.submitted) + '</span>' : '') + '</div></div>' +
    statusBadge(d.status) +
    '<div class="list-actions">' + (d.status === 'pending'
      ? (can('submitDuty') || can('verifyDuty')
        ? '<button class="btn btn-primary btn-sm" data-action="duty-submit" data-id="' + d.id + '">' + icon('check') + (can('submitDuty') ? ' Submit completion' : ' Verify done') + '</button>'
        : '')
      : '<span class="tiny muted">' + esc(d.note || 'Completed') + '</span>') +
    '</div></div>'
  ).join('') : emptyState(ui.dutiesTab === 'pending' ? 'No pending duties' : 'No completed duties', 'Your cleaning tasks will show up here.');

  return '<div class="toolbar">' + tabs('dutiesTab', [
    { value: 'pending', label: 'Pending', count: pending },
    { value: 'completed', label: 'Completed', count: state.duties.length - pending },
    { value: 'all', label: 'All duties' }
  ]) + '</div>' + card('Cleaning tasks', 'Submit a completion to move a duty from pending to done.', rows);
}

/* --------------------------------------------------------- render: services */
function renderServices() {
  const q = ui.serviceQuery.trim().toLowerCase();
  const services = state.services.filter(s => !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  const cards = services.length ? services.map(s =>
    '<article class="card service-card"><div class="module-top"><span class="module-icon tone-sky">' + icon(s.icon || 'file') + '</span><span class="badge neutral">' + esc(s.code) + '</span></div>' +
    '<div><h3 style="margin:0;font-size:14px">' + esc(s.name) + '</h3></div><p>' + esc(s.description) + '</p>' +
    '<div class="service-meta"><span>' + icon('clock') + esc(s.hours) + '</span><span>' + icon('ticket') + 'Next: ' + esc(s.code) + '-' + String(s.queueNext).padStart(3, '0') + '</span></div>' +
    '<button class="btn btn-primary btn-sm" data-action="token-confirm" data-id="' + s.id + '"' + (can('takeToken') ? '' : ' disabled') + '>' + icon('ticket') + ' Take a token</button></article>'
  ).join('') : emptyState('No services found', 'Try a different search term.');

  const tokenRows = state.tokens.length ? state.tokens.map(t =>
    '<div class="list-row"><span class="badge public">' + esc(t.number) + '</span><div class="list-main"><strong>' + esc(t.service) + '</strong><div class="meta"><span>' + icon('clock') + esc(t.time) + '</span></div></div>' +
    '<span class="badge ' + (t.status === 'Waiting' ? 'pending' : 'resolved') + '">' + esc(t.status) + '</span></div>'
  ).join('') : emptyState('No tokens yet', 'Take a token from any service above.');

  const adminButton = can('addService') ? '<button class="btn btn-primary btn-sm" data-action="add-service">' + icon('plus') + ' Add service</button>' : '';

  return roleNotice() +
    '<div class="toolbar">' + adminButton + '<div class="search-box">' + icon('search') + '<input class="input" id="service-search" placeholder="Search services…" value="' + esc(ui.serviceQuery) + '" /></div>' +
    '<span class="small muted">' + services.length + ' of ' + state.services.length + ' services</span></div>' +
    '<div class="service-grid">' + cards + '</div>' +
    '<div style="margin-top:22px">' + card('Your queue tokens', 'Each token has a unique number generated at the time you take it.', tokenRows) + '</div>';
}

/* ------------------------------------------------------------ render: quizzes */
function renderQuizzes() {
  let list = state.quizzes.slice();
  if (ui.quizFilter === 'public' || ui.quizFilter === 'private') list = list.filter(q => q.visibility === ui.quizFilter);
  if (ui.quizFilter === 'todo') list = list.filter(q => q.attempts.length === 0);
  if (ui.quizFilter === 'done') list = list.filter(q => q.attempts.length > 0);

  const cards = list.length ? list.map(q => {
    const best = q.attempts.length ? Math.max.apply(null, q.attempts.map(a => a.percent)) : null;
    return '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + esc(q.title) + '</h3>' +
      '<div class="quiz-meta"><span>' + icon('quiz') + esc(q.items) + ' items</span><span>' + icon('book') + esc(q.topic) + '</span>' +
      '<span>' + icon('history') + q.attempts.length + ' attempt' + (q.attempts.length === 1 ? '' : 's') + '</span></div></div>' +
      '<span class="badge ' + q.visibility + '">' + (q.visibility === 'public' ? 'Public' : 'Private') + '</span></div>' +
      '<div class="score-pill' + (best == null ? ' none' : '') + '">' + (best == null ? 'Not started' : 'Best score: ' + best + '%') + '</div>' +
      '<div class="row wrap">' + (q.attempts.length ? '<button class="btn btn-outline btn-sm" data-action="quiz-attempts" data-id="' + q.id + '">Results & history</button>' : '') +
      (can('takeQuiz') ? '<button class="btn btn-primary btn-sm" data-action="quiz-start" data-id="' + q.id + '">' + icon('check') + ' Start practice</button>' : '') +
      '</div></article>';
  }).join('') : emptyState('No quizzes match this filter', 'Choose another filter above.');

  return '<div class="toolbar">' + tabs('quizFilter', [
    { value: 'all', label: 'All quizzes', count: state.quizzes.length },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'todo', label: 'Not started' },
    { value: 'done', label: 'Completed' }
  ]) + '</div>' + '<div class="quiz-grid">' + cards + '</div>';
}

/* ----------------------------------------------------------- render: balances */
function renderBalances() {
  const total = state.balances.reduce((s, b) => s + b.total, 0);
  const paid = state.balances.reduce((s, b) => s + b.paid, 0);
  const outstanding = state.balances.reduce((s, b) => s + balanceOf(b), 0);
  const stats = '<div class="stat-grid">' +
    '<div class="card stat-card"><span>Total obligations</span><strong>' + money(total) + '</strong></div>' +
    '<div class="card stat-card good"><span>Total paid (incl. partial)</span><strong>' + money(paid) + '</strong></div>' +
    '<div class="card stat-card warn"><span>Outstanding balance</span><strong>' + money(outstanding) + '</strong></div></div>';

  let body;
  if (ui.balanceTab === 'history') {
    const payments = [];
    state.balances.forEach(b => b.history.forEach(h => payments.push({ name: b.name, ...h })));
    payments.sort((a, b) => b.date.localeCompare(a.date));
    body = payments.length ? payments.map(p =>
      '<div class="list-row"><span class="activity-icon">' + icon('wallet') + '</span><div class="list-main"><strong>' + esc(p.name) + '</strong><div class="meta"><span>' + icon('calendar') + esc(p.date) + '</span><span>' + esc(p.note || 'Payment') + '</span></div></div><strong class="bold">' + money(p.amount) + '</strong></div>'
    ).join('') : emptyState('No payments recorded', 'Payments you record will appear here.');
  } else {
    let list = state.balances.slice();
    if (ui.balanceTab === 'unpaid') list = list.filter(b => balanceOf(b) > 0);
    body = list.length ? list.map(b => {
      const bal = balanceOf(b);
      const pct = Math.round(b.paid / b.total * 100);
      return '<div class="list-row"><span class="activity-icon">' + icon('wallet') + '</span>' +
        '<div class="list-main"><strong>' + esc(b.name) + '</strong><div class="meta"><span>' + icon('calendar') + 'Due ' + esc(b.due) + '</span><span>Total ' + money(b.total) + '</span><span>Paid ' + money(b.paid) + '</span></div>' +
        '<div class="mini-track" style="max-width:260px;margin-top:7px"><div style="width:' + pct + '%;background:var(--done)"></div></div></div>' +
        '<div class="balance-figure"><strong>' + money(bal) + '</strong><span>' + (bal > 0 ? 'remaining' : 'fully paid') + '</span></div>' +
        '<div class="list-actions">' + (bal > 0 && can('recordPayment') ? '<button class="btn btn-primary btn-sm" data-action="payment-modal" data-id="' + b.id + '">' + icon('plus') + ' Record payment</button>' : (bal === 0 ? '<span class="badge done">Paid</span>' : '')) + '</div></div>';
    }).join('') : emptyState('No unpaid balances', 'Everything has been paid in full.');
  }

  return roleNotice() + stats + '<div class="toolbar">' + tabs('balanceTab', [
    { value: 'unpaid', label: 'Unpaid balances', count: state.balances.filter(b => balanceOf(b) > 0).length },
    { value: 'all', label: 'All obligations' },
    { value: 'history', label: 'Payment history' }
  ]) + '</div>' + card('Obligations', 'Full and partial payments are credited immediately.', body);
}

/* ----------------------------------------------------------- render: concerns */
function renderConcerns() {
  const open = state.concerns.filter(c => c.status === 'open').length;
  const q = ui.concernQuery.trim().toLowerCase();
  let list = state.concerns.slice();
  if (ui.concernStatus === 'open' || ui.concernStatus === 'resolved') list = list.filter(c => c.status === ui.concernStatus);
  if (q) list = list.filter(c => (c.title + ' ' + c.category + ' ' + c.description).toLowerCase().includes(q));

  const rows = list.length ? list.map(c =>
    '<div class="list-row"><span class="activity-icon">' + icon('chat') + '</span>' +
    '<div class="list-main"><strong>' + esc(c.title) + '</strong><div class="meta"><span>' + icon('file') + esc(c.category) + '</span><span>' + icon('calendar') + 'Filed ' + esc(c.date) + '</span>' +
    (c.resolvedDate ? '<span>' + icon('check') + 'Resolved ' + esc(c.resolvedDate) + '</span>' : '') + '</div></div>' +
    '<span class="badge ' + c.status + '">' + (c.status === 'open' ? 'Open' : 'Resolved') + '</span>' +
    '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="concern-details" data-id="' + c.id + '">View</button>' +
    (c.status === 'open' && can('resolveConcern') ? '<button class="btn btn-success btn-sm" data-action="resolve-concern" data-id="' + c.id + '">' + icon('check') + ' Resolve</button>' : '') +
    '</div></div>'
  ).join('') : emptyState('No concerns found', 'Adjust your search or status filter.');

  const newBtn = can('fileConcern') ? '<button class="btn btn-primary btn-sm" data-action="new-concern">' + icon('plus') + ' File a concern</button>' : '';
  return '<div class="toolbar"><div class="row wrap" style="flex:1">' +
    '<div class="search-box">' + icon('search') + '<input class="input" id="concern-search" placeholder="Search concerns…" value="' + esc(ui.concernQuery) + '" /></div>' +
    tabs('concernStatus', [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open', count: open }, { value: 'resolved', label: 'Resolved', count: state.concerns.length - open }]) +
    '</div>' + newBtn + '</div>' + card('My concerns', 'Concerns are simply Open or Resolved and can be filtered instantly.', rows);
}

/* ------------------------------------------------------------------- modals */
const modalRoot = document.getElementById('modal-root');
function openModal(title, subtitle, body, footer, wide) {
  modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
    '<div class="modal-head"><div><h3>' + esc(title) + '</h3>' + (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div>' +
    '<button class="icon-btn" data-action="close-modal" aria-label="Close dialog">' + icon('close') + '</button></div>' +
    '<div class="modal-body">' + body + '</div>' + (footer ? '<div class="modal-foot">' + footer + '</div>' : '') + '</div></div>';
  const firstInput = modalRoot.querySelector('input, textarea, select');
  if (firstInput) firstInput.focus();
}
function closeModal() { modalRoot.innerHTML = ''; }

function openItemDetails(id) {
  const i = state.items.find(x => x.id === id);
  if (!i) return;
  const body = '<div class="detail-grid">' +
    '<div class="detail"><small>Item code</small><strong>' + esc(i.code) + '</strong></div>' +
    '<div class="detail"><small>Location</small><strong>' + esc(i.location) + '</strong></div>' +
    '<div class="detail"><small>Requested</small><strong>' + esc(i.requested) + '</strong></div>' +
    '<div class="detail"><small>Status</small><strong>' + (i.status === 'pending' ? 'Pending' : 'Claimed ' + esc(i.claimedDate || '')) + '</strong></div>' +
    '<div class="detail full"><small>Notes</small><strong>' + esc(i.note || '—') + '</strong></div></div>' +
    '<h4 class="section-title" style="margin-top:20px">' + icon('history') + ' Claiming history</h4>' +
    '<ul class="timeline">' + i.history.map(h => '<li><div><strong>' + esc(h.event) + '</strong><small>' + esc(h.date) + '</small></div></li>').join('') + '</ul>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Close</button>' +
    (i.status === 'pending' && can('claimItem') ? '<button class="btn btn-primary" data-action="claim-item" data-id="' + i.id + '">' + icon('check') + ' Mark as claimed</button>' : '');
  openModal(i.name, 'Item details and claiming history', body, footer);
}

function openDutySubmit(id) {
  const d = state.duties.find(x => x.id === id);
  if (!d) return;
  const body = '<div class="detail-grid"><div class="detail full"><small>Task</small><strong>' + esc(d.title) + '</strong></div>' +
    '<div class="detail"><small>Location</small><strong>' + esc(d.location) + '</strong></div>' +
    '<div class="detail"><small>Assigned</small><strong>' + esc(d.assigned) + '</strong></div></div>' +
    '<form id="duty-form" style="margin-top:16px"><div class="field"><label for="duty-note">Completion note (optional)</label>' +
    '<textarea class="textarea" id="duty-note" name="note" placeholder="e.g. Board wiped, floor swept, chairs arranged">' + esc(d.note || '') + '</textarea></div></form>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
    '<button class="btn btn-success" data-action="submit-duty-form" data-id="' + d.id + '">' + icon('check') + (can('submitDuty') ? ' Submit completion' : ' Verify done') + '</button>';
  openModal(can('submitDuty') ? 'Submit cleaning task' : 'Verify cleaning task', d.title, body, footer);
}

function openTokenConfirm(id) {
  const s = state.services.find(x => x.id === id);
  if (!s) return;
  const body = '<div class="detail-grid">' +
    '<div class="detail"><small>Service</small><strong>' + esc(s.name) + '</strong></div>' +
    '<div class="detail"><small>Code</small><strong>' + esc(s.code) + '</strong></div>' +
    '<div class="detail"><small>Open hours</small><strong>' + esc(s.hours) + '</strong></div>' +
    '<div class="detail"><small>Next number</small><strong>' + esc(s.code) + '-' + String(s.queueNext).padStart(3, '0') + '</strong></div></div>' +
    '<p class="small muted" style="margin:16px 0 0">A unique queue number will be generated and added to your tokens. The service counter will call your number.</p>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
    '<button class="btn btn-primary" data-action="take-token" data-id="' + s.id + '">' + icon('ticket') + ' Generate my token</button>';
  openModal('Take a queue token', 'Confirm your chosen service', body, footer);
}

function openQuizAttempts(id) {
  const q = state.quizzes.find(x => x.id === id);
  if (!q) return;
  const body = '<p class="small muted">Results and previous attempts for <strong>' + esc(q.title) + '</strong>.</p>' +
    '<table class="table"><thead><tr><th>#</th><th>Date</th><th>Score</th><th>Percent</th><th>Result</th></tr></thead><tbody>' +
    q.attempts.map((a, idx) => '<tr><td>' + (idx + 1) + '</td><td>' + esc(a.date) + '</td><td>' + a.score + ' / ' + a.total + '</td><td><strong>' + a.percent + '%</strong></td><td><span class="badge ' + (a.percent >= 75 ? 'done' : 'pending') + '">' + (a.percent >= 75 ? 'Passed' : 'Needs review') + '</span></td></tr>').join('') +
    '</tbody></table>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Close</button>' +
    (can('takeQuiz') ? '<button class="btn btn-primary" data-action="quiz-start" data-id="' + q.id + '">Retake practice</button>' : '');
  openModal('Quiz results & attempt history', q.title, body, footer, true);
}

function openQuizStart(id) {
  const q = state.quizzes.find(x => x.id === id);
  if (!q) return;
  const questions = state.quizQuestions[q.id] || [];
  if (!questions.length) { toast('No demo questions are configured for this quiz.', 'error'); return; }
  const body = '<form id="quiz-form" data-id="' + q.id + '">' + questions.map((question, qi) =>
    '<div class="quiz-question"><p>' + (qi + 1) + '. ' + esc(question.q) + '</p>' +
    question.options.map((opt, oi) => '<label class="quiz-option"><input type="radio" name="q' + qi + '" value="' + oi + '" required /> ' + esc(opt) + '</label>').join('') +
    '</div>').join('') + '<p class="field-hint">This is a short demo quiz (3 sample questions) used to record an attempt.</p></form>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
    '<button class="btn btn-primary" data-action="submit-quiz-form" data-id="' + q.id + '">' + icon('check') + ' Submit answers</button>';
  openModal('Start practice quiz', q.title + ' · ' + q.items + ' items', body, footer, true);
}

function openPayment(id) {
  const b = state.balances.find(x => x.id === id);
  if (!b) return;
  const bal = balanceOf(b);
  const body = '<div class="detail-grid">' +
    '<div class="detail"><small>Obligation</small><strong>' + esc(b.name) + '</strong></div>' +
    '<div class="detail"><small>Due date</small><strong>' + esc(b.due) + '</strong></div>' +
    '<div class="detail"><small>Total</small><strong>' + money(b.total) + '</strong></div>' +
    '<div class="detail"><small>Outstanding</small><strong>' + money(bal) + '</strong></div></div>' +
    '<form id="payment-form" data-id="' + b.id + '" style="margin-top:16px">' +
    '<div class="field"><label for="pay-amount">Payment amount</label><input class="input" type="number" id="pay-amount" name="amount" min="0.01" max="' + bal + '" step="0.01" placeholder="0.00" required />' +
    '<div class="amount-chips"><button type="button" class="chip" data-action="fill-amount" data-mode="full" data-max="' + bal + '">Full (' + money(bal) + ')</button>' +
    '<button type="button" class="chip" data-action="fill-amount" data-mode="half" data-max="' + bal + '">Half (' + money(bal / 2) + ')</button></div></div>' +
    '<div class="field"><label for="pay-note">Note (optional)</label><input class="input" id="pay-note" name="note" placeholder="e.g. Partial payment via cash" /></div></form>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Cancel</button>' +
    '<button class="btn btn-primary" data-action="submit-payment-form" data-id="' + b.id + '">' + icon('wallet') + ' Record payment</button>';
  openModal('Record a payment', 'Full or partial payments are credited immediately', body, footer);
}

function openConcernDetails(id) {
  const c = state.concerns.find(x => x.id === id);
  if (!c) return;
  const body = '<div class="detail-grid">' +
    '<div class="detail"><small>Category</small><strong>' + esc(c.category) + '</strong></div>' +
    '<div class="detail"><small>Date filed</small><strong>' + esc(c.date) + '</strong></div>' +
    '<div class="detail"><small>Status</small><strong>' + (c.status === 'open' ? 'Open' : 'Resolved ' + esc(c.resolvedDate || '')) + '</strong></div>' +
    '<div class="detail"><small>Reference</small><strong>' + esc(c.id.toUpperCase()) + '</strong></div>' +
    '<div class="detail full"><small>Description</small><strong>' + esc(c.description) + '</strong></div></div>';
  const footer = '<button class="btn btn-outline" data-action="close-modal">Close</button>' +
    (c.status === 'open' && can('resolveConcern') ? '<button class="btn btn-success" data-action="resolve-concern" data-id="' + c.id + '">' + icon('check') + ' Mark resolved</button>' : '');
  openModal(c.title, 'Concern details', body, footer);
}

function openNewConcern() {
  const body = '<form id="concern-form">' +
    '<div class="field"><label for="c-title">Title</label><input class="input" id="c-title" name="title" required placeholder="e.g. Broken projector in Room 201" /></div>' +
    '<div class="field"><label for="c-category">Category</label><select class="select" id="c-category" name="category"><option>Facilities</option><option>Academics</option><option>IT Services</option><option>Finance</option><option>Others</option></select></div>' +
    '<div class="field"><label for="c-desc">Description</label><textarea class="textarea" id="c-desc" name="description" required placeholder="Describe the concern…"></textarea></div></form>';
  openModal('File a concern', 'New concerns start with an Open status', body,
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-concern-form">' + icon('plus') + ' Submit concern</button>');
}

function openAddService() {
  const body = '<form id="service-form">' +
    '<div class="field"><label for="s-name">Service name</label><input class="input" id="s-name" name="name" required placeholder="e.g. Scholarship Desk" /></div>' +
    '<div class="field"><label for="s-code">Code prefix</label><input class="input" id="s-code" name="code" required maxlength="5" placeholder="e.g. SCH" /></div>' +
    '<div class="field"><label for="s-desc">Description</label><input class="input" id="s-desc" name="description" required /></div>' +
    '<div class="field"><label for="s-hours">Open hours</label><input class="input" id="s-hours" name="hours" required placeholder="8:00 AM – 5:00 PM" /></div></form>';
  openModal('Add campus service', 'Available services appear on the student dashboard', body,
    '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="submit-service-form">' + icon('plus') + ' Add service</button>');
}

/* ----------------------------------------------------------------- actions */
function claimItem(id) {
  const i = state.items.find(x => x.id === id);
  if (!i || i.status !== 'pending') return;
  i.status = 'claimed';
  i.claimedDate = todayStr();
  i.history.unshift({ date: todayStr(), event: 'Marked as claimed by student' });
  addActivity(i.name + ' marked as claimed', 'items');
  saveState(); closeModal(); render(); toast('Item marked as claimed. Status updated.');
}

function submitDuty(id, note) {
  const d = state.duties.find(x => x.id === id);
  if (!d || d.status !== 'pending') return;
  d.status = 'done';
  d.submitted = todayStr();
  if (note) d.note = note;
  addActivity(can('verifyDuty') && !can('submitDuty') ? 'Duty verified: ' + d.title : 'Cleaning duty submitted for ' + d.title, 'duties');
  saveState(); closeModal(); render(); toast('Duty submitted and marked as done.');
}

function takeToken(id) {
  const s = state.services.find(x => x.id === id);
  if (!s) return;
  const number = s.code + '-' + String(s.queueNext).padStart(3, '0');
  s.queueNext += 1;
  state.tokens.unshift({ id: uid('tk'), number, service: s.name, time: nowStamp(), status: 'Waiting' });
  addActivity('Queue token ' + number + ' taken for ' + s.name, 'services');
  saveState(); closeModal(); render(); toast('Your token is ' + number + '.');
}

function resolveConcern(id) {
  const c = state.concerns.find(x => x.id === id);
  if (!c || c.status !== 'open') return;
  c.status = 'resolved';
  c.resolvedDate = todayStr();
  addActivity('Concern resolved: ' + c.title, 'concerns');
  saveState(); closeModal(); render(); toast('Concern marked as resolved.');
}

/* --------------------------------------------------------------- listeners */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case 'nav':
      ui.view = el.dataset.view;
      document.getElementById('sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('show');
      render();
      break;
    case 'toggle-sidebar':
      document.getElementById('sidebar').classList.toggle('open');
      document.querySelector('.sidebar-overlay').classList.toggle('show');
      break;
    case 'close-sidebar':
      document.getElementById('sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('show');
      break;
    case 'close-modal': closeModal(); break;
    case 'filter':
      ui[el.dataset.key] = el.dataset.value;
      render();
      break;
    case 'item-details': openItemDetails(id); break;
    case 'claim-item': if (can('claimItem')) claimItem(id); break;
    case 'duty-submit':
      if (can('submitDuty') || can('verifyDuty')) openDutySubmit(id);
      break;
    case 'submit-duty-form': {
      const note = (document.getElementById('duty-note') || {}).value || '';
      submitDuty(id, note.trim());
      break;
    }
    case 'submit-quiz-form':
    case 'submit-payment-form':
    case 'submit-concern-form':
    case 'submit-service-form': {
      const form = document.getElementById(action.replace('submit-', ''));
      if (form) form.requestSubmit();
      break;
    }
    case 'token-confirm': if (can('takeToken')) openTokenConfirm(id); break;
    case 'take-token': if (can('takeToken')) takeToken(id); break;
    case 'quiz-attempts': openQuizAttempts(id); break;
    case 'quiz-start': if (can('takeQuiz')) openQuizStart(id); break;
    case 'payment-modal': if (can('recordPayment')) openPayment(id); break;
    case 'fill-amount': {
      const input = document.getElementById('pay-amount');
      if (input) input.value = el.dataset.mode === 'full' ? el.dataset.max : (Math.round(Number(el.dataset.max) / 2 * 100) / 100);
      break;
    }
    case 'concern-details': openConcernDetails(id); break;
    case 'resolve-concern': if (can('resolveConcern')) resolveConcern(id); break;
    case 'new-concern': if (can('fileConcern')) openNewConcern(); break;
    case 'add-service': if (can('addService')) openAddService(); break;
    case 'reset-demo':
      openModal('Reset demo data?', 'This restores the original seed data', '<p class="small muted">All changes made in this browser session will be discarded. This cannot be undone.</p>',
        '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="reset-demo-confirm">' + icon('reset') + ' Reset data</button>');
      break;
    case 'reset-demo-confirm':
      state = JSON.parse(JSON.stringify(CLEARPASS_SEED));
      saveState(); closeModal(); ui.view = 'dashboard'; render(); toast('Demo data restored.');
      break;
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'service-search') { ui.serviceQuery = e.target.value; render(); const el = document.getElementById('service-search'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
  if (e.target.id === 'concern-search') { ui.concernQuery = e.target.value; render(); const el = document.getElementById('concern-search'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
});

document.getElementById('role-select').addEventListener('change', e => {
  state.role = e.target.value;
  saveState();
  render();
  toast('Switched to ' + e.target.options[e.target.selectedIndex].text + '.');
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  if (form.id === 'quiz-form') {
    const q = state.quizzes.find(x => x.id === form.dataset.id);
    if (!q) return;
    const questions = state.quizQuestions[q.id] || [];
    let score = 0;
    questions.forEach((question, qi) => {
      const chosen = form.querySelector('input[name="q' + qi + '"]:checked');
      if (chosen && Number(chosen.value) === question.answer) score++;
    });
    const total = questions.length;
    const percent = Math.round(score / total * 100);
    q.attempts.unshift({ date: todayStr(), score, total, percent });
    addActivity('Practice attempt recorded for ' + q.title + ' (' + percent + '%)', 'quizzes');
    saveState(); closeModal(); render(); toast('Attempt saved: ' + score + '/' + total + ' (' + percent + '%).');
  }

  if (form.id === 'payment-form') {
    const b = state.balances.find(x => x.id === form.dataset.id);
    if (!b) return;
    const bal = balanceOf(b);
    const amount = Number(new FormData(form).get('amount'));
    const note = (new FormData(form).get('note') || '').trim();
    if (!Number.isFinite(amount) || amount <= 0) { toast('Enter an amount greater than zero.', 'error'); return; }
    if (amount > bal) { toast('Amount cannot exceed the outstanding balance.', 'error'); return; }
    b.paid = Math.round((b.paid + amount) * 100) / 100;
    b.history.unshift({ date: todayStr(), amount, note: note || (balanceOf(b) === 0 ? 'Full payment' : 'Partial payment') });
    addActivity('Payment of ' + money(amount) + ' recorded for ' + b.name, 'balances');
    saveState(); closeModal(); render(); toast(balanceOf(b) === 0 ? 'Balance fully paid.' : 'Partial payment credited.');
  }

  if (form.id === 'concern-form') {
    const data = new FormData(form);
    const title = (data.get('title') || '').trim();
    const description = (data.get('description') || '').trim();
    if (!title || !description) { toast('Please complete all fields.', 'error'); return; }
    state.concerns.unshift({ id: uid('cn'), title, category: data.get('category'), description, date: todayStr(), status: 'open' });
    addActivity('New concern filed: ' + title, 'concerns');
    saveState(); closeModal(); ui.view = 'concerns'; ui.concernStatus = 'all'; ui.concernQuery = ''; render(); toast('Concern filed with Open status.');
  }

  if (form.id === 'service-form') {
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const code = (data.get('code') || '').trim().toUpperCase();
    if (!name || !code) { toast('Please complete all fields.', 'error'); return; }
    state.services.push({ id: uid('sv'), name, code, description: (data.get('description') || '').trim(), hours: (data.get('hours') || '').trim(), queueNext: 1, icon: 'file' });
    addActivity('Campus service added: ' + name, 'services');
    saveState(); closeModal(); ui.view = 'services'; render(); toast('Service added and now available to students.');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); document.getElementById('sidebar').classList.remove('open'); document.querySelector('.sidebar-overlay').classList.remove('show'); }
});

/* ------------------------------------------------------------------- start */
// Fill static [data-icon] placeholders in the shell (sidebar, topbar, footer).
document.querySelectorAll('[data-icon]').forEach(el => {
  const name = el.getAttribute('data-icon');
  if (ICONS[name]) el.innerHTML = icon(name);
});
render();
