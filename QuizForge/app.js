/* QuizForge prototype — quiz studio, timed attempts, auto-grading, and analytics. */
(function () {
  let s; // assigned immediately after App.init(), before any handlers are registered
  const ME = 'Juan Dela Cruz';
  const ui = { browse: 'all', takeQuiz: null, takeIndex: 0, results: 'all', studio: 'all', analytics: 'all', search: '', timer: null };

  function canCreate() { return s.role === 'creator' || s.role === 'admin'; }
  function quiz(id) { return (s.quizzes || []).find(q => q.id === id); }
  function attemptsFor(qid, user) {
    return (s.attempts || []).filter(a => a.quizId === qid && (!user || a.user === user) && a.status === 'submitted');
  }
  function canBrowse(q) {
    return !!q && q.status === 'published' && (q.visibility === 'public' || canCreate() || (q.allowed || []).indexOf(ME) !== -1);
  }
  function dkey(qid) { return ME + '|' + qid; }
  function draft(qid) { s.drafts = s.drafts || {}; return s.drafts[dkey(qid)] || null; }
  function fmtTime(sec) {
    const m = Math.floor(sec / 60), ss = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }
  function remaining(a) { return Math.max(0, Math.ceil(((a.endsAt || Date.now()) - Date.now()) / 1000)); }
  function stateBadge(st) {
    if (st === 'in_progress') return '<span class="badge pending">In progress</span>';
    return App.badge(st);
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function statCard(label, value, cls) {
    return '<div class="card stat-card ' + (cls || '') + '"><span>' + App.esc(label) + '</span><strong>' + App.esc(value) + '</strong></div>';
  }
  function bestAttempt(qid) {
    const list = attemptsFor(qid, ME);
    return list.length ? list.reduce((best, a) => (a.percent > best.percent ? a : best), list[0]) : null;
  }
  function currentAttempt() {
    return (s.attempts || []).find(a => a.quizId === ui.takeQuiz && a.user === ME && a.status === 'in_progress') || null;
  }
  function orderedQuestions(q, a) {
    if (!q) return [];
    if (q.randomization && a && a.order && a.order.length) {
      return a.order.map(id => (q.questions || []).find(x => x.id === id)).filter(Boolean);
    }
    return q.questions || [];
  }

  function dashboard() {
    const published = s.quizzes.filter(q => q.status === 'published').length;
    const mine = s.attempts.filter(a => a.user === ME && a.status === 'submitted');
    const avg = mine.length ? Math.round(mine.reduce((n, a) => n + (a.percent || 0), 0) / mine.length) : 0;
    const drafts = Object.keys(s.drafts || {}).length;
    const available = s.quizzes.filter(canBrowse).slice(0, 4);
    const focus = available.length ? available.map(q => '<div class="focus-item"><span class="focus-dot"></span><div class="txt"><strong>' + App.esc(q.title) + '</strong><span>' + (q.questions || []).length + ' questions · ' + App.esc(q.duration) + ' min · ' + App.esc(q.visibility) + '</span></div><button class="btn btn-primary btn-sm" data-action="start-attempt" data-id="' + q.id + '">' + App.icon('arrow') + ' Take</button></div>').join('') : App.empty('No quizzes available', 'Published quizzes will appear here.');
    const act = s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
    return '<div class="hero"><div class="hero-top"><div><h2>QuizForge workspace</h2><p>Create, take, and evaluate quizzes in one place. Answers are saved as you go.</p></div><div class="hero-ring"><div class="ring" style="--ring:' + avg + '%"><div class="ring-inner">' + avg + '%</div></div><small>Your average</small></div></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + published + '</strong><span>Published quizzes</span></div><div class="hero-stat"><strong>' + mine.length + '</strong><span>Your attempts</span></div><div class="hero-stat"><strong>' + drafts + '</strong><span>Saved drafts</span></div></div></div>' +
      '<div class="stat-grid" style="margin-top:18px">' + statCard('All quizzes', s.quizzes.length, 'accent') + statCard('Question types', '3', '') + statCard('Pass rate', (mine.length ? Math.round(mine.filter(a => a.passed).length / mine.length * 100) : 0) + '%', 'good') + '</div>' +
      '<h2 class="section-title">' + App.icon('quiz') + ' Available for you</h2>' + App.card('Ready to take', 'Public quizzes and private quizzes you are authorized to access', focus) +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Creator snapshot', 'Quizzes by status', '<div class="focus-item"><div class="txt"><strong>Published</strong><span>Live and visible to participants</span></div>' + App.badge('published') + '</div><div class="focus-item"><div class="txt"><strong>Drafts</strong><span>Still being prepared</span></div>' + App.badge('draft') + '</div><div class="focus-item"><div class="txt"><strong>Archived</strong><span>Retained for records</span></div>' + App.badge('archived') + '</div>') + App.card('Recent activity', 'Latest records', act) + '</div>';
  }

  function browse() {
    let list = s.quizzes.filter(q => q.status === 'published');
    if (ui.browse === 'public') list = list.filter(q => q.visibility === 'public');
    if (ui.browse === 'private') list = list.filter(q => q.visibility === 'private' && ((q.allowed || []).indexOf(ME) !== -1 || canCreate()));
    if (ui.browse === 'taken') list = list.filter(q => attemptsFor(q.id, ME).length);
    if (ui.search) {
      const k = ui.search.toLowerCase();
      list = list.filter(q => (q.title + ' ' + q.description).toLowerCase().indexOf(k) !== -1);
    }
    const cards = list.length ? list.map(q => {
      const best = bestAttempt(q.id);
      return '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3><p class="small muted">' + App.esc(q.description) + '</p></div>' +
        '<div class="row wrap">' + App.badge(q.visibility) + stateBadge(q.status) + '</div></div>' +
        '<div class="quiz-meta"><span>' + App.icon('file') + (q.questions || []).length + ' questions</span><span>' + App.icon('clock') + App.esc(q.duration) + ' min</span><span>' + App.icon('star') + 'Pass ' + App.esc(q.passingScore) + '%</span><span>' + App.icon('user') + App.esc(q.creator) + '</span></div>' +
        '<div class="row spread"><span class="score-pill ' + (best ? '' : 'none') + '">' + (best ? 'Best: ' + best.percent + '%' : 'No attempts yet') + '</span>' +
        '<div class="row"><button class="btn btn-outline btn-sm" data-action="quiz-details" data-id="' + q.id + '">Details</button><button class="btn btn-primary btn-sm" data-action="start-attempt" data-id="' + q.id + '">' + App.icon('arrow') + (best ? ' Retake' : ' Start') + '</button></div></div></article>';
    }).join('') : App.empty('No quizzes found', 'Try another filter or search term.');
    return '<div class="toolbar"><div class="search-box">' + App.icon('search') + '<input class="input" id="browse-search" placeholder="Search quizzes..." value="' + App.esc(ui.search) + '" /></div>' +
      App.tabs('browse', [{ value: 'all', label: 'All', count: s.quizzes.filter(q => q.status === 'published' && (q.visibility === 'public' || canCreate() || (q.allowed || []).indexOf(ME) !== -1)).length }, { value: 'public', label: 'Public' }, { value: 'private', label: 'Authorized private' }, { value: 'taken', label: 'Taken' }], ui.browse) + '</div>' +
      App.notice('info', 'Private quizzes appear only when you are on the authorized list (switch roles to simulate another user).') +
      '<div class="quiz-grid">' + cards + '</div>';
  }

  function take() {
    const a = currentAttempt();
    if (!a) {
      const list = s.quizzes.filter(canBrowse);
      return App.notice('info', 'Choose a quiz below to begin a timed attempt. Answers are auto-saved as you work.') +
        App.card('Available quizzes', 'Each attempt has its own timer and saved draft', list.length ? list.map(q => '<div class="list-row"><span class="activity-icon">' + App.icon('quiz') + '</span><div class="list-main"><strong>' + App.esc(q.title) + '</strong><div class="meta"><span>' + App.icon('clock') + App.esc(q.duration) + ' minutes</span><span>' + App.icon('file') + (q.questions || []).length + ' questions</span><span>' + App.icon('star') + 'Pass ' + App.esc(q.passingScore) + '%</span></div></div><button class="btn btn-primary btn-sm" data-action="start-attempt" data-id="' + q.id + '">Begin quiz</button></div>').join('') : App.empty('Nothing to take', 'No published quizzes are available for this role.'));
    }
    const q = quiz(a.quizId);
    if (!q) return App.empty('Quiz unavailable', 'This attempt no longer has a matching quiz.');
    const questions = orderedQuestions(q, a);
    if (!questions.length) return App.card('No questions', 'This quiz has no questions yet.');
    const index = Math.min(Math.max(0, ui.takeIndex), questions.length - 1);
    const cur = questions[index];
    const d = draft(q.id) || { answers: {} };
    const answered = questions.filter(x => d.answers[x.id] !== undefined && d.answers[x.id] !== '').length;
    const nav = questions.map((x, i) => '<button class="btn ' + (i === index ? 'btn-primary' : (d.answers[x.id] !== undefined && d.answers[x.id] !== '' ? 'btn-success' : 'btn-outline')) + ' btn-sm" data-action="goto-question" data-value="' + i + '">' + (i + 1) + '</button>').join(' ');
    let body = '';
    if (cur.type === 'identification') {
      body = '<div class="quiz-question"><p>' + (index + 1) + '. ' + App.esc(cur.text) + '</p><input class="input" id="qinput-' + cur.id + '" placeholder="Type your answer" value="' + App.esc(d.answers[cur.id] || '') + '" /></div>';
    } else {
      body = '<div class="quiz-question"><p>' + (index + 1) + '. ' + App.esc(cur.text) + '</p>' + (cur.choices || []).map((c, i) =>
        '<label class="quiz-option"><input type="radio" id="qinput-' + cur.id + '-' + i + '" name="q-' + cur.id + '" value="' + i + '"' + (String(d.answers[cur.id]) === String(i) ? ' checked' : '') + ' /><span>' + App.esc(c) + '</span></label>').join('') + '</div>';
    }
    return '<div class="notice warn">' + App.icon('clock') + '<span>Time remaining: <strong id="countdown">' + fmtTime(remaining(a)) + '</strong> · ' + answered + ' of ' + questions.length + ' answered · <span id="draft-status">Draft saved · ' + App.esc((d.savedAt || a.started).slice(11) || 'just now') + '</span></span></div>' +
      '<div class="toolbar"><div class="row wrap"><span class="badge ' + (q.visibility === 'private' ? 'private' : 'public') + '">' + App.esc(q.title) + '</span><span class="small muted">' + App.esc(q.randomization ? 'Questions randomized' : 'Fixed question order') + '</span></div>' +
      '<div class="row"><button class="btn btn-outline btn-sm" data-action="goto-question" data-value="' + Math.max(0, index - 1) + '">Previous</button>' + nav + '<button class="btn btn-outline btn-sm" data-action="goto-question" data-value="' + Math.min(questions.length - 1, index + 1) + '">Next</button></div></div>' +
      App.card(cur.type === 'mcq' ? 'Multiple choice' : cur.type === 'truefalse' ? 'True or false' : 'Identification', 'Question ' + (index + 1) + ' of ' + questions.length + ' · ' + (Number(cur.points) || 0) + ' points', body) +
      '<div class="row wrap" style="margin-top:18px"><button class="btn btn-success" data-action="submit-quiz" data-id="' + a.id + '">' + App.icon('check') + ' Submit & grade</button><button class="btn btn-outline" data-action="expire-quiz" data-id="' + a.id + '">' + App.icon('clock') + ' Simulate time expiry</button><button class="btn btn-danger-ghost" data-action="abandon-attempt" data-id="' + a.id + '">Discard attempt</button></div>';
  }

  function results() {
    let list = s.attempts.filter(a => a.status === 'submitted' && (canCreate() || a.user === ME));
    if (ui.results === 'passed') list = list.filter(a => a.passed);
    if (ui.results === 'failed') list = list.filter(a => !a.passed);
    if (ui.results === 'expired') list = list.filter(a => a.expired);
    const rows = list.length ? list.map(a => {
      const q = quiz(a.quizId);
      return '<div class="list-row"><span class="activity-icon">' + App.icon('chart') + '</span><div class="list-main"><strong>' + App.esc(q ? q.title : 'Deleted quiz') + '</strong><div class="meta"><span>' + App.icon('user') + App.esc(a.user) + '</span><span>' + App.icon('calendar') + App.esc(a.submitted) + '</span><span>' + App.icon('clock') + (a.expired ? 'Auto-submitted on expiry' : 'Submitted on time') + '</span></div></div>' +
        '<div class="balance-figure"><strong>' + App.esc(a.percent) + '%</strong><span>' + App.esc(a.score) + ' / ' + App.esc(a.total) + ' pts</span></div>' + (a.passed ? App.badge('done') : App.badge('open')) +
        '<div class="list-actions"><button class="btn btn-outline btn-sm" data-action="result-details" data-id="' + a.id + '">Review</button></div></div>';
    }).join('') : App.empty('No attempts yet', 'Take a quiz to see graded results here.');
    return '<div class="toolbar">' + App.tabs('results', [{ value: 'all', label: 'All attempts', count: s.attempts.filter(a => a.status === 'submitted').length }, { value: 'passed', label: 'Passed' }, { value: 'failed', label: 'Failed' }, { value: 'expired', label: 'Expired' }], ui.results) + '</div>' +
      App.card('Grading results', 'Scores are computed automatically for multiple-choice, true/false, and identification questions', rows);
  }

  function studio() {
    if (!canCreate()) return App.notice('info', 'Quiz studio is available in the Creator and Admin views. Switch roles using the picker at the top right.') +
      App.card('Creator studio', 'Create, edit, publish, and archive quizzes', App.empty('Creator access required', 'Switch to Creator view to manage quizzes.'));
    let list = s.quizzes.slice();
    if (ui.studio !== 'all') list = list.filter(q => q.status === ui.studio);
    const cards = list.length ? list.map(q => {
      const stats = attemptsFor(q.id);
      const avg = stats.length ? Math.round(stats.reduce((n, a) => n + (a.percent || 0), 0) / stats.length) : 0;
      return '<article class="card quiz-card"><div class="quiz-head"><div><h3>' + App.esc(q.title) + '</h3><p class="small muted">' + App.esc(q.description) + '</p></div><div class="row wrap">' + App.badge(q.visibility) + stateBadge(q.status) + '</div></div>' +
        '<div class="quiz-meta"><span>' + App.icon('file') + (q.questions || []).length + ' questions</span><span>' + App.icon('clock') + App.esc(q.duration) + ' min</span><span>' + App.icon('star') + 'Pass ' + App.esc(q.passingScore) + '%</span><span>' + App.icon('chart') + 'Avg ' + avg + '%</span></div>' +
        '<div class="row wrap"><button class="btn btn-outline btn-sm" data-action="edit-quiz" data-id="' + q.id + '">' + App.icon('edit') + ' Edit</button><button class="btn btn-primary btn-sm" data-action="add-question" data-id="' + q.id + '">' + App.icon('plus') + ' Add question</button>' +
        (q.status !== 'published' ? '<button class="btn btn-success btn-sm" data-action="set-quiz-status" data-id="' + q.id + '" data-value="published">Publish</button>' : '<button class="btn btn-outline btn-sm" data-action="set-quiz-status" data-id="' + q.id + '" data-value="archived">Archive</button><button class="btn btn-outline btn-sm" data-action="set-quiz-status" data-id="' + q.id + '" data-value="draft">Unpublish</button>') + '</div></article>';
    }).join('') : App.empty('No quizzes in this state', 'Create a new quiz to get started.');
    return '<div class="toolbar">' + App.tabs('studio', [{ value: 'all', label: 'All', count: s.quizzes.length }, { value: 'draft', label: 'Drafts' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }], ui.studio) +
      '<button class="btn btn-primary btn-sm" data-action="create-quiz">' + App.icon('plus') + ' Create quiz</button></div>' + '<div class="quiz-grid">' + cards + '</div>';
  }

  function analytics() {
    if (!canCreate()) return App.notice('info', 'Analytics are available in the Creator and Admin views.') +
      App.card('Performance analytics', 'Average score and pass rate per quiz', App.empty('Creator access required', 'Switch roles to view analytics.'));
    const all = s.attempts.filter(a => a.status === 'submitted');
    const avg = all.length ? Math.round(all.reduce((n, a) => n + (a.percent || 0), 0) / all.length) : 0;
    const pass = all.length ? Math.round(all.filter(a => a.passed).length / all.length * 100) : 0;
    const max = Math.max(1, ...s.quizzes.map(q => (q.questions || []).length));
    const bars = s.quizzes.length ? s.quizzes.map(q => {
      const ats = attemptsFor(q.id);
      const qavg = ats.length ? Math.round(ats.reduce((n, a) => n + (a.percent || 0), 0) / ats.length) : 0;
      const qpass = ats.length ? Math.round(ats.filter(a => a.passed).length / ats.length * 100) : 0;
      return '<div class="card" style="padding:16px;margin-bottom:12px"><div class="row spread"><strong>' + App.esc(q.title) + '</strong>' + stateBadge(q.status) + '</div>' +
        '<div class="bar-row"><span>Avg. score</span><div class="bar-bg"><div style="width:' + qavg + '%"></div></div><strong>' + qavg + '%</strong></div>' +
        '<div class="bar-row"><span>Pass rate</span><div class="bar-bg"><div style="width:' + qpass + '%;background:var(--done)"></div></div><strong>' + qpass + '%</strong></div>' +
        '<div class="bar-row"><span>Questions</span><div class="bar-bg"><div style="width:' + Math.round((q.questions || []).length / max * 100) + '%;background:var(--info)"></div></div><strong>' + (q.questions || []).length + '</strong></div></div>';
    }).join('') : App.empty('No quizzes to analyze', 'Create a quiz first.');
    return '<div class="analytics-grid">' + statCard('Quizzes', s.quizzes.length, 'accent') + statCard('Submissions', all.length, '') + statCard('Average score', avg + '%', '') + statCard('Overall pass rate', pass + '%', 'good') + '</div>' +
      '<h2 class="section-title">' + App.icon('chart') + ' Per-quiz performance</h2>' + bars;
  }

  function registerAnswerInputs() {
    (s.quizzes || []).forEach(q => (q.questions || []).forEach(qu => {
      if (qu.type === 'identification') {
        App.onInput('qinput-' + qu.id, value => saveAnswer(qu.id, value));
      } else {
        (qu.choices || []).forEach((c, i) => App.onInput('qinput-' + qu.id + '-' + i, () => saveAnswer(qu.id, String(i))));
      }
    }));
  }

  function saveAnswer(qid, value) {
    const a = currentAttempt();
    if (!a || !qid) return;
    s.drafts = s.drafts || {};
    const k = dkey(a.quizId);
    s.drafts[k] = s.drafts[k] || { answers: {}, index: ui.takeIndex };
    s.drafts[k].answers[qid] = value;
    s.drafts[k].index = ui.takeIndex;
    s.drafts[k].savedAt = App.stamp();
    App.save();
    const el = document.getElementById('draft-status');
    if (el) el.textContent = 'Draft saved · ' + s.drafts[k].savedAt.slice(11);
  }

  function startTimer(a) {
    if (typeof setInterval !== 'function') return;
    if (ui.timer) clearInterval(ui.timer);
    ui.timer = setInterval(tick, 1000);
  }
  function tick() {
    const a = currentAttempt();
    if (!a) { if (ui.timer) { clearInterval(ui.timer); ui.timer = null; } return; }
    const left = remaining(a);
    const el = document.getElementById('countdown');
    if (el) el.textContent = fmtTime(left);
    if (left <= 0) { if (ui.timer) { clearInterval(ui.timer); ui.timer = null; } submitAttempt(a.id, true); }
  }

  function startAttempt(id) {
    const q = quiz(id);
    if (!q || !canBrowse(q)) { App.toast('This quiz is not available to you.', 'error'); return; }
    let a = currentAttempt();
    if (!a || a.quizId !== id) {
      a = { id: App.uid('at'), quizId: id, user: ME, started: App.stamp(), endsAt: Date.now() + Number(q.duration || 5) * 60000, answers: {}, status: 'in_progress', order: q.randomization ? shuffle((q.questions || []).map(x => x.id)) : null };
      s.attempts.unshift(a);
    }
    ui.takeQuiz = id;
    ui.takeIndex = 0;
    registerAnswerInputs();
    App.save();
    App.go('take');
    startTimer(a);
    App.toast('Timer started — answers save automatically.');
  }

  function submitAttempt(id, expired) {
    const a = (s.attempts || []).find(x => x.id === id);
    if (!a || a.status !== 'in_progress') return;
    const q = quiz(a.quizId);
    if (!q) return;
    const d = draft(a.quizId);
    const answers = (d && d.answers) || a.answers || {};
    let score = 0, total = 0;
    const breakdown = (q.questions || []).map(qu => {
      const pts = Number(qu.points) || 0;
      total += pts;
      const given = answers[qu.id];
      let correct = false;
      if (qu.type === 'identification') correct = String(given == null ? '' : given).trim().toLowerCase() === String(qu.answer || '').trim().toLowerCase();
      else correct = Number(given) === Number(qu.answer) && given !== undefined && given !== '';
      if (correct) score += pts;
      return { id: qu.id, text: qu.text, correct: correct, given: given, answer: qu.answer, type: qu.type };
    });
    a.answers = answers;
    a.breakdown = breakdown;
    a.score = score;
    a.total = total;
    a.percent = total ? Math.round(score / total * 100) : 0;
    a.passed = a.percent >= Number(q.passingScore || 0);
    a.expired = !!expired;
    a.status = 'submitted';
    a.submitted = App.stamp();
    s.drafts = s.drafts || {};
    delete s.drafts[dkey(a.quizId)];
    if (ui.timer) { clearInterval(ui.timer); ui.timer = null; }
    ui.takeQuiz = null;
    App.activity('Attempt graded: ' + q.title + ' — ' + a.percent + '%', 'results');
    App.save();
    App.go('results');
    App.toast(expired ? 'Time expired — attempt submitted automatically.' : 'Quiz submitted and graded.', expired ? 'error' : '');
  }

  App.init({
    slug: 'quizforge', title: 'QuizForge', tagline: 'Quiz Creation & Assessment', icon: 'quiz', accent: 'violet',
    roles: ['admin', 'creator', 'participant'], roleLabels: { admin: 'Admin view', creator: 'Creator view', participant: 'Participant view' },
    viewAccess: { studio: ['creator', 'admin'], analytics: ['creator', 'admin'] },
    user: { name: ME, meta: 'Quiz participant · demo account', initials: 'JD' },
    progressLabel: 'Quizzes graded', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'WORKSPACE' },
      { id: 'browse', label: 'Browse quizzes', icon: 'book', group: 'PARTICIPATE' },
      { id: 'take', label: 'Take quiz', icon: 'quiz', group: 'PARTICIPATE' },
      { id: 'results', label: 'Results', icon: 'chart', group: 'PARTICIPATE' },
      { id: 'studio', label: 'Creator studio', icon: 'edit', group: 'MANAGE' },
      { id: 'analytics', label: 'Analytics', icon: 'monitor', group: 'MANAGE' }
    ],
    views: {
      dashboard: { title: 'Dashboard', subtitle: 'Quizzes, attempts, and performance at a glance', render: dashboard },
      browse: { title: 'Browse quizzes', subtitle: 'Discover public and authorized private quizzes', render: browse },
      take: { title: 'Take quiz', subtitle: 'Timed attempt with auto-saved answers', render: take },
      results: { title: 'Results', subtitle: 'Graded scores and previous attempt history', render: results },
      studio: { title: 'Creator studio', subtitle: 'Create, edit, publish, and archive quizzes', render: studio },
      analytics: { title: 'Analytics', subtitle: 'Average scores and pass rates by quiz', render: analytics }
    }
  });

  s = App.state; // must happen after App.init()
  registerAnswerInputs();

  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });
  App.onInput('browse-search', value => { ui.search = value; });

  App.on('start-attempt', d => startAttempt(d.id));
  App.on('start-quiz-modal', d => { App.closeModal(); startAttempt(d.id); });
  App.on('goto-question', d => {
    const a = currentAttempt();
    if (!a) { App.go('take'); return; }
    const q = quiz(a.quizId);
    const len = q ? orderedQuestions(q, a).length : 0;
    if (!len) return;
    ui.takeIndex = Math.min(Math.max(0, Number(d.value) || 0), len - 1);
    const dft = draft(a.quizId);
    if (dft) { dft.index = ui.takeIndex; App.save(); }
    App.refresh();
  });
  App.on('submit-quiz', d => submitAttempt(d.id, false));
  App.on('expire-quiz', d => submitAttempt(d.id, true));
  App.on('abandon-attempt', d => {
    const a = (s.attempts || []).find(x => x.id === d.id);
    if (!a || a.status !== 'in_progress') return;
    a.status = 'abandoned';
    s.drafts = s.drafts || {};
    delete s.drafts[dkey(a.quizId)];
    if (ui.timer) { clearInterval(ui.timer); ui.timer = null; }
    ui.takeQuiz = null;
    App.save(); App.go('browse'); App.toast('Attempt discarded.');
  });
  App.on('result-details', d => {
    const a = (s.attempts || []).find(x => x.id === d.id);
    if (!a) return;
    const q = quiz(a.quizId);
    const rows = (a.breakdown || []).map(b => '<li>' + App.icon(b.correct ? 'check' : 'close') + '<div><strong>' + App.esc(b.text) + '</strong><small>Your answer: ' + App.esc(typeof b.given === 'string' ? b.given : (b.given !== undefined ? (q && (q.questions || []).find(x => x.id === b.id) || {}).choices?.[Number(b.given)] || b.given : 'No answer')) + ' · Correct: ' + App.esc(b.type === 'identification' ? b.answer : ((q && (q.questions || []).find(x => x.id === b.id) || {}).choices?.[Number(b.answer)] || b.answer)) + '</small></div></li>').join('');
    App.modal('Attempt review', q ? q.title : 'Quiz', '<div class="detail-grid"><div class="detail"><small>Score</small><strong>' + App.esc(a.score) + ' / ' + App.esc(a.total) + '</strong></div><div class="detail"><small>Result</small><strong>' + (a.passed ? 'Passed' : 'Failed') + '</strong></div><div class="detail"><small>Submitted</small><strong>' + App.esc(a.submitted) + '</strong></div><div class="detail"><small>Expiry</small><strong>' + (a.expired ? 'Auto-submitted' : 'On time') + '</strong></div></div><ul class="timeline" style="margin-top:16px">' + (rows || '<li>No question breakdown recorded.</li>') + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button>');
  });
  App.on('quiz-details', d => {
    const q = quiz(d.id);
    if (!q) return;
    const qs = (q.questions || []).map(x => '<li>' + App.icon('file') + '<div><strong>' + App.esc(x.text) + '</strong><small>' + App.esc(x.type.replace('truefalse', 'true/false')) + ' · ' + App.esc(x.points) + ' pts</small></div></li>').join('');
    App.modal('Quiz details', q.description, '<div class="kv"><dt>Visibility</dt><dd>' + App.esc(q.visibility) + '</dd><dt>Duration</dt><dd>' + App.esc(q.duration) + ' minutes</dd><dt>Passing score</dt><dd>' + App.esc(q.passingScore) + '%</dd><dt>Randomization</dt><dd>' + (q.randomization ? 'Enabled' : 'Disabled') + '</dd><dt>Creator</dt><dd>' + App.esc(q.creator) + '</dd></div><ul class="timeline" style="margin-top:14px">' + qs + '</ul>',
      '<button class="btn btn-outline" data-action="close-modal">Close</button><button class="btn btn-primary" data-action="start-quiz-modal" data-id="' + q.id + '">Start quiz</button>');
  });

  function openQuizForm(q) {
    const isEdit = !!q;
    App.modal(isEdit ? 'Edit quiz' : 'Create quiz', 'Configure the quiz settings',
      '<form id="quiz-form"><input type="hidden" name="qid" value="' + (isEdit ? App.esc(q.id) : '') + '" />' +
      '<div class="field"><label for="qf-title">Title</label><input class="input" id="qf-title" name="title" value="' + (isEdit ? App.esc(q.title) : '') + '" required /></div>' +
      '<div class="field"><label for="qf-desc">Description</label><textarea class="textarea" id="qf-desc" name="description">' + (isEdit ? App.esc(q.description) : '') + '</textarea></div>' +
      '<div class="field"><label for="qf-vis">Visibility</label><select class="select" id="qf-vis" name="visibility"><option value="public"' + (!isEdit || q.visibility === 'public' ? ' selected' : '') + '>Public</option><option value="private"' + (isEdit && q.visibility === 'private' ? ' selected' : '') + '>Private</option></select></div>' +
      '<div class="detail-grid"><div class="field"><label for="qf-dur">Duration (min)</label><input class="input" type="number" id="qf-dur" name="duration" min="1" value="' + (isEdit ? App.esc(q.duration) : 5) + '" /></div>' +
      '<div class="field"><label for="qf-pass">Passing score (%)</label><input class="input" type="number" id="qf-pass" name="passingScore" min="1" max="100" value="' + (isEdit ? App.esc(q.passingScore) : 60) + '" /></div></div>' +
      '<div class="field"><label for="qf-rand">Randomize questions</label><select class="select" id="qf-rand" name="randomization"><option value="no"' + (!isEdit || !q.randomization ? ' selected' : '') + '>No — fixed order</option><option value="yes"' + (isEdit && q.randomization ? ' selected' : '') + '>Yes — shuffle order</option></select></div>' +
      (isEdit ? '' : '<p class="small muted">New quizzes start as drafts. Add questions, then publish from the studio.</p>') + '</form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-quiz">' + App.icon('check') + ' Save quiz</button>');
  }
  App.on('create-quiz', () => { if (canCreate()) openQuizForm(null); });
  App.on('edit-quiz', d => { const q = quiz(d.id); if (canCreate() && q) openQuizForm(q); });
  App.on('save-quiz', () => {
    if (!canCreate()) return;
    const f = document.getElementById('quiz-form');
    if (!f) return;
    const d = new FormData(f);
    const title = String(d.get('title') || '').trim();
    if (!title) { App.toast('Please enter a quiz title.', 'error'); return; }
    const existing = quiz(String(d.get('qid') || ''));
    const fields = {
      title: title, description: String(d.get('description') || ''), visibility: d.get('visibility') === 'private' ? 'private' : 'public',
      duration: Number(d.get('duration')) || 5, passingScore: Number(d.get('passingScore')) || 60, randomization: d.get('randomization') === 'yes'
    };
    if (existing) {
      Object.assign(existing, fields);
      App.activity('Quiz updated: ' + existing.title, 'studio');
      App.toast('Quiz updated.');
    } else {
      s.quizzes.unshift(Object.assign({ id: App.uid('qz'), status: 'draft', creator: ME, allowed: [], created: App.today(), questions: [] }, fields));
      App.activity('Quiz created: ' + title, 'studio');
      App.toast('Draft quiz created — add questions next.');
    }
    App.save(); App.closeModal(); App.refresh();
  });
  App.on('set-quiz-status', d => {
    if (!canCreate()) return;
    const q = quiz(d.id);
    if (!q) return;
    q.status = d.value === 'published' || d.value === 'archived' || d.value === 'draft' ? d.value : q.status;
    if (!q.questions || !q.questions.length) { App.toast('Add at least one question before publishing.', 'error'); App.save(); App.refresh(); return; }
    App.activity('Quiz ' + q.title + ' marked ' + q.status, 'studio');
    App.save(); App.refresh(); App.toast('Quiz status: ' + q.status + '.');
  });
  App.on('add-question', d => {
    if (!canCreate()) return;
    const q = quiz(d.id);
    if (!q) return;
    App.modal('Add question', q.title,
      '<form id="question-form"><input type="hidden" name="qid" value="' + App.esc(q.id) + '" />' +
      '<div class="field"><label for="qf-type">Question type</label><select class="select" id="qf-type" name="type"><option value="mcq">Multiple choice</option><option value="truefalse">True / false</option><option value="identification">Identification</option></select></div>' +
      '<div class="field"><label for="qn-text">Question</label><textarea class="textarea" id="qn-text" name="text" required></textarea></div>' +
      '<div class="field"><label for="qn-choices">Choices (multiple choice only, comma-separated)</label><input class="input" id="qn-choices" name="choices" placeholder="Manila, Cebu, Davao" /></div>' +
      '<div class="detail-grid"><div class="field"><label for="qn-answer">Correct answer</label><input class="input" id="qn-answer" name="answer" placeholder="Index (0-based) or text" required /></div>' +
      '<div class="field"><label for="qn-points">Points</label><input class="input" type="number" id="qn-points" name="points" value="20" min="1" /></div></div>' +
      '<p class="small muted">For multiple choice / true-false, use the option index starting at 0. For identification, type the exact expected answer.</p></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-question">' + App.icon('plus') + ' Add question</button>');
  });
  App.on('save-question', () => {
    if (!canCreate()) return;
    const f = document.getElementById('question-form');
    if (!f) return;
    const d = new FormData(f);
    const q = quiz(String(d.get('qid') || ''));
    if (!q) { App.toast('Quiz not found.', 'error'); return; }
    const type = ['mcq', 'truefalse', 'identification'].indexOf(d.get('type')) !== -1 ? d.get('type') : 'mcq';
    const text = String(d.get('text') || '').trim();
    if (!text) { App.toast('Please enter the question text.', 'error'); return; }
    const choices = type === 'truefalse' ? ['True', 'False'] : String(d.get('choices') || '').split(',').map(x => x.trim()).filter(Boolean);
    if (type === 'mcq' && choices.length < 2) { App.toast('Multiple-choice questions need at least two choices.', 'error'); return; }
    const answerRaw = String(d.get('answer') || '').trim();
    const answer = type === 'identification' ? answerRaw : Math.max(0, Math.min(choices.length - 1, Number(answerRaw) || 0));
    q.questions = q.questions || [];
    q.questions.push({ id: App.uid('qq'), type: type, text: text, choices: choices, answer: answer, points: Number(d.get('points')) || 20 });
    registerAnswerInputs();
    App.activity('Question added to ' + q.title, 'studio');
    App.save(); App.closeModal(); App.refresh(); App.toast('Question added.');
  });

  function updateCounts() {
    App.setCounts({
      dashboard: s.quizzes.filter(q => q.status === 'published').length,
      browse: s.quizzes.filter(canBrowse).length,
      take: currentAttempt() ? 1 : 0,
      results: s.attempts.filter(a => a.status === 'submitted' && (canCreate() || a.user === ME)).length,
      studio: canCreate() ? s.quizzes.filter(q => q.status === 'draft').length : 0,
      analytics: canCreate() ? s.quizzes.length : 0
    });
    const all = s.attempts.filter(a => a.status === 'submitted');
    App.setProgress(all.length ? Math.round(all.filter(a => a.passed).length / all.length * 100) : 0, 'Overall pass rate');
  }
  updateCounts();
  App.go('dashboard');
})();
