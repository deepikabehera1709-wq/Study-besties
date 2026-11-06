import React, { useState, useEffect } from 'react';
import { Chapter, ChapterQuestionBank, StudentData, QuizAttempt } from '../types';
import { getChapterQuestionBank } from '../data/questionBanks';
import {
  X,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Save,
  Calendar,
} from 'lucide-react';
import SoundEffects from '../utils/sound';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  currentStudent: StudentData;
  onSaveAttempt: (attempt: QuizAttempt) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  chapter,
  currentStudent,
  onSaveAttempt,
}) => {
  if (!isOpen || !chapter) return null;

  const qb: ChapterQuestionBank = getChapterQuestionBank(chapter.id);
  const isBankReady = qb.status === 'ready';

  const [activeSection, setActiveSection] = useState<'mcq' | 'written' | 'history'>('mcq');

  // Section A State (MCQs)
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Section B State (Written)
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [writtenSavedCount, setWrittenSavedCount] = useState(0);

  // Timer
  const [startTime] = useState<number>(Date.now());

  // Past Attempts for this chapter
  const pastAttempts = (currentStudent.quizAttempts || []).filter(
    (a) => a.chapterId === chapter.id
  );

  const bestScore = pastAttempts
    .filter((a) => a.section === 'mcq')
    .reduce((max, a) => Math.max(max, a.score), 0);

  // Reset or initialize on open
  useEffect(() => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
    setWrittenAnswers({});
    setExpandedAnswers({});
  }, [chapter.id]);

  // Handle MCQ Submission
  const handleMcqSubmit = () => {
    let score = 0;
    qb.sectionA.forEach((q) => {
      if (mcqAnswers[q.id] === q.correctAnswerIndex) {
        score += 1;
      }
    });

    setMcqScore(score);
    setMcqSubmitted(true);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    if (score >= 7) {
      SoundEffects.playSuccess();
      SoundEffects.fireConfetti();
    } else {
      SoundEffects.playChime();
    }

    const newAttempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      studentId: currentStudent.id,
      chapterId: chapter.id,
      subjectId: chapter.subjectId,
      chapterTitle: chapter.title,
      section: 'mcq',
      score: score,
      totalQuestions: 10,
      attemptedCount: Object.keys(mcqAnswers).length,
      userAnswers: mcqAnswers,
      date: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      passed: score >= 4,
    };

    onSaveAttempt(newAttempt);
  };

  // Handle Written Answer Save
  const handleSaveWritten = () => {
    const attemptedCount = Object.values(writtenAnswers).filter((t) => t && t.trim().length > 0).length;
    setWrittenSavedCount(attemptedCount);
    SoundEffects.playSuccess();

    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    const newAttempt: QuizAttempt = {
      id: `attempt-written-${Date.now()}`,
      studentId: currentStudent.id,
      chapterId: chapter.id,
      subjectId: chapter.subjectId,
      chapterTitle: chapter.title,
      section: 'written',
      score: attemptedCount, // count of attempted board questions
      totalQuestions: 10,
      attemptedCount: attemptedCount,
      userAnswers: writtenAnswers,
      date: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      passed: true,
    };

    onSaveAttempt(newAttempt);
  };

  const handleRetakeMcq = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
    SoundEffects.playChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-purple-100 dark:border-zinc-800 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-200">
              <span>{chapter.unitName}</span>
              <span>•</span>
              <span>Chapter {chapter.chapterNumber} Independent Quiz</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
              {chapter.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs between Section A, Section B, and History */}
        <div className="flex items-center border-b border-purple-100 dark:border-zinc-800 bg-purple-50/50 dark:bg-zinc-800/40 px-6 py-2.5 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('mcq')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeSection === 'mcq'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-purple-100/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Section A: 10 MCQs</span>
            {mcqSubmitted && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-purple-700 font-extrabold">
                {mcqScore}/10
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('written')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeSection === 'written'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-purple-100/60 dark:hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Section B: 10 Written Questions</span>
          </button>

          <button
            onClick={() => setActiveSection('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeSection === 'history'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-purple-100/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attempts & History ({pastAttempts.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {!isBankReady ? (
            /* Under Preparation Notice (Mandatory by prompt) */
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Question set under preparation
              </h3>
              <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                The CBSE board-style 10 MCQs and 10 written questions for <strong>{chapter.title}</strong> are being verified for 2026-27 accuracy. As per Study Besties rules, generic or duplicate questions are never displayed.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Tip: Try Chapter 3 of Physics, Chapter 2 of Chemistry, Chapter 3 of Maths, Chapter 3 of CS, or Chapter 3 of English!</span>
              </div>
            </div>
          ) : activeSection === 'mcq' ? (
            /* ================= SECTION A: 10 MCQs ================= */
            <div className="space-y-6">
              {/* Score Banner if Submitted */}
              {mcqSubmitted && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-purple-200">
                      Test Submitted
                    </span>
                    <h3 className="text-2xl font-extrabold">
                      Your Score: {mcqScore} / 10
                    </h3>
                    <p className="text-xs text-purple-100 mt-0.5">
                      {mcqScore === 10
                        ? '🌟 Perfect Score! Outstanding mastery of this chapter!'
                        : mcqScore >= 8
                        ? '🎉 Excellent work! Strong command of board concepts.'
                        : mcqScore >= 5
                        ? '👍 Good attempt! Review the detailed explanations below to improve.'
                        : '📖 Need more revision on key formulas and concepts.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRetakeMcq}
                      className="px-4 py-2.5 rounded-xl bg-white text-purple-800 font-bold text-xs shadow-md hover:bg-purple-50 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 10 Questions List */}
              <div className="space-y-6">
                {qb.sectionA.map((q, qIndex) => {
                  const selectedOpt = mcqAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        mcqSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                          : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {/* Question Header & Tag */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          Q{qIndex + 1}. [1 Mark]
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-zinc-700 text-purple-800 dark:text-purple-200">
                          {q.tag}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>

                      {/* 4 Options */}
                      <div className="mt-3.5 space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex;
                          const isOptionRight = q.correctAnswerIndex === optIndex;

                          let optStyles = 'border-zinc-200 dark:border-zinc-700 hover:border-purple-300 bg-white dark:bg-zinc-900';
                          if (mcqSubmitted) {
                            if (isOptionRight) {
                              optStyles = 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              optStyles = 'border-red-500 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 font-medium';
                            }
                          } else if (isOptionSelected) {
                            optStyles = 'border-purple-600 bg-purple-100/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100 font-bold shadow-xs';
                          }

                          return (
                            <button
                              key={optIndex}
                              disabled={mcqSubmitted}
                              onClick={() => {
                                setMcqAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                                SoundEffects.playChime();
                              }}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-3 ${optStyles}`}
                            >
                              <span className="w-5 h-5 rounded-full flex items-center justify-center border text-[11px] font-bold shrink-0">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="flex-1">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Detailed Explanation after Submission */}
                      {mcqSubmitted && (
                        <div className="mt-4 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300">
                          <div className="font-bold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Correct Answer & Step-by-Step Explanation:</span>
                          </div>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit MCQs Button */}
              {!mcqSubmitted ? (
                <div className="sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-purple-200 dark:border-zinc-800 shadow-xl flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    Attempted: <strong>{Object.keys(mcqAnswers).length}</strong> of 10 questions
                  </div>
                  <button
                    onClick={handleMcqSubmit}
                    disabled={Object.keys(mcqAnswers).length === 0}
                    className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition ${
                      Object.keys(mcqAnswers).length > 0
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 active:scale-95'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    Submit MCQ Test & View Explanations
                  </button>
                </div>
              ) : null}
            </div>
          ) : activeSection === 'written' ? (
            /* ================= SECTION B: 10 WRITTEN CBSE BOARD QUESTIONS ================= */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="font-bold text-purple-900 dark:text-purple-200 text-sm mb-1">
                  Section B: CBSE Board-Style Written Examination (10 Questions)
                </div>
                <p>
                  Includes authentic 2-mark, 3-mark, and 5-mark numerical problems, derivations, and reasoning questions. Type your step-wise solution below and compare with official CBSE model answers and marking rubrics!
                </p>
              </div>

              <div className="space-y-6">
                {qb.sectionB.map((q, idx) => {
                  const isExpanded = !!expandedAnswers[q.id];
                  const userText = writtenAnswers[q.id] || '';

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                            Q{idx + 1}.
                          </span>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            {q.marks} Marks
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-semibold">{q.tag}</span>
                      </div>

                      <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>

                      {/* Student Answer Textarea */}
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                          Your Step-Wise Answer / Calculation:
                        </label>
                        <textarea
                          rows={3}
                          value={userText}
                          onChange={(e) =>
                            setWrittenAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Type your derivation steps, formula substitution, or key points here..."
                          className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Toggle Model Answer */}
                      <button
                        onClick={() =>
                          setExpandedAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isExpanded ? 'Hide Model Answer' : 'View Official Model Answer & Marking Scheme'}</span>
                      </button>

                      {/* Model Answer Drawer */}
                      {isExpanded && (
                        <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-zinc-900/80 border border-purple-200 dark:border-zinc-700 text-xs space-y-3">
                          <div>
                            <div className="font-bold text-purple-900 dark:text-purple-200 mb-1">
                              CBSE Model Answer:
                            </div>
                            <pre className="font-sans whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {q.modelAnswer}
                            </pre>
                          </div>

                          <div className="pt-2 border-t border-purple-200/60 dark:border-zinc-800">
                            <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                              Marking Guidance (Step Marking):
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400">{q.markingScheme}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save Written Work Button */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-purple-200 dark:border-zinc-800 shadow-xl flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  {Object.values(writtenAnswers).filter((t) => t.trim().length > 0).length} of 10 written questions attempted
                </div>
                <button
                  onClick={handleSaveWritten}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/30 active:scale-95 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Written Answers to Profile</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= ATTEMPT HISTORY ================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Previous Quiz Attempts ({currentStudent.name})
                </h3>
                <span className="text-xs font-semibold text-purple-600">
                  Best Score: {bestScore}/10
                </span>
              </div>

              {pastAttempts.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-8">
                  No previous attempts recorded for this chapter yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {pastAttempts.map((attempt, i) => (
                    <div
                      key={attempt.id}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>Attempt #{pastAttempts.length - i}</span>
                          <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                            {attempt.section}
                          </span>
                        </div>
                        <div className="text-zinc-500 mt-0.5 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(attempt.date).toLocaleString()}</span>
                          <span>•</span>
                          <span>Time: {Math.round(attempt.timeSpentSeconds / 60)} min</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-extrabold text-purple-600">
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                        <div className="text-[10px] text-zinc-400">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
