import React, { useEffect, useState } from 'react';
import { Download, Trash2, Mail, Phone } from 'lucide-react';
import { store } from '../services/storage';
import { useToast } from './Toast';

interface Interest {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
}

const authHeader = () => ({ Authorization: `Bearer ${store.getAdminToken()}` });

/** Admin view of "register your interest" sign-ups (stored on the server). */
export const InterestList: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<Interest[] | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await fetch('/api/admin/interest', { headers: authHeader() });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || 'تعذر تحميل القائمة');
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر الاتصال بالخادم');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = async () => {
    const r = await fetch('/api/admin/interest.csv', { headers: authHeader() });
    if (!r.ok) return showToast('تعذر التصدير', 'error');
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = `interested-readers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id: string) => {
    if (!window.confirm('حذف هذا التسجيل؟')) return;
    const r = await fetch(`/api/admin/interest/${id}`, { method: 'DELETE', headers: authHeader() });
    if (!r.ok) return showToast('تعذر الحذف', 'error');
    setItems((prev) => (prev || []).filter((x) => x.id !== id));
  };

  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!items) return <p className="text-sm text-stone-500">جارٍ التحميل…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="px-4 py-3 bg-white rounded-2xl border border-[#E5DDD0]">
          <p className="text-xs text-stone-500">عدد المسجلين</p>
          <p className="text-2xl font-extrabold text-[#E84200]">{items.length}</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!items.length}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#268F0C] hover:bg-[#1F7509] rounded-xl disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          تصدير إلى Excel
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#E5DDD0] text-sm text-stone-500">
          لم يسجّل أحد اهتمامه بعد.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5DDD0] overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E5DDD0] text-stone-600">
              <tr>
                <th className="p-3 font-bold">الاسم</th>
                <th className="p-3 font-bold">التواصل</th>
                <th className="p-3 font-bold">الدولة</th>
                <th className="p-3 font-bold">التاريخ</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {items.map((x) => (
                <tr key={x.id}>
                  <td className="p-3 font-semibold text-stone-800">{x.name}</td>
                  <td className="p-3 text-stone-600 space-y-1" dir="ltr">
                    {x.email && (
                      <a href={`mailto:${x.email}`} className="flex items-center gap-1.5 justify-end hover:text-[#268F0C]">
                        {x.email} <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {x.phone && (
                      <a
                        href={`https://wa.me/${x.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 justify-end hover:text-[#268F0C]"
                      >
                        {x.phone} <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-stone-600">{x.country || '—'}</td>
                  <td className="p-3 text-stone-500 whitespace-nowrap">
                    {new Date(x.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => remove(x.id)}
                      aria-label="حذف"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
