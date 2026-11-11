/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EAE1] bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {isPrivacy ? 'سياسة الخصوصية وحماية البيانات' : 'شروط الاستخدام وميثاق المجتمع'}
            </h3>
            {isPrivacy ? (
              <ShieldCheck className="w-5 h-5 text-[#268F0C]" />
            ) : (
              <FileText className="w-5 h-5 text-[#268F0C]" />
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
          {isPrivacy ? (
            <>
              <p className="font-semibold text-stone-900">
                أهلاً بكم في منصة «مدن الإنسان» (cityforhuman.com). نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية.
              </p>
              <h4 className="font-bold text-stone-900 pt-2">١. البيانات التي نجمعها</h4>
              <p>
                نجمع فقط البيانات الأساسية الضرورية لتشغيل المجتمع ومشاركتك في النقاشات: الاسم، اسم المستخدم، البريد الإلكتروني، والصورة الشخصية. لا نقوم بمشاركة أي من بياناتك مع أطراف ثالثة أو استخدامها لأغراض إعلانية تجارية.
              </p>
              <h4 className="font-bold text-stone-900 pt-2">٢. استخدام ملفات الارتباط</h4>
              <p>
                تُستخدم الجلسات والتخزين المحلي لحفظ حالة تسجيل الدخول وتفضيلات التصفح والإشعارات لضمان تجربة مستخدم سلسة ومستقرة.
              </p>
              <h4 className="font-bold text-stone-900 pt-2">٣. حقوق الملكية الفكرية</h4>
              <p>
                يحتفظ الكاتب عثمان الطيب بجميع حقوق الطبع والنشر والتأليف لكتاب «مدن الإنسان». ويحتفظ القراء والكتاب بحقوق مقالاتهم الأصلية المنشورة على المنصة مع منح المنصة حق العرض غير الحصري.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-stone-900">
                مرحباً بكم في مجتمع «مدن الإنسان». تهدف هذه المنصة إلى فتح حوار فكري ومعماري راقٍ حول قضايا المدن ونقلها.
              </p>
              <h4 className="font-bold text-stone-900 pt-2">١. ميثاق الحوار والاحترام</h4>
              <p>
                يلتزم جميع الأعضاء بالنقاش الموضوعي الهادف والابتعاد عن الإساءة الشخصية أو التمييز أو الترويج التجاري غير المرتبط بمواضيع التخطيط الحضري.
              </p>
              <h4 className="font-bold text-stone-900 pt-2">٢. محتوى المقالات والنقاشات</h4>
              <p>
                تخضع المقالات المقدمة للمراجعة والتدقيق للتأكد من الرصانة العلمية والموضوعية. تحتفظ إدارة المنصة بحق قبول أو رفض أو طلب تعديل أي مقال قبل نشره.
              </p>
              <h4 className="font-bold text-stone-900 pt-2">٣. صلاحيات الإشراف</h4>
              <p>
                يحق للمشرفين والمديرين تثبيت أو إغلاق أو حذف أي مشاركة تخالف ميثاق المجتمع أو تتضمن معلومات مضللة، وذلك لحماية جودة الحوار العام.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F0EAE1] bg-[#FAF8F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
