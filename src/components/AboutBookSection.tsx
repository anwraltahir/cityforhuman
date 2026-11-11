/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Layers, CheckCircle, ArrowDown, MapPin, Sparkles } from 'lucide-react';

interface AboutBookSectionProps {
  onExploreChapters: () => void;
}

export const AboutBookSection: React.FC<AboutBookSectionProps> = ({ onExploreChapters }) => {
  return (
    <section id="about" className="py-16 lg:py-24 border-b border-[#E8E2D6] bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Architectural visual showcase & Full Book Jacket */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#DDD5C7] shadow-lg bg-[#F4EFEA]">
              <img
                src="/src/assets/images/book_cover_official.jpeg"
                alt="غلاف كتاب مدن الإنسان الكامل (الأمامي والخلفي)"
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 bg-white/95 backdrop-blur-xs border-t border-[#E8E2D6] text-right">
                <p className="text-xs text-stone-500 font-semibold mb-1">كلمة الغلاف الخلفي للكتاب</p>
                <p className="text-xs sm:text-sm font-bold text-stone-800 leading-relaxed">
                  «لم تعد المدن تُقام من أجل الإنسان، بل صارت ممرات مزعجة للسيارات، وفقدت ذلك الألق الذي ميّز المدن العريقة ذات الأحياء الحميمة والدروب العامرة، فقد كانت المدن تُبنى للإنسان، وتُخطط على وقع خطواته...»
                </p>
                <span className="block text-xs font-semibold text-[#268F0C] mt-2">
                  — من غلاف كتاب مدن الإنسان، عثمان الطيب
                </span>
              </div>
            </div>

            {/* Endorsement Card */}
            <div className="p-4 rounded-xl bg-white border border-[#E8E2D6] text-right space-y-2">
              <p className="text-xs text-stone-700 italic leading-relaxed">
                «إن كتاب "مدن الإنسان" ليس مجرد دراسة في التخطيط العمراني، بل هو دعوة للتفكير في شكل الحياة الحضرية التي نريدها لأجيالنا القادمة.»
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold border-t border-[#F2ECE3] pt-2">
                <span>د. أمجد إبراهيم سلمان</span>
                <span className="text-[#268F0C]">شهادة نقدية</span>
              </div>
            </div>
          </div>

          {/* Text and book information */}
          <div className="lg:col-span-7 space-y-6 text-right order-1 lg:order-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#268F0C]">
              <BookOpen className="w-4 h-4" />
              <span>عن الكتاب ورسالته</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              كتاب «مدن الإنسان» للمؤلف عثمان الطيب
            </h2>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
              يقدم كتاب <strong className="text-stone-900">«مدن الإنسان»</strong> قراءة نقدية وبصرية عميقة للتحولات الدراماتيكية التي طرأت على مدننا العربية والعالمية منذ مطلع القرن العشرين حين تم تسليم مقاليد التخطيط لحساب حركة المركبات الخاصة على حساب راحة وأمان المشاة.
            </p>

            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              عبر <strong className="text-stone-900 font-bold">10 فصول مترابطة</strong>، يأخذنا الكاتب في رحلة تبدأ من تشريح أخطار الطرق السريعة ومتاهة الزحام الدائم، مروراً بجرائم التخطيط الوظيفي الصارم وتدمير الطبيعة الحضرية، وصولاً إلى استشراف مدن الغد الإنسانية التي تحتفي بالأطفال والمشاة والساحات الخضراء والنقل المستدام.
            </p>

            {/* Core pillars list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E8E2D6]">
                <CheckCircle className="w-5 h-5 text-[#268F0C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">استعادة المقياس الإنساني</h4>
                  <p className="text-xs text-stone-500 mt-0.5">تصميم الشوارع لسرعة مشي الإنسان (٤ كم/س) وليس سرعة المركبة (٨٠ كم/س).</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E8E2D6]">
                <CheckCircle className="w-5 h-5 text-[#268F0C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">تفكيك وهم توسيع الطرق</h4>
                  <p className="text-xs text-stone-500 mt-0.5">شرح ظاهرة الطلب المستحث ولماذا كل حارة إضافية تجلب المزيد من الزحام.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E8E2D6]">
                <CheckCircle className="w-5 h-5 text-[#268F0C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">إحياء الساحات العامة والأرصفة</h4>
                  <p className="text-xs text-stone-500 mt-0.5">تحويل الأرصفة من مواقف عشوائية إلى شرايين خضراء للتنزه والتلاقي الاجتماعي.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E8E2D6]">
                <CheckCircle className="w-5 h-5 text-[#268F0C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">تجارب ونماذج عالمية رائدة</h4>
                  <p className="text-xs text-stone-500 mt-0.5">استلهام الحلول من تجارب يان جيل، جين جاكوبز، سوبربلوك برشلونة، ومترو المشاة.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onExploreChapters}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4 text-[#C1E2B9]" />
                <span>استعراض الفصول العشرة وبدء النقاش</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
