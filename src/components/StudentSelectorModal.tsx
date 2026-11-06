import React, { useState } from 'react';
import { StudentData, StudentId } from '../types';
import { ShieldCheck, UserCheck, KeyRound, X, AlertCircle } from 'lucide-react';
import SoundEffects from '../utils/sound';

interface StudentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudentId: StudentId;
  deepika: StudentData;
  sonali: StudentData;
  onSelectStudent: (id: StudentId) => void;
}

export const StudentSelectorModal: React.FC<StudentSelectorModalProps> = ({
  isOpen,
  onClose,
  currentStudentId,
  deepika,
  sonali,
  onSelectStudent,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<StudentId | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentClick = (id: StudentId) => {
    if (id === currentStudentId) {
      onClose();
      return;
    }
    setSelectedTarget(id);
    setPinInput('');
    setErrorMsg('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    const targetStudent = selectedTarget === 'deepika' ? deepika : sonali;
    const requiredPin = targetStudent.pin || (selectedTarget === 'deepika' ? '1234' : '5678');

    if (pinInput.trim() === requiredPin) {
      SoundEffects.playSuccess();
      onSelectStudent(selectedTarget);
      setSelectedTarget(null);
      setPinInput('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg(`Incorrect PIN for ${targetStudent.name}! (Default PIN: ${requiredPin})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 dark:border-zinc-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Student Account Login</h2>
              <p className="text-xs text-zinc-500">Switch profile on this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Deepika Card */}
          <div
            onClick={() => handleStudentClick('deepika')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center relative ${
              currentStudentId === 'deepika'
                ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/30'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-300 bg-zinc-50/50 dark:bg-zinc-800/40'
            }`}
          >
            {currentStudentId === 'deepika' && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
            )}
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-md">
              {deepika.avatar}
            </div>
            <h3 className="mt-2.5 font-bold text-zinc-900 dark:text-white text-base">{deepika.name}</h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Target: {deepika.targetPercent}%</p>
            <div className="mt-2 pt-2 border-t border-purple-100/80 dark:border-zinc-700/60 text-[10px] text-zinc-500">
              {Object.keys(deepika.completedChapters || {}).length} lessons completed
            </div>
          </div>

          {/* Sonali Card */}
          <div
            onClick={() => handleStudentClick('sonali')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center relative ${
              currentStudentId === 'sonali'
                ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/30'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-300 bg-zinc-50/50 dark:bg-zinc-800/40'
            }`}
          >
            {currentStudentId === 'sonali' && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
            )}
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl shadow-md">
              {sonali.avatar}
            </div>
            <h3 className="mt-2.5 font-bold text-zinc-900 dark:text-white text-base">{sonali.name}</h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Target: {sonali.targetPercent}%</p>
            <div className="mt-2 pt-2 border-t border-purple-100/80 dark:border-zinc-700/60 text-[10px] text-zinc-500">
              {Object.keys(sonali.completedChapters || {}).length} lessons completed
            </div>
          </div>
        </div>

        {/* PIN Verification Box if switching */}
        {selectedTarget && (
          <form onSubmit={handlePinSubmit} className="mt-6 p-4 rounded-2xl bg-purple-50 dark:bg-zinc-800/80 border border-purple-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Enter 4-Digit PIN for {selectedTarget === 'deepika' ? 'Deepika' : 'Sonali'}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Protected authentication so Sonali cannot accidentally overwrite Deepika’s progress (Default PIN: {selectedTarget === 'deepika' ? '1234' : '5678'})
            </p>

            <div className="flex items-center gap-2">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                autoFocus
                className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center tracking-widest text-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition"
              >
                Unlock
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 text-center text-xs text-zinc-400">
          Both Deepika & Sonali can log in from separate Android devices concurrently. All progress is synchronized in real time via the cloud database.
        </div>
      </div>
    </div>
  );
};
