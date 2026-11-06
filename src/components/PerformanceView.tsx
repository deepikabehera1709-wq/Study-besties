import React, { useState } from 'react';
import { StudentData, StudentId, QuizAttempt } from '../types';
import { CBSE_CHAPTERS, SUBJECTS_META } from '../data/cbseData';
import {
  BarChart3,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import SoundEffects from '../utils/sound';

interface PerformanceViewProps {
  currentStudent: StudentData;
  otherStudent: StudentData;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  currentStudent,
  otherStudent,
}) => {
  const [filterSection, setFilterSection] = useState<'all' | 'mcq' | 'written'>('all');

  const attempts = currentStudent.quizAttempts || [];
  const filteredAttempts = attempts.filter((a) =>
    filterSection === 'all' ? true : a.section === filterSection
  );

  const mcqAttempts = attempts.filter((a) => a.section === 'mcq');
  const writtenAttempts = attempts.filter((a) => a.section === 'written');

  const avgMCQ =
    mcqAttempts.length > 0
      ? (mcqAttempts.reduce((acc, a) => acc + a.score, 0) / mcqAttempts.length).toFixed(1)
      : '0.0';

  const bestMCQ = mcqAttempts.reduce((max, a) => Math.max(max, a.score), 0);
  const totalWrittenAttempted = writtenAttempts.reduce((acc, a) => acc + (a.attemptedCount || 0), 0);

  // Chapter-wise Accuracy Breakdown
  const chapterAccuracies: Record<
    string,
    { title: string; subjectId: string; attempts: QuizAttempt[]; bestScore: number; avgScore: number }
  > = {};

  attempts.forEach((a) => {
    if (!chapterAccuracies[a.chapterId]) {
      chapterAccuracies[a.chapterId] = {
        title: a.chapterTitle,
        subjectId: a.subjectId,
        attempts: [],
        bestScore: 0,
        avgScore: 0,
      };
    }
    chapterAccuracies[a.chapterId].attempts.push(a);
  });

  Object.values(chapterAccuracies).forEach((item) => {
    const mcqs = item.attempts.filter((a) => a.section === 'mcq');
    item.bestScore = mcqs.reduce((max, a) => Math.max(max, a.score), 0);
    item.avgScore =
      mcqs.length > 0 ? parseFloat((mcqs.reduce((acc, a) => acc + a.score, 0) / mcqs.length).toFixed(1)) : 0;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MCQ Average */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold mb-2">
            <span>Average MCQ Score</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {avgMCQ} <span className="text-xs text-zinc-400 font-normal">/ 10</span>
          </div>
          <div className="text-[11px] text-purple-600 mt-1 font-semibold">
            Based on {mcqAttempts.length} chapter tests
          </div>
        </div>

        {/* Card 2: Best MCQ Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold mb-2">
            <span>Highest Score</span>
            <Sparkles className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-3xl font-extrabold text-pink-600">
            {bestMCQ} <span className="text-xs text-zinc-400 font-normal">/ 10</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Personal best in board practice
          </div>
        </div>

        {/* Card 3: Written Problems Attempted */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold mb-2">
            <span>Written Questions</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">
            {totalWrittenAttempted}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Solved & self-evaluated
          </div>
        </div>

        {/* Card 4: Study Time Logged */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold mb-2">
            <span>Total Study Hours</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {currentStudent.studyHours?.totalHours || 0}h
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {currentStudent.studyHours?.todayHours || 0} hours logged today
          </div>
        </div>
      </div>

      {/* Chapter-Wise Accuracy & Mastery Matrix */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              📊
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Chapter-Wise Accuracy & Mastery
              </h3>
              <p className="text-xs text-zinc-500">
                Detailed metrics for tested chapters ({currentStudent.name})
              </p>
            </div>
          </div>
          <span className="text-xs text-purple-600 font-semibold">
            {Object.keys(chapterAccuracies).length} chapters tested
          </span>
        </div>

        {Object.keys(chapterAccuracies).length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-400">
            No chapter quizzes attempted yet. Complete a chapter and take its quiz to see accuracy charts!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(chapterAccuracies).map(([chapId, data]) => {
              const subMeta = SUBJECTS_META.find((s) => s.id === data.subjectId);
              return (
                <div
                  key={chapId}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {data.title}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-600">
                      {subMeta?.name}
                    </span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>MCQ Accuracy: {data.avgScore * 10}%</span>
                      <span>Best Score: {data.bestScore}/10</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${data.avgScore * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 flex items-center gap-2 pt-1">
                    <span>Total Attempts: {data.attempts.length}</span>
                    <span>•</span>
                    <span>Last Attempt: {new Date(data.attempts[0].date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Historical Attempts Log with Retake info */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Complete Quiz Attempt History
            </h3>
            <p className="text-xs text-zinc-500">
              Preserved attempt records even after retaking quizzes
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(['all', 'mcq', 'written'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSection(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  filterSection === s
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {s === 'all' ? 'All Sections' : s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-400">
            No quiz attempts recorded matching this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>{attempt.chapterTitle}</span>
                    <span className="uppercase text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                      Section {attempt.section}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(attempt.date).toLocaleString()}</span>
                    <span>•</span>
                    <span>Time Spent: {Math.round(attempt.timeSpentSeconds / 60)} min</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-purple-600">
                    {attempt.score}/{attempt.totalQuestions}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {attempt.section === 'mcq' ? 'MCQ Score' : 'Questions Attempted'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
