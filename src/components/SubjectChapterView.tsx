import React, { useState } from 'react';
import { Chapter, StudentData, SubjectId } from '../types';
import { CBSE_CHAPTERS, SUBJECTS_META } from '../data/cbseData';
import { getChapterQuestionBank } from '../data/questionBanks';
import {
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  Play,
  Calendar,
  Sparkles,
  Info,
  Clock,
  BookOpen,
  HelpCircle,
  Award,
} from 'lucide-react';
import SoundEffects from '../utils/sound';

interface SubjectChapterViewProps {
  currentStudent: StudentData;
  otherStudent: StudentData;
  onToggleChapter: (chapterId: string, completed: boolean) => void;
  onOpenQuiz: (chapter: Chapter) => void;
}

export const SubjectChapterView: React.FC<SubjectChapterViewProps> = ({
  currentStudent,
  otherStudent,
  onToggleChapter,
  onOpenQuiz,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('physics');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSubjectMeta = SUBJECTS_META.find((s) => s.id === selectedSubject)!;
  const filteredChapters = CBSE_CHAPTERS.filter(
    (c) =>
      c.subjectId === selectedSubject &&
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.unitName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completedCount = CBSE_CHAPTERS.filter(
    (c) => c.subjectId === selectedSubject && currentStudent.completedChapters?.[c.id]
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subject Selector Tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-purple-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>CBSE Class 12 Syllabus & Chapters (2026-27)</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Complete chapters in <strong className="text-purple-600">ANY order</strong>. Marking a chapter complete immediately unlocks its independent quiz!
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
            {completedCount} of {currentSubjectMeta.totalChapters} Completed ({currentStudent.name})
          </div>
        </div>

        {/* 5 Subjects Pill Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SUBJECTS_META.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            const subCompleted = CBSE_CHAPTERS.filter(
              (c) => c.subjectId === sub.id && currentStudent.completedChapters?.[c.id]
            ).length;

            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub.id);
                  SoundEffects.playChime();
                }}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-300 bg-white dark:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white mb-1">
                  <span>{sub.name}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">{sub.code}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>
                    {subCompleted}/{sub.totalChapters} done
                  </span>
                  <span className="text-purple-600 font-semibold">
                    {Math.round((subCompleted / sub.totalChapters) * 100)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters Grid / List */}
      <div className="space-y-4">
        {filteredChapters.map((chapter) => {
          const isCompleted = !!currentStudent.completedChapters?.[chapter.id];
          const completedAt = currentStudent.completedChapters?.[chapter.id]?.completedAt;
          const otherCompleted = !!otherStudent.completedChapters?.[chapter.id];
          const otherCompletedAt = otherStudent.completedChapters?.[chapter.id]?.completedAt;

          // Check attempts for this chapter
          const attempts = (currentStudent.quizAttempts || []).filter((a) => a.chapterId === chapter.id);
          const mcqBestScore = attempts
            .filter((a) => a.section === 'mcq')
            .reduce((max, a) => Math.max(max, a.score), -1);

          const qb = getChapterQuestionBank(chapter.id);
          const isBankReady = qb.status === 'ready';

          return (
            <div
              key={chapter.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all ${
                isCompleted
                  ? 'bg-white dark:bg-zinc-900 border-purple-200 dark:border-purple-900/60 shadow-sm'
                  : 'bg-white/80 dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Checkbox and Chapter Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Dedicated Completion Checkbox */}
                  <button
                    onClick={() => {
                      const next = !isCompleted;
                      if (next) {
                        SoundEffects.playSuccess();
                        SoundEffects.fireConfetti();
                      } else {
                        SoundEffects.playChime();
                      }
                      onToggleChapter(chapter.id, next);
                    }}
                    className={`mt-1 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                        : 'border-2 border-zinc-300 dark:border-zinc-700 text-transparent hover:border-purple-500'
                    }`}
                    title={
                      isCompleted
                        ? 'Lesson Completed! Click to unmark if you wish to revise.'
                        : 'Mark lesson as complete to unlock independent quiz.'
                    }
                  >
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {chapter.unitName}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500 font-semibold">
                        Chapter {chapter.chapterNumber}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500">
                        Board Weightage: ~{chapter.marksWeightage} Marks
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{chapter.title}</span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {chapter.description}
                    </p>

                    {/* High-Yield Topics Tags */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {chapter.keyTopics.map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-zinc-800 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-zinc-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Completion Timestamps & Bestie Status */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                      {completedAt && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {currentStudent.name} completed: {new Date(completedAt).toLocaleDateString()}
                          </span>
                        </span>
                      )}

                      {otherCompleted ? (
                        <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-medium">
                          <span>{otherStudent.avatar}</span>
                          <span>
                            {otherStudent.name} completed ({new Date(otherCompletedAt || '').toLocaleDateString()})
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px]">
                          {otherStudent.name} has not finished this chapter yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Independent Quiz Lock/Unlock Box */}
                <div className="lg:w-64 pt-3 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    {isCompleted ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Quiz Unlocked!</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          {isBankReady
                            ? '10 MCQs + 10 Written questions ready'
                            : 'Question set under preparation'}
                        </p>
                        {mcqBestScore >= 0 && (
                          <div className="mt-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                            Best MCQ Score: {mcqBestScore}/10
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Quiz Locked</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Mark checkbox above as completed to unlock Chapter {chapter.chapterNumber} quiz.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Launch Quiz Button */}
                  <div className="mt-3">
                    {isCompleted ? (
                      <button
                        onClick={() => {
                          SoundEffects.playChime();
                          onOpenQuiz(chapter);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Chapter {chapter.chapterNumber} Quiz</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-semibold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Complete Lesson to Unlock</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
