import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE = path.join(__dirname, 'data', 'study-besties-db.json');

app.use(express.json({ limit: '10mb' }));

// Initial Seed Data for Deepika and Sonali
function getInitialDbState() {
  const now = new Date().toISOString();
  return {
    deepika: {
      id: 'deepika',
      name: 'Deepika',
      avatar: '🌸',
      pin: '1234',
      bio: 'Dreaming of 98% in CBSE 12th! Physics & Computer Science lover ✨',
      targetPercent: 98,
      favoriteSubject: 'physics',
      theme: 'lavender',
      completedChapters: {
        // Deepika marked Chapter 3 of Physics as complete (per prompt testing scenario)
        'phy-ch3': {
          completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          notes: "Revised Kirchhoff's rules and Wheatstone bridge formula thoroughly!",
        },
      },
      quizAttempts: [
        {
          id: 'attempt-d1',
          studentId: 'deepika',
          chapterId: 'phy-ch3',
          subjectId: 'physics',
          chapterTitle: 'Current Electricity',
          section: 'mcq',
          score: 10,
          totalQuestions: 10,
          attemptedCount: 10,
          userAnswers: {},
          date: new Date(Date.now() - 3600000 * 2).toISOString(),
          timeSpentSeconds: 420,
          passed: true,
        },
      ],
      studyHours: {
        todayHours: 3.5,
        totalHours: 42.5,
        weeklyGoalHours: 25,
        dailyHistory: {
          '2026-11-01': 4.0,
          '2026-11-02': 3.5,
          '2026-11-03': 5.0,
          '2026-11-04': 4.5,
          '2026-11-05': 3.0,
          '2026-11-06': 3.5,
        },
      },
      tasks: [
        {
          id: 'task-d1',
          studentId: 'deepika',
          title: 'Solve 10 written questions of Current Electricity',
          subjectId: 'physics',
          dueDate: '2026-11-07',
          completed: false,
          priority: 'high',
          createdAt: now,
        },
        {
          id: 'task-d2',
          studentId: 'deepika',
          title: 'Revise Python pickle module and file handling modes',
          subjectId: 'computer_science',
          dueDate: '2026-11-08',
          completed: true,
          priority: 'medium',
          createdAt: now,
        },
      ],
      reminders: {
        enabled: true,
        dailyReminderTime: '19:30',
        notifyOnChapterComplete: true,
        notifyOnQuizUnlock: true,
        unfinishedChaptersReminder: true,
      },
      lastActive: now,
    },
    sonali: {
      id: 'sonali',
      name: 'Sonali',
      avatar: '🌺',
      pin: '5678',
      bio: 'Board topper in making! Chemistry and English enthusiast 📖💜',
      targetPercent: 97,
      favoriteSubject: 'chemistry',
      theme: 'soft-purple',
      completedChapters: {
        'chem-ch2': {
          completedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          notes: 'Mastered Nernst Equation and Kohlrausch Law problems.',
        },
      },
      quizAttempts: [
        {
          id: 'attempt-s1',
          studentId: 'sonali',
          chapterId: 'chem-ch2',
          subjectId: 'chemistry',
          chapterTitle: 'Electrochemistry',
          section: 'mcq',
          score: 9,
          totalQuestions: 10,
          attemptedCount: 10,
          userAnswers: {},
          date: new Date(Date.now() - 3600000 * 6).toISOString(),
          timeSpentSeconds: 380,
          passed: true,
        },
      ],
      studyHours: {
        todayHours: 4.0,
        totalHours: 39.0,
        weeklyGoalHours: 25,
        dailyHistory: {
          '2026-11-01': 3.5,
          '2026-11-02': 4.0,
          '2026-11-03': 4.5,
          '2026-11-04': 3.5,
          '2026-11-05': 4.2,
          '2026-11-06': 4.0,
        },
      },
      tasks: [
        {
          id: 'task-s1',
          studentId: 'sonali',
          title: 'Practice Kohlrausch law numericals in Electrochemistry',
          subjectId: 'chemistry',
          dueDate: '2026-11-07',
          completed: true,
          priority: 'high',
          createdAt: now,
        },
        {
          id: 'task-s2',
          studentId: 'sonali',
          title: 'Read Deep Water theme and write Roosevelt quote analysis',
          subjectId: 'english',
          dueDate: '2026-11-08',
          completed: false,
          priority: 'medium',
          createdAt: now,
        },
      ],
      reminders: {
        enabled: true,
        dailyReminderTime: '20:00',
        notifyOnChapterComplete: true,
        notifyOnQuizUnlock: true,
        unfinishedChaptersReminder: true,
      },
      lastActive: now,
    },
    bestieNudges: [
      {
        id: 'nudge-1',
        from: 'deepika',
        to: 'sonali',
        text: 'Hey Sonali! I just solved the Physics Chapter 3 Quiz! Let’s crush Boards together! 🚀',
        emoji: '💜',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        type: 'cheer',
      },
      {
        id: 'nudge-2',
        from: 'sonali',
        to: 'deepika',
        text: 'Proud of you Deepika! Electrochemistry notes are ready for our study session! 🌸',
        emoji: '✨',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'high-five',
      },
    ],
    lastSyncedAt: now,
  };
}

// Read database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDbState();
      writeDb(initial);
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB, falling back to seed:', err);
    return getInitialDbState();
  }
}

// Write database
function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastSyncedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// ---------------- API ROUTES ----------------

// Get full synchronised state
app.get('/api/state', (_req, res) => {
  const db = readDb();
  res.json({ success: true, state: db });
});

// Toggle chapter completion for a specific student (Deepika or Sonali)
app.post('/api/student/:id/chapter-toggle', (req, res) => {
  const studentId = req.params.id as 'deepika' | 'sonali';
  const { chapterId, completed, notes } = req.body;

  if (studentId !== 'deepika' && studentId !== 'sonali') {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const db = readDb();
  const student = db[studentId];

  if (!student.completedChapters) {
    student.completedChapters = {};
  }

  if (completed) {
    student.completedChapters[chapterId] = {
      completedAt: new Date().toISOString(),
      notes: notes || '',
    };
  } else {
    // Unmark chapter for revision
    delete student.completedChapters[chapterId];
  }

  student.lastActive = new Date().toISOString();
  writeDb(db);

  return res.json({
    success: true,
    studentId,
    chapterId,
    completed,
    completedChapters: student.completedChapters,
    state: db,
  });
});

// Record quiz attempt
app.post('/api/student/:id/quiz-attempt', (req, res) => {
  const studentId = req.params.id as 'deepika' | 'sonali';
  const attempt = req.body;

  if (studentId !== 'deepika' && studentId !== 'sonali') {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const db = readDb();
  const student = db[studentId];

  if (!student.quizAttempts) {
    student.quizAttempts = [];
  }

  // Prepend latest attempt
  student.quizAttempts.unshift({
    ...attempt,
    id: attempt.id || `attempt-${Date.now()}`,
    date: attempt.date || new Date().toISOString(),
  });

  student.lastActive = new Date().toISOString();
  writeDb(db);

  return res.json({
    success: true,
    quizAttempts: student.quizAttempts,
    state: db,
  });
});

// Log study hours
app.post('/api/student/:id/study-hours', (req, res) => {
  const studentId = req.params.id as 'deepika' | 'sonali';
  const { addedHours, todayDate } = req.body;

  if (studentId !== 'deepika' && studentId !== 'sonali') {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const db = readDb();
  const student = db[studentId];
  const dateKey = todayDate || new Date().toISOString().split('T')[0];

  student.studyHours.todayHours = (student.studyHours.todayHours || 0) + Number(addedHours);
  student.studyHours.totalHours = (student.studyHours.totalHours || 0) + Number(addedHours);

  if (!student.studyHours.dailyHistory) {
    student.studyHours.dailyHistory = {};
  }
  student.studyHours.dailyHistory[dateKey] = (student.studyHours.dailyHistory[dateKey] || 0) + Number(addedHours);

  student.lastActive = new Date().toISOString();
  writeDb(db);

  return res.json({
    success: true,
    studyHours: student.studyHours,
    state: db,
  });
});

// Manage tasks
app.post('/api/student/:id/tasks', (req, res) => {
  const studentId = req.params.id as 'deepika' | 'sonali';
  const { action, task, taskId } = req.body;

  if (studentId !== 'deepika' && studentId !== 'sonali') {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const db = readDb();
  const student = db[studentId];

  if (!student.tasks) {
    student.tasks = [];
  }

  if (action === 'add' && task) {
    student.tasks.unshift({
      ...task,
      id: `task-${Date.now()}`,
      studentId,
      createdAt: new Date().toISOString(),
    });
  } else if (action === 'toggle' && taskId) {
    const t = student.tasks.find((item: any) => item.id === taskId);
    if (t) t.completed = !t.completed;
  } else if (action === 'delete' && taskId) {
    student.tasks = student.tasks.filter((item: any) => item.id !== taskId);
  }

  student.lastActive = new Date().toISOString();
  writeDb(db);

  return res.json({
    success: true,
    tasks: student.tasks,
    state: db,
  });
});

// Update reminders
app.post('/api/student/:id/reminders', (req, res) => {
  const studentId = req.params.id as 'deepika' | 'sonali';
  const { reminders } = req.body;

  if (studentId !== 'deepika' && studentId !== 'sonali') {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const db = readDb();
  db[studentId].reminders = { ...db[studentId].reminders, ...reminders };
  db[studentId].lastActive = new Date().toISOString();
  writeDb(db);

  return res.json({
    success: true,
    reminders: db[studentId].reminders,
    state: db,
  });
});

// Send Bestie Nudge / Cheer / High-five
app.post('/api/nudge', (req, res) => {
  const { from, to, text, emoji, type } = req.body;
  const db = readDb();

  const newNudge = {
    id: `nudge-${Date.now()}`,
    from,
    to,
    text: text || 'Sending you study bestie energy! ✨',
    emoji: emoji || '💜',
    type: type || 'cheer',
    timestamp: new Date().toISOString(),
  };

  db.bestieNudges.unshift(newNudge);
  // Keep last 30 nudges
  if (db.bestieNudges.length > 30) {
    db.bestieNudges = db.bestieNudges.slice(0, 30);
  }

  writeDb(db);
  return res.json({ success: true, nudge: newNudge, state: db });
});

// Reset demo to fresh state
app.post('/api/reset-demo', (_req, res) => {
  const initial = getInitialDbState();
  writeDb(initial);
  res.json({ success: true, state: initial });
});

// ---------------- VITE & STATIC HANDLING ----------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    // Vite Dev Middleware with HMR disabled to prevent WebSocket errors
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Study Besties full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
