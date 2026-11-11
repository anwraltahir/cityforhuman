/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Article } from '../types';
import { ArrowRight, Calendar, Eye, Share2, User, Newspaper, BookOpen } from 'lucide-react';

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
  onOpenShare: (title: string, url: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
  onOpenShare,
}) => {
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#268F0C] mb-6 p-1 cursor-pointer transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى مقالات القراء</span>
        </button>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-[#E3DBD0] overflow-hidden shadow-sm">
          {/* Cover Hero */}
          {article.coverImage && (
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-stone-100">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold">
                {article.category}
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-stone-400 pb-4 border-b border-[#F0EAE1]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views} قراءة</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 mt-6 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt callout */}
            <div className="p-4 my-6 bg-[#FAF7F0] rounded-2xl border border-[#EBE3D5] text-stone-700 text-sm sm:text-base font-semibold leading-relaxed">
              {article.excerpt}
            </div>

            {/* Body */}
            <div className="text-stone-800 text-base sm:text-lg leading-loose space-y-4 whitespace-pre-line font-normal">
              {article.content}
            </div>

            {/* Author Box */}
            <div className="mt-10 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={article.authorAvatar}
                  alt={article.authorName}
                  className="w-12 h-12 rounded-full object-cover border border-[#D5CCBE]"
                />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{article.authorName}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{article.authorBio || 'باحث وكاتب مساهم في مجتمع مدن الإنسان'}</p>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenShare(article.title, `https://cityforhuman.com/articles/${article.id}`)
                }
                className="px-4 py-2 text-xs font-bold bg-white text-stone-800 border border-[#DDD5C7] rounded-xl hover:bg-[#F2ECE3] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
