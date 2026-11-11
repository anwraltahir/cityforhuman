/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Globe, Mail, Heart, ShieldCheck, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="bg-[#1C1917] text-stone-300 pt-16 pb-12 border-t border-stone-800 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-10 rounded-xl bg-[#C1E2B9] border border-[#268F0C]/40 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                <img
                  src="/src/assets/images/official_logo.png"
                  alt="شعار مدن الإنسان"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">مدن الإنسان</span>
                <span className="block text-[10px] text-stone-400 font-medium">City for Human · دار كنعان للدراسات والنشر</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              المجتمع الرقمي التفاعلي المصاحب لكتاب «مدن الإنسان» للمؤلف عثمان الطيب (ردمك: 978-9933-747-18-3).
              مساحة فكرية مفتوحة تجمع القراء والمتخصصين لمناقشة مستقبل مدننا وكيف تعود للمشاة والطبيعة.
            </p>

            <div className="pt-2">
              <a
                href="https://cityforhuman.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#C1E2B9] hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>الموقع الرسمي: https://cityforhuman.com</span>
              </a>
            </div>
          </div>

          {/* Quick Nav (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">أقسام المنصة</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  عن الكتاب
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('chapters')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  فصول الكتاب العشرة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discussions')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  منتدى النقاشات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('articles')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  مقالات القراء
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('author')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  عن المؤلف عثمان الطيب
                </button>
              </li>
            </ul>
          </div>

          {/* Chapters Spotlight (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">من الفصول</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>١. الطرق السريعة</li>
              <li>٢. زحام المدن</li>
              <li>٣. العمران والطبيعة</li>
              <li>٦. سادة وأوباش</li>
              <li>٨. مدن الإنسان</li>
              <li>١٠. أعلام مدن الإنسان</li>
            </ul>
          </div>

          {/* Legal & Contact (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">السياسات والتواصل</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>سياسة الخصوصية</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>شروط الاستخدام</span>
                </button>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:osman7777@gmail.com"
                  className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E84200]" />
                  <span className="font-mono text-xs">osman7777@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لكتاب «مدن الإنسان» — عثمان الطيب.</p>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>مساحة فكرية عربية لصالح إنسان المدن</span>
            <Heart className="w-3 h-3 text-[#E84200] fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};
