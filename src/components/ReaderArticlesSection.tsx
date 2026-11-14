/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Article } from '../types';
import { Newspaper, PenTool, ArrowLeft, Eye, Calendar, User } from 'lucide-react';

interface ReaderArticlesSectionProps {
  articles: Article[];
  onSelectArticle: (articleId: string) => void;
  onOpenSubmitArticle: () => void;
}

export const ReaderArticlesSection: React.FC<ReaderArticlesSectionProps> = ({
  articles,
  onSelectArticle,
  onOpenSubmitArticle,
}) => {
  const publishedArticles = articles.filter((a) => a.status === 'approved');

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="articles" className="py-16 lg:py-24 border-b border-[#E8E2D6] bg-[#F7F4EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-right">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#268F0C] mb-2">
              <Newspaper className="w-4 h-4" />
              <span>منصة الأقلام المعمارية والحضرية</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              مقالات ودراسات القراء
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
              أوراق ورؤى نقدية ينشرها أعضاء المجتمع ومهندسو التخطيط بعد مراجعتها واعتمادها،
              لإثراء المحتوى العربي حول عمارة المدن ونقلها وبيئتها.
            </p>
          </div>

          <button
            onClick={onOpenSubmitArticle}
            className="self-start md:self-auto px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <PenTool className="w-4 h-4 text-[#C1E2B9]" />
            <span>شارك بمقالك أو دراستك</span>
          </button>
        </div>

        {/* Articles Grid */}
        {publishedArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#DDD5C7] p-8">
            <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">لا توجد مقالات منشورة حالياً</h3>
            <p className="text-sm text-stone-500 mt-1">كن أول من يرسل مقالاً تحليلياً لمناقشة أفكار الكتاب.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article.id)}
                className="flex flex-col justify-between bg-white rounded-2xl border border-[#E5DDD0] overflow-hidden hover:shadow-md transition-all text-right cursor-pointer group"
              >
                <div>
                  {/* Article Cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={article.coverImage || '/images/urban_plaza_articles_1794401625775.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {/* Quiet category metadata overlay */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold">
                      {article.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-stone-400 pb-2 border-b border-[#F2ECE3]">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{article.views} قراءة</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-[#268F0C] transition-colors mt-3 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Author Info & Read button */}
                <div className="p-6 pt-0 mt-2 border-t border-[#F5EFE6] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 mt-3">
                    <img
                      src={article.authorAvatar}
                      alt={article.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#D5CCBE]"
                    />
                    <div className="text-right">
                      <span className="block text-xs font-bold text-stone-800">{article.authorName}</span>
                      <span className="block text-[10px] text-stone-400 font-medium">كاتب مساهم</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#268F0C] flex items-center gap-1 mt-3 group-hover:underline">
                    <span>قراءة المقال</span>
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
