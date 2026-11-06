import React, { useState } from 'react';
import { StudentData } from '../types';
import { Bell, Clock, X, Check, ShieldAlert, Sparkles } from 'lucide-react';
import SoundEffects from '../utils/sound';

interface RemindersSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentData;
  onSaveReminders: (reminders: any) => void;
}

export const RemindersSettingsModal: React.FC<RemindersSettingsModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSaveReminders,
}) => {
  const [enabled, setEnabled] = useState(currentStudent.reminders?.enabled ?? true);
  const [reminderTime, setReminderTime] = useState(
    currentStudent.reminders?.dailyReminderTime || '19:30'
  );
  const [notifyOnComplete, setNotifyOnComplete] = useState(
    currentStudent.reminders?.notifyOnChapterComplete ?? true
  );
  const [notifyOnUnlock, setNotifyOnUnlock] = useState(
    currentStudent.reminders?.notifyOnQuizUnlock ?? true
  );
  const [unfinishedChaptersReminder, setUnfinishedChaptersReminder] = useState(
    currentStudent.reminders?.unfinishedChaptersReminder ?? true
  );
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const result = await Notification.requestPermission();
        setPermissionStatus(result);
        if (result === 'granted') {
          new Notification('Study Besties Reminders Activated!', {
            body: `Hi ${currentStudent.name}, daily study notifications set for ${reminderTime}. Keep up the great work! 🌸`,
            icon: '/icon.svg',
          });
          SoundEffects.playSuccess();
        }
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  const handleSave = () => {
    onSaveReminders({
      enabled,
      dailyReminderTime: reminderTime,
      notifyOnChapterComplete: notifyOnComplete,
      notifyOnQuizUnlock: notifyOnUnlock,
      unfinishedChaptersReminder,
    });
    SoundEffects.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 dark:border-zinc-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Study Reminders & Notifications
              </h2>
              <p className="text-xs text-zinc-500">
                Personalized notifications for {currentStudent.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser & Android Permission Banner */}
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-zinc-800/80 border border-purple-100 dark:border-zinc-700 text-xs flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-purple-900 dark:text-purple-200">
              Android System Push Notification Status
            </div>
            <p className="text-zinc-500 mt-0.5">
              Permission: <strong>{permissionStatus}</strong>. Required on Android for daily lockscreen alerts.
            </p>
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-sm whitespace-nowrap"
            >
              Allow Alerts
            </button>
          )}
        </div>

        {/* Reminder Settings Toggles */}
        <div className="space-y-4 text-xs">
          {/* Daily Reminder Time */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                Daily Reminder Time
              </span>
              <span className="text-zinc-400">Choose when you want your daily study alert</span>
            </div>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-purple-700"
            />
          </div>

          {/* Chapter completion alerts */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                Chapter Completion Alerts
              </span>
              <span className="text-zinc-400">Notify your bestie when you finish a chapter</span>
            </div>
            <input
              type="checkbox"
              checked={notifyOnComplete}
              onChange={(e) => setNotifyOnComplete(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded-md cursor-pointer"
            />
          </div>

          {/* Quiz Unlock Alerts */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                Quiz Availability Notifications
              </span>
              <span className="text-zinc-400">Alert immediately when a 10-MCQ test is unlocked</span>
            </div>
            <input
              type="checkbox"
              checked={notifyOnUnlock}
              onChange={(e) => setNotifyOnUnlock(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded-md cursor-pointer"
            />
          </div>

          {/* Unfinished Chapters Reminder */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                Optional Unfinished Chapters Reminder
              </span>
              <span className="text-zinc-400">Nudge on high-weightage pending board chapters</span>
            </div>
            <input
              type="checkbox"
              checked={unfinishedChaptersReminder}
              onChange={(e) => setUnfinishedChaptersReminder(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded-md cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
