import React, { useState } from 'react';
import { Plus, Trash2, Save, BookOpen, Tablet, ArrowUp } from 'lucide-react';
import { BookAvailability, BookStore, DigitalStore } from '../types';
import { store } from '../services/storage';
import { useToast } from './Toast';

const tmpId = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const input =
  'w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]';
const label = 'block text-[11px] font-bold text-stone-600 mb-1';

/** Admin editor for where to get the book: bookstores (printed) and online stores (digital). */
export const AvailabilityManager: React.FC = () => {
  const { showToast } = useToast();
  const [av, setAv] = useState<BookAvailability>(() => store.getAvailability());
  const [saving, setSaving] = useState(false);

  const setPaper = (paper: BookStore[]) => setAv((a) => ({ ...a, paper }));
  const setDigital = (digital: DigitalStore[]) => setAv((a) => ({ ...a, digital }));
  const editPaper = (id: string, patch: Partial<BookStore>) => setPaper(av.paper.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const editDigital = (id: string, patch: Partial<DigitalStore>) =>
    setDigital(av.digital.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const moveUp = <T,>(list: T[], i: number) => (i === 0 ? list : [...list.slice(0, i - 1), list[i], list[i - 1], ...list.slice(i + 1)]);

  const addStore = () => {
    // Pre-fill the country of the last store, since stores are usually added country by country
    const last = av.paper[av.paper.length - 1];
    setPaper([...av.paper, { id: tmpId('store'), country: last?.country || '', name: '' }]);
  };

  const save = async () => {
    const paper = av.paper.filter((s) => s.country.trim() || s.name.trim());
    const digital = av.digital.filter((d) => d.name.trim() || d.url.trim());
    if (paper.some((s) => !s.country.trim() || !s.name.trim())) return showToast('اكتب الدولة واسم المكتبة لكل مكتبة', 'error');
    if (digital.some((d) => !d.name.trim() || !d.url.trim())) return showToast('اكتب اسم المتجر والرابط لكل متجر', 'error');
    setSaving(true);
    const res = await store.updateAvailability({ paper, digital });
    setSaving(false);
    if (res.ok) {
      setAv(store.getAvailability());
      showToast('تم حفظ أماكن توفر الكتاب، وظهرت للزوار', 'success');
    } else {
      showToast(res.error || 'تعذر الحفظ', 'error');
    }
  };

  const isEmpty = av.paper.length === 0 && av.digital.length === 0;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="p-4 rounded-2xl bg-[#FFF7F2] border border-[#F5D5C2] text-xs text-stone-700 leading-relaxed">
        {isEmpty ? (
          <>
            حالياً لا توجد أماكن مضافة، لذلك يظهر للزوار <strong>«قريباً في المكتبات»</strong> مع زر تسجيل الاهتمام. عند إضافة أول
            مكتبة أو متجر وحفظها، يتغيّر الموقع تلقائياً إلى <strong>«متوفر الآن»</strong> ويظهر زر «احصل على الكتاب».
          </>
        ) : (
          <>
            الكتاب يظهر للزوار <strong>«متوفر الآن»</strong>. إذا حذفت كل الأماكن يرجع الموقع إلى «قريباً في المكتبات».
          </>
        )}
      </div>

      {/* Printed edition */}
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E5DDD0] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
            <BookOpen className="w-4 h-4 text-[#268F0C]" />
            النسخة الورقية: المكتبات ({av.paper.length})
          </h3>
          <button
            onClick={addStore}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة مكتبة
          </button>
        </div>
        {av.paper.length === 0 && <p className="text-xs text-stone-500">لم تُضف أي مكتبة بعد.</p>}
        {av.paper.map((s, i) => (
          <div key={s.id} className="p-3.5 rounded-2xl bg-[#FAF8F5]/60 border border-[#E8E2D6] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={label}>الدولة *</label>
                <input className={input} value={s.country} onChange={(e) => editPaper(s.id, { country: e.target.value })} placeholder="مثال: قطر" />
              </div>
              <div>
                <label className={label}>المدينة</label>
                <input className={input} value={s.city || ''} onChange={(e) => editPaper(s.id, { city: e.target.value })} placeholder="مثال: الدوحة" />
              </div>
              <div>
                <label className={label}>اسم المكتبة *</label>
                <input className={input} value={s.name} onChange={(e) => editPaper(s.id, { name: e.target.value })} placeholder="مثال: مكتبة جرير" />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>العنوان</label>
                <input className={input} value={s.address || ''} onChange={(e) => editPaper(s.id, { address: e.target.value })} placeholder="الحي، الشارع، المجمع" />
              </div>
              <div>
                <label className={label}>الهاتف</label>
                <input className={input} dir="ltr" value={s.phone || ''} onChange={(e) => editPaper(s.id, { phone: e.target.value })} placeholder="+974 ..." />
              </div>
              <div className="sm:col-span-3">
                <label className={label}>رابط الموقع على خرائط جوجل</label>
                <input className={input} dir="ltr" value={s.mapUrl || ''} onChange={(e) => editPaper(s.id, { mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {i > 0 && (
                <button onClick={() => setPaper(moveUp(av.paper, i))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-stone-600 hover:bg-[#EFEAE2] rounded-lg cursor-pointer">
                  <ArrowUp className="w-3.5 h-3.5" />
                  تقديم
                </button>
              )}
              <button onClick={() => setPaper(av.paper.filter((x) => x.id !== s.id))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Digital edition */}
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E5DDD0] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
            <Tablet className="w-4 h-4 text-[#268F0C]" />
            النسخة الرقمية: روابط المتاجر ({av.digital.length})
          </h3>
          <button
            onClick={() => setDigital([...av.digital, { id: tmpId('shop'), name: '', url: '' }])}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة متجر
          </button>
        </div>
        {av.digital.length === 0 && <p className="text-xs text-stone-500">لم يُضف أي متجر بعد.</p>}
        {av.digital.map((d, i) => (
          <div key={d.id} className="p-3.5 rounded-2xl bg-[#FAF8F5]/60 border border-[#E8E2D6] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={label}>اسم المتجر *</label>
                <input className={input} value={d.name} onChange={(e) => editDigital(d.id, { name: e.target.value })} placeholder="مثال: أمازون كيندل" />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>رابط صفحة الكتاب في المتجر *</label>
                <input className={input} dir="ltr" value={d.url} onChange={(e) => editDigital(d.id, { url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {i > 0 && (
                <button onClick={() => setDigital(moveUp(av.digital, i))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-stone-600 hover:bg-[#EFEAE2] rounded-lg cursor-pointer">
                  <ArrowUp className="w-3.5 h-3.5" />
                  تقديم
                </button>
              )}
              <button onClick={() => setDigital(av.digital.filter((x) => x.id !== d.id))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="sticky bottom-0 py-3 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5] to-transparent">
        <button
          onClick={save}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] disabled:opacity-60 rounded-xl shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'جارٍ الحفظ...' : 'حفظ ونشر على الموقع'}
        </button>
      </div>
    </div>
  );
};
