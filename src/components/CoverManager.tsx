import React, { useRef, useState } from 'react';
import { ImageUp, RotateCcw } from 'lucide-react';
import { store } from '../services/storage';
import { useToast } from './Toast';

const SLOTS = [
  { id: 'front', label: 'الغلاف في أعلى الصفحة الرئيسية' },
  { id: 'official', label: 'الغلاف في قسم «عن الكتاب»' },
] as const;

const MAX_BYTES = 7 * 1024 * 1024;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

/** Uploads book covers to the server so every visitor sees them. */
export const CoverManager: React.FC = () => {
  const { showToast } = useToast();
  const [version, setVersion] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const call = async (slot: string, method: 'POST' | 'DELETE', body?: object) => {
    setBusy(slot);
    try {
      const r = await fetch(`/api/admin/cover/${slot}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.getAdminToken()}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || 'تعذر حفظ الغلاف');
      setVersion(Date.now());
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر الاتصال بالخادم', 'error');
      return false;
    } finally {
      setBusy(null);
    }
  };

  const onPick = async (slot: string, file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      showToast('الصيغة غير مدعومة، استخدم JPG أو PNG أو WEBP', 'error');
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast('حجم الصورة أكبر من 7 ميجابايت', 'error');
      return;
    }
    if (await call(slot, 'POST', { dataUrl: await readAsDataUrl(file) })) {
      showToast('تم تحديث الغلاف لجميع الزوار', 'success');
    }
  };

  const onReset = async (slot: string) => {
    if (!window.confirm('استعادة الغلاف الأصلي؟')) return;
    if (await call(slot, 'DELETE')) showToast('تمت استعادة الغلاف الأصلي', 'success');
  };

  return (
    <div className="max-w-2xl bg-white p-4 sm:p-6 rounded-3xl border border-[#E5DDD0] space-y-4">
      <div>
        <h3 className="text-sm font-bold text-stone-800">غلاف الكتاب</h3>
        <p className="text-[11px] text-stone-500 mt-0.5">
          يظهر التغيير لجميع زوار الموقع فوراً. الصيغ المقبولة: JPG أو PNG أو WEBP، بحد أقصى 7 ميجابايت.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SLOTS.map((slot) => (
          <div key={slot.id} className="p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-2xl space-y-3">
            <p className="text-xs font-bold text-stone-700">{slot.label}</p>
            <img
              src={`/cover/${slot.id}?v=${version}`}
              alt={slot.label}
              className="w-full h-56 object-contain bg-white rounded-xl border border-[#E5DDD0]"
            />
            <input
              ref={(el) => {
                inputs.current[slot.id] = el;
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                onPick(slot.id, e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => inputs.current[slot.id]?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#268F0C] hover:bg-[#1F7509] rounded-xl disabled:opacity-50 cursor-pointer"
              >
                <ImageUp className="w-4 h-4" />
                {busy === slot.id ? 'جارٍ الرفع…' : 'تغيير الغلاف'}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => onReset(slot.id)}
                title="استعادة الغلاف الأصلي"
                className="px-3 py-2 text-xs font-bold text-stone-600 bg-white border border-[#DDD5C7] hover:border-stone-400 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
