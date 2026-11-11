/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, MessageSquare, ArrowLeft, Compass, Users } from 'lucide-react';

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
              <span>المؤلف: عثمان الطيب</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.2] tracking-tight">
              مدن الإنسان
            </h1>

            {/* Sub-headline directly from the book */}
            <p className="text-xl sm:text-2xl font-bold text-[#E84200] leading-snug">
              كيف غيرت السيارات المدن؟ وماذا نفعل لتعود المدينة للإنسان؟
            </p>

            {/* Intro paragraph */}
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl font-normal">
              من خلال هذا المجتمع نواصل الحوار حول أفكار كتاب «مدن الإنسان»، ونناقش مستقبل مدننا
              وكيف يمكن أن تصبح أكثر إنسانية وملاءمة لحياة الناس، بعيداً عن هيمنة الأسفلت وصخب المركبات.
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

              {/* Book frame container */}
              <div className="relative bg-[#F4EFEA] p-3 rounded-2xl border border-[#DDD5C7] shadow-xl transition-transform group-hover:scale-[1.01] duration-300">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E2D6] text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#268F0C]"></span>
                    <span>الغلاف الأصلي المعتمد</span>
                  </span>
                  <span className="text-[11px] text-stone-500">دار كنعان للدراسات والنشر</span>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-[#C1E2B9]/30">
                  <img
                    src="/src/assets/images/book_cover_front.jpeg"
                    alt="غلاف كتاب مدن الإنسان - عثمان الطيب"
                    className="w-full h-auto rounded-xl shadow-md object-contain max-h-[460px] mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Quiet caption underneath */}
                <div className="mt-3 px-1 flex items-center justify-between text-xs text-stone-600">
                  <span className="font-semibold text-stone-700">ردمك: 978-9933-747-18-3</span>
                  <span>الموقع الرسمي: <strong className="text-stone-900 font-mono">cityforhuman.com</strong></span>
                </div>
              </div>

              {/* Quick Jump Ribbon to Popular Chapters */}
              <div className="mt-4 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-[#E5DECF] flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
                  <Compass className="w-3.5 h-3.5 text-[#268F0C]" />
                  <span>ابرز الفصول:</span>
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
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
    </section>
  );
};
