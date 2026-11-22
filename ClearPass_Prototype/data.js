/* ClearPass prototype seed data. Loaded before app.js via a plain <script> tag. */

const CLEARPASS_SEED = {
  role: "student",
  items: [
    {
      id: "it-1",
      name: "Library Book — Introduction to Algorithms",
      code: "LIB-8821",
      location: "University Library",
      requested: "2026-10-12",
      status: "pending",
      note: "Return to the circulation counter by 2026-11-25.",
      history: [{ date: "2026-10-12", event: "Item request recorded" }]
    },
    {
      id: "it-2",
      name: "Safety Goggles",
      code: "LAB-1104",
      location: "Science Laboratory 1",
      requested: "2026-10-18",
      status: "pending",
      note: "Return to the lab-in-charge after the practical exam.",
      history: [{ date: "2026-10-18", event: "Item request recorded" }]
    },
    {
      id: "it-3",
      name: "Student ID Lanyard (replacement)",
      code: "ADM-2041",
      location: "Admission Office",
      requested: "2026-09-28",
      status: "claimed",
      claimedDate: "2026-10-02",
      note: "Lost-ID replacement.",
      history: [
        { date: "2026-10-02", event: "Marked as claimed by student" },
        { date: "2026-09-28", event: "Item request recorded" }
      ]
    },
    {
      id: "it-4",
      name: "Microscope Kit",
      code: "LAB-3310",
      location: "Science Laboratory 2",
      requested: "2026-09-15",
      status: "claimed",
      claimedDate: "2026-09-20",
      note: "Used for Biology lab activities.",
      history: [
        { date: "2026-09-20", event: "Marked as claimed by student" },
        { date: "2026-09-15", event: "Item request recorded" }
      ]
    }
  ],

  duties: [
    {
      id: "du-1",
      title: "Classroom Cleaning — Room 301",
      location: "Building A, Room 301",
      assigned: "2026-11-18",
      status: "pending",
      note: "Wipe the board, sweep the floor, and arrange the chairs."
    },
    {
      id: "du-2",
      title: "Lab Equipment Tidy-Up",
      location: "Science Laboratory 2",
      assigned: "2026-11-20",
      status: "pending",
      note: "Return all tools to their labeled cabinets."
    },
    {
      id: "du-3",
      title: "Garden Area Cleanup",
      location: "Quadrangle",
      assigned: "2026-11-10",
      status: "done",
      submitted: "2026-11-10",
      note: "Weeded and swept the area."
    },
    {
      id: "du-4",
      title: "Desk Sanitizing",
      location: "Building B, Room 205",
      assigned: "2026-11-04",
      status: "done",
      submitted: "2026-11-05",
      note: "Sanitized all desks and chairs."
    }
  ],

  services: [
    { id: "sv-1", name: "Registrar's Office", code: "REG", description: "Enrollment, grades, and student records", hours: "8:00 AM – 5:00 PM", queueNext: 42, icon: "file" },
    { id: "sv-2", name: "Cashier", code: "CAS", description: "Payments and official receipts", hours: "8:00 AM – 4:00 PM", queueNext: 18, icon: "wallet" },
    { id: "sv-3", name: "Guidance Counseling", code: "GDC", description: "Academic and personal advising", hours: "9:00 AM – 4:00 PM", queueNext: 7, icon: "heart" },
    { id: "sv-4", name: "IT Help Desk", code: "ITH", description: "Accounts, Wi-Fi, and campus devices", hours: "8:00 AM – 5:00 PM", queueNext: 25, icon: "monitor" },
    { id: "sv-5", name: "Library Counter", code: "LIB", description: "Borrowing, returns, and reservations", hours: "7:30 AM – 6:00 PM", queueNext: 33, icon: "book" },
    { id: "sv-6", name: "Medical Clinic", code: "MED", description: "Consultation and basic care", hours: "8:00 AM – 3:00 PM", queueNext: 12, icon: "plus" }
  ],

  tokens: [
    { id: "tk-1", number: "REG-041", service: "Registrar's Office", time: "2026-11-20 09:15", status: "Served" }
  ],

  quizzes: [
    {
      id: "qz-1",
      title: "Data Structures Basics",
      visibility: "public",
      items: 20,
      topic: "Computer Science",
      attempts: [{ date: "2026-11-14", score: 17, total: 20, percent: 85 }]
    },
    {
      id: "qz-2",
      title: "SQL Fundamentals",
      visibility: "private",
      items: 15,
      topic: "Database Systems",
      attempts: []
    },
    {
      id: "qz-3",
      title: "Campus Policies & Ethics",
      visibility: "public",
      items: 10,
      topic: "General Education",
      attempts: [
        { date: "2026-11-02", score: 9, total: 10, percent: 90 },
        { date: "2026-10-20", score: 7, total: 10, percent: 70 }
      ]
    },
    {
      id: "qz-4",
      title: "Web Development Intro",
      visibility: "public",
      items: 12,
      topic: "Information Technology",
      attempts: []
    }
  ],

  quizQuestions: {
    "qz-1": [
      { q: "Which structure follows LIFO order?", options: ["Queue", "Stack", "Linked List", "Tree"], answer: 1 },
      { q: "What is the average time complexity of binary search?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 2 },
      { q: "Which traversal visits the root first?", options: ["Inorder", "Postorder", "Level order", "Preorder"], answer: 3 }
    ],
    "qz-2": [
      { q: "Which SQL clause filters grouped rows?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1 },
      { q: "Which key uniquely identifies a table row?", options: ["Foreign key", "Primary key", "Check key", "Index key"], answer: 1 },
      { q: "Which JOIN returns all rows from the left table?", options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"], answer: 2 }
    ],
    "qz-3": [
      { q: "What should a student do first when disrespect is observed?", options: ["Ignore it", "Report it through proper channels", "Post it online", "Confront aggressively"], answer: 1 },
      { q: "Academic integrity mainly requires…", options: ["Memorizing answers", "Honest work and proper citation", "Fast submission", "Group answers"], answer: 1 },
      { q: "Where is the campus code of conduct published?", options: ["Student handbook", "Canteen menu", "Dormitory notice", "Library shelf"], answer: 0 }
    ],
    "qz-4": [
      { q: "Which language structures a web page?", options: ["CSS", "HTML", "SQL", "Python"], answer: 1 },
      { q: "What does CSS primarily control?", options: ["Data storage", "Presentation and layout", "Server logic", "File compression"], answer: 1 },
      { q: "Which tag creates a hyperlink?", options: ["<a>", "<link>", "<href>", "<url>"], answer: 0 }
    ]
  },

  balances: [
    {
      id: "bl-1",
      name: "Tuition Fee — 2nd Semester",
      total: 15000,
      paid: 10000,
      due: "2026-12-15",
      history: [
        { date: "2026-11-01", amount: 5000, note: "Partial payment" },
        { date: "2026-10-01", amount: 5000, note: "Initial payment" }
      ]
    },
    {
      id: "bl-2",
      name: "Laboratory Fee",
      total: 2500,
      paid: 0,
      due: "2026-11-30",
      history: []
    },
    {
      id: "bl-3",
      name: "Library Fines",
      total: 300,
      paid: 300,
      due: "2026-10-31",
      history: [{ date: "2026-10-25", amount: 300, note: "Full payment" }]
    },
    {
      id: "bl-4",
      name: "Dormitory Fee",
      total: 8000,
      paid: 4000,
      due: "2026-12-01",
      history: [{ date: "2026-10-15", amount: 4000, note: "Partial payment" }]
    }
  ],

  concerns: [
    {
      id: "cn-1",
      title: "Broken chair in Room 301",
      category: "Facilities",
      date: "2026-11-15",
      status: "open",
      description: "One chair in the back row is broken and unsafe to use."
    },
    {
      id: "cn-2",
      title: "Missing lab report feedback",
      category: "Academics",
      date: "2026-11-12",
      status: "open",
      description: "I have not received comments for Lab Report 3 yet."
    },
    {
      id: "cn-3",
      title: "Wi-Fi issue at the Library",
      category: "IT Services",
      date: "2026-11-08",
      status: "resolved",
      resolvedDate: "2026-11-09",
      description: "Could not connect to the campus Wi-Fi network."
    },
    {
      id: "cn-4",
      title: "Fan not working in Lab 2",
      category: "Facilities",
      date: "2026-10-30",
      status: "resolved",
      resolvedDate: "2026-11-02",
      description: "The ceiling fan stopped working during the lab session."
    }
  ],

  activity: [
    { id: "ac-1", text: "Library Book — Introduction to Algorithms is still pending", module: "items", time: "Today, 08:10" },
    { id: "ac-2", text: "Partial payment of ₱5,000.00 recorded for Tuition Fee", module: "balances", time: "Yesterday, 16:42" },
    { id: "ac-3", text: "Cleaning duty submitted for Garden Area Cleanup", module: "duties", time: "Nov 10, 2026" },
    { id: "ac-4", text: "Queue token REG-041 was served", module: "services", time: "Nov 20, 2026" }
  ]
};
