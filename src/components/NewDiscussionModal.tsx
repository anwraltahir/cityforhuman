/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Chapter } from '../types';
import { store } from '../services/storage';
import { useToast } from './Toast';
import { X, Send, Image as ImageIcon, BookOpen, AlertCircle } from 'lucide-react';

interface NewDiscussionModalProps {
  chapters: Chapter[];
  defaultChapterId?: number;
  onClose: () => void;
  onSuccess: (newDiscussionId: string) => void;
}

export const NewDiscussionModal: React.FC<NewDiscussionModalProps> = ({
  chapters,
  defaultChapterId,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [chapterId, setChapterId] = useState<number>(defaultChapterId || 1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('يرجى كتابة عنوان واضح ونص للنقاش', 'error');
      return;
    }

    setIsSubmitting(true);
    const newDisc = store.createDiscussion({
      chapterId,
      title,
      content,
      imageUrl: imageUrl.trim() || undefined,
    });

    if (newDisc) {
      showToast('تم نشر موضوع النقاش بنجاح!', 'success');
      onSuccess(newDisc.id);
      onClose();
    } else {
      showToast('حدث خطأ أثناء النشر، يرجى تسجيل الدخول أولاً', 'error');
      setIsSubmitting(false);
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
            <h2 className="text-base sm:text-lg font-bold text-stone-900">إنشاء موضوع نقاش جديد</h2>
            <BookOpen className="w-5 h-5 text-[#268F0C]" />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Chapter Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              اختر الفصل المرتبط بالنقاش <span className="text-red-500">*</span>
            </label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(Number(e.target.value))}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#268F0C]"
            >
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  الفصل {ch.id}: {ch.title} — ({ch.subtitle})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              عنوان النقاش <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كيف نعيد تصميم التقاطعات الخطرة أمام المدارس؟"
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#268F0C]"
              maxLength={120}
              required
            />
            <span className="block text-[11px] text-stone-400 mt-1">
              اختر عنواناً جذاباً ومحدداً يلخص جوهر الفكرة (حتى ١٢٠ حرفاً).
            </span>
          </div>

          {/* Body Content */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              نص وتفاصيل الموضوع <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اطرح أفكارك، اقتباساتك من الفصل، أو تساؤلاتك الموجهة للقراء والمعماريين..."
              rows={6}
              className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#268F0C] leading-relaxed"
              required
            />
          </div>

          {/* Optional Image */}
          <div>
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className="text-xs font-bold text-[#268F0C] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{showImageInput ? 'إخفاء حقل الصورة' : 'إضافة صورة توضيحية اختيارية (رابط)'}</span>
            </button>

            {showImageInput && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/urban-photo.jpg"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#268F0C]"
                />
                {imageUrl && (
                  <div className="h-32 rounded-xl overflow-hidden border border-[#DDD5C7] bg-stone-100">
                    <img
                      src={imageUrl}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                      onError={() => showToast('تعذر تحميل رابط الصورة', 'error')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#A99C8A]" />
              <span>يُنشر الموضوع فوراً تحت الفصل المختار.</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#C1E2B9]" />
                <span>نشر النقاش</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
