/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, MessageSquare, ArrowLeft, Compass, Users, BellRing } from 'lucide-react';
import { InterestModal } from './InterestModal';
import { store } from '../services/storage';

interface HeroSectionProps {
  onDiscoverBook: () => void;
  onJoinDiscussion: () => void;
  onSelectChapter: (chapterId: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onDiscoverBook,
  onJoinDiscussion,
  onSelectChapter,
}) => {
  const [interestOpen, setInterestOpen] = useState(false);
  const settings = store.getSiteSettings();
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-[#E8E2D6] bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5] to-[#F3EDE3]/40">
      {/* Subtle architectural backdrop lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#268F0C_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Editorial Copy (7 columns) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Curatorial Kicker (Zero pill text with subtle separator) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <span className="text-[#268F0C] font-bold">المجتمع الثقافي الرسمي</span>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <span>كتاب مدن الإنسان</span>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <span>المؤلف: {settings.authorName}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.2] tracking-tight">
              {settings.bookTitle}
            </h1>

            {/* Sub-headline directly from the book */}
            <p className="text-xl sm:text-2xl font-bold text-[#E84200] leading-snug">
              {settings.bookSubtitle}
            </p>

            {/* Intro paragraph */}
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl font-normal whitespace-pre-line">
              {settings.communityIntro}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onJoinDiscussion}
                className="px-6 py-3.5 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-[#C1E2B9]" />
                <span>شارك في النقاش</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={onDiscoverBook}
                className="px-6 py-3.5 bg-[#FAF8F5] hover:bg-[#EFE9DF] text-stone-800 font-bold text-sm sm:text-base rounded-xl border border-[#D5CCBE] transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-[#A99C8A]" />
                <span>اكتشف الكتاب وفصوله</span>
              </button>
            </div>

            {/* Curatorial Key Metrics strip */}
            <div className="pt-6 border-t border-[#E8E2D6] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums">10</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">فصول فكرية متخصصة</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#268F0C] tabular-nums">100%</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">أولوية للمشاة والبيئة</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#E84200] tabular-nums">حوار حر</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">بين القراء والمتخصصين</p>
              </div>
            </div>
          </div>

          {/* Book Cover Presentation (5 columns) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Soft atmospheric book shadow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#C1E2B9]/30 via-[#E84200]/10 to-transparent rounded-2xl filter blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Book presentation: front cover only, styled as a physical book */}
              <div className="relative pt-4 pb-8 flex flex-col items-center">
                <div className="relative w-[230px] sm:w-[280px]" style={{ perspective: '1400px' }}>
                  <div
                    className="relative transition-transform duration-500 ease-out [transform:rotateY(10deg)_rotateX(2deg)] group-hover:[transform:rotateY(3deg)]"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Page edges peeking out on the open (left) side */}
                    <div
                      aria-hidden="true"
                      className="absolute top-[6px] bottom-[6px] -left-[9px] w-[30px] rounded-l-sm"
                      style={{
                        background: 'repeating-linear-gradient(90deg, #fdfbf7 0 2px, #e4ddd0 2px 3px)',
                        boxShadow: 'inset 4px 0 6px rgba(0,0,0,0.08)',
                      }}
                    />

                    {/* Front cover (shows only the front part of a full wrap-around cover) */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-l-md rounded-r-[3px] bg-[#8c9a87] shadow-[0_25px_45px_-12px_rgba(40,30,20,0.55),0_8px_16px_-6px_rgba(40,30,20,0.35)]">
                      <img
                        src="/cover/front"
                        alt="غلاف كتاب مدن الإنسان - عثمان الطيب"
                        className="absolute inset-0 w-full h-full object-cover object-left"
                        referrerPolicy="no-referrer"
                      />
                      {/* Spine hinge on the right edge */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-y-0 right-0 w-[14%]"
                        style={{
                          background:
                            'linear-gradient(to left, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 18%, rgba(255,255,255,0.28) 26%, rgba(0,0,0,0.10) 38%, transparent 100%)',
                        }}
                      />
                      {/* Soft light sheen */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.22) 0%, transparent 38%, transparent 70%, rgba(0,0,0,0.10) 100%)' }}
                      />
                    </div>
                  </div>

                  {/* Coming soon badge */}
                  <span className="absolute -top-3 -right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-[#E84200] rounded-full shadow-lg">
                    <BellRing className="w-3.5 h-3.5" />
                    قريباً في المكتبات
                  </span>

                  {/* Ground shadow */}
                  <div aria-hidden="true" className="absolute -bottom-5 left-[8%] right-[8%] h-6 rounded-[50%] bg-stone-900/25 blur-md" />
                </div>

                {/* Quiet caption underneath */}
                <div className="mt-9 text-center text-xs text-stone-600 space-y-1">
                  <p>
                    <span className="font-bold text-stone-800">دار كنعان للدراسات والنشر</span>
                    <span className="text-stone-300 mx-2">·</span>
                    <span className="font-semibold text-stone-700 tabular-nums">ردمك: 978-9933-747-18-3</span>
                  </p>
                  <p>
                    الموقع الرسمي: <strong className="text-stone-900 font-mono">cityforhuman.com</strong>
                  </p>
                </div>
              </div>

              {/* Pre-launch call to action */}
              <div className="relative mt-4 p-4 rounded-2xl bg-white border border-[#E5DECF] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:justify-between text-center sm:text-right">
                <div>
                  <p className="text-base font-extrabold text-stone-900">قريباً في المكتبات</p>
                  <p className="text-xs text-stone-500 mt-0.5">كن أول من يعلم عند صدور الكتاب</p>
                </div>
                <button
                  onClick={() => setInterestOpen(true)}
                  className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#E84200] hover:bg-[#C93900] rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <BellRing className="w-4 h-4" />
                  سجّل اهتمامك
                </button>
              </div>

              {/* Quick Jump Ribbon to Popular Chapters */}
              <div className="mt-4 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-[#E5DECF] flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
                  <Compass className="w-3.5 h-3.5 text-[#268F0C]" />
                  <span>ابرز الفصول:</span>
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 min-w-0">
                  <button
                    onClick={() => onSelectChapter(8)}
                    className="hover:text-[#268F0C] font-semibold text-stone-600 whitespace-nowrap cursor-pointer"
                  >
                    ٨. مدن الإنسان
                  </button>
                  <span className="text-stone-300">·</span>
                  <button
                    onClick={() => onSelectChapter(1)}
                    className="hover:text-[#268F0C] font-semibold text-stone-600 whitespace-nowrap cursor-pointer"
                  >
                    ١. الطرق السريعة
                  </button>
                  <span className="text-stone-300">·</span>
                  <button
                    onClick={() => onSelectChapter(6)}
                    className="hover:text-[#268F0C] font-semibold text-stone-600 whitespace-nowrap cursor-pointer"
                  >
                    ٦. سادة وأوباش
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {interestOpen && <InterestModal onClose={() => setInterestOpen(false)} />}
    </section>
  );
};
