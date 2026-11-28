/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SITE_HOST } from '../siteConfig';
import React, { useState } from 'react';
import { BookOpen, MessageSquare, ArrowLeft, Compass, Users, BellRing, RotateCcw, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { InterestModal } from './InterestModal';
import { GetBookModal } from './GetBookModal';
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
  const [bookFlipped, setBookFlipped] = useState(false);
  const [getBookOpen, setGetBookOpen] = useState(false);
  const settings = store.getSiteSettings();
  const availability = store.getAvailability();
  const isAvailable = availability.paper.length > 0 || availability.digital.length > 0;
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.2]">
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
                onClick={() => setGetBookOpen(true)}
                className="px-6 py-3.5 bg-[#FAF8F5] hover:bg-[#EFE9DF] text-stone-800 font-bold text-sm sm:text-base rounded-xl border border-[#D5CCBE] transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#A99C8A]" />
                <span>احصل على الكتاب</span>
                {!isAvailable && (
                  <span className="text-xs font-bold text-[#E84200] bg-[#E84200]/10 px-2 py-0.5 rounded-full">قريباً</span>
                )}
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
                <div className="relative">
                  {/* 3D book: front, spine and page edges (styles in index.css, .book3d) */}
                  <button
                    type="button"
                    className="book3d__toggle"
                    onClick={() => setBookFlipped((f) => !f)}
                    aria-label={bookFlipped ? 'عرض الغلاف الأمامي' : 'عرض الغلاف الخلفي'}
                  >
                  <div className="book3d" style={{ ['--cover' as string]: "url('/cover/front')" }}>
                    <div className={`book3d__inner${bookFlipped ? ' is-flipped' : ''}`}>
                      <div className="book3d__face book3d__back" />
                      <div className="book3d__face book3d__bottom" />
                      <div className="book3d__face book3d__top" />
                      <div className="book3d__face book3d__pages" />
                      <div className="book3d__face book3d__spine" />
                      <div className="book3d__face book3d__front">
                        <img src="/cover/front" alt="غلاف كتاب مدن الإنسان - عثمان الطيب" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                    <div className="book3d__shadow" aria-hidden="true" />
                  </div>
                  </button>

                  {/* Coming soon badge */}
                  <span className="absolute -top-3 -right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-[#E84200] rounded-full shadow-lg">
                    {isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BellRing className="w-3.5 h-3.5" />}
                    {isAvailable ? 'متوفر الآن' : 'قريباً في المكتبات'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setBookFlipped((f) => !f)}
                  className="mt-9 inline-flex items-center gap-1.5 text-xs font-semibold text-[#268F0C] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {bookFlipped ? 'اضغط لعرض الغلاف الأمامي' : 'اضغط على الكتاب لعرض الغلاف الخلفي'}
                </button>

                {/* Quiet caption underneath */}
                <div className="mt-3 text-center text-xs text-stone-600 space-y-1">
                  <p>
                    <span className="font-bold text-stone-800">دار كنعان للدراسات والنشر</span>
                    <span className="text-stone-300 mx-2">·</span>
                    <span className="font-semibold text-stone-700 tabular-nums">ردمك: 978-9933-747-18-3</span>
                  </p>
                  <p>
                    الموقع الرسمي: <strong className="text-stone-900 font-mono">{SITE_HOST}</strong>
                  </p>
                </div>
              </div>

              {/* Call to action: pre-launch interest, or where to buy once available */}
              <div className="relative mt-4 p-4 rounded-2xl bg-white border border-[#E5DECF] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:justify-between text-center sm:text-right">
                <div>
                  <p className="text-base font-extrabold text-stone-900">{isAvailable ? 'الكتاب متوفر الآن' : 'قريباً في المكتبات'}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isAvailable ? 'النسخة الورقية في المكتبات والنسخة الرقمية عبر المتاجر' : 'كن أول من يعلم عند صدور الكتاب'}
                  </p>
                </div>
                <button
                  onClick={() => (isAvailable ? setGetBookOpen(true) : setInterestOpen(true))}
                  className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#E84200] hover:bg-[#C93900] rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isAvailable ? <ShoppingBag className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                  {isAvailable ? 'احصل على الكتاب' : 'سجّل اهتمامك'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      {getBookOpen && (
        <GetBookModal
          availability={availability}
          onClose={() => setGetBookOpen(false)}
          onRegisterInterest={() => {
            setGetBookOpen(false);
            setInterestOpen(true);
          }}
        />
      )}
      {interestOpen && <InterestModal onClose={() => setInterestOpen(false)} />}
    </section>
  );
};
