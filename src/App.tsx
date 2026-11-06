import React, { useState, useEffect } from 'react';
import { StudyBestiesState, StudentId, Chapter, QuizAttempt, StudyTask, BestieNudge } from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { SharedDashboard } from './components/SharedDashboard';
import { SubjectChapterView } from './components/SubjectChapterView';
import { QuizModal } from './components/QuizModal';
import { StudyPlannerView } from './components/StudyPlannerView';
import { BoardPapersView } from './components/BoardPapersView';
import { PerformanceView } from './components/PerformanceView';
import { StudentSelectorModal } from './components/StudentSelectorModal';
import { RemindersSettingsModal } from './components/RemindersSettingsModal';
import { AndroidInstallGuideModal } from './components/AndroidInstallGuideModal';
import { downloadSourceCodeZip } from './utils/exportZip';
import SoundEffects from './utils/sound';
import { WifiOff, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<StudyBestiesState | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<StudentId>('deepika');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Quiz Modal state
  const [activeQuizChapter, setActiveQuizChapter] = useState<Chapter | null>(null);

  // Modal open states
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // Synchronisation & Online status setup
  useEffect(() => {
    // 1. Initial State Load
    StorageService.loadState().then((state) => {
      setAppState(state);
    });

    // 2. Subscribe to storage updates
    const unsubscribe = StorageService.subscribe((state) => {
      setAppState(state);
    });

    // 3. Online / Offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      StorageService.loadState();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Polling loop every 8 seconds for multi-device sync
    const pollInterval = setInterval(() => {
      if (navigator.onLine) {
        StorageService.loadState();
      }
    }, 8000);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pollInterval);
    };
  }, []);

  if (!appState) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 via-violet-500 to-pink-500 flex items-center justify-center shadow-xl text-white text-2xl animate-bounce">
          ✨
        </div>
        <h2 className="mt-4 font-bold text-zinc-800 dark:text-zinc-200 text-lg">
          Loading Study Besties...
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Connecting to cloud database</p>
      </div>
    );
  }

  const currentStudent = appState[currentStudentId];
  const otherStudentId: StudentId = currentStudentId === 'deepika' ? 'sonali' : 'deepika';
  const otherStudent = appState[otherStudentId];

  // Actions
  const handleToggleChapter = async (chapterId: string, completed: boolean) => {
    await StorageService.toggleChapterCompletion(currentStudentId, chapterId, completed);
  };

  const handleSaveQuizAttempt = async (attempt: QuizAttempt) => {
    await StorageService.saveQuizAttempt(currentStudentId, attempt);
  };

  const handleAddTask = async (task: Partial<StudyTask>) => {
    await StorageService.manageTask(currentStudentId, 'add', task);
  };

  const handleToggleTask = async (taskId: string) => {
    await StorageService.manageTask(currentStudentId, 'toggle', undefined, taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await StorageService.manageTask(currentStudentId, 'delete', undefined, taskId);
  };

  const handleLogHours = async (hours: number) => {
    await StorageService.logStudyHours(currentStudentId, hours);
  };

  const handleSendNudge = async (nudge: Partial<BestieNudge>) => {
    await StorageService.sendBestieNudge(nudge);
  };

  const handleSaveReminders = async (reminders: any) => {
    await StorageService.updateReminders(currentStudentId, reminders);
  };

  const handleDownloadZip = () => {
    downloadSourceCodeZip();
  };

  return (
    <div className="min-h-screen bg-[#fbfbfe] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-purple-200">
      {/* Header */}
      <Header
        currentStudent={currentStudent}
        otherStudent={otherStudent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        onOpenStudentSelector={() => setShowStudentSelector(true)}
        onOpenReminders={() => setShowRemindersModal(true)}
        onOpenAndroidGuide={() => setShowAndroidGuide(true)}
        onDownloadZip={handleDownloadZip}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs py-2 px-4 text-center font-medium shadow-md flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>
            Offline Mode: You are studying offline. Chapter checklists and quiz attempts will be saved locally and synced to the cloud when internet returns.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <SharedDashboard
            currentStudent={currentStudent}
            otherStudent={otherStudent}
            deepika={appState.deepika}
            sonali={appState.sonali}
            bestieNudges={appState.bestieNudges || []}
            onSendNudge={handleSendNudge}
            onNavigateToSubjects={() => setActiveTab('subjects')}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectChapterView
            currentStudent={currentStudent}
            otherStudent={otherStudent}
            onToggleChapter={handleToggleChapter}
            onOpenQuiz={(chapter) => setActiveQuizChapter(chapter)}
          />
        )}

        {activeTab === 'papers' && <BoardPapersView />}

        {activeTab === 'planner' && (
          <StudyPlannerView
            currentStudent={currentStudent}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onLogHours={handleLogHours}
            onNavigateToSubjects={() => setActiveTab('subjects')}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceView
            currentStudent={currentStudent}
            otherStudent={otherStudent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-purple-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-700 dark:text-purple-400">Study Besties</span>
            <span>•</span>
            <span>Deepika & Sonali’s CBSE Class 12 (2026-27) Companion</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowAndroidGuide(true)}
              className="text-purple-600 hover:underline"
            >
              Android APK & Installation Guide
            </button>
            <span>•</span>
            <button
              onClick={handleDownloadZip}
              className="text-purple-600 hover:underline"
            >
              Download Project ZIP
            </button>
            <span>•</span>
            <span>Cloud Sync Active</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Chapter Quiz Modal */}
      <QuizModal
        isOpen={!!activeQuizChapter}
        onClose={() => setActiveQuizChapter(null)}
        chapter={activeQuizChapter}
        currentStudent={currentStudent}
        onSaveAttempt={handleSaveQuizAttempt}
      />

      {/* 2. Student Account Switcher Modal */}
      <StudentSelectorModal
        isOpen={showStudentSelector}
        onClose={() => setShowStudentSelector(false)}
        currentStudentId={currentStudentId}
        deepika={appState.deepika}
        sonali={appState.sonali}
        onSelectStudent={(id) => setCurrentStudentId(id)}
      />

      {/* 3. Reminders & Notifications Modal */}
      <RemindersSettingsModal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
        currentStudent={currentStudent}
        onSaveReminders={handleSaveReminders}
      />

      {/* 4. Android APK & PWA Guide Modal */}
      <AndroidInstallGuideModal
        isOpen={showAndroidGuide}
        onClose={() => setShowAndroidGuide(false)}
        onDownloadZip={handleDownloadZip}
      />
    </div>
  );
}
