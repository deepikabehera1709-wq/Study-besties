import React, { useState } from 'react';
import { StudentData, StudentId, BestieNudge } from '../types';
import { CBSE_CHAPTERS, SUBJECTS_META } from '../data/cbseData';
import {
  Users,
  Trophy,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  Heart,
  Flame,
} from 'lucide-react';
import SoundEffects from '../utils/sound';

interface SharedDashboardProps {
  currentStudent: StudentData;
  otherStudent: StudentData;
  deepika: StudentData;
  sonali: StudentData;
  bestieNudges: BestieNudge[];
  onSendNudge: (nudge: Partial<BestieNudge>) => void;
  onNavigateToSubjects: () => void;
}

export const SharedDashboard: React.FC<SharedDashboardProps> = ({
  currentStudent,
  otherStudent,
  deepika,
  sonali,
  bestieNudges,
  onSendNudge,
  onNavigateToSubjects,
}) => {
  const [nudgeText, setNudgeText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💜');

  // Metrics Calculation
  const totalChaptersCount = CBSE_CHAPTERS.length; // 65 chapters across 5 subjects

  const deepikaLessons = Object.keys(deepika.completedChapters || {}).length;
  const sonaliLessons = Object.keys(sonali.completedChapters || {}).length;

  const deepikaMCQAttempts = (deepika.quizAttempts || []).filter((a) => a.section === 'mcq');
  const sonaliMCQAttempts = (sonali.quizAttempts || []).filter((a) => a.section === 'mcq');

  const deepikaAvgMCQ =
    deepikaMCQAttempts.length > 0
      ? (deepikaMCQAttempts.reduce((acc, curr) => acc + curr.score, 0) / deepikaMCQAttempts.length).toFixed(1)
      : '0.0';

  const sonaliAvgMCQ =
    sonaliMCQAttempts.length > 0
      ? (sonaliMCQAttempts.reduce((acc, curr) => acc + curr.score, 0) / sonaliMCQAttempts.length).toFixed(1)
      : '0.0';

  const deepikaWrittenAttempts = (deepika.quizAttempts || []).filter((a) => a.section === 'written');
  const sonaliWrittenAttempts = (sonali.quizAttempts || []).filter((a) => a.section === 'written');

  const deepikaWrittenCount = deepikaWrittenAttempts.reduce((acc, curr) => acc + (curr.attemptedCount || 0), 0);
  const sonaliWrittenCount = sonaliWrittenAttempts.reduce((acc, curr) => acc + (curr.attemptedCount || 0), 0);

  const deepikaHours = deepika.studyHours?.totalHours || 0;
  const sonaliHours = sonali.studyHours?.totalHours || 0;

  const deepikaTodayHours = deepika.studyHours?.todayHours || 0;
  const sonaliTodayHours = sonali.studyHours?.todayHours || 0;

  // Weekly days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSendNudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nudgeText.trim()) return;

    SoundEffects.playNudge();
    onSendNudge({
      from: currentStudent.id,
      to: otherStudent.id,
      text: nudgeText.trim(),
      emoji: selectedEmoji,
      type: 'cheer',
    });
    setNudgeText('');
  };

  const quickHighFive = () => {
    SoundEffects.playSuccess();
    SoundEffects.fireConfetti();
    onSendNudge({
      from: currentStudent.id,
      to: otherStudent.id,
      text: `${currentStudent.name} sent you a High-Five! You're crushing CBSE Class 12 prep! 🎉`,
      emoji: '🙌',
      type: 'high-five',
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Besties Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shared Best-Friend Study Space</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Deepika & Sonali’s Board Mastery Hub 🌸🌺
            </h2>
            <p className="mt-2 text-sm text-purple-100 leading-relaxed">
              Real-time synchronised study tracking for all 5 CBSE Class 12 subjects. Track lessons, independent chapter quizzes, and motivate each other to that 98%+ goal!
            </p>
          </div>

          {/* Quick Action Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={quickHighFive}
              className="px-5 py-3 rounded-2xl bg-white text-purple-800 font-bold text-sm shadow-lg hover:bg-purple-50 active:scale-95 transition flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-pink-600 fill-pink-500" />
              <span>Send High-Five to {otherStudent.name}</span>
            </button>
            <button
              onClick={onNavigateToSubjects}
              className="px-5 py-3 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Chapters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Comparison Metric Matrix (Required by Prompt) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Live Best-Friend Comparison Dashboard
              </h3>
              <p className="text-xs text-zinc-500">Synchronised across separate devices in real time</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            CBSE 2026-27
          </span>
        </div>

        {/* Table Comparison on desktop & responsive cards on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-4 px-4 sm:px-6">Metric</th>
                <th className="py-4 px-4 sm:px-6">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-xs">
                      🌸
                    </span>
                    Deepika {currentStudent.id === 'deepika' && <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-sm">You</span>}
                  </div>
                </th>
                <th className="py-4 px-4 sm:px-6">
                  <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-xs">
                      🌺
                    </span>
                    Sonali {currentStudent.id === 'sonali' && <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-sm">You</span>}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-zinc-800/60 text-sm">
              {/* Row 1: Lessons completed */}
              <tr className="hover:bg-purple-50/40 dark:hover:bg-zinc-800/40 transition">
                <td className="py-4 px-4 sm:px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Lessons Completed
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-purple-600">{deepikaLessons}</span>
                    <span className="text-xs text-zinc-400">/ {totalChaptersCount} chapters</span>
                  </div>
                  <div className="w-36 h-2 bg-purple-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (deepikaLessons / totalChaptersCount) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-violet-600">{sonaliLessons}</span>
                    <span className="text-xs text-zinc-400">/ {totalChaptersCount} chapters</span>
                  </div>
                  <div className="w-36 h-2 bg-purple-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (sonaliLessons / totalChaptersCount) * 100)}%` }}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 2: MCQ scores */}
              <tr className="hover:bg-purple-50/40 dark:hover:bg-zinc-800/40 transition">
                <td className="py-4 px-4 sm:px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-pink-600" />
                  MCQ Scores (Avg / Total Attempts)
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{deepikaAvgMCQ}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 font-semibold">
                      {deepikaMCQAttempts.length} tests taken
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{sonaliAvgMCQ}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-semibold">
                      {sonaliMCQAttempts.length} tests taken
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 3: Written questions attempted */}
              <tr className="hover:bg-purple-50/40 dark:hover:bg-zinc-800/40 transition">
                <td className="py-4 px-4 sm:px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Written Questions Attempted
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{deepikaWrittenCount}</span>
                  <span className="text-xs text-zinc-400 ml-1.5">board problems solved</span>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{sonaliWrittenCount}</span>
                  <span className="text-xs text-zinc-400 ml-1.5">board problems solved</span>
                </td>
              </tr>

              {/* Row 4: Study hours */}
              <tr className="hover:bg-purple-50/40 dark:hover:bg-zinc-800/40 transition">
                <td className="py-4 px-4 sm:px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Study Hours (Today / Total)
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-amber-600">{deepikaTodayHours}h</span>
                    <span className="text-xs text-zinc-400">today</span>
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">({deepikaHours}h total)</span>
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-amber-600">{sonaliTodayHours}h</span>
                    <span className="text-xs text-zinc-400">today</span>
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">({sonaliHours}h total)</span>
                  </div>
                </td>
              </tr>

              {/* Row 5: Weekly Progress */}
              <tr className="hover:bg-purple-50/40 dark:hover:bg-zinc-800/40 transition">
                <td className="py-4 px-4 sm:px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Weekly Progress (Hours/Day)
                </td>
                <td className="py-4 px-4 sm:px-6">
                  {/* Deepika 7-day mini chart */}
                  <div className="flex items-end gap-1 h-12 pt-2">
                    {last7Days.map((dStr, idx) => {
                      const h = deepika.studyHours?.dailyHistory?.[dStr] || 0;
                      const maxH = 6;
                      const pct = Math.min(100, (h / maxH) * 100);
                      const dObj = new Date(dStr);
                      return (
                        <div key={dStr} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full bg-purple-100 dark:bg-zinc-800 rounded-t-sm h-10 flex items-end">
                            <div
                              className="w-full bg-purple-600 rounded-t-sm transition-all"
                              style={{ height: `${Math.max(10, pct)}%` }}
                              title={`${dStr}: ${h} hours`}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400">{dayLabels[dObj.getDay()]}</span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  {/* Sonali 7-day mini chart */}
                  <div className="flex items-end gap-1 h-12 pt-2">
                    {last7Days.map((dStr, idx) => {
                      const h = sonali.studyHours?.dailyHistory?.[dStr] || 0;
                      const maxH = 6;
                      const pct = Math.min(100, (h / maxH) * 100);
                      const dObj = new Date(dStr);
                      return (
                        <div key={dStr} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full bg-purple-100 dark:bg-zinc-800 rounded-t-sm h-10 flex items-end">
                            <div
                              className="w-full bg-violet-600 rounded-t-sm transition-all"
                              style={{ height: `${Math.max(10, pct)}%` }}
                              title={`${dStr}: ${h} hours`}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400">{dayLabels[dObj.getDay()]}</span>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Bestie Cheer Stream & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bestie Cheer & Study Nudges */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-pink-500" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                Bestie Study Cheers & Nudges
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400">Live synchronized</span>
          </div>

          {/* Cheer Feed */}
          <div className="flex-1 space-y-3 max-h-72 overflow-y-auto pr-1">
            {bestieNudges.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No cheers sent yet. Send the first high-five!</p>
            ) : (
              bestieNudges.map((nudge) => {
                const isFromDeepika = nudge.from === 'deepika';
                const isMine = nudge.from === currentStudent.id;
                return (
                  <div
                    key={nudge.id}
                    className={`p-3.5 rounded-2xl border text-xs transition ${
                      isMine
                        ? 'bg-purple-50/70 border-purple-200 dark:bg-purple-950/30 dark:border-zinc-800 ml-4'
                        : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{nudge.emoji}</span>
                        <span className={isFromDeepika ? 'text-pink-600' : 'text-violet-600'}>
                          {isFromDeepika ? 'Deepika' : 'Sonali'}
                        </span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        {new Date(nudge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{nudge.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Cheer Form */}
          <form onSubmit={handleSendNudge} className="mt-4 pt-4 border-t border-purple-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              {['💜', '✨', '🚀', '🔥', '🌸', '🙌'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                    selectedEmoji === emoji ? 'bg-purple-200 dark:bg-purple-900 scale-110' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nudgeText}
                onChange={(e) => setNudgeText(e.target.value)}
                placeholder={`Cheer on ${otherStudent.name}...`}
                className="flex-1 px-4 py-2 rounded-xl border border-purple-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* 5 Subjects Completion Overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                Subject Completion Breakdown
              </h3>
            </div>
            <button
              onClick={onNavigateToSubjects}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View All Chapters →
            </button>
          </div>

          <div className="space-y-4">
            {SUBJECTS_META.map((sub) => {
              const subChapters = CBSE_CHAPTERS.filter((c) => c.subjectId === sub.id);
              const deepikaSubCount = subChapters.filter((c) => deepika.completedChapters?.[c.id]).length;
              const sonaliSubCount = subChapters.filter((c) => sonali.completedChapters?.[c.id]).length;

              return (
                <div key={sub.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-zinc-900 dark:text-white">{sub.name} ({sub.code})</span>
                    <span className="text-zinc-400 text-[11px]">{sub.totalChapters} chapters</span>
                  </div>

                  {/* Deepika Bar */}
                  <div className="flex items-center gap-2 text-[11px] mb-1.5">
                    <span className="w-16 font-semibold text-pink-600">Deepika:</span>
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full transition-all"
                        style={{ width: `${(deepikaSubCount / sub.totalChapters) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-zinc-500">{deepikaSubCount}/{sub.totalChapters}</span>
                  </div>

                  {/* Sonali Bar */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 font-semibold text-violet-600">Sonali:</span>
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all"
                        style={{ width: `${(sonaliSubCount / sub.totalChapters) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-zinc-500">{sonaliSubCount}/{sub.totalChapters}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
