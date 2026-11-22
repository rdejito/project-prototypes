/* CleanClass prototype — classroom cleanliness monitoring. */
(function () {
  let s; // assigned after App.init() in this file
  const ui = { taskFilter: 'mine', roomFilter: 'all' };
  const me = 'Juan Dela Cruz';
  const canStudent = () => s.role === 'student';
  const canTeacher = () => s.role === 'teacher' || s.role === 'admin';
  const canAdmin = () => s.role === 'admin';

  function taskRow(t) {
    const isMine = t.assignedTo === me;
    return '<div class="list-row"><span class="activity-icon">' + App.icon('broom') + '</span><div class="list-main"><strong>' + App.esc(t.task) + '</strong><div class="meta">' +
      '<span>' + App.icon('map') + App.esc(t.room) + '</span><span>' + App.icon('calendar') + App.esc(t.date) + '</span><span>' + App.icon('user') + App.esc(t.assignedTo) + '</span>' +
      (t.submitted ? '<span>' + App.icon('check') + 'Submitted ' + App.esc(t.submitted) + '</span>' : '') + '</div></div>' + App.badge(t.status) +
      '<div class="list-actions">' + (t.status === 'pending' && ((canStudent() && isMine) || canTeacher())
        ? '<button class="btn btn-primary btn-sm" data-action="submit-task" data-id="' + t.id + '">' + App.icon('check') + (canStudent() ? ' Submit completion' : ' Mark done') + '</button>' : '') + '</div></div>';
  }

  function dashboard() {
    const pending = s.tasks.filter(t => t.status === 'pending').length;
    const mine = s.tasks.filter(t => t.assignedTo === me && t.status === 'pending');
    const attention = s.classrooms.filter(c => c.cleanliness !== 'Good');
    const stats = '<div class="stat-grid"><div class="card stat-card"><span>Classrooms</span><strong>' + s.classrooms.length + '</strong></div>' +
      '<div class="card stat-card warn"><span>Pending tasks</span><strong>' + pending + '</strong></div>' +
      '<div class="card stat-card good"><span>Need attention</span><strong>' + attention.length + '</strong></div></div>';
    const mineHtml = mine.length ? mine.slice(0, 4).map(taskRow).join('') : App.empty('No pending duties', 'You are all caught up.');
    const roomsHtml = s.classrooms.slice(0, 5).map(c => '<div class="focus-item"><span class="focus-dot" style="background:' + (c.cleanliness === 'Good' ? 'var(--done)' : c.cleanliness === 'Poor' ? 'var(--danger)' : 'var(--pending)') + '"></span><div class="txt"><strong>' + App.esc(c.name) + '</strong><span>' + App.esc(c.building) + ' · checked ' + App.esc(c.lastChecked) + '</span></div>' + '<span class="badge ' + (c.cleanliness === 'Good' ? 'done' : c.cleanliness === 'Poor' ? 'open' : 'pending') + '">' + App.esc(c.cleanliness) + '</span></div>').join('');
    const act = s.activity.slice(0, 5).map(a => '<div class="activity-item"><span class="activity-icon">' + App.icon('history') + '</span><div><p>' + App.esc(a.text) + '</p><small>' + App.esc(a.time) + '</small></div></div>').join('');
    return stats + '<h2 class="section-title">' + App.icon('broom') + ' Today’s duties</h2>' + App.card('Your cleaning schedule', 'Tasks assigned to you that are still pending', mineHtml) +
      '<div class="dash-bottom" style="margin-top:18px">' + App.card('Classroom status', 'Latest cleanliness checks', roomsHtml) + App.card('Recent activity', 'Latest records', act) + '</div>';
  }

  function schedule() {
    let list = s.tasks.slice();
    if (ui.taskFilter === 'mine') list = list.filter(t => t.assignedTo === me);
    if (ui.taskFilter === 'pending') list = list.filter(t => t.status === 'pending');
    if (ui.taskFilter === 'done') list = list.filter(t => t.status === 'done');
    const head = canTeacher() ? '<button class="btn btn-primary btn-sm" data-action="assign-task">' + App.icon('plus') + ' Assign task</button>' : '';
    return '<div class="toolbar">' + App.tabs('taskFilter', [
      { value: 'mine', label: 'My schedule' }, { value: 'pending', label: 'Pending', count: s.tasks.filter(t => t.status === 'pending').length },
      { value: 'done', label: 'Completed', count: s.tasks.filter(t => t.status === 'done').length }, { value: 'all', label: 'All tasks' }
    ], ui.taskFilter) + head + '</div>' + App.card('Cleaning schedule', 'Published tasks and their current status', list.length ? list.map(taskRow).join('') : App.empty('No tasks here', 'Adjust the filter above.'));
  }

  function tasks() {
    const pending = s.tasks.filter(t => t.status === 'pending');
    const done = s.tasks.filter(t => t.status === 'done');
    return '<div class="stat-grid"><div class="card stat-card warn"><span>Pending</span><strong>' + pending.length + '</strong></div><div class="card stat-card good"><span>Completed</span><strong>' + done.length + '</strong></div><div class="card stat-card accent"><span>Completion rate</span><strong>' + Math.round(done.length / s.tasks.length * 100) + '%</strong></div></div>' +
      App.card('Pending submissions', 'Students submit completion; teachers record the result', pending.length ? pending.map(taskRow).join('') : App.empty('Nothing pending', 'All tasks are completed.')) +
      '<div style="margin-top:18px">' + App.card('Completed records', 'Every completed task keeps its submission date and note', done.length ? done.map(taskRow).join('') : App.empty('No completed tasks yet', 'Completed tasks appear here.')) + '</div>';
  }

  function classrooms() {
    let list = s.classrooms.slice();
    if (ui.roomFilter !== 'all') list = list.filter(c => c.cleanliness === ui.roomFilter);
    const cards = list.length ? list.map(c => {
      const tone = c.cleanliness === 'Good' ? 'teal' : c.cleanliness === 'Poor' ? 'rose' : 'amber';
      return '<article class="card service-card"><div class="module-top"><span class="module-icon tone-' + tone + '">' + App.icon('home') + '</span><span class="badge ' + (c.cleanliness === 'Good' ? 'done' : c.cleanliness === 'Poor' ? 'open' : 'pending') + '">' + App.esc(c.cleanliness) + '</span></div>' +
        '<div><h3 style="margin:0;font-size:14px">' + App.esc(c.name) + '</h3></div><p>' + App.esc(c.building) + (c.capacity ? ' · capacity ' + c.capacity : '') + '</p>' +
        '<div class="service-meta"><span>' + App.icon('calendar') + 'Checked ' + App.esc(c.lastChecked) + '</span></div>' +
        (canTeacher() ? '<div class="row"><button class="btn btn-outline btn-sm" data-action="set-clean" data-id="' + c.id + '" data-value="Good">Mark clean</button><button class="btn btn-danger-ghost btn-sm" data-action="set-clean" data-id="' + c.id + '" data-value="Needs attention">Needs attention</button></div>' : '') + '</article>';
    }).join('') : App.empty('No classrooms found', 'Adjust the filter above.');
    return '<div class="toolbar">' + App.tabs('roomFilter', [
      { value: 'all', label: 'All rooms', count: s.classrooms.length }, { value: 'Good', label: 'Clean' }, { value: 'Needs attention', label: 'Needs attention' }, { value: 'Poor', label: 'Poor' }
    ], ui.roomFilter) + (canAdmin() ? '<button class="btn btn-primary btn-sm" data-action="add-room">' + App.icon('plus') + ' Add classroom</button>' : '') + '</div><div class="service-grid">' + cards + '</div>';
  }

  function reports() {
    const rows = s.tasks.slice().reverse().map(t => '<tr><td>' + App.esc(t.date) + '</td><td>' + App.esc(t.room) + '</td><td>' + App.esc(t.task) + '</td><td>' + App.esc(t.assignedTo) + '</td><td>' + App.badge(t.status) + '</td></tr>').join('');
    return App.card('Cleaning records', 'All tasks, statuses, and submission dates', '<table class="table"><thead><tr><th>Date</th><th>Room</th><th>Task</th><th>Assigned to</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }

  App.init({
    slug: 'cleancheck', title: 'CleanClass', tagline: 'Classroom Cleanliness Monitor', icon: 'broom', accent: 'amber',
    roles: ['student', 'teacher', 'admin'], roleLabels: { student: 'Student view', teacher: 'Teacher view', admin: 'Admin view' },
    user: { name: 'Juan Dela Cruz', meta: '2024-00137 · BS IT', initials: 'JD' },
    progressLabel: 'Tasks completed', seed: SEED,
    nav: [
      { id: 'dashboard', label: 'Overview', icon: 'grid', group: 'WORKSPACE' },
      { id: 'schedule', label: 'Cleaning Schedule', icon: 'calendar', group: 'MODULES' },
      { id: 'tasks', label: 'Tasks & Submissions', icon: 'broom', group: 'MODULES' },
      { id: 'classrooms', label: 'Classrooms', icon: 'home', group: 'MODULES' },
      { id: 'reports', label: 'Records', icon: 'file', group: 'MODULES' }
    ],
    views: {
      dashboard: { title: 'Overview', subtitle: 'Cleanliness and duties at a glance', render: dashboard },
      schedule: { title: 'Cleaning Schedule', subtitle: 'Published cleaning assignments', render: schedule },
      tasks: { title: 'Tasks & Submissions', subtitle: 'Record completed and pending cleaning tasks', render: tasks },
      classrooms: { title: 'Classrooms', subtitle: 'Monitor and update classroom cleanliness', render: classrooms },
      reports: { title: 'Records', subtitle: 'Full cleaning task history', render: reports }
    }
  });

  s = App.state;
  App.on('filter', d => { ui[d.key] = d.value; App.refresh(); });

  App.on('submit-task', d => {
    const t = s.tasks.find(x => x.id === d.id); if (!t || t.status !== 'pending') return;
    App.modal('Submit cleaning task', t.room + ' · ' + t.task,
      '<form id="task-form"><div class="field"><label for="tn">Completion note</label><textarea class="textarea" id="tn" name="note" placeholder="What did you clean?"></textarea></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-success" data-action="confirm-task" data-id="' + t.id + '">' + App.icon('check') + ' Submit</button>');
  });
  App.on('confirm-task', d => {
    const t = s.tasks.find(x => x.id === d.id); if (!t) return;
    t.status = 'done'; t.submitted = App.today(); t.note = (document.getElementById('tn') || {}).value || t.note;
    App.activity(t.task + ' submitted for ' + t.room, 'tasks'); App.save(); App.closeModal(); App.refresh(); App.toast('Task marked as completed.');
  });
  App.on('set-clean', d => {
    const c = s.classrooms.find(x => x.id === d.id); if (!c) return;
    c.cleanliness = d.value; c.lastChecked = App.today();
    App.activity(c.name + ' marked as ' + d.value, 'classrooms'); App.save(); App.refresh(); App.toast(c.name + ' updated.');
  });
  App.on('assign-task', () => {
    App.modal('Assign cleaning task', 'Create a new schedule entry',
      '<form id="assign-form"><div class="field"><label for="a-room">Classroom</label><select class="select" id="a-room" name="room">' + s.classrooms.map(c => '<option>' + App.esc(c.name) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="a-task">Task</label><input class="input" id="a-task" name="task" required /></div>' +
      '<div class="field"><label for="a-who">Assigned to</label><input class="input" id="a-who" name="who" value="' + App.esc(me) + '" required /></div>' +
      '<div class="field"><label for="a-date">Date</label><input class="input" type="date" id="a-date" name="date" value="' + App.today() + '" required /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-assign">' + App.icon('plus') + ' Assign</button>');
  });
  App.on('save-assign', () => {
    const f = document.getElementById('assign-form'); const d = new FormData(f);
    s.tasks.unshift({ id: App.uid('tk'), room: d.get('room'), task: d.get('task'), assignedTo: d.get('who'), date: d.get('date'), status: 'pending' });
    App.activity('Task assigned: ' + d.get('task'), 'schedule'); App.save(); App.closeModal(); App.refresh(); App.toast('Task assigned.');
  });
  App.on('add-room', () => {
    App.modal('Add classroom', 'Register a new room or area',
      '<form id="room-form"><div class="field"><label for="r-name">Name</label><input class="input" id="r-name" name="name" required /></div>' +
      '<div class="field"><label for="r-bldg">Building</label><input class="input" id="r-bldg" name="building" required /></div>' +
      '<div class="field"><label for="r-cap">Capacity</label><input class="input" type="number" id="r-cap" name="capacity" value="30" /></div></form>',
      '<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-room">' + App.icon('plus') + ' Add room</button>');
  });
  App.on('save-room', () => {
    const d = new FormData(document.getElementById('room-form'));
    s.classrooms.push({ id: App.uid('rm'), name: d.get('name'), building: d.get('building'), capacity: Number(d.get('capacity')), cleanliness: 'Good', lastChecked: App.today() });
    App.activity('Classroom added: ' + d.get('name'), 'classrooms'); App.save(); App.closeModal(); App.refresh(); App.toast('Classroom added.');
  });

  function updateCounts() {
    App.setCounts({ dashboard: s.tasks.filter(t => t.status === 'pending').length, schedule: s.tasks.filter(t => t.assignedTo === me && t.status === 'pending').length, tasks: s.tasks.filter(t => t.status === 'pending').length, classrooms: s.classrooms.filter(c => c.cleanliness !== 'Good').length, reports: 0 });
    App.setProgress(Math.round(s.tasks.filter(t => t.status === 'done').length / s.tasks.length * 100));
  }
  updateCounts();
  App.go('dashboard');
})();
