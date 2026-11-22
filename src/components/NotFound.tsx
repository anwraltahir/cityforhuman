import React from 'react';
import { ArrowRight, SearchX } from 'lucide-react';

interface NotFoundProps {
  title: string;
  message: string;
  backLabel: string;
  onBack: () => void;
}

/** Shared "not found" view for missing discussions, articles, chapters and unknown paths. */
export const NotFound: React.FC<NotFoundProps> = ({ title, message, backLabel, onBack }) => (
  <div className="py-20 px-4 text-center text-stone-600 max-w-xl mx-auto">
    <SearchX className="w-12 h-12 text-stone-300 mx-auto" aria-hidden="true" />
    <h1 className="mt-4 text-2xl font-extrabold text-stone-900">{title}</h1>
    <p className="mt-2 text-base leading-relaxed">{message}</p>
    <button
      onClick={onBack}
      className="mt-6 inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-[#268F0C] hover:bg-[#1f7309] text-white rounded-xl text-sm font-bold cursor-pointer"
    >
      <ArrowRight className="w-4 h-4" aria-hidden="true" />
      {backLabel}
    </button>
  </div>
);
