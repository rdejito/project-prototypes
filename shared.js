/* ClearPass prototype set — shared mini-framework. Load before data.js / app.js. */
(function (global) {
  'use strict';

  const ICONS = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    broom:'<path d="M14 4l6 6"/><path d="M15 9l-7.5 7.5-4-4L11 5z"/><path d="M4 21l5-5 4 4-5 1z"/>',
    ticket:'<path d="M4 7h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V8a1 1 0 0 1 1-1z"/><path d="M14 7v2M14 12v2M14 17v2"/>',
    quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2 1-1.2 1.8v.3"/><path d="M12 16.5h.01"/>',
    wallet:'<path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 7V6a2 2 0 0 1 2-2h12"/><path d="M16 12h4"/>',
    chat:'<path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9z"/>',
    reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    shield:'<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    close:'<path d="M18 6L6 18M6 6l12 12"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/>',
    heart:'<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    map:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/>',
    chevron:'<path d="M9 6l6 6-6 6"/>',
    star:'<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9L12 3z"/>',
    alert:'<path d="M12 3L2 20h20L12 3z"/><path d="M12 9v5M12 17h.01"/>',
    scan:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M4 12h16"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z"/><path d="M10 21h4"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M17 14a6 6 0 0 1 4 6"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    send:'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'
  };

  function icon(name) { return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.info) + '</svg>'; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
  function money(n) { return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function uid(p) { return p + '-' + Date.now().toString(36).slice(-5) + Math.floor(Math.random() * 90 + 10); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function stamp() { return today() + ' ' + new Date().toTimeString().slice(0, 5); }
  function addDays(dateStr, n) { const d = new Date(dateStr); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function daysSince(dateStr) { return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)); }
  function ageChip(dateStr) { const d = daysSince(dateStr); const cls = d <= 1 ? 'fresh' : d <= 3 ? 'warn' : 'late'; return '<span class="age-chip ' + cls + '">' + d + 'd old</span>'; }
  function badge(status) {
    const map = { pending:'pending', claimed:'done', done:'done', open:'open', resolved:'resolved', active:'done', published:'done', draft:'neutral', archived:'neutral', waiting:'pending', served:'resolved', new:'public', forwarded:'pending', high:'open', medium:'pending', low:'neutral' };
    const label = { pending:'Pending', claimed:'Claimed', done:'Done', open:'Open', resolved:'Resolved', active:'Active', published:'Published', draft:'Draft', archived:'Archived', waiting:'Waiting', served:'Served', new:'New', forwarded:'Forwarded', high:'High', medium:'Medium', low:'Low' };
    const s = String(status || '').toLowerCase();
    return '<span class="badge ' + (map[s] || 'neutral') + '">' + (label[s] || esc(status)) + '</span>';
  }
  function tabs(key, items, current) {
    return '<div class="tabs">' + items.map(t => '<button class="tab' + (current === t.value ? ' active' : '') + '" data-action="filter" data-key="' + key + '" data-value="' + t.value + '">' + esc(t.label) + (t.count != null ? ' (' + t.count + ')' : '') + '</button>').join('') + '</div>';
  }
  function card(title, subtitle, body, extraHead) {
    return '<section class="card"><div class="card-head"><div><h2>' + esc(title) + '</h2>' + (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div>' + (extraHead || '') + '</div><div class="card-body" style="padding:0">' + body + '</div></section>';
  }
  function empty(title, hint) { return '<div class="empty">' + icon('check') + '<strong>' + esc(title) + '</strong><span>' + esc(hint || '') + '</span></div>'; }
  function notice(kind, html) { return '<div class="notice ' + kind + '">' + icon(kind === 'warn' ? 'alert' : 'info') + '<span>' + html + '</span></div>'; }

  let cfg = null, state = null, storeKey = '', current = '', handlers = {}, submits = {}, inputs = {};
  const api = {};

  function load() {
    try { const raw = localStorage.getItem(storeKey); if (raw) { const p = JSON.parse(raw); if (p && typeof p === 'object') return p; } } catch (e) {}
    return JSON.parse(JSON.stringify(cfg.seed));
  }
  function save() { try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (e) {} }
  function reset() {
    const fresh = JSON.parse(JSON.stringify(cfg.seed));
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, fresh);
    save();
  }

  function buildShell() {
    const navHtml = cfg.nav.map((n, i) => {
      const prev = cfg.nav[i - 1];
      const group = (!prev || prev.group !== n.group) ? '<div class="sidebar-label nav-group">' + esc(n.group) + '</div>' : '';
      return group + '<button class="nav-link" data-action="nav" data-view="' + n.id + '" data-nav="' + n.id + '"><span class="nav-icon">' + icon(n.icon) + '</span><span>' + esc(n.label) + '</span><span class="nav-count" data-count="' + n.id + '">0</span></button>';
    }).join('');
    const roles = cfg.roles ? '<label class="role-picker">' + icon('shield') + '<select id="role-select" aria-label="Switch role">' + cfg.roles.map(r => '<option value="' + r + '">' + esc((cfg.roleLabels || {})[r] || r) + '</option>').join('') + '</select></label>' : '';
    const user = cfg.user || { name:'Demo User', meta:'Prototype account', initials:'DU' };
    document.getElementById('app-root').innerHTML =
      '<div class="app"><aside class="sidebar" id="sidebar">' +
      '<div class="brand"><span class="brand-mark ' + (cfg.accent || '') + '">' + icon(cfg.icon || 'grid') + '</span><span class="brand-text">' + esc(cfg.title) + '<small>' + esc(cfg.tagline || '') + '</small></span></div>' +
      '<div class="sidebar-label">WORKSPACE</div><nav class="nav" aria-label="Main navigation">' + navHtml + '</nav>' +
      '<div class="sidebar-foot"><div class="progress-mini"><div class="progress-mini-head"><span>' + esc(cfg.progressLabel || 'Records overview') + '</span><strong id="side-percent">0%</strong></div><div class="progress-track"><div class="progress-fill" id="side-progress"></div></div></div>' +
      '<button class="reset-btn" data-action="reset-demo">' + icon('reset') + ' Reset demo data</button><p class="prototype-note">Interactive prototype · v1.0</p></div></aside>' +
      '<div class="sidebar-overlay" data-action="close-sidebar"></div><div class="main">' +
      '<header class="topbar"><button class="icon-btn menu-btn" data-action="toggle-sidebar" aria-label="Toggle navigation">' + icon('menu') + '</button>' +
      '<a class="btn btn-outline btn-sm hub-return" href="../index.html" title="Back to prototype hub">' + icon('chevron') + '<span>Back to hub</span></a>' +
      '<div class="topbar-title"><h1 id="page-title"></h1><p id="page-subtitle"></p></div><div class="topbar-right">' + roles +
      '<div class="user-chip"><div class="avatar">' + esc(user.initials) + '</div><div class="user-meta"><strong>' + esc(user.name) + '</strong><span>' + esc(user.meta) + '</span></div></div></div></header>' +
      '<main class="content" id="content"></main></div></div>';
  }

  function attach() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const a = el.dataset.action;
      if (a === 'nav') return api.go(el.dataset.view);
      if (a === 'toggle-sidebar') { document.getElementById('sidebar').classList.toggle('open'); document.querySelector('.sidebar-overlay').classList.toggle('show'); return; }
      if (a === 'close-sidebar') { document.getElementById('sidebar').classList.remove('open'); document.querySelector('.sidebar-overlay').classList.remove('show'); return; }
      if (a === 'close-modal') return api.closeModal();
      if (a === 'reset-demo') {
        return api.modal('Reset demo data?', 'This restores the original seed data', '<p class="small muted">All changes made in this browser will be discarded.</p>', '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="reset-demo-confirm">' + icon('reset') + ' Reset data</button>');
      }
      if (a === 'reset-demo-confirm') { reset(); api.closeModal(); api.go(cfg.nav[0].id); api.toast('Demo data restored.'); return; }
      if (a === 'filter') { if (handlers[a]) handlers[a](el.dataset, el, e); return; }
      if (handlers[a]) handlers[a](el.dataset, el, e);
    });
    document.addEventListener('submit', e => {
      e.preventDefault();
      const fn = submits[e.target.id];
      if (fn) fn(e.target, e);
    });
    document.addEventListener('input', e => { if (inputs[e.target.id]) inputs[e.target.id](e.target.value, e.target); });
    document.addEventListener('change', e => {
      if (e.target.id !== 'role-select') return;
      state.role = e.target.value;
      save();
      if (cfg.onRoleChange) cfg.onRoleChange(e.target.value);
      api.refresh();
      api.toast('Switched to ' + e.target.options[e.target.selectedIndex].text + '.');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { api.closeModal(); document.getElementById('sidebar').classList.remove('open'); document.querySelector('.sidebar-overlay').classList.remove('show'); }
    });
  }

  api.init = function (config) {
    cfg = config;
    storeKey = 'cp_proto_' + config.slug;
    state = load();
    buildShell();
    attach();
    if (state.role && config.roles) document.getElementById('role-select').value = state.role;
    return api;
  };
  api.go = function (view) {
    const def = cfg.views[view];
    if (!def) return;
    current = view;
    document.getElementById('page-title').textContent = def.title;
    document.getElementById('page-subtitle').textContent = def.subtitle || '';
    document.getElementById('content').innerHTML = def.render();
    document.querySelectorAll('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === view));
    document.getElementById('sidebar').classList.remove('open');
    document.querySelector('.sidebar-overlay').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  api.refresh = function () { if (current) api.go(current); };
  api.current = function () { return current; };
  api.setCounts = function (obj) {
    document.querySelectorAll('[data-count]').forEach(el => { const n = obj[el.dataset.count] || 0; el.textContent = n; el.classList.toggle('zero', n === 0); });
  };
  api.setProgress = function (percent, label) {
    document.getElementById('side-percent').textContent = Math.round(percent) + '%';
    document.getElementById('side-progress').style.width = Math.round(percent) + '%';
    if (label) document.querySelector('.progress-mini-head span').textContent = label;
  };
  api.on = function (action, fn) { handlers[action] = fn; };
  api.onSubmit = function (formId, fn) { submits[formId] = fn; };
  api.onInput = function (id, fn) { inputs[id] = fn; };
  api.modal = function (title, subtitle, body, footer, wide) {
    const root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true"><div class="modal-head"><div><h3>' + esc(title) + '</h3>' + (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div><button class="icon-btn" data-action="close-modal" aria-label="Close">' + icon('close') + '</button></div><div class="modal-body">' + body + '</div>' + (footer ? '<div class="modal-foot">' + footer + '</div>' : '') + '</div></div>';
    const first = root.querySelector('input, textarea, select'); if (first) first.focus();
  };
  api.closeModal = function () { document.getElementById('modal-root').innerHTML = ''; };
  api.toast = function (message, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.innerHTML = icon(type === 'error' ? 'alert' : 'check') + '<span>' + esc(message) + '</span>';
    document.getElementById('toast-root').appendChild(el);
    setTimeout(() => el.remove(), 3400);
  };
  api.activity = function (text, module) {
    state.activity = state.activity || [];
    state.activity.unshift({ id: uid('ac'), text, module: module || '', time: 'Today, ' + new Date().toTimeString().slice(0, 5) });
    state.activity = state.activity.slice(0, 12);
  };
  api.log = api.activity;

  Object.assign(api, { icon, esc, money, uid, today, stamp, addDays, daysSince, ageChip, badge, tabs, card, empty, notice });
  Object.defineProperty(api, 'state', { get() { return state; }, set(v) { state = v; } });
  api.save = save;
  api.reset = reset;

  global.App = api;
})(window);
