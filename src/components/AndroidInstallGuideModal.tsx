import React from 'react';
import { Smartphone, Download, CheckCircle, ExternalLink, ShieldCheck, X, HardDrive, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import SoundEffects from '../utils/sound';

interface AndroidInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
}

export const AndroidInstallGuideModal: React.FC<AndroidInstallGuideModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
}) => {
  const { isInstallable, isInstalled, install, isIOS, isAndroid } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 dark:border-zinc-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Android Installation & Offline Guide
              </h2>
              <p className="text-xs text-zinc-500">
                Install as a full native-feeling app on Android phones & tablets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instant Install Button if in Chromium / Android */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-purple-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Android WebAPK & PWA Compliance</span>
            </div>
            <h3 className="text-lg font-extrabold mt-0.5">
              {isInstalled
                ? 'App is Already Installed!'
                : 'Install Study Besties on Your Device'}
            </h3>
            <p className="text-xs text-purple-100 mt-1 max-w-md">
              Generates a standalone Android app with home screen icon, full offline caching, and instant cloud sync when reconnected.
            </p>
          </div>

          {!isInstalled && isInstallable && (
            <button
              onClick={() => {
                SoundEffects.playSuccess();
                install();
              }}
              className="px-6 py-3 rounded-xl bg-white text-purple-800 font-extrabold text-xs shadow-md hover:bg-purple-50 active:scale-95 transition whitespace-nowrap"
            >
              Install on Android Now
            </button>
          )}

          {isInstalled && (
            <div className="px-4 py-2 rounded-xl bg-white/20 text-white text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Running in App Mode</span>
            </div>
          )}
        </div>

        {/* 3 Step Installation Guide */}
        <div className="space-y-4">
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
            Three Ways to Run on Android:
          </h4>

          {/* Method 1: Chrome PWA / WebAPK */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
            <div className="font-bold text-purple-700 dark:text-purple-300 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs">
                1
              </span>
              <span>Method 1: Direct Android Installation via Chrome (Recommended)</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Open this app URL in Google Chrome on your Android phone or tablet. Tap the three-dot menu <strong>(⋮)</strong> and select <strong>&quot;Install App&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>). Android will compile a genuine WebAPK with an app drawer icon, splash screen, and offline persistence.
            </p>
          </div>

          {/* Method 2: Offline Caching */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
            <div className="font-bold text-purple-700 dark:text-purple-300 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs">
                2
              </span>
              <span>Offline Functionality & Auto-Sync</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When disconnected from Wi-Fi/mobile data, all syllabus chapters, notes, and quizzes remain 100% accessible via Service Worker and IndexedDB/LocalStorage cache. All completed lessons and quiz scores are placed in an offline queue and synced to the cloud database the moment connection returns!
            </p>
          </div>

          {/* Method 3: Standalone APK with Bubblewrap */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
            <div className="font-bold text-purple-700 dark:text-purple-300 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs">
                3
              </span>
              <span>Building Standalone APK with Bubblewrap CLI / Android Studio</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To produce a signed release \`.apk\` for Google Play Store or direct sideloading:
            </p>
            <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto">
{`npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://<app-url>/manifest.webmanifest"
bubblewrap build`}
            </pre>
          </div>
        </div>

        {/* Download Project Source ZIP Button */}
        <div className="p-5 rounded-2xl bg-purple-50 dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-zinc-900 dark:text-white text-xs">
              Complete Project Source Code & Assets
            </div>
            <p className="text-[11px] text-zinc-500">
              Download all TypeScript, React, Tailwind, and Firebase assets in a single .zip archive.
            </p>
          </div>
          <button
            onClick={() => {
              SoundEffects.playSuccess();
              onDownloadZip();
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
