/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserCheck, BookOpen, Quote, Globe, Mail } from 'lucide-react';

export const AuthorSection: React.FC = () => {
  return (
    <section id="author" className="py-16 lg:py-24 border-b border-[#E8E2D6] bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Author Portrait (5 cols) */}
          {/* Author Portrait (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-sm w-full">
              <div className="absolute -inset-3 bg-[#C1E2B9]/30 rounded-3xl transform rotate-1 filter blur-xs" />
              <div className="relative rounded-2xl overflow-hidden border border-[#D5CCBE] shadow-xl bg-white">
                <img
                  src="/images/author_osman_official.jpeg"
                  alt="المهندس والباحث عثمان الطيب - مؤلف كتاب مدن الإنسان"
                  className="w-full h-auto object-cover max-h-[440px]"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 bg-white border-t border-[#E8E2D6] text-right">
                  <h3 className="text-base font-extrabold text-stone-900">م. عثمان الطيب</h3>
                  <p className="text-xs text-stone-500 font-medium">مهندس مدني وباحث في حركة العمران الجديد وأنسنة المدن</p>
                </div>
              </div>
            </div>
          </div>

          {/* Author Bio & Thesis (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#268F0C]">
              <UserCheck className="w-4 h-4" />
              <span>عن المؤلف والمسيرة المهنية والفكرية</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              المهندس والكاتب عثمان الطيب
            </h2>

            {/* Author Pull Quote from Book */}
            <div className="relative p-5 rounded-2xl bg-[#F7F3EB] border border-[#E3DBD0] my-4">
              <Quote className="w-8 h-8 text-[#A99C8A]/40 absolute left-4 top-4 rotate-180" />
              <p className="text-base sm:text-lg font-semibold text-stone-800 leading-relaxed italic">
                «فقد كانت المدن تُبنى للإنسان، وتُخطط على وقع خطواته، وفي هذا الكتاب نتبين العلاقة الوثيقة بين العمران والإنسان وكيف يؤثر كل منهما في الآخر.»
              </p>
              <span className="block text-xs font-bold text-[#E84200] mt-2">
                — عثمان الطيب، من كتاب مدن الإنسان
              </span>
            </div>

            <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
              <p className="font-semibold text-stone-900">
                عثمان الطيب مهندس مدني، حصل على ماجستير الهندسة المدنية من جامعة برادلي بالولايات المتحدة الأمريكية، وعمل في العديد من المشاريع المرموقة في أمريكا وقطر والسودان.
              </p>
              <p>
                تعرّف على رواد حركة العمران الجديد (New Urbanism) في أمريكا، أمثال <strong className="text-stone-900">أندريس دواني</strong> و<strong className="text-stone-900">جيف سبيك</strong> و<strong className="text-stone-900">فيكتور دوفر</strong>، وعاين عن كثب الأثر العظيم الذي أحدثوه في عمران مدن أمريكا، وسعى من خلال هذا الكتاب وهذا المجتمع لنقل وتوطين هذه المفاهيم في العالم العربي.
              </p>
              <p className="text-xs text-stone-500 italic border-t border-[#F0EAE1] pt-3">
                «الكتاب ممتع وراقٍ ويحمل حساً مرهفاً لفنان وأديب وليس مهندساً مدنياً فقط، كما أثرى المؤلف اللغة العربية بمفردات جميلة وغائبة.» — د. حسام الدين إسماعيل
              </p>
            </div>

            {/* Direct Official Links */}
            <div className="pt-4 border-t border-[#E8E2D6] flex flex-wrap items-center gap-6 text-xs font-semibold text-stone-600">
              <a
                href="https://cityforhuman.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-[#268F0C] transition-colors"
              >
                <Globe className="w-4 h-4 text-[#268F0C]" />
                <span>الموقع الرسمي: cityforhuman.com</span>
              </a>

              <a
                href="mailto:osman7777@gmail.com"
                className="flex items-center gap-1.5 hover:text-[#268F0C] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#E84200]" />
                <span className="font-mono text-xs">osman7777@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
