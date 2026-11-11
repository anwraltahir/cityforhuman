/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Chapter, Discussion } from '../types';
import {
  ArrowRight,
  PlusCircle,
  MessageSquare,
  Heart,
  Eye,
  Pin,
  Lock,
  Layers,
  Search,
  BookOpen,
} from 'lucide-react';

interface ChapterDetailViewProps {
  chapter: Chapter;
  discussions: Discussion[];
  onBack: () => void;
  onSelectDiscussion: (discussionId: string) => void;
  onOpenNewDiscussion: (chapterId: number) => void;
}

export const ChapterDetailView: React.FC<ChapterDetailViewProps> = ({
  chapter,
  discussions,
  onBack,
  onSelectDiscussion,
  onOpenNewDiscussion,
}) => {
  const [filterSort, setFilterSort] = useState<'latest' | 'active'>('latest');
  const [search, setSearch] = useState('');

  let filtered = discussions.filter((d) => d.chapterId === chapter.id);

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.authorName.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (filterSort === 'active') {
      const aScore = a.commentsCount * 3 + a.likes.length * 2;
      const bScore = b.commentsCount * 3 + b.likes.length * 2;
      return bScore - aScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

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

            {/* Quick Action & Stats */}
            <div className="flex flex-col gap-3 shrink-0">
              <button
                onClick={() => onOpenNewDiscussion(chapter.id)}
                className="px-5 py-3 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#C1E2B9]" />
                <span>ابدأ نقاشاً في هذا الفصل</span>
              </button>

              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D6] text-xs text-stone-600 space-y-1">
                <div className="flex justify-between items-center gap-4">
                  <span>موضوعات النقاش:</span>
                  <strong className="text-stone-900 tabular-nums">{filtered.length}</strong>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span>إجمالي المشاركات:</span>
                  <strong className="text-stone-900 tabular-nums">{chapter.commentsCount}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discussions Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث داخل نقاشات هذا الفصل..."
              className="w-full pr-9 pl-4 py-2 bg-white border border-[#E0D8CB] rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#268F0C]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E0D8CB] self-end sm:self-auto">
            <button
              onClick={() => setFilterSort('latest')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterSort === 'latest' ? 'bg-[#FAF8F5] text-stone-900 shadow-2xs font-bold' : 'text-stone-500'
              }`}
            >
              الأحدث
            </button>
            <button
              onClick={() => setFilterSort('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterSort === 'active' ? 'bg-[#FAF8F5] text-stone-900 shadow-2xs font-bold' : 'text-stone-500'
              }`}
            >
              الأكثر تفاعلاً
            </button>
          </div>
        </div>

        {/* Discussions List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#DDD5C7] p-8">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">لا توجد موضوعات نقاش مفتوحة لهذا الفصل بعد</h3>
            <p className="text-sm text-stone-500 mt-1">
              شارك فكرتك أو اقتباسك من قراءتك لهذا الفصل وافتح باب الحوار مع باقي القراء.
            </p>
            <button
              onClick={() => onOpenNewDiscussion(chapter.id)}
              className="mt-4 px-5 py-2.5 bg-[#268F0C] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              ابدأ أول نقاش الآن
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((disc) => (
              <div
                key={disc.id}
                onClick={() => onSelectDiscussion(disc.id)}
                className="p-6 rounded-2xl bg-white border border-[#E5DDD0] hover:border-[#268F0C]/60 hover:shadow-sm transition-all text-right cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F2ECE3]">
                  <div className="flex items-center gap-2">
                    <img
                      src={disc.authorAvatar}
                      alt={disc.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#D5CCBE]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-stone-800">{disc.authorName}</span>
                      <span className="block text-[10px] text-stone-400 font-medium">
                        {formatDate(disc.createdAt)}
                      </span>
                    </div>
                  </div>

                  {disc.isPinned && (
                    <span className="text-xs font-bold text-[#E84200] flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5" />
                      <span>مثبت</span>
                    </span>
                  )}
                  {disc.isLocked && (
                    <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مغلق</span>
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#268F0C] transition-colors leading-snug">
                    {disc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                    {disc.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F5EFE6] flex items-center justify-between text-xs text-stone-500 tabular-nums">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-stone-400" />
                      <span>{disc.commentsCount} مشاركات</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-[#E84200]/80" />
                      <span>{disc.likes.length}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-stone-400" />
                      <span>{disc.views}</span>
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#268F0C] group-hover:underline">
                    ادخل إلى النقاش ←
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
