import React, { useState } from 'react';
import { X, BellRing, CheckCircle2 } from 'lucide-react';

interface InterestModalProps {
  onClose: () => void;
}

/** "Register your interest" form: saved on the server for launch announcements. */
export const InterestModal: React.FC<InterestModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('يرجى كتابة الاسم');
    if (!email.trim() && !phone.trim()) return setError('يرجى كتابة البريد الإلكتروني أو رقم الجوال');
    setBusy(true);
    try {
      const r = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, country }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || 'تعذر التسجيل، حاول مرة أخرى');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر الاتصال بالخادم');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-[#268F0C] mx-auto" />
            <h3 className="text-lg font-extrabold text-stone-900">شكراً لاهتمامك!</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              سنُعلمك فور صدور كتاب «مدن الإنسان» وتوفّره في الأسواق.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 text-sm font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] rounded-xl cursor-pointer"
            >
              حسناً
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 sm:p-7 space-y-4">
            <div className="pl-8">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E84200] bg-[#E84200]/10 px-2.5 py-1 rounded-full">
                <BellRing className="w-3.5 h-3.5" />
                قريباً في الأسواق
              </span>
              <h3 className="text-xl font-extrabold text-stone-900 mt-3">سجّل اهتمامك بالكتاب</h3>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                اترك بياناتك لنُعلمك أولاً عند صدور الكتاب وأماكن توفّره.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الاسم *</label>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني</label>
              <input
                className={input}
                type="email"
                dir="ltr"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={150}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الجوال / واتساب</label>
                <input
                  className={input}
                  type="tel"
                  dir="ltr"
                  placeholder="+966…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الدولة</label>
                <input className={input} value={country} onChange={(e) => setCountry(e.target.value)} maxLength={60} />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">يكفي البريد الإلكتروني أو رقم الجوال.</p>

            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] rounded-xl shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              {busy ? 'جارٍ التسجيل…' : 'سجّل اهتمامك'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
