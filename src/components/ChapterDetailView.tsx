/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Chapter } from '../types';
import { ArrowRight, MessageSquare, Layers } from 'lucide-react';

interface ChapterDetailViewProps {
  chapter: Chapter;
  onBack: () => void;
  onGoToDiscussions: () => void;
}

export const ChapterDetailView: React.FC<ChapterDetailViewProps> = ({ chapter, onBack, onGoToDiscussions }) => {
  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#268F0C] mb-6 p-1 cursor-pointer transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى جميع فصول الكتاب</span>
        </button>

        {/* Chapter Header Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E3DBD0] shadow-sm mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-[#268F0C]" />
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
                <Layers className="w-4 h-4 text-[#268F0C]" />
                <span className="tabular-nums">الفصل رقم {chapter.id}</span>
                <span className="text-stone-300">·</span>
                <span>كتاب مدن الإنسان</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                {chapter.title}
              </h1>

              <p className="text-sm sm:text-base font-bold text-[#E84200] leading-snug">
                {chapter.subtitle}
              </p>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed pt-2">
                {chapter.description}
              </p>

              {/* Themes */}
              <div className="flex flex-wrap gap-2 pt-3">
                {chapter.keyThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="text-xs text-stone-600 bg-[#F4EFEA] px-3 py-1 rounded-lg border border-[#E8E2D6]"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Discussions live in one shared place for the whole book */}
            <div className="flex flex-col gap-3 shrink-0">
              <button
                onClick={onGoToDiscussions}
                className="px-5 py-3 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#C1E2B9]" />
                <span>شارك في نقاشات الكتاب</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
