import React, { useState } from 'react';
import { CrownCrust3D } from './CrownCrust3D';
import { Plus, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CrownCrustSectionProps {
  signatureItem: MenuItem;
  onAddToCart: (item: MenuItem, size: { name: string; price: number }, addOns: { name: string; price: number }[]) => void;
}

export const CrownCrustSection: React.FC<CrownCrustSectionProps> = ({
  signatureItem,
  onAddToCart,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1); // Default Medium 11"
  const [selectedAddOns, setSelectedAddOns] = useState<{ name: string; price: number }[]>([]);
  const [isExploded, setIsExploded] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const sizes = signatureItem.sizes || [
    { name: 'Small (8")', price: 850 },
    { name: 'Medium (11")', price: 1450 },
    { name: 'Large (14")', price: 1950 },
    { name: 'Monster Crown (16")', price: 2550 },
  ];

  const currentSize = sizes[selectedSizeIndex];
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = currentSize.price + addOnsTotal;

  const toggleAddOn = (addOn: { name: string; price: number }) => {
    soundEffects.playPop();
    if (selectedAddOns.some(a => a.name === addOn.name)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addOn.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAdd = () => {
    soundEffects.playCartDing();

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0189FE', '#D97706'],
      });
    } catch {}

    onAddToCart(signatureItem, currentSize, selectedAddOns);

    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1800);
  };

  return (
    <section id="signature-crown" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* Editorial Header */}
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          The Signature Creation
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          The Crown Crust
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Eighteen hand-pinched molten cheese crowns, Greek black olives, Khyber smoked chicken, and stone-oven blisters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center boutique-card p-6 sm:p-10">
        {/* Left: Interactive 3D Pizza Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <CrownCrust3D isExploded={isExploded} onExplodeToggle={() => setIsExploded(!isExploded)} />
        </div>

        {/* Right: Configurator & Order Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {/* Clean Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500 mb-2">
            <span>Bestseller #1</span>
            <span aria-hidden="true">·</span>
            <span>450°C Stone Oven</span>
            <span aria-hidden="true">·</span>
            <span>18 Mozzarella Crowns</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Signature Crown Crust
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Choose your portion, select gourmet additions, and enjoy freshly stone-baked delivery in Hayatabad.
          </p>

          {/* Size Selector */}
          <div className="mt-6">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Portion Size
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {sizes.map((s, idx) => {
                const isSelected = selectedSizeIndex === idx;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      soundEffects.playPop();
                      setSelectedSizeIndex(idx);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-stone-50 dark:bg-slate-800'
                        : 'border-stone-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Rs. {s.price.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons */}
          {signatureItem.addOns && signatureItem.addOns.length > 0 && (
            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Chef Additions
              </label>
              <div className="space-y-1.5">
                {signatureItem.addOns.map(addon => {
                  const isChecked = selectedAddOns.some(a => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-slate-900 dark:border-white bg-stone-50 dark:bg-slate-800'
                          : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-white">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900'
                              : 'border-stone-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                        +Rs. {addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-8 pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-wider block">
                Total
              </span>
              <span className="font-mono tabular-nums text-xl font-bold text-slate-900 dark:text-white">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 font-semibold text-xs tracking-wide flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Crown Crust</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
