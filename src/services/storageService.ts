import { StudyBestiesState, StudentId, QuizAttempt, StudyTask, BestieNudge } from '../types';

const OFFLINE_STORAGE_KEY = 'study_besties_local_cache_v2';
const OFFLINE_QUEUE_KEY = 'study_besties_offline_queue_v2';

interface OfflineAction {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  timestamp: string;
}

// Default fallback state if server is completely unreachable and no local cache exists
const FALLBACK_STATE: StudyBestiesState = {
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
        createdAt: new Date().toISOString(),
      },
    ],
    reminders: {
      enabled: true,
      dailyReminderTime: '19:30',
      notifyOnChapterComplete: true,
      notifyOnQuizUnlock: true,
      unfinishedChaptersReminder: true,
    },
    lastActive: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
      },
    ],
    reminders: {
      enabled: true,
      dailyReminderTime: '20:00',
      notifyOnChapterComplete: true,
      notifyOnQuizUnlock: true,
      unfinishedChaptersReminder: true,
    },
    lastActive: new Date().toISOString(),
  },
  bestieNudges: [
    {
      id: 'nudge-init-1',
      from: 'deepika',
      to: 'sonali',
      text: 'Hey Sonali! I just solved the Physics Chapter 3 Quiz! Let’s crush Boards together! 🚀',
      emoji: '💜',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'cheer',
    },
  ],
  lastSyncedAt: new Date().toISOString(),
};

export class StorageService {
  private static cachedState: StudyBestiesState | null = null;
  private static listeners: Array<(state: StudyBestiesState) => void> = [];

  static subscribe(listener: (state: StudyBestiesState) => void): () => void {
    this.listeners.push(listener);
    if (this.cachedState) {
      listener(this.cachedState);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(state: StudyBestiesState) {
    this.cachedState = state;
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Listener notify error:', err);
      }
    });
  }

  // Fetch initial state from server or offline cache
  static async loadState(): Promise<StudyBestiesState> {
    // Check local storage first
    try {
      const local = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (local) {
        this.cachedState = JSON.parse(local);
      }
    } catch (e) {
      console.warn('Local read error:', e);
    }

    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          this.flushOfflineQueue();
          return json.state;
        }
      }
    } catch (err) {
      console.warn('Network unreachable, using offline state:', err);
    }

    const state = this.cachedState || FALLBACK_STATE;
    this.notify(state);
    return state;
  }

  // Toggle chapter completion
  static async toggleChapterCompletion(
    studentId: StudentId,
    chapterId: string,
    completed: boolean,
    notes?: string
  ): Promise<StudyBestiesState> {
    // Optimistic local update
    const state = this.cachedState ? { ...this.cachedState } : { ...FALLBACK_STATE };
    const student = { ...state[studentId] };
    const completedChapters = { ...student.completedChapters };

    if (completed) {
      completedChapters[chapterId] = {
        completedAt: new Date().toISOString(),
        notes: notes || '',
      };
    } else {
      delete completedChapters[chapterId];
    }

    student.completedChapters = completedChapters;
    student.lastActive = new Date().toISOString();
    state[studentId] = student;
    state.lastSyncedAt = new Date().toISOString();
    this.notify(state);

    // Send to cloud backend
    const payload = { chapterId, completed, notes };
    try {
      const res = await fetch(`/api/student/${studentId}/chapter-toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      } else {
        this.queueOfflineAction(`/api/student/${studentId}/chapter-toggle`, 'POST', payload);
      }
    } catch {
      this.queueOfflineAction(`/api/student/${studentId}/chapter-toggle`, 'POST', payload);
    }

    return state;
  }

  // Record quiz attempt
  static async saveQuizAttempt(studentId: StudentId, attempt: QuizAttempt): Promise<StudyBestiesState> {
    // Optimistic update
    const state = this.cachedState ? { ...this.cachedState } : { ...FALLBACK_STATE };
    const student = { ...state[studentId] };
    const quizAttempts = [attempt, ...(student.quizAttempts || [])];

    student.quizAttempts = quizAttempts;
    student.lastActive = new Date().toISOString();
    state[studentId] = student;
    state.lastSyncedAt = new Date().toISOString();
    this.notify(state);

    // Sync with backend
    try {
      const res = await fetch(`/api/student/${studentId}/quiz-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      } else {
        this.queueOfflineAction(`/api/student/${studentId}/quiz-attempt`, 'POST', attempt);
      }
    } catch {
      this.queueOfflineAction(`/api/student/${studentId}/quiz-attempt`, 'POST', attempt);
    }

    return state;
  }

  // Log study hours
  static async logStudyHours(studentId: StudentId, addedHours: number): Promise<StudyBestiesState> {
    const today = new Date().toISOString().split('T')[0];
    const payload = { addedHours, todayDate: today };

    const state = this.cachedState ? { ...this.cachedState } : { ...FALLBACK_STATE };
    const student = { ...state[studentId] };
    student.studyHours.todayHours = (student.studyHours.todayHours || 0) + addedHours;
    student.studyHours.totalHours = (student.studyHours.totalHours || 0) + addedHours;
    if (!student.studyHours.dailyHistory) student.studyHours.dailyHistory = {};
    student.studyHours.dailyHistory[today] = (student.studyHours.dailyHistory[today] || 0) + addedHours;
    state[studentId] = student;
    this.notify(state);

    try {
      const res = await fetch(`/api/student/${studentId}/study-hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      } else {
        this.queueOfflineAction(`/api/student/${studentId}/study-hours`, 'POST', payload);
      }
    } catch {
      this.queueOfflineAction(`/api/student/${studentId}/study-hours`, 'POST', payload);
    }

    return state;
  }

  // Manage tasks
  static async manageTask(
    studentId: StudentId,
    action: 'add' | 'toggle' | 'delete',
    task?: Partial<StudyTask>,
    taskId?: string
  ): Promise<StudyBestiesState> {
    const payload = { action, task, taskId };

    try {
      const res = await fetch(`/api/student/${studentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      }
    } catch {
      this.queueOfflineAction(`/api/student/${studentId}/tasks`, 'POST', payload);
    }

    return this.cachedState || FALLBACK_STATE;
  }

  // Send Bestie Nudge
  static async sendBestieNudge(nudge: Partial<BestieNudge>): Promise<StudyBestiesState> {
    try {
      const res = await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nudge),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      }
    } catch (e) {
      console.warn('Failed to send nudge:', e);
    }
    return this.cachedState || FALLBACK_STATE;
  }

  // Update Reminders
  static async updateReminders(studentId: StudentId, reminders: any): Promise<StudyBestiesState> {
    try {
      const res = await fetch(`/api/student/${studentId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      }
    } catch (e) {
      console.warn('Failed to update reminders:', e);
    }
    return this.cachedState || FALLBACK_STATE;
  }

  // Reset demo
  static async resetDemo(): Promise<StudyBestiesState> {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          this.notify(json.state);
          return json.state;
        }
      }
    } catch {
      // fallback
    }
    this.notify(FALLBACK_STATE);
    return FALLBACK_STATE;
  }

  // Offline queue management
  private static queueOfflineAction(endpoint: string, method: string, body: any) {
    try {
      const currentQueue: OfflineAction[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      currentQueue.push({
        id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        endpoint,
        method,
        body,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
    } catch (e) {
      console.warn('Queue action failed:', e);
    }
  }

  private static async flushOfflineQueue() {
    try {
      const currentQueue: OfflineAction[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      if (currentQueue.length === 0) return;

      console.log(`📡 Flushing ${currentQueue.length} offline actions to cloud database...`);
      for (const action of currentQueue) {
        try {
          await fetch(action.endpoint, {
            method: action.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.body),
          });
        } catch (e) {
          console.warn('Failed to replay action:', e);
          return; // stop and retry later
        }
      }
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      // Refresh state
      const res = await fetch('/api/state');
      if (res.ok) {
        const json = await res.json();
        if (json.state) this.notify(json.state);
      }
    } catch (e) {
      console.warn('Error flushing queue:', e);
    }
  }
}
