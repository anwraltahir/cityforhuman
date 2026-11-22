import { useEscapeClose } from '../hooks/useEscapeClose';
import React, { useState } from 'react';
import { X, BookOpen, Tablet, MapPin, Phone, ExternalLink, BellRing, Store } from 'lucide-react';
import { BookAvailability, BookStore } from '../types';

interface GetBookModalProps {
  availability: BookAvailability;
  onClose: () => void;
  onRegisterInterest: () => void;
}

/** "Get the book": printed edition by country/bookstore, digital edition via store links. */
export const GetBookModal: React.FC<GetBookModalProps> = ({ availability, onClose, onRegisterInterest }) => {
  useEscapeClose(onClose);
  const { paper, digital } = availability;
  const [tab, setTab] = useState<'paper' | 'digital'>(paper.length || !digital.length ? 'paper' : 'digital');

  // Group bookstores by country, keeping the order the admin entered them in
  const byCountry = paper.reduce<Map<string, BookStore[]>>((m, s) => {
    m.set(s.country, [...(m.get(s.country) || []), s]);
    return m;
  }, new Map());

  const comingSoon = (label: string) => (
    <div className="text-center py-8 px-4 space-y-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E84200] bg-[#E84200]/10 px-3 py-1.5 rounded-full">
        <BellRing className="w-3.5 h-3.5" />
        قريباً
      </span>
      <p className="text-sm text-stone-600 leading-relaxed">{label}</p>
      <button
        onClick={onRegisterInterest}
        className="px-5 py-2.5 text-sm font-bold text-white bg-[#E84200] hover:bg-[#C93900] rounded-xl shadow-sm cursor-pointer"
      >
        سجّل اهتمامك ليصلك إشعار
      </button>
    </div>
  );

  const tabBtn = (id: 'paper' | 'digital', label: string, Icon: typeof BookOpen, count: number) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
        tab === id ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count > 0 && <span className="text-xs text-[#268F0C] tabular-nums">({count})</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[88dvh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-[#F0EAE1]">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 left-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-extrabold text-stone-900 pl-8">احصل على كتاب «مدن الإنسان»</h2>
          <p className="text-xs text-stone-500 mt-1">اختر النسخة التي تناسبك</p>
          <div className="mt-4 flex gap-1 p-1 bg-[#F4EFEA] rounded-2xl">
            {tabBtn('paper', 'النسخة الورقية', BookOpen, paper.length)}
            {tabBtn('digital', 'النسخة الرقمية', Tablet, digital.length)}
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {tab === 'paper' &&
            (paper.length === 0 ? (
              comingSoon('النسخة الورقية ستتوفر قريباً في المكتبات. سجّل اهتمامك ونخبرك بأماكن توفرها فور وصولها.')
            ) : (
              <div className="space-y-6">
                {[...byCountry.entries()].map(([country, stores]) => (
                  <div key={country}>
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900 mb-3">
                      <MapPin className="w-4 h-4 text-[#268F0C]" />
                      {country}
                    </h3>
                    <ul className="space-y-2.5">
                      {stores.map((s) => (
                        <li key={s.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                {s.name}
                              </p>
                              {(s.city || s.address) && (
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                  {[s.city, s.address].filter(Boolean).join(' · ')}
                                </p>
                              )}
                              {s.phone && (
                                <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} className="mt-1 inline-flex items-center gap-1 text-xs text-stone-600 hover:text-[#268F0C]" dir="ltr">
                                  <Phone className="w-3 h-3" />
                                  {s.phone}
                                </a>
                              )}
                            </div>
                            {s.mapUrl && (
                              <a
                                href={s.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#268F0C] bg-white border border-[#DDD5C7] hover:border-[#268F0C] rounded-lg"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                الموقع
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}

          {tab === 'digital' &&
            (digital.length === 0 ? (
              comingSoon('النسخة الرقمية ستتوفر قريباً على متاجر الكتب الإلكترونية.')
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-stone-500 mb-1">اشترِ نسختك الرقمية من أحد المتاجر التالية:</p>
                {digital.map((d) => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] hover:border-[#268F0C] hover:bg-white transition-colors group"
                  >
                    <span className="font-bold text-sm text-stone-900">{d.name}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#268F0C] group-hover:bg-[#1f7309] px-3 py-1.5 rounded-lg">
                      اشترِ الآن
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
