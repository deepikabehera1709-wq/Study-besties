import JSZip from 'jszip';

export async function downloadSourceCodeZip(): Promise<void> {
  const zip = new JSZip();

  // Root instructions & guides
  zip.file(
    'README.md',
    `# Study Besties - CBSE Class 12 Planner & Quizzes
A complete CBSE Class 12 study planner, independent chapter quiz system, and best-friend progress-sharing app for Deepika and Sonali.

## Features
- **Student Profiles**: Independent accounts for Deepika and Sonali with protected PIN verification.
- **Syllabus**: All 5 CBSE Class 12 Subjects (Physics, Chemistry, Mathematics, Computer Science, English Core).
- **Independent Chapter Quizzes**:
  - Exactly 10 MCQs with answers & detailed explanations
  - Exactly 10 Written CBSE board-style questions with model answers and marking schemes
  - Non-sequential unlocking: Marking Chapter 3 complete unlocks Chapter 3 quiz without requiring Chapter 1 or 2!
- **Shared Bestie Dashboard**: Real-time cross-device progress comparison.
- **Study Planner & Pomodoro Timer**: Track study hours, daily logs, and revision schedule.
- **Official CBSE Board Papers**: Authentic links to CBSE Academic and cbse.gov.in (SQP 2026-27, PYQs 2024-2020, Marking Schemes).
- **Android PWA & Offline Support**: Offline service worker caching, IndexedDB/LocalStorage fallback, and cloud sync.

## How to Run
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit http://localhost:3000
`
  );

  // Firebase Setup Guide
  zip.file(
    'FIREBASE_SETUP_GUIDE.md',
    `# Firebase Cloud Firestore & Auth Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (e.g. \`study-besties-cbse\`).
2. Add a Web App and copy the config into \`firebase-applet-config.json\`.
3. Enable Cloud Firestore in Production or Test mode.
4. Deploy the included \`firestore.rules\` file.
5. Enable Firebase Authentication with Google Sign-In or Email/Password.
`
  );

  // Android APK Guide & manifest
  zip.file(
    'ANDROID_INSTALL_GUIDE.md',
    `# Android Installation & APK Build Guide

### Method 1: Instant PWA Installation (Recommended)
1. Open the Study Besties URL on your Android device in Google Chrome.
2. Tap the "Install on Android" button or tap Chrome menu (⋮) -> "Install App" / "Add to Home screen".
3. An official Android WebAPK will be generated and installed with offline capabilities.

### Method 2: Build Standalone APK using Bubblewrap (TWA)
\`\`\`bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://<your-app-url>/manifest.webmanifest"
bubblewrap build
\`\`\`
This produces a release-ready \`app-release.apk\` for any Android phone or tablet.
`
  );

  zip.file(
    'AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.studybesties.cbse12">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Study Besties"
        android:theme="@style/Theme.StudyBesties">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.StudyBesties.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'study-besties-cbse12-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
