/* QuizForge prototype seed data */
const SEED = {
  role: 'participant',
  quizzes: [
    {
      id: 'qz-1', title: 'General Knowledge Check',
      description: 'A short mixed-format quiz about the Philippines and everyday facts.',
      visibility: 'public', duration: 5, passingScore: 60, randomization: false,
      status: 'published', creator: 'Maria Santos', allowed: [], created: '2026-11-10',
      questions: [
        { id: 'qq-1', type: 'mcq', text: 'What is the capital city of the Philippines?', choices: ['Manila', 'Cebu City', 'Davao City', 'Quezon City'], answer: 0, points: 20 },
        { id: 'qq-2', type: 'truefalse', text: 'The sun rises in the east.', choices: ['True', 'False'], answer: 0, points: 20 },
        { id: 'qq-3', type: 'identification', text: 'Name the largest island in the Philippines.', choices: [], answer: 'Luzon', points: 20 }
      ]
    },
    {
      id: 'qz-2', title: 'Workplace Safety Basics',
      description: 'Required safety quiz for authorized warehouse staff (private quiz).',
      visibility: 'private', duration: 4, passingScore: 70, randomization: true,
      status: 'published', creator: 'Maria Santos', allowed: ['Juan Dela Cruz', 'Ana Reyes'], created: '2026-11-12',
      questions: [
        { id: 'qq-4', type: 'mcq', text: 'What should you do first when you notice a spill on the floor?', choices: ['Walk around it', 'Report and mark the area', 'Ignore it', 'Run across it'], answer: 1, points: 25 },
        { id: 'qq-5', type: 'truefalse', text: 'Safety goggles are optional when cutting materials.', choices: ['True', 'False'], answer: 1, points: 25 },
        { id: 'qq-6', type: 'identification', text: 'What is the universal emergency number for most PH mobile phones?', choices: [], answer: '911', points: 25 }
      ]
    },
    {
      id: 'qz-3', title: 'Intro to Algebra (Draft)',
      description: 'Work-in-progress quiz for the training program; not yet published.',
      visibility: 'public', duration: 10, passingScore: 75, randomization: false,
      status: 'draft', creator: 'Maria Santos', allowed: [], created: '2026-11-19',
      questions: [
        { id: 'qq-7', type: 'mcq', text: 'Solve for x: 2x + 4 = 12', choices: ['2', '4', '6', '8'], answer: 1, points: 20 }
      ]
    }
  ],
  attempts: [
    { id: 'at-1', quizId: 'qz-1', user: 'Juan Dela Cruz', started: '2026-11-18 09:00', submitted: '2026-11-18 09:04', answers: { 'qq-1': '0', 'qq-2': '1', 'qq-3': 'Mindanao' }, score: 20, total: 60, percent: 33, passed: false, expired: false, status: 'submitted' },
    { id: 'at-2', quizId: 'qz-1', user: 'Juan Dela Cruz', started: '2026-11-20 10:10', submitted: '2026-11-20 10:13', answers: { 'qq-1': '0', 'qq-2': '0', 'qq-3': 'Luzon' }, score: 60, total: 60, percent: 100, passed: true, expired: false, status: 'submitted' },
    { id: 'at-3', quizId: 'qz-2', user: 'Ana Reyes', started: '2026-11-21 14:00', submitted: '2026-11-21 14:03', answers: { 'qq-4': '1', 'qq-5': '1', 'qq-6': '911' }, score: 75, total: 75, percent: 100, passed: true, expired: false, status: 'submitted' },
    { id: 'at-4', quizId: 'qz-1', user: 'Pedro Reyes', started: '2026-11-19 08:30', submitted: '2026-11-19 08:35', answers: { 'qq-1': '1', 'qq-2': '0', 'qq-3': 'Luzon' }, score: 40, total: 60, percent: 67, passed: true, expired: true, status: 'submitted' }
  ],
  drafts: {},
  activity: [
    { id: 'ac-1', text: 'Juan Dela Cruz passed General Knowledge Check (100%)', module: 'results', time: 'Nov 20, 2026' },
    { id: 'ac-2', text: 'Quiz published: Workplace Safety Basics', module: 'studio', time: 'Nov 12, 2026' },
    { id: 'ac-3', text: 'Draft quiz created: Intro to Algebra (Draft)', module: 'studio', time: 'Nov 19, 2026' }
  ]
};
