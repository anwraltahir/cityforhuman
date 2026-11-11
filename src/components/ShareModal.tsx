/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { useToast } from './Toast';

interface ShareModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ title, url, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(`«${title}» — من كتاب ومجتمع مدن الإنسان:`);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('تم نسخ الرابط إلى الحافظة بنجاح', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold text-stone-900">مشاركة الرابط</h3>
        </div>

        <p className="text-xs text-stone-600 mt-3 line-clamp-2 leading-relaxed">
          {title}
        </p>

        {/* Social Platforms */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#E8F8EA] hover:bg-[#d6f4d9] text-[#1b7a2e] border border-[#b2e8b8] transition-all"
          >
            <MessageCircle className="w-6 h-6 mb-1 fill-current" />
            <span className="text-[11px] font-bold">واتساب</span>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 transition-all"
          >
            <span className="text-lg font-black mb-0.5">𝕏</span>
            <span className="text-[11px] font-bold">منصة إكس</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#E6F3FA] hover:bg-[#d2ecf9] text-[#1785b8] border border-[#aed9f1] transition-all"
          >
            <Send className="w-5 h-5 mb-1.5" />
            <span className="text-[11px] font-bold">تيليجرام</span>
          </a>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-2 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-stone-700 outline-none px-2 font-mono"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#268F0C] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
