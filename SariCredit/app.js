/* SariCredit prototype — sari-sari store utang ledger. */
(function () {
  let s; // assigned immediately after App.init(), before any handlers are registered
  const CUSTOMER_ME = 'Nora Reyes';
  const ui = { customerFilter: 'all', txFilter: 'all', paymentFilter: 'all' };

  const I18N = {
    en: {
      dashboard: 'Dashboard', customers: 'Customers', transactions: 'Utang entries', payments: 'Payments', reports: 'Monthly report', settings: 'Settings',
      balance: 'Balance', unpaid: 'Unpaid customers', addCustomer: 'Add customer', recordUtang: 'Record utang', recordPayment: 'Record payment',
      totalOutstanding: 'Total outstanding', welcome: 'Welcome', recentActivity: 'Recent activity', all: 'All', unpaidTab: 'Unpaid', paidTab: 'Paid',
      language: 'Language', offlineMode: 'Offline mode', offlineSync: 'Offline — changes will sync', monthlyReport: 'Monthly report', history: 'History',
      remind: 'Remind', edit: 'Edit', delete: 'Delete', date: 'Date', item: 'Item', amount: 'Amount', customer: 'Customer', note: 'Note', status: 'Status',
      totalUtang: 'Total utang', totalPayments: 'Total payments', collectionRate: 'Collection rate', noticeCenter: 'Notice center'
    },
    fil: {
      dashboard: 'Dashboard', customers: 'Mga Customer', transactions: 'Mga Utang', payments: 'Mga Bayad', reports: 'Buwanang Ulat', settings: 'Mga Setting',
      balance: 'Balanse', unpaid: 'Mga may utang', addCustomer: 'Magdagdag ng customer', recordUtang: 'Itala ang utang', recordPayment: 'Itala ang bayad',
      totalOutstanding: 'Kabuuang natitira', welcome: 'Maligayang pagdating', recentActivity: 'Kamakailang aktibidad', all: 'Lahat', unpaidTab: 'May utang', paidTab: 'Bayad na',
      language: 'Wika', offlineMode: 'Offline mode', offlineSync: 'Offline — isi-sync ang mga pagbabago', monthlyReport: 'Buwanang ulat', history: 'Kasaysayan',
      remind: 'Paalala', edit: 'I-edit', delete: 'Tanggalin', date: 'Petsa', item: 'Produkto', amount: 'Halaga', customer: 'Customer', note: 'Tala', status: 'Status',
      totalUtang: 'Kabuuang utang', totalPayments: 'Kabuuang bayad', collectionRate: 'Rate ng singil', noticeCenter: 'Sentro ng abiso'
    },
    ceb: {
      dashboard: 'Dashboard', customers: 'Mga Kustomer', transactions: 'Mga Utang', payments: 'Mga Bayad', reports: 'Tinuig-report', settings: 'Mga Setting',
      balance: 'Balanse', unpaid: 'Mga may utang', addCustomer: 'Magdugang og kustomer', recordUtang: 'Itala ang utang', recordPayment: 'Itala ang bayad',
      totalOutstanding: 'Kinatibuk-ang nahabilin', welcome: 'Malipayon', recentActivity: 'Bag-ong kalihokan', all: 'Tanang', unpaidTab: 'May utang', paidTab: 'Bayad na',
      language: 'Pinulongan', offlineMode: 'Offline mode', offlineSync: 'Offline — mga kausaban ma-sync', monthlyReport: 'Buwanong report', history: 'Kasaysayan',
      remind: 'Pahinumdom', edit: 'Usba', delete: 'Tanggalon', date: 'Petsa', item: 'Butang', amount: 'Halaga', customer: 'Kustomer', note: 'Nota', status: 'Status',
      totalUtang: 'Kinatibuk-ang utang', totalPayments: 'Kinatibuk-ang bayad', collectionRate: 'Rate sa koleksyon', noticeCenter: 'Sentro sa abiso'
    }
  };
  function t(key) { return (I18N[s.lang] && I18N[s.lang][key]) || I18N.en[key] || key; }
  function localizeTitle(key, sub) {
    const a = document.getElementById('page-title'); if (a) a.textContent = t(key);
    const b = document.getElementById('page-subtitle'); if (b && sub) b.textContent = sub;
  }
  const isOwner = () => s.role === 'owner';
  const isAdmin = () => s.role === 'admin';
  const isCustomer = () => s.role === 'customer';
  function offlineNotice() { return s.offline ? App.notice('warn', t('offlineSync')) : ''; }
  function findCustomer(id) { return (s.customers || []).find(c => c.id === id); }
  function myCustomer() { return findCustomer('cu-1') || (s.customers || []).find(c => c.name === CUSTOMER_ME) || null; }
  function balance(cid) {
    let b = 0;
    (s.transactions || []).forEach(x => {
      if (x.customerId !== cid) return;
      b += (x.type === 'payment' ? -1 : 1) * (Number(x.amount) || 0);
    });
    return Math.round(b * 100) / 100;
  }
  function totals() {
    let utang = 0, paid = 0;
    (s.transactions || []).forEach(x => { if (x.type === 'payment') paid += Number(x.amount) || 0; else utang += Number(x.amount) || 0; });
    return { utang: utang, paid: paid, outstanding: Math.round((utang - paid) * 100) / 100, rate: utang ? Math.round(paid / utang * 100) : 0 };
  }
  function unpaidCustomers() { return s.customers.filter(c => balance(c.id) > 0); }
  function typeBadge(type) { return '<span class="badge ' + (type === 'payment' ? 'done' : 'pending') + '">' + App.esc(type === 'payment' ? 'Payment' : 'Utang') + '</span>'; }
  function statCard(label, value, cls) { return '<div class="card stat-card ' + (cls || '') + '"><span>' + App.esc(label) + '</span><strong>' + App.esc(value) + '</strong></div>'; }
  function activityHtml() { return s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join(''); }
  function txRows(list, withCustomer) {
    return list.length ? list.map(x => '<tr><td>' + App.esc(x.date) + '</td>' + (withCustomer ? '<td>' + App.esc((findCustomer(x.customerId) || {}).name || 'Deleted customer') + '</td>' : '') + '<td>' + App.esc(x.item) + '</td><td>' + typeBadge(x.type) + '</td><td><strong>' + App.money(x.amount) + '</strong></td><td class="muted">' + App.esc(x.note || '—') + '</td></tr>').join('') : '<tr><td colspan="6" class="muted">No records yet.</td></tr>';
  }
  function customerHistory(cid) {
    const list = s.transactions.filter(x => x.customerId === cid).slice().reverse();
    return list.length ? list.map(x => '<div class="activity-item"><span class="activity-icon">' + App.icon(x.type === 'payment' ? 'check' : 'wallet') + '</span><div><p><strong>' + App.esc(x.item) + '</strong> · ' + App.money(x.amount) + '</p><small>' + App.esc(x.date) + ' · ' + App.esc(x.type) + (x.note ? ' · ' + App.esc(x.note) : '') + '</small></div></div>').join('') : App.empty('No history yet', 'Utang and payments will appear here.');
  }
  function noticeCenter() {
    const unread = s.reminders.filter(r => !r.read);
    const body = unread.length ? unread.map(r => '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>' + App.esc(r.text) + '</strong><span>' + App.esc(r.date) + '</span></div><button class="btn btn-outline btn-sm" data-action="read-reminder" data-id="' + r.id + '">Mark read</button></div>').join('') : App.empty('No new notices', 'Payment reminders have all been read.');
    return App.card(t('noticeCenter'), 'Unread payment reminders', body + (unread.length ? '<div style="padding:10px 20px"><button class="btn btn-outline btn-sm" data-action="read-all-reminders">Mark all read</button></div>' : ''));
  }

  function dashboard() {
    localizeTitle('dashboard', 'Ledger, balances, and notices at a glance');
    if (isCustomer()) {
      const c = myCustomer();
      if (!c) return offlineNotice() + App.card('Your account', 'No customer profile is linked to this demo account.', App.empty('Profile missing', 'Switch to Owner view to add a customer profile.'));
      const bal = balance(c.id);
      const mine = s.transactions.filter(x => x.customerId === c.id).slice().reverse();
      return offlineNotice() + '<div class="hero"><div class="hero-top"><div><h2>' + t('welcome') + ', ' + App.esc(c.name) + '</h2><p>Your personal utang record at Aling Nena\'s sari-sari store. Only your own data is shown here.</p></div><div class="hero-ring"><div class="ring" style="--ring:' + Math.min(100, bal ? 100 : 0) + '%"><div class="ring-inner">' + App.money(bal) + '</div></div><small>Your balance</small></div></div>' +
        '<div class="hero-stats"><div class="hero-stat"><strong>' + mine.filter(x => x.type === 'utang').length + '</strong><span>Utang entries</span></div><div class="hero-stat"><strong>' + mine.filter(x => x.type === 'payment').length + '</strong><span>Payments made</span></div><div class="hero-stat"><strong>' + App.esc(c.joined) + '</strong><span>Customer since</span></div></div></div>' +
        '<h2 class="section-title">' + App.icon('history') + ' ' + t('history') + '</h2>' + App.card('Your utang & payment history', 'Every entry recorded for your account', customerHistory(c.id));
    }
    const tt = totals();
    if (isAdmin()) {
      return offlineNotice() + '<div class="stat-grid">' + statCard('Accounts', s.accounts.length, 'accent') + statCard(t('totalOutstanding'), App.money(tt.outstanding), 'warn') + statCard('Last backup', s.lastBackup || 'Never', 'good') + '</div>' +
        '<h2 class="section-title">' + App.icon('shield') + ' Administration</h2>' + App.card('System overview', 'Accounts, backups, and store ledger health', '<div class="detail-grid"><div class="detail"><small>Store customers</small><strong>' + s.customers.length + '</strong></div><div class="detail"><small>Ledger entries</small><strong>' + s.transactions.length + '</strong></div><div class="detail"><small>Backup status</small><strong>' + App.esc(s.lastBackup || 'No backup yet') + '</strong></div><div class="detail"><small>Offline mode</small><strong>' + (s.offline ? 'On' : 'Off') + '</strong></div></div>') +
        '<div style="margin-top:18px">' + noticeCenter() + '</div>' + App.card('Recent activity', t('recentActivity'), activityHtml());
    }
    const unpaid = unpaidCustomers();
    const focus = unpaid.length ? unpaid.map(c => '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>' + App.esc(c.name) + '</strong><span>' + App.esc(c.phone) + ' · ' + t('unpaid') + '</span></div><strong>' + App.money(balance(c.id)) + '</strong><button class="btn btn-outline btn-sm" data-action="remind" data-id="' + c.id + '">' + App.icon('bell') + ' ' + t('remind') + '</button></div>').join('') : App.empty('All balances settled', 'No customers currently have unpaid utang.');
    return offlineNotice() + '<div class="hero"><div class="hero-top"><div><h2>Aling Nena\'s Sari-Sari Store</h2><p>Keep the utang notebook digital: record entries fast, track balances, and remind customers.</p></div><div class="hero-ring"><div class="ring" style="--ring:' + tt.rate + '%"><div class="ring-inner">' + tt.rate + '%</div></div><small>Collected</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + App.money(tt.outstanding) + '</strong><span>' + t('totalOutstanding') + '</span></div><div class="hero-stat"><strong>' + App.money(tt.utang) + '</strong><span>' + t('totalUtang') + '</span></div><div class="hero-stat"><strong>' + App.money(tt.paid) + '</strong><span>' + t('totalPayments') + '</span></div></div></div>' +
      '<div class="stat-grid" style="margin-top:18px">' + statCard('Customers', s.customers.length, 'accent') + statCard(t('unpaid'), unpaid.length, 'warn') + statCard('Ledger entries', s.transactions.length, 'good') + '</div>' +
      '<h2 class="section-title">' + App.icon('bell') + ' ' + t('unpaid') + '</h2>' + App.card('Customers to follow up', 'Balances automatically computed from utang and payments', focus) +
      '<div class="dash-bottom" style="margin-top:18px">' + noticeCenter() + App.card(t('recentActivity'), 'Latest ledger records', activityHtml()) + '</div>';
  }

  function customers() {
    localizeTitle('customers', 'Profiles, balances, and customer history');
    if (isCustomer()) {
      const c = myCustomer();
      if (!c) return offlineNotice() + App.card(t('customers'), 'No profile linked.', App.empty('Profile missing', 'Switch to Owner view.'));
      return offlineNotice() + App.card('Your profile', 'This view is restricted to your own record',
        '<div class="kv" style="padding:20px"><dt>Name</dt><dd>' + App.esc(c.name) + '</dd><dt>Phone</dt><dd>' + App.esc(c.phone) + '</dd><dt>Address</dt><dd>' + App.esc(c.address) + '</dd><dt>' + t('balance') + '</dt><dd>' + App.money(balance(c.id)) + '</dd></div>') +
        '<div style="margin-top:18px">' + App.card(t('history'), 'Your utang and payment entries', customerHistory(c.id)) + '</div>';
    }
    let list = s.customers.slice();
    if (ui.customerFilter === 'unpaid') list = list.filter(c => balance(c.id) > 0);
    if (ui.customerFilter === 'paid') list = list.filter(c => balance(c.id) <= 0);
    const rows = list.length ? list.map(c => {
      const bal = balance(c.id);
      return '<div class="list-row"><span class="activity-icon">' + App.icon('users') + '</span><div class="list-main"><strong>' + App.esc(c.name) + '</strong><div class="meta"><span>' + App.icon('user') + App.esc(c.phone) + '</span><span>' + App.icon('map') + App.esc(c.address) + '</span><span>' + App.icon('calendar') + 'Since ' + App.esc(c.joined) + '</span></div></div>' +
        '<div class="balance-figure"><strong>' + App.money(bal) + '</strong><span>' + (bal > 0 ? 'Unpaid' : 'Paid in full') + '</span></div>' +
        (isOwner() ? '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="view-history" data-id="' + c.id + '">' + App.icon('history') + ' History</button>' +
          (bal > 0 ? '<button class="btn btn-outline btn-sm" data-action="remind" data-id="' + c.id + '">' + App.icon('bell') + ' ' + t('remind') + '</button>' : '') +
          '<button class="btn btn-primary btn-sm" data-action="open-utang" data-id="' + c.id + '">+ ' + t('recordUtang') + '</button>' +
          '<button class="btn btn-success btn-sm" data-action="open-payment" data-id="' + c.id + '">' + App.icon('check') + ' ' + t('recordPayment') + '</button>' +
          '<button class="btn btn-outline btn-sm" data-action="edit-customer" data-id="' + c.id + '">' + App.icon('edit') + '</button>' +
          '<button class="btn btn-danger-ghost btn-sm" data-action="delete-customer" data-id="' + c.id + '">' + App.icon('trash') + '</button></div>' : '') + '</div>';
    }).join('') : App.empty('No customers found', 'Adjust the filter or add a new profile.');
    return offlineNotice() + '<div class="toolbar">' + App.tabs('customerFilter', [
      { value: 'all', label: t('all'), count: s.customers.length },
      { value: 'unpaid', label: t('unpaidTab'), count: unpaidCustomers().length },
      { value: 'paid', label: t('paidTab'), count: s.customers.filter(c => balance(c.id) <= 0).length }
    ], ui.customerFilter) + (isOwner() ? '<button class="btn btn-primary btn-sm" data-action="add-customer">' + App.icon('plus') + ' ' + t('addCustomer') + '</button>' : '') + '</div>' +
      App.card(t('customers'), 'Balances are computed automatically from all utang and payment entries', rows);
  }

  function transactions() {
    localizeTitle('transactions', 'Every item bought on credit');
    let list = s.transactions.filter(x => x.type === 'utang');
    if (isCustomer()) { const c = myCustomer(); list = list.filter(x => x.customerId === (c && c.id)); }
    if (ui.txFilter === 'month') { const m = App.today().slice(0, 7); list = list.filter(x => x.date.slice(0, 7) === m); }
    const total = list.reduce((n, x) => n + (Number(x.amount) || 0), 0);
    return offlineNotice() + '<div class="toolbar">' + App.tabs('txFilter', [{ value: 'all', label: t('all') }, { value: 'month', label: 'This month' }], ui.txFilter) +
      (isOwner() ? '<button class="btn btn-primary btn-sm" data-action="open-utang">' + App.icon('plus') + ' ' + t('recordUtang') + '</button>' : '') + '</div>' +
      '<div class="stat-grid">' + statCard('Entries shown', list.length, 'accent') + statCard('Total utang shown', App.money(total), 'warn') + '</div>' +
      App.card(t('transactions'), 'Recorded item, amount, and date for each credit purchase', '<table class="table"><thead><tr><th>' + t('date') + '</th>' + (isCustomer() ? '' : '<th>' + t('customer') + '</th>') + '<th>' + t('item') + '</th><th>Amount</th><th>' + t('note') + '</th></tr></thead><tbody>' + txRows(list, !isCustomer()) + '</tbody></table>');
  }

  function payments() {
    localizeTitle('payments', 'Full and partial payments with live balances');
    let list = s.transactions.filter(x => x.type === 'payment');
    if (isCustomer()) { const c = myCustomer(); list = list.filter(x => x.customerId === (c && c.id)); }
    if (ui.paymentFilter === 'month') { const m = App.today().slice(0, 7); list = list.filter(x => x.date.slice(0, 7) === m); }
    const total = list.reduce((n, x) => n + (Number(x.amount) || 0), 0);
    return offlineNotice() + '<div class="toolbar">' + App.tabs('paymentFilter', [{ value: 'all', label: t('all') }, { value: 'month', label: 'This month' }], ui.paymentFilter) +
      (isOwner() ? '<button class="btn btn-success btn-sm" data-action="open-payment">' + App.icon('plus') + ' ' + t('recordPayment') + '</button>' : '') + '</div>' +
      '<div class="stat-grid">' + statCard('Payments shown', list.length, 'accent') + statCard('Total collected shown', App.money(total), 'good') + '</div>' +
      App.card(t('payments'), 'Partial payments reduce the outstanding balance immediately', '<table class="table"><thead><tr><th>' + t('date') + '</th>' + (isCustomer() ? '' : '<th>' + t('customer') + '</th>') + '<th>Type</th><th>' + t('amount') + '</th><th>' + t('note') + '</th></tr></thead><tbody>' + txRows(list, !isCustomer()) + '</tbody></table>');
  }

  function reports() {
    localizeTitle('reports', 'Monthly utang, payments, and outstanding totals');
    let list = s.transactions.slice();
    if (isCustomer()) { const c = myCustomer(); list = list.filter(x => x.customerId === (c && c.id)); }
    const months = [];
    list.forEach(x => { const m = x.date.slice(0, 7); if (months.indexOf(m) === -1) months.push(m); });
    months.sort().reverse();
    const label = m => { const d = new Date(m + '-01'); return d.toLocaleString('en-PH', { month: 'long', year: 'numeric' }); };
    const rows = months.length ? months.map(m => {
      const inMonth = list.filter(x => x.date.slice(0, 7) === m);
      const u = inMonth.filter(x => x.type === 'utang').reduce((n, x) => n + (Number(x.amount) || 0), 0);
      const p = inMonth.filter(x => x.type === 'payment').reduce((n, x) => n + (Number(x.amount) || 0), 0);
      return '<tr><td><strong>' + App.esc(label(m)) + '</strong></td><td>' + App.money(u) + '</td><td>' + App.money(p) + '</td><td>' + App.money(u - p) + '</td><td class="muted">' + inMonth.length + ' entries</td></tr>';
    }).join('') : '<tr><td colspan="5" class="muted">No transactions to report.</td></tr>';
    const tt = totals();
    return offlineNotice() + '<div class="stat-grid">' + statCard(t('totalUtang'), App.money(isCustomer() ? list.filter(x => x.type === 'utang').reduce((n, x) => n + Number(x.amount), 0) : tt.utang), 'accent') +
      statCard(t('totalPayments'), App.money(isCustomer() ? list.filter(x => x.type === 'payment').reduce((n, x) => n + Number(x.amount), 0) : tt.paid), 'good') +
      statCard(t('totalOutstanding'), App.money(isCustomer() ? (myCustomer() ? balance(myCustomer().id) : 0) : tt.outstanding), 'warn') + '</div>' +
      App.card(t('monthlyReport'), 'Grouped by transaction date; outstanding is utang minus payments', '<table class="table"><thead><tr><th>Month</th><th>' + t('totalUtang') + '</th><th>' + t('totalPayments') + '</th><th>Net outstanding</th><th>Entries</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  function settings() {
    localizeTitle('settings', 'Language, offline mode, accounts, and backups');
    const langs = [{ code: 'en', label: 'English' }, { code: 'fil', label: 'Filipino' }, { code: 'ceb', label: 'Cebuano' }];
    const langBtns = langs.map(l => '<button class="btn ' + (s.lang === l.code ? 'btn-primary' : 'btn-outline') + ' btn-sm" data-action="set-lang" data-value="' + l.code + '">' + l.label + '</button>').join(' ');
    const accountRows = isAdmin() ? s.accounts.map(a => '<div class="list-row"><span class="activity-icon">' + App.icon('user') + '</span><div class="list-main"><strong>' + App.esc(a.name) + '</strong><div class="meta"><span>@' + App.esc(a.username) + '</span><span>' + App.esc(a.role) + '</span></div></div>' + (a.status === 'active' ? App.badge('active') : App.badge('archived')) +
      '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="toggle-account" data-id="' + a.id + '">' + (a.status === 'active' ? 'Deactivate' : 'Activate') + '</button></div></div>').join('') : '';
    return offlineNotice() +
      App.card(t('language'), 'Key interface labels switch immediately', '<div class="field"><label>Select language</label><div class="row wrap">' + langBtns + '</div><p class="field-hint">Currently: ' + App.esc((langs.find(l => l.code === s.lang) || langs[0]).label) + '</p></div>') +
      '<div style="margin-top:18px">' + App.card(t('offlineMode'), 'Simulate working without a connection', '<div class="row spread"><div><strong>' + (s.offline ? 'Offline mode is ON' : 'Offline mode is OFF') + '</strong><p class="small muted">' + App.esc(t('offlineSync')) + '</p></div><button class="btn ' + (s.offline ? 'btn-warning' : 'btn-outline') + '" data-action="toggle-offline">' + (s.offline ? 'Go back online' : 'Switch to offline') + '</button></div>') + '</div>' +
      (isAdmin() ? '<div style="margin-top:18px">' + App.card('Admin — accounts & backup', 'Manage access and create a simulated data backup',
        '<div class="row spread" style="margin-bottom:16px"><div><strong>Last backup</strong><p class="small muted">' + App.esc(s.lastBackup || 'No backup has been created yet.') + '</p></div><button class="btn btn-primary" data-action="backup">' + App.icon('shield') + ' Backup now</button></div>' + (accountRows || App.empty('No accounts', 'Seed accounts will appear here.'))) + '</div>' : '') +
      (isCustomer() ? App.notice('info', 'Customers can view language and offline settings. Account and backup controls are limited to the Admin view.') : '');
  }

  App.init({
    slug: 'saricredit', title: 'SariCredit', tagline: 'Digital Utang Ledger', icon: 'wallet', accent: 'rose',
    roles: ['owner', 'customer', 'admin'], roleLabels: { owner: 'Store owner', customer: 'Customer view', admin: 'Admin view' },
    user: { name: 'Aling Nena', meta: 'Sari-sari store · demo account', initials: 'AN' },
    progressLabel: 'Balance collected', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'WORKSPACE' },
      { id: 'customers', label: 'Customers', icon: 'users', group: 'LEDGER' },
      { id: 'transactions', label: 'Utang entries', icon: 'wallet', group: 'LEDGER' },
      { id: 'payments', label: 'Payments', icon: 'check', group: 'LEDGER' },
      { id: 'reports', label: 'Reports', icon: 'chart', group: 'LEDGER' },
      { id: 'settings', label: 'Settings', icon: 'shield', group: 'SYSTEM' }
    ],
    views: {
      dashboard: { title: 'Dashboard', subtitle: 'Balances and reminders', render: dashboard },
      customers: { title: 'Customers', subtitle: 'Profiles and unpaid balances', render: customers },
      transactions: { title: 'Utang entries', subtitle: 'Recorded credit purchases', render: transactions },
      payments: { title: 'Payments', subtitle: 'Full and partial payments', render: payments },
      reports: { title: 'Reports', subtitle: 'Monthly totals and outstanding credit', render: reports },
      settings: { title: 'Settings', subtitle: 'Language, offline mode, and admin controls', render: settings }
    }
  });

  s = App.state; // must happen after App.init()
  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });

  App.on('set-lang', d => {
    if (['en', 'fil', 'ceb'].indexOf(d.value) === -1) return;
    s.lang = d.value;
    App.save(); App.refresh(); App.toast('Language updated.');
  });
  App.on('toggle-offline', () => {
    s.offline = !s.offline;
    App.save(); App.refresh();
    App.toast(s.offline ? 'Offline mode on — changes will sync.' : 'Back online — changes synced.');
  });
  App.on('backup', () => {
    if (!isAdmin()) return;
    s.lastBackup = App.stamp();
    App.activity('Data backup created', 'settings');
    App.save(); App.refresh(); App.toast('Backup stamped at ' + s.lastBackup + '.');
  });
  App.on('toggle-account', d => {
    if (!isAdmin()) return;
    const a = (s.accounts || []).find(x => x.id === d.id);
    if (!a) return;
    a.status = a.status === 'active' ? 'inactive' : 'active';
    App.activity('Account ' + a.name + ' set to ' + a.status, 'settings');
    App.save(); App.refresh(); App.toast('Account ' + a.status + '.');
  });

  function openCustomerForm(c) {
    const edit = !!c;
    App.modal(edit ? 'Edit customer' : t('addCustomer'), 'Store profile details',
      '<form id="customer-form"><input type="hidden" name="cid" value="' + (edit ? App.esc(c.id) : '') + '" />' +
      '<div class="field"><label for="cf-name">Name</label><input class="input" id="cf-name" name="name" value="' + (edit ? App.esc(c.name) : '') + '" required /></div>' +
      '<div class="field"><label for="cf-phone">Mobile number</label><input class="input" id="cf-phone" name="phone" value="' + (edit ? App.esc(c.phone) : '') + '" /></div>' +
      '<div class="field"><label for="cf-address">Address</label><input class="input" id="cf-address" name="address" value="' + (edit ? App.esc(c.address) : '') + '" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-customer">' + App.icon('check') + ' Save</button>');
  }
  App.on('add-customer', () => { if (isOwner()) openCustomerForm(null); });
  App.on('edit-customer', d => { if (isOwner()) { const c = findCustomer(d.id); if (c) openCustomerForm(c); } });
  App.on('save-customer', () => {
    if (!isOwner()) return;
    const f = document.getElementById('customer-form'); if (!f) return;
    const d = new FormData(f);
    const name = String(d.get('name') || '').trim();
    if (!name) { App.toast('Customer name is required.', 'error'); return; }
    const existing = findCustomer(String(d.get('cid') || ''));
    if (existing) {
      existing.name = name; existing.phone = String(d.get('phone') || ''); existing.address = String(d.get('address') || '');
      App.activity('Customer updated: ' + name, 'customers');
      App.toast('Customer profile updated.');
    } else {
      s.customers.push({ id: App.uid('cu'), name: name, phone: String(d.get('phone') || ''), address: String(d.get('address') || ''), joined: App.today() });
      App.activity('Customer added: ' + name, 'customers');
      App.toast('Customer added.');
    }
    App.save(); App.closeModal(); App.refresh();
  });
  App.on('delete-customer', d => {
    if (!isOwner()) return;
    const c = findCustomer(d.id); if (!c) return;
    App.modal('Delete customer?', c.name + ' and their ledger entries',
      '<p class="small muted">This removes the profile, all utang/payment entries, and reminders for this customer. This cannot be undone in the demo.</p>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-danger-ghost" data-action="confirm-delete-customer" data-id="' + c.id + '">' + App.icon('trash') + ' Delete customer</button>');
  });
  App.on('confirm-delete-customer', d => {
    if (!isOwner()) return;
    const c = findCustomer(d.id); if (!c) return;
    s.customers = s.customers.filter(x => x.id !== c.id);
    s.transactions = s.transactions.filter(x => x.customerId !== c.id);
    s.reminders = s.reminders.filter(x => x.customerId !== c.id);
    App.activity('Customer deleted: ' + c.name, 'customers');
    App.save(); App.closeModal(); App.refresh(); App.toast('Customer and ledger entries deleted.');
  });

  function openUtang(cid) {
    if (!isOwner()) return;
    const options = s.customers.map(c => '<option value="' + c.id + '"' + (cid === c.id ? ' selected' : '') + '>' + App.esc(c.name) + '</option>').join('');
    App.modal(t('recordUtang'), 'Add an item bought on credit',
      '<form id="utang-form"><div class="field"><label for="ut-customer">Customer</label><select class="select" id="ut-customer" name="customerId">' + options + '</select></div>' +
      '<div class="field"><label for="ut-item">Item</label><input class="input" id="ut-item" name="item" required placeholder="Rice 3kg" /></div>' +
      '<div class="detail-grid"><div class="field"><label for="ut-amount">Amount (₱)</label><input class="input" type="number" id="ut-amount" name="amount" min="0.01" step="0.01" required /></div>' +
      '<div class="field"><label for="ut-date">Date</label><input class="input" type="date" id="ut-date" name="date" value="' + App.today() + '" required /></div></div>' +
      '<div class="field"><label for="ut-note">Note (optional)</label><input class="input" id="ut-note" name="note" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-utang">' + App.icon('plus') + ' Record utang</button>');
  }
  App.on('open-utang', d => openUtang(d.id));
  App.on('save-utang', () => {
    if (!isOwner()) return;
    const f = document.getElementById('utang-form'); if (!f) return;
    const d = new FormData(f);
    const c = findCustomer(String(d.get('customerId') || ''));
    const amt = Number(d.get('amount'));
    if (!c || !(amt > 0)) { App.toast('Choose a customer and enter a valid amount.', 'error'); return; }
    s.transactions.unshift({ id: App.uid('tx'), customerId: c.id, type: 'utang', item: String(d.get('item') || 'Item'), amount: amt, date: String(d.get('date') || App.today()), note: String(d.get('note') || '') });
    App.activity('Utang recorded: ' + d.get('item') + ' — ' + App.money(amt), 'transactions');
    App.save(); App.closeModal(); App.refresh();
    App.toast('Utang recorded for ' + c.name + '. Balance: ' + App.money(balance(c.id)));
  });

  function openPayment(cid) {
    if (!isOwner()) return;
    const options = s.customers.map(c => '<option value="' + c.id + '"' + (cid === c.id ? ' selected' : '') + '>' + App.esc(c.name) + ' — ' + App.money(balance(c.id)) + '</option>').join('');
    App.modal(t('recordPayment'), 'Full or partial payment',
      '<form id="payment-form"><div class="field"><label for="pay-customer">Customer</label><select class="select" id="pay-customer" name="customerId">' + options + '</select></div>' +
      '<div class="field"><label for="pay-amount">Amount paid (₱)</label><input class="input" type="number" id="pay-amount" name="amount" min="0.01" step="0.01" required />' +
      '<div class="amount-chips"><button type="button" class="chip" data-action="fill-amount" data-value="full">Full balance</button><button type="button" class="chip" data-action="fill-amount" data-value="half">Half</button><button type="button" class="chip" data-action="fill-amount" data-value="100">₱100</button><button type="button" class="chip" data-action="fill-amount" data-value="500">₱500</button></div></div>' +
      '<div class="detail-grid"><div class="field"><label for="pay-date">Date</label><input class="input" type="date" id="pay-date" name="date" value="' + App.today() + '" required /></div>' +
      '<div class="field"><label for="pay-note">Note</label><input class="input" id="pay-note" name="note" placeholder="Cash / GCash" /></div></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="save-payment">' + App.icon('check') + ' Record payment</button>');
  }
  App.on('open-payment', d => openPayment(d.id));
  App.on('fill-amount', d => {
    const sel = document.getElementById('pay-customer');
    const c = findCustomer(sel ? sel.value : '');
    const bal = c ? balance(c.id) : 0;
    const el = document.getElementById('pay-amount');
    if (!el) return;
    if (d.value === 'full') el.value = String(Math.round(bal * 100) / 100);
    else if (d.value === 'half') el.value = String(Math.round(bal * 50) / 100);
    else el.value = String(Number(d.value) || 0);
  });
  App.on('save-payment', () => {
    if (!isOwner()) return;
    const f = document.getElementById('payment-form'); if (!f) return;
    const d = new FormData(f);
    const c = findCustomer(String(d.get('customerId') || ''));
    const amt = Number(d.get('amount'));
    if (!c || !(amt > 0)) { App.toast('Choose a customer and enter a valid amount.', 'error'); return; }
    const before = balance(c.id);
    s.transactions.unshift({ id: App.uid('tx'), customerId: c.id, type: 'payment', item: amt >= before ? 'Full payment' : 'Partial payment', amount: amt, date: String(d.get('date') || App.today()), note: String(d.get('note') || '') });
    App.activity('Payment recorded: ' + App.money(amt) + ' from ' + c.name, 'payments');
    App.save(); App.closeModal(); App.refresh();
    App.toast('Payment recorded. Remaining balance: ' + App.money(balance(c.id)));
  });

  App.on('remind', d => {
    if (!isOwner()) return;
    const c = findCustomer(d.id); if (!c) return;
    const bal = balance(c.id);
    if (bal <= 0) { App.toast('This customer has no unpaid balance.', 'error'); return; }
    s.reminders.unshift({ id: App.uid('rm'), customerId: c.id, text: 'Reminder sent to ' + c.name + ' for ' + App.money(bal) + ' balance', date: App.stamp(), read: false });
    App.activity('Payment reminder sent to ' + c.name, 'reminders');
    App.save(); App.refresh(); App.toast('Reminder queued for ' + c.name + '.');
  });
  App.on('read-reminder', d => {
    const r = (s.reminders || []).find(x => x.id === d.id); if (!r) return;
    r.read = true; App.save(); App.refresh(); App.toast('Reminder marked as read.');
  });
  App.on('read-all-reminders', () => {
    s.reminders.forEach(r => { r.read = true; });
    App.save(); App.refresh(); App.toast('All reminders marked as read.');
  });
  App.on('view-history', d => {
    const c = findCustomer(d.id); if (!c) return;
    App.modal('Customer history', c.name + ' · current balance ' + App.money(balance(c.id)),
      '<div class="detail-grid"><div class="detail"><small>Total utang</small><strong>' + App.money(s.transactions.filter(x => x.customerId === c.id && x.type === 'utang').reduce((n, x) => n + Number(x.amount), 0)) + '</strong></div><div class="detail"><small>Total payments</small><strong>' + App.money(s.transactions.filter(x => x.customerId === c.id && x.type === 'payment').reduce((n, x) => n + Number(x.amount), 0)) + '</strong></div></div><div style="margin-top:14px">' + customerHistory(c.id) + '</div>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });

  function updateCounts() {
    App.setCounts({
      dashboard: s.reminders.filter(r => !r.read).length,
      customers: unpaidCustomers().length,
      transactions: s.transactions.filter(x => x.type === 'utang').length,
      payments: s.transactions.filter(x => x.type === 'payment').length,
      reports: 0, settings: isAdmin() ? 1 : 0
    });
    App.setProgress(totals().rate, 'Balance collected');
  }
  updateCounts();
  App.go('dashboard');
})();
