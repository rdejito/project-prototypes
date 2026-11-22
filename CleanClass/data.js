/* CleanClass prototype seed data */
const SEED = {
  role: 'student',
  classrooms: [
    { id: 'rm-1', name: 'Room 301', building: 'Building A', capacity: 40, cleanliness: 'Good', lastChecked: '2026-11-20' },
    { id: 'rm-2', name: 'Lab 2', building: 'Science Block', capacity: 30, cleanliness: 'Needs attention', lastChecked: '2026-11-18' },
    { id: 'rm-3', name: 'Room 205', building: 'Building B', capacity: 35, cleanliness: 'Good', lastChecked: '2026-11-21' },
    { id: 'rm-4', name: 'CITE Lab 1', building: 'CITE Building', capacity: 25, cleanliness: 'Poor', lastChecked: '2026-11-15' },
    { id: 'rm-5', name: 'Quadrangle', building: 'Open Area', capacity: 0, cleanliness: 'Good', lastChecked: '2026-11-19' }
  ],
  tasks: [
    { id: 'tk-1', room: 'Room 301', task: 'Wipe boards and arrange chairs', assignedTo: 'Juan Dela Cruz', date: '2026-11-22', status: 'pending' },
    { id: 'tk-2', room: 'Lab 2', task: 'Return tools to labeled cabinets', assignedTo: 'Juan Dela Cruz', date: '2026-11-23', status: 'pending' },
    { id: 'tk-3', room: 'CITE Lab 1', task: 'Clean computer desks and monitors', assignedTo: 'Maria Santos', date: '2026-11-22', status: 'pending' },
    { id: 'tk-4', room: 'Room 205', task: 'Sweep floor and empty trash', assignedTo: 'Juan Dela Cruz', date: '2026-11-20', status: 'done', submitted: '2026-11-20', note: 'Floor swept, trash emptied.' },
    { id: 'tk-5', room: 'Quadrangle', task: 'Weed garden area', assignedTo: 'Pedro Reyes', date: '2026-11-18', status: 'done', submitted: '2026-11-18', note: 'Area cleared.' }
  ],
  activity: [
    { id: 'ac-1', text: 'Task assigned: Wipe boards and arrange chairs (Room 301)', module: 'schedule', time: 'Today, 08:00' },
    { id: 'ac-2', text: 'Lab 2 marked as needing attention', module: 'classrooms', time: 'Nov 18, 2026' },
    { id: 'ac-3', text: 'Sweep floor and empty trash submitted', module: 'tasks', time: 'Nov 20, 2026' }
  ]
};
