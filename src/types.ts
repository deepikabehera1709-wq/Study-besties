export type StudentId = 'deepika' | 'sonali';

export type SubjectId = 'physics' | 'chemistry' | 'mathematics' | 'computer_science' | 'english';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  code: string;
  color: string;
  gradient: string;
  iconName: string;
  totalChapters: number;
  totalMarks: number;
  theoryMarks: number;
  practicalMarks: number;
}

export interface Chapter {
  id: string; // e.g., 'phy-ch1'
  subjectId: SubjectId;
  chapterNumber: number;
  title: string;
  description: string;
  marksWeightage: number;
  keyTopics: string[];
  unitName: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
  tag: string; // e.g. "CBSE 2024", "CBSE 2023", "CBSE board-style practice"
}

export interface WrittenQuestion {
  id: string;
  marks: 2 | 3 | 5;
  question: string;
  modelAnswer: string;
  markingScheme: string;
  keyPoints: string[];
  tag: string; // e.g. "CBSE board-style practice", "CBSE 2024", etc.
}

export interface ChapterQuestionBank {
  chapterId: string;
  subjectId: SubjectId;
  chapterNumber: number;
  chapterTitle: string;
  status: 'ready' | 'preparing';
  sectionA: MCQQuestion[]; // Exactly 10
  sectionB: WrittenQuestion[]; // Exactly 10
}

export interface QuizAttempt {
  id: string;
  studentId: StudentId;
  chapterId: string;
  subjectId: SubjectId;
  chapterTitle: string;
  section: 'mcq' | 'written';
  score: number; // out of 10
  totalQuestions: number; // 10
  attemptedCount: number;
  userAnswers: Record<string, any>; // questionId -> selectedIndex or written answer string
  date: string; // ISO date
  timeSpentSeconds: number;
  passed: boolean;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  hours: number;
  subjects: Partial<Record<SubjectId, number>>;
}

export interface StudyTask {
  id: string;
  studentId: StudentId;
  title: string;
  subjectId: SubjectId;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface BestieNudge {
  id: string;
  from: StudentId;
  to: StudentId;
  text: string;
  emoji: string;
  timestamp: string;
  type: 'cheer' | 'nudge' | 'high-five' | 'congrats';
}

export interface StudentData {
  id: StudentId;
  name: string;
  avatar: string;
  pin: string; // 4-digit PIN for device switching/verification
  bio: string;
  targetPercent: number;
  favoriteSubject: SubjectId;
  theme: 'lavender' | 'soft-purple' | 'rose-pastel';
  completedChapters: Record<string, { completedAt: string; notes?: string }>;
  quizAttempts: QuizAttempt[];
  studyHours: {
    todayHours: number;
    totalHours: number;
    weeklyGoalHours: number;
    dailyHistory: Record<string, number>; // YYYY-MM-DD -> hours
  };
  tasks: StudyTask[];
  reminders: {
    enabled: boolean;
    dailyReminderTime: string; // e.g. "19:30"
    notifyOnChapterComplete: boolean;
    notifyOnQuizUnlock: boolean;
    unfinishedChaptersReminder: boolean;
  };
  lastActive: string;
}

export interface StudyBestiesState {
  deepika: StudentData;
  sonali: StudentData;
  bestieNudges: BestieNudge[];
  lastSyncedAt: string;
}

export interface CBSEBoardPaper {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  year: string;
  category: 'SQP' | 'PYQ' | 'Marking Scheme' | 'Syllabus';
  title: string;
  officialUrl: string;
  downloadUrl: string;
  description: string;
  examCode: string;
}
