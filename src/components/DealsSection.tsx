import React from 'react';
import { MenuItem } from '../types';
import { FoodIllustration } from './FoodIllustrations';
import { ShoppingBag, Users, Plus } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface DealsSectionProps {
  combos: MenuItem[];
  onAddComboToCart: (combo: MenuItem) => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({ combos, onAddComboToCart }) => {
  const handleAdd = (combo: MenuItem) => {
    soundEffects.playCartDing();
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0189FE', '#D97706'],
      });
    } catch {}
    onAddComboToCart(combo);
  };

  return (
    <section id="deals" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Curated Gatherings
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Feast Bundles
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Balanced tasting combinations designed for family dinners, late-night cravings, and group gatherings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {combos.map((combo, idx) => (
          <div
            key={combo.id}
            className="boutique-card p-7 flex flex-col justify-between group relative"
          >
            {/* Top Row: Serving Size */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean">
                {idx === 0 ? 'Tasting Feast' : idx === 1 ? 'Duo Selection' : 'Midnight Special'}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{idx === 0 ? '4–5 Guests' : idx === 1 ? '2–3 Guests' : '1–2 Guests'}</span>
              </span>
            </div>

            {/* Minimalist Vector Emblem */}
            <div className="py-3 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-stone-50 dark:bg-slate-800/40 border border-stone-200/60 dark:border-slate-800 flex items-center justify-center p-3 text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform">
                <FoodIllustration type="combo" className="w-14 h-14" />
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 flex-1">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                {combo.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {combo.description}
              </p>
            </div>

            {/* Price & Add bundle button */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 dark:text-slate-500 block">Bundle Price</span>
                <span className="font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
                  Rs. {combo.price.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(combo)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bundle</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
