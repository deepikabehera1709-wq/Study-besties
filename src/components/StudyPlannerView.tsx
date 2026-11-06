import React, { useState, useEffect } from 'react';
import { StudentData, SubjectId, StudyTask } from '../types';
import { CBSE_CHAPTERS, SUBJECTS_META } from '../data/cbseData';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Flame,
  Trash2,
} from 'lucide-react';
import SoundEffects from '../utils/sound';

interface StudyPlannerViewProps {
  currentStudent: StudentData;
  onAddTask: (task: Partial<StudyTask>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogHours: (hours: number) => void;
  onNavigateToSubjects: () => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  currentStudent,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onLogHours,
  onNavigateToSubjects,
}) => {
  // Pomodoro / Stopwatch State
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerSubject, setTimerSubject] = useState<SubjectId>('physics');

  // New Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState<SubjectId>('physics');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Manual hours logger input
  const [manualHours, setManualHours] = useState('1.5');

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleStopAndLogTimer = () => {
    setTimerRunning(false);
    const hours = parseFloat((secondsElapsed / 3600).toFixed(2));
    if (hours > 0.05) {
      onLogHours(hours);
      SoundEffects.playSuccess();
      SoundEffects.fireConfetti();
    }
    setSecondsElapsed(0);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      subjectId: newTaskSubject,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      completed: false,
    });
    SoundEffects.playChime();
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  // Pending Chapters (uncompleted chapters)
  const pendingChapters = CBSE_CHAPTERS.filter(
    (c) => !currentStudent.completedChapters?.[c.id]
  );

  // Completed chapters for revision schedule
  const completedChaptersList = CBSE_CHAPTERS.filter(
    (c) => currentStudent.completedChapters?.[c.id]
  ).map((c) => ({
    ...c,
    completedAt: currentStudent.completedChapters[c.id].completedAt,
  }));

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Pomodoro & Daily Hours Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Study Pomodoro Stopwatch */}
        <div className="md:col-span-2 bg-gradient-to-br from-purple-700 via-violet-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">
                ⏱️
              </span>
              <span className="font-extrabold text-sm uppercase tracking-wider text-purple-200">
                Focus Study Timer (Pomodoro)
              </span>
            </div>
            <select
              value={timerSubject}
              onChange={(e) => setTimerSubject(e.target.value as SubjectId)}
              className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/30 focus:outline-hidden"
            >
              {SUBJECTS_META.map((s) => (
                <option key={s.id} value={s.id} className="text-zinc-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="my-6 text-center">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight drop-shadow-md">
              {formatTimer(secondsElapsed)}
            </div>
            <p className="text-xs text-purple-200 mt-2">
              Studying: <strong>{SUBJECTS_META.find((s) => s.id === timerSubject)?.name}</strong> • Time will be added to your profile & best-friend dashboard
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {!timerRunning ? (
              <button
                onClick={() => {
                  setTimerRunning(true);
                  SoundEffects.playChime();
                }}
                className="px-6 py-3 rounded-2xl bg-white text-purple-800 font-bold text-sm shadow-md hover:bg-purple-50 active:scale-95 transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-purple-800" />
                <span>Start Studying</span>
              </button>
            ) : (
              <button
                onClick={() => setTimerRunning(false)}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-zinc-900 font-bold text-sm shadow-md hover:bg-amber-300 active:scale-95 transition flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            {secondsElapsed > 0 && (
              <button
                onClick={handleStopAndLogTimer}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log Study Session</span>
              </button>
            )}

            <button
              onClick={() => {
                setTimerRunning(false);
                setSecondsElapsed(0);
              }}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Study Hours Quick Logger */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-base mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Today’s Study Hours</span>
            </div>
            <p className="text-xs text-zinc-500">
              Tracked for {currentStudent.name}
            </p>

            <div className="my-4 text-center">
              <div className="text-4xl font-extrabold text-purple-600">
                {currentStudent.studyHours?.todayHours || 0} hrs
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Total All-Time: {currentStudent.studyHours?.totalHours || 0} hours
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-purple-50 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Quick Log Hours:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[0.5, 1.0, 2.0].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    onLogHours(h);
                    SoundEffects.playSuccess();
                  }}
                  className="py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 transition"
                >
                  +{h}h
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Study Tasks Checklist */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Daily Study Tasks & Checklist
              </h3>
              <p className="text-xs text-zinc-500">
                Personal task list for {currentStudent.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {(currentStudent.tasks || []).length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No tasks scheduled. Tap &quot;Add Study Task&quot; above to set targets!
            </div>
          ) : (
            currentStudent.tasks.map((task) => {
              const subMeta = SUBJECTS_META.find((s) => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-purple-50/40 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800 opacity-70'
                      : 'bg-white dark:bg-zinc-900 border-purple-100 dark:border-zinc-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => {
                        onToggleTask(task.id);
                        SoundEffects.playChime();
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                        task.completed
                          ? 'bg-purple-600 text-white'
                          : 'border-2 border-zinc-300 dark:border-zinc-700 hover:border-purple-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <span
                        className={`text-sm font-semibold text-zinc-900 dark:text-white ${
                          task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {subMeta?.name}
                        </span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-sm text-[9px] uppercase font-bold ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onDeleteTask(task.id);
                      SoundEffects.playChime();
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Spaced Repetition Revision Schedule & Pending Chapters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revision Schedule */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              🔄
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                Spaced Repetition Revision Calendar
              </h3>
              <p className="text-xs text-zinc-500">Scientifically planned review intervals (1, 3, 7, 21 days)</p>
            </div>
          </div>

          {completedChaptersList.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No completed chapters yet to schedule for revision. Check off chapters in the Syllabus tab!
            </div>
          ) : (
            <div className="space-y-3">
              {completedChaptersList.slice(0, 5).map((chap) => {
                const compDate = new Date(chap.completedAt || '');
                const rev1 = new Date(compDate.getTime() + 86400000).toLocaleDateString();
                const rev7 = new Date(compDate.getTime() + 7 * 86400000).toLocaleDateString();

                return (
                  <div
                    key={chap.id}
                    className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-zinc-800/40 border border-purple-100 dark:border-zinc-800 text-xs"
                  >
                    <div className="font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                      <span>{chap.title}</span>
                      <span className="text-[10px] text-purple-600 font-semibold">{chap.unitName}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>1st Review: <strong>{rev1}</strong></span>
                      <span>•</span>
                      <span>Next Deep Review: <strong>{rev7}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Chapters Audit */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                ⏳
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  Pending Chapters List ({pendingChapters.length})
                </h3>
                <p className="text-xs text-zinc-500">Remaining to be finished</p>
              </div>
            </div>
            <button
              onClick={onNavigateToSubjects}
              className="text-xs font-semibold text-purple-600 hover:underline"
            >
              Start One →
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {pendingChapters.slice(0, 8).map((ch) => {
              const subMeta = SUBJECTS_META.find((s) => s.id === ch.subjectId);
              return (
                <div
                  key={ch.id}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {ch.title}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {subMeta?.name} • Weightage: ~{ch.marksWeightage} Marks
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold">
                    Incomplete
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-purple-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              Add New Study Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Solve Ray Optics derivations"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    Subject
                  </label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value as SubjectId)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                  >
                    {SUBJECTS_META.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
