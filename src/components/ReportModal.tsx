/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store } from '../services/storage';
import { useToast } from './Toast';
import { X, Flag, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  targetType: 'discussion' | 'comment' | 'article';
  targetId: string;
  targetTitle: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'محتوى مسيء أو غير لائق',
  'إعلانات مضللة أو رسائل مزعجة (سبام)',
  'خروج واضح عن سياق الكتاب وموضوعات المدن',
  'انتهاك حقوق ملكية أو اقتباس غير مصرح',
  'أخرى',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetTitle,
  onClose,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = store.submitReport({
      targetType,
      targetId,
      targetTitle,
      reason,
      details,
    });

    if (rep) {
      showToast('شكراً لحرصك. تم إرسال البلاغ لفريق الإشراف للمراجعة والتدقيق.', 'success');
      onClose();
    } else {
      showToast('يرجى تسجيل الدخول أولاً لتقديم بلاغ', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">إبلاغ عن محتوى مخالف</h3>
            <Flag className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <p className="text-xs text-stone-600 mt-3 font-semibold">
          المحتوى المعني: <span className="text-stone-900">{targetTitle}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">سبب البلاغ</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:border-red-500"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              تفاصيل إضافية للإشراف (اختياري)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="وضح لفريق الإشراف سبب المخالفة بدقة..."
              rows={3}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#F0EAE1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              إرسال البلاغ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
