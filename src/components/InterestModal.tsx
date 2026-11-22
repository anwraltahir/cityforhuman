import { useEscapeClose } from '../hooks/useEscapeClose';
import React, { useEffect, useState } from 'react';
import { X, BellRing, CheckCircle2, ChevronDown } from 'lucide-react';
import { COUNTRIES, findCountry, normalizeNational, phoneError } from '../data/countries';

interface InterestModalProps {
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Register your interest" form: saved on the server for launch announcements. */
export const InterestModal: React.FC<InterestModalProps> = ({ onClose }) => {
  useEscapeClose(onClose);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const country = findCountry(countryCode);
  const national = normalizeNational(phone);

  // Keep the page behind the dialog from scrolling (and jumping) on phones
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'يرجى كتابة الاسم';
    if (!email.trim()) e.email = 'يرجى كتابة البريد الإلكتروني';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'البريد الإلكتروني غير صحيح';
    if (!country) e.country = 'اختر الدولة';
    const pe = country ? phoneError(country, national) : national ? '' : 'يرجى كتابة رقم الجوال';
    if (pe) e.phone = pe;
    return e;
  };

  const touch = (field: string) => {
    const e = validate();
    setErrors((prev) => ({ ...prev, [field]: e[field] || '' }));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    setBusy(true);
    try {
      const r = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), countryCode, phone: national }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || 'تعذر التسجيل، حاول مرة أخرى');
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'تعذر الاتصال بالخادم');
    } finally {
      setBusy(false);
    }
  };

  // 16px text: smaller inputs make iPhone zoom the whole page when they get focus
  const field = (bad?: string) =>
    `w-full p-3 bg-[#FAF8F5] border rounded-xl text-base text-stone-900 focus:outline-none ${
      bad ? 'border-red-400 focus:border-red-500' : 'border-[#DDD5C7] focus:border-[#268F0C]'
    }`;
  const label = 'block text-xs font-bold text-stone-700 mb-1';
  const err = (k: string) => (errors[k] ? <p className="text-xs font-semibold text-red-600 mt-1">{errors[k]}</p> : null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] text-right"
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
              <p className="text-sm text-stone-600 leading-relaxed">سنُعلمك فور صدور كتاب «مدن الإنسان» وتوفّره في المكتبات.</p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 text-sm font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] rounded-xl cursor-pointer"
              >
                حسناً
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="p-6 sm:p-7 space-y-4">
              <div className="pl-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E84200] bg-[#E84200]/10 px-2.5 py-1 rounded-full">
                  <BellRing className="w-3.5 h-3.5" />
                  قريباً في المكتبات
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 mt-3">سجّل اهتمامك بالكتاب</h3>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">اترك بياناتك لنُعلمك أولاً عند صدور الكتاب وأماكن توفّره.</p>
              </div>

              <div>
                <label htmlFor="int-name" className={label}>الاسم *</label>
                <input
                  id="int-name"
                  className={field(errors.name)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => touch('name')}
                  maxLength={100}
                  autoComplete="name"
                />
                {err('name')}
              </div>

              <div>
                <label htmlFor="int-email" className={label}>البريد الإلكتروني *</label>
                <input
                  id="int-email"
                  className={field(errors.email)}
                  type="email"
                  dir="ltr"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                  maxLength={150}
                  autoComplete="email"
                  inputMode="email"
                />
                {err('email')}
              </div>

              <div>
                <label htmlFor="int-country" className={label}>الدولة *</label>
                <div className="relative">
                  <select
                    id="int-country"
                    className={`${field(errors.country)} appearance-none pl-10 cursor-pointer ${countryCode ? '' : 'text-stone-400'}`}
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setErrors((p) => ({ ...p, country: '', phone: '' }));
                    }}
                  >
                    <option value="" disabled>
                      اختر دولتك
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="text-stone-900">
                        {c.name} (+{c.dial})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {err('country')}
              </div>

              <div>
                <label htmlFor="int-phone" className={label}>رقم الجوال / واتساب *</label>
                <div
                  dir="ltr"
                  className={`flex items-stretch bg-[#FAF8F5] border rounded-xl overflow-hidden focus-within:border-[#268F0C] ${
                    errors.phone ? 'border-red-400' : 'border-[#DDD5C7]'
                  }`}
                >
                  <span className="flex items-center px-3 text-base font-semibold text-stone-600 bg-[#F0EAE1] border-r border-[#DDD5C7] tabular-nums">
                    {country ? `+${country.dial}` : '+ ···'}
                  </span>
                  <input
                    id="int-phone"
                    className="flex-1 min-w-0 p-3 bg-transparent text-base text-stone-900 focus:outline-none tabular-nums"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={country ? country.example : 'اختر الدولة أولاً'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d٠-٩۰-۹ ]/g, '').slice(0, 20))}
                    onBlur={() => phone && touch('phone')}
                  />
                </div>
                {errors.phone ? (
                  err('phone')
                ) : country ? (
                  <p className="text-xs text-stone-400 mt-1">
                    اكتب رقمك بدون مفتاح الدولة ({country.min === country.max ? country.min : `${country.min}–${country.max}`} أرقام).
                  </p>
                ) : null}
              </div>

              {serverError && <p className="text-xs font-semibold text-red-600">{serverError}</p>}

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
    </div>
  );
};
