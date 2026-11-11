/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Discussion, Chapter } from '../types';
import {
  MessageSquare,
  Heart,
  Eye,
  PlusCircle,
  Pin,
  Lock,
  ArrowLeft,
  Search,
} from 'lucide-react';

interface RecentDiscussionsProps {
  discussions: Discussion[];
  chapters: Chapter[];
  onSelectDiscussion: (discussionId: string) => void;
  onOpenNewDiscussion: () => void;
  onSelectChapter: (chapterId: number) => void;
}

export const RecentDiscussions: React.FC<RecentDiscussionsProps> = ({
  discussions,
  chapters,
  onSelectDiscussion,
  onOpenNewDiscussion,
  onSelectChapter,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');
  const [sortFilter, setSortFilter] = useState<'latest' | 'active' | 'views'>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort discussions
  let filtered = [...discussions];

  if (selectedChapterId !== 'all') {
    filtered = filtered.filter((d) => d.chapterId === selectedChapterId);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.authorName.toLowerCase().includes(q)
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortFilter === 'active') {
      const aScore = a.commentsCount * 3 + a.likes.length * 2;
      const bScore = b.commentsCount * 3 + b.likes.length * 2;
      return bScore - aScore;
    }
    if (sortFilter === 'views') {
      return b.views - a.views;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getChapterTitle = (id: number) => {
    const ch = chapters.find((c) => c.id === id);
    return ch ? `الفصل ${id}: ${ch.title}` : `الفصل ${id}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="discussions" className="py-16 lg:py-24 border-b border-[#E8E2D6] bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-right">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#268F0C] mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>مساحة الحوار المفتوح</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              نقاشات القراء والمفكرين
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-1">
              شارك برأيك في أحد فصول الكتاب، أو اطرح تساؤلاً حول واقع مدينتك وكيفية أنسنتها.
            </p>
          </div>

          <button
            onClick={onOpenNewDiscussion}
            className="self-start md:self-auto px-5 py-3 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#C1E2B9]" />
            <span>ابدأ موضوع نقاش جديد</span>
          </button>
        </div>

        {/* Filter Controls Bar (Interactive tabs / Segmented controls per design guidelines) */}
        <div className="bg-white p-3 rounded-2xl border border-[#E5DDD0] shadow-2xs mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في عناوين ونصوص النقاشات..."
              className="w-full pr-9 pl-4 py-2 bg-[#FAF8F5] border border-[#E0D8CB] rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#268F0C]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            {/* Chapter Filter Dropdown */}
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              aria-label="تصفية النقاشات حسب الفصل"
              className="px-3 py-2 bg-[#FAF8F5] border border-[#E0D8CB] rounded-xl text-xs sm:text-sm font-medium text-stone-800 focus:outline-none focus:border-[#268F0C]"
            >
              <option value="all">جميع الفصول (١٠ فصول)</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  الفصل {ch.id}: {ch.title}
                </option>
              ))}
            </select>

            {/* Sort Filter Buttons (Functional Tabs) */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#E0D8CB]">
              <button
                onClick={() => setSortFilter('latest')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  sortFilter === 'latest'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                الأحدث
              </button>
              <button
                onClick={() => setSortFilter('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  sortFilter === 'active'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                الأكثر تفاعلاً
              </button>
              <button
                onClick={() => setSortFilter('views')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  sortFilter === 'views'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                الأكثر مشاهدة
              </button>
            </div>
          </div>
        </div>

        {/* Discussions List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#DDD5C7] p-8">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">لا توجد موضوعات تطابق بحثك حالياً</h3>
            <p className="text-sm text-stone-500 mt-1">كن أول من يفتتح النقاش ويطرح رؤيته حول هذا الفصل.</p>
            <button
              onClick={onOpenNewDiscussion}
              className="mt-4 px-4 py-2 bg-[#268F0C] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              ابدأ موضوع نقاش جديد
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((disc) => (
              <div
                key={disc.id}
                onClick={() => onSelectDiscussion(disc.id)}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5DDD0] hover:border-[#268F0C]/50 hover:shadow-sm transition-all text-right cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE3]">
                  {/* Chapter association & status (Clean unboxed text) */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChapter(disc.chapterId);
                      }}
                      className="font-bold text-[#268F0C] hover:underline"
                    >
                      {getChapterTitle(disc.chapterId)}
                    </button>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>{formatDate(disc.createdAt)}</span>

                    {disc.isPinned && (
                      <>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-[#E84200] font-bold flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          <span>مثبت</span>
                        </span>
                      </>
                    )}

                    {disc.isLocked && (
                      <>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-stone-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>مغلق</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Author lockup */}
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <span className="block text-xs font-bold text-stone-800">{disc.authorName}</span>
                      <span className="block text-[10px] text-stone-400 font-medium">
                        {disc.authorRole === 'admin'
                          ? 'المؤلف / المشرف العام'
                          : disc.authorRole === 'moderator'
                          ? 'مشرف مجتمع'
                          : 'عضو مسجل'}
                      </span>
                    </div>
                    <img
                      src={disc.authorAvatar}
                      alt={disc.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#D5CCBE]"
                    />
                  </div>
                </div>

                {/* Title & Preview */}
                <div className="mt-3">
                  <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 group-hover:text-[#268F0C] transition-colors leading-snug">
                    {disc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                    {disc.content}
                  </p>
                </div>

                {/* Footer Metrics & Action */}
                <div className="mt-4 pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-stone-500 tabular-nums">
                    <span className="flex items-center gap-1.5" title="الردود والمشاركات">
                      <MessageSquare className="w-4 h-4 text-stone-400" />
                      <span className="font-semibold">{disc.commentsCount} ردود</span>
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="flex items-center gap-1.5" title="الإعجابات">
                      <Heart className="w-4 h-4 text-[#E84200]/80" />
                      <span className="font-semibold">{disc.likes.length}</span>
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="flex items-center gap-1.5" title="المشاهدات">
                      <Eye className="w-4 h-4 text-stone-400" />
                      <span className="font-semibold">{disc.views}</span>
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#268F0C] flex items-center gap-1 group-hover:underline">
                    <span>عرض النقاش والردود</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
