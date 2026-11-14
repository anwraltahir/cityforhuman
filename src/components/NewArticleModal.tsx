/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store } from '../services/storage';
import { useToast } from './Toast';
import { X, PenTool, CheckCircle, Info } from 'lucide-react';

interface NewArticleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'تخطيط عمراني',
  'مواصلات ونقل مستدام',
  'بيئة وتشجير',
  'عمارة إنسانية',
  'جودة الحياة',
  'دراسات ميدانية',
];

export const NewArticleModal: React.FC<NewArticleModalProps> = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('/images/urban_plaza_articles_1794401625775.jpg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      showToast('يرجى استكمال جميع الحقول المطلوبة', 'error');
      return;
    }

    const art = store.submitArticle({
      title,
      category,
      excerpt,
      content,
      coverImage,
    });

    if (art) {
      showToast('تم إرسال مقالك للمراجعة بنجاح! سيتم إشعارك فور اعتماده.', 'success');
      onSuccess();
      onClose();
    } else {
      showToast('يرجى تسجيل الدخول أولاً لتقديم مقال', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EAE1] bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900">مشاركة مقال أو دراسة للقراء</h2>
            <PenTool className="w-5 h-5 text-[#268F0C]" />
          </div>
        </div>

        {/* Notice Ribbon */}
        <div className="bg-[#FAF7F0] px-6 py-3 border-b border-[#EAE3D6] flex items-center gap-2 text-xs text-stone-600">
          <Info className="w-4 h-4 text-[#E84200] shrink-0" />
          <span>
            تخضع المقالات لمراجعة هيئة التحرير للتأكد من موافقتها للمعايير الفكرية والموضوعية قبل نشرها للعامة.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              عنوان المقال <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كيف أثرت شوارع الحي المغلقة إيجاباً على أمان أطفالنا؟"
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              تصنيف المقال <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#268F0C]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              المقدمة أو الملخص القصير <span className="text-red-500">*</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="ملخص مكثف من فقرة واحدة يوضح موضوع المقال والرسالة الأساسية..."
              rows={2}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
              required
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              نص المقال كاملاً <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب أفكارك وتحليلاتك بالتفصيل، مستنداً على تجارب أو أرقام أو أفكار كتاب مدن الإنسان..."
              rows={7}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C] leading-relaxed"
              required
            />
          </div>

          {/* Image Choice */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              صورة الغلاف (رابط اختياري)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#268F0C]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-[#C1E2B9]" />
              <span>إرسال المقال للمراجعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
