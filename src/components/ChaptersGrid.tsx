/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Chapter } from '../types';
import { MessageSquare, MessagesSquare, ArrowLeft, BookOpen, Layers } from 'lucide-react';

interface ChaptersGridProps {
  chapters: Chapter[];
  onSelectChapter: (chapterId: number) => void;
}

const arabicNumerals = ['٠١', '٠٢', '٠٣', '٠٤', '٠٥', '٠٦', '٠٧', '٠٨', '٠٩', '١٠'];

export const ChaptersGrid: React.FC<ChaptersGridProps> = ({ chapters, onSelectChapter }) => {
  return (
    <section id="chapters" className="py-16 lg:py-24 border-b border-[#E8E2D6] bg-[#F7F4EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-right max-w-3xl mb-12 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#268F0C]">
            <Layers className="w-4 h-4" />
            <span>فهرس الموضوعات والمناقشات</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            فصول كتاب «مدن الإنسان»
          </h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            يحتوي الكتاب على عشرة فصول تأسيسية، لكل منها منتدى حواري مستقل يتيح للقراء تبادل
            الآراء، طرح الأسئلة، ومشاركة التجارب الميدانية من مدنهم.
          </p>
        </div>

        {/* 10 Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, idx) => {
            const formattedIndex = arabicNumerals[chapter.id - 1] || `٠${chapter.id}`;
            const isFeatured = chapter.id === 8 || chapter.id === 1;

            return (
              <div
                key={chapter.id}
                className={`flex flex-col justify-between p-6 rounded-2xl bg-white border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${
                  isFeatured
                    ? 'border-[#268F0C]/40 ring-1 ring-[#268F0C]/20 shadow-xs'
                    : 'border-[#E5DDD0]'
                }`}
              >
                <div>
                  {/* Top Metadata: Editorial Index Number (Unboxed) */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                    <span className="text-xs font-bold text-stone-400 group-hover:text-[#268F0C] transition-colors tabular-nums">
                      الفصل {formattedIndex}
                    </span>
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                      <span>{chapter.keyThemes[0] || 'عمران إنساني'}</span>
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mt-4 text-right">
                    <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-[#268F0C] transition-colors leading-snug">
                      {chapter.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#E84200] mt-1 leading-normal">
                      {chapter.subtitle}
                    </p>
                    <p className="text-sm text-stone-600 mt-3 leading-relaxed line-clamp-3">
                      {chapter.description}
                    </p>
                  </div>

                  {/* Key themes tags (Clean unboxed inline text) */}
                  <div className="mt-4 pt-3 border-t border-[#F5EFE6] flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-stone-500">
                    {chapter.keyThemes.slice(0, 3).map((theme, tIdx) => (
                      <span key={tIdx} className="inline-flex items-center gap-1">
                        <span className="text-stone-300">#</span>
                        <span>{theme}</span>
                        {tIdx < 2 && <span className="text-stone-300 mr-1">·</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics & CTA Button */}
                <div className="mt-6 pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-stone-500 tabular-nums">
                    <span className="flex items-center gap-1" title="موضوعات النقاش">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                      <span>{chapter.discussionsCount}</span>
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="flex items-center gap-1" title="إجمالي المشاركات">
                      <MessagesSquare className="w-3.5 h-3.5 text-stone-400" />
                      <span>{chapter.commentsCount}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectChapter(chapter.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-stone-800 bg-[#FAF8F5] hover:bg-[#268F0C] hover:text-white rounded-lg border border-[#DDD5C7] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>ادخل إلى النقاش</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
