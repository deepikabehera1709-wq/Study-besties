import React, { useState } from 'react';
import { CBSEBoardPaper, SubjectId } from '../types';
import { CBSE_BOARD_PAPERS } from '../data/boardPapers';
import { SUBJECTS_META } from '../data/cbseData';
import {
  FileText,
  ExternalLink,
  Download,
  Filter,
  Eye,
  CheckCircle,
  ShieldCheck,
  Search,
  BookOpen,
} from 'lucide-react';
import SoundEffects from '../utils/sound';

export const BoardPapersView: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'SQP' | 'PYQ' | 'Marking Scheme'>('all');
  const [previewPaper, setPreviewPaper] = useState<CBSEBoardPaper | null>(null);

  const filteredPapers = CBSE_BOARD_PAPERS.filter((paper) => {
    const matchesSubject = selectedSubject === 'all' || paper.subjectId === selectedSubject;
    const matchesCat = selectedCategory === 'all' || paper.category === selectedCategory;
    return matchesSubject && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Official CBSE Notice Header */}
      <div className="bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authentic Board Repository</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Official CBSE Class 12 Board Question Papers
        </h2>
        <p className="mt-2 text-sm text-purple-100 max-w-2xl leading-relaxed">
          Sourced directly from CBSE Academic (<strong>cbseacademic.nic.in</strong>) and CBSE Portal (<strong>cbse.gov.in</strong>). Access official sample question papers (SQP 2026-27), previous-year actual board question papers (2024–2020), and authoritative marking schemes.
        </p>

        {/* Quick Links to Authentic CBSE Portals */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs">
          <a
            href="https://cbseacademic.nic.in/SQP_CLASSXII_2026-27.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md font-semibold transition flex items-center gap-1.5"
          >
            <span>CBSE SQP Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.cbse.gov.in/cbsenew/question-paper.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md font-semibold transition flex items-center gap-1.5"
          >
            <span>CBSE Previous Papers</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://cbseacademic.nic.in/curriculum_2027.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md font-semibold transition flex items-center gap-1.5"
          >
            <span>CBSE Curriculum 2026-27</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-purple-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Subject Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <button
            onClick={() => {
              setSelectedSubject('all');
              SoundEffects.playChime();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedSubject === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-purple-50'
            }`}
          >
            All Subjects
          </button>
          {SUBJECTS_META.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubject(s.id);
                SoundEffects.playChime();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === s.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-purple-50'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(['all', 'SQP', 'Marking Scheme', 'PYQ'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                SoundEffects.playChime();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {cat === 'all' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 shadow-sm hover:border-purple-300 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {paper.subjectName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    paper.category === 'SQP'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : paper.category === 'Marking Scheme'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {paper.category} • Year {paper.year}
                </span>
              </div>

              <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">
                {paper.title}
              </h3>

              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {paper.description}
              </p>
            </div>

            <div className="pt-4 border-t border-purple-50 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewPaper(paper)}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 dark:bg-zinc-800 dark:text-purple-300 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Paper Details</span>
              </button>

              <a
                href={paper.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <span>Open CBSE Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Paper Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-purple-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-purple-600">
                  {previewPaper.category} • {previewPaper.subjectName}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                  {previewPaper.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPaper(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {previewPaper.description}
            </p>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-zinc-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Official Portal:</span>
                <span className="font-semibold text-purple-700">Central Board of Secondary Education</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Academic Year:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{previewPaper.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CBSE Subject Code:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{previewPaper.examCode}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewPaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
              >
                Close
              </button>
              <a
                href={previewPaper.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Access on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
