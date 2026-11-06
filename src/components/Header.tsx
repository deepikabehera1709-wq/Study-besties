import React from 'react';
import { StudentData, StudentId } from '../types';
import {
  Sparkles,
  Wifi,
  WifiOff,
  Download,
  Smartphone,
  Volume2,
  VolumeX,
  Bell,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  BarChart3,
  FileText,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import SoundEffects from '../utils/sound';

interface HeaderProps {
  currentStudent: StudentData;
  otherStudent: StudentData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  onOpenStudentSelector: () => void;
  onOpenReminders: () => void;
  onOpenAndroidGuide: () => void;
  onDownloadZip: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStudent,
  otherStudent,
  activeTab,
  setActiveTab,
  isOnline,
  onOpenStudentSelector,
  onOpenReminders,
  onOpenAndroidGuide,
  onDownloadZip,
  soundEnabled,
  setSoundEnabled,
}) => {
  const { isInstallable, install } = usePWAInstall();

  const navItems = [
    { id: 'dashboard', label: 'Besties Hub', icon: Users },
    { id: 'subjects', label: 'CBSE Chapters & Quizzes', icon: BookOpen },
    { id: 'papers', label: 'CBSE Board Papers', icon: FileText },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'performance', label: 'My Performance', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-purple-100 dark:border-zinc-800 shadow-sm transition-colors">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-bold text-xl select-none">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                Study Besties
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                CBSE Class 12 (2026-27)
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Deepika & Sonali’s Shared Study Ecosystem
            </p>
          </div>
        </div>

        {/* Actions & Profiles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online / Offline Sync Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
            }`}
            title={isOnline ? 'Cloud database connected (real-time sync)' : 'Offline mode — changes cached locally'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isOnline ? 'Cloud Synced' : 'Offline Mode'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              SoundEffects.enabled = next;
              if (next) SoundEffects.playChime();
            }}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-zinc-800 transition"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Study Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reminders Button */}
          <button
            onClick={onOpenReminders}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-zinc-800 transition relative"
            title="Study Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            {currentStudent.reminders.enabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
            )}
          </button>

          {/* Android PWA / APK Guide Button */}
          <button
            onClick={onOpenAndroidGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 dark:hover:bg-purple-900/60 transition"
            title="Android APK, PWA & Installation Guide"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android & APK</span>
          </button>

          {/* Download Project ZIP */}
          <button
            onClick={onDownloadZip}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            title="Download complete project source ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>

          {/* Current Active Student Selector Card */}
          <div
            onClick={onOpenStudentSelector}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-purple-200/80 dark:border-zinc-700 cursor-pointer transition select-none shadow-xs"
            title="Switch between Deepika and Sonali profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-sm shadow-inner">
              {currentStudent.avatar}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                {currentStudent.name}
                <span className="text-[10px] text-purple-600 font-normal">Active</span>
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Tap to Switch
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-50 dark:border-zinc-800/60">
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (soundEnabled) SoundEffects.playChime();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600 hover:bg-purple-50/80 dark:hover:bg-zinc-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
