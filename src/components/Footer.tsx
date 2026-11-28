/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SITE_URL } from '../siteConfig';
import React from 'react';
import { BookOpen, Globe, Mail, Heart, ShieldCheck, FileText } from 'lucide-react';
import { store } from '../services/storage';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="bg-[#1C1917] text-stone-300 pt-16 pb-12 border-t border-stone-800 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-10 rounded-xl bg-[#C1E2B9] border border-[#268F0C]/40 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                <img
                  src="/images/official_logo.png"
                  alt="شعار مدن الإنسان"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-white">مدن الإنسان</span>
                <span className="block text-xs text-stone-400 font-medium">City for Human · دار كنعان للدراسات والنشر</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              المجتمع الرقمي التفاعلي المصاحب لكتاب «مدن الإنسان» للمؤلف عثمان الطيب (ردمك: 978-9933-747-18-3).
              مساحة فكرية مفتوحة تجمع القراء والمتخصصين لمناقشة مستقبل مدننا وكيف تعود للمشاة والطبيعة.
            </p>

            <div className="pt-2">
              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] inline-flex items-center inline-flex items-center gap-2 text-xs font-semibold text-[#C1E2B9] hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>الموقع الرسمي: {SITE_URL}</span>
              </a>
            </div>
          </div>

          {/* Quick Nav (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white">أقسام المنصة</h4>
            <ul className="space-y-0.5 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="min-h-[44px] inline-flex items-center hover:text-white transition-colors cursor-pointer"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="min-h-[44px] inline-flex items-center hover:text-white transition-colors cursor-pointer"
                >
                  عن الكتاب
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('chapters')}
                  className="min-h-[44px] inline-flex items-center hover:text-white transition-colors cursor-pointer"
                >
                  فصول الكتاب العشرة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discussions')}
                  className="min-h-[44px] inline-flex items-center hover:text-white transition-colors cursor-pointer"
                >
                  منتدى النقاشات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('articles')}
                  className="min-h-[44px] inline-flex items-center hover:text-white transition-colors cursor-pointer"
                >
                  مقالات القراء
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('author')}
                  className="min-h-[44px] inline-flex items-center hover:text-white transition-colors cursor-pointer"
                >
                  عن المؤلف عثمان الطيب
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Contact (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white">السياسات والتواصل</h4>
            <ul className="space-y-0.5 text-sm text-stone-400">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="min-h-[44px] flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>سياسة الخصوصية</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="min-h-[44px] flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>شروط الاستخدام</span>
                </button>
              </li>
              <li className="pt-2">
                <a
                  href={`mailto:${store.getSiteSettings().contactEmail}`}
                  className="min-h-[44px] flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E84200]" />
                  <span className="font-mono text-xs">{store.getSiteSettings().contactEmail}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لكتاب «مدن الإنسان» — عثمان الطيب.</p>
          <div className="flex items-center gap-1.5 text-xs">
            <span>مساحة فكرية عربية لصالح إنسان المدن</span>
            <Heart className="w-3 h-3 text-[#E84200] fill-current" />
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-6 flex justify-center">
          <a
            href="https://qdv.qa"
            target="_blank"
            rel="noopener"
            dir="ltr"
            className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-wide text-stone-500 hover:text-stone-300 transition-colors"
          >
            <span>Powered by</span>
            <span className="bg-white rounded-lg px-2 py-1 shadow-xs">
              <img src="/images/qdv-logo.jpg" alt="Qatar Digital Vision (QDV)" className="h-9 sm:h-10 w-auto" loading="lazy" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};
