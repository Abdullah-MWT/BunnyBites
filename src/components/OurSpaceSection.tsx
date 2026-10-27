import React, { useState } from 'react';
import { Sparkles, MapPin, Armchair, Sun, Eye, ChevronRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export const OurSpaceSection: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<number>(0);

  const spaceFeatures = [
    {
      id: 0,
      title: 'Periwinkle Santorini Arches',
      subtitle: 'Acoustic Doorways & Soft Perimeter Glow',
      icon: '🏛️',
      color: 'bg-blue-500/10 text-[#0189FE]',
      description:
        'Inspired by the whitewashed cliffside architecture of Oia, our dining rooms are framed with soft Greek periwinkle archways. Concealed warm 3000K LED strips wash down the textured acoustic plaster, creating a calm, intimate sanctuary away from the bustling streets of Hayatabad.',
      details: [
        { label: 'Palette', value: 'Santorini Periwinkle & Aegean Blue' },
        { label: 'Lighting', value: '3000K Soft Architectural Halo' },
        { label: 'Vibe', value: 'Intimate, Peaceful & Family-Friendly' },
      ],
    },
    {
      id: 1,
      title: '3D Bunny Mascot Wall Feature',
      subtitle: 'Sculptural Emblem & Floating Cloud Panels',
      icon: '🐰',
      color: 'bg-sky-500/10 text-sky-500',
      description:
        'The centerpiece of our main hall: a handcrafted 3D white bunny mascot sculpture with soft pink inner ears, emerging cheerfully from scalloped cloud wall cutouts. Loved by children and family diners alike as Peshawar’s most photographed restaurant wall.',
      details: [
        { label: 'Artisan', value: 'Hand-sculpted matte ceramic finish' },
        { label: 'Backdrop', value: 'Wave cloud contour panels' },
        { label: 'Highlight', value: 'Peshawar’s signature photo spot' },
      ],
    },
    {
      id: 2,
      title: 'Blue Rose & Brass Halo Chandeliers',
      subtitle: 'Suspended Florals & Warm Ring Lamps',
      icon: '✨',
      color: 'bg-amber-500/10 text-amber-500',
      description:
        'Suspended above the center tables are brushed brass ring chandeliers intertwined with cascading Santorini blue silk roses. The lighting casts a gentle, flattering glow on every hand-pinched crown pizza served to your table.',
      details: [
        { label: 'Fixtures', value: 'Brushed Brass Ring Halo Chandeliers' },
        { label: 'Florals', value: 'Cascading Santorini Blue Silk Roses' },
        { label: 'Atmosphere', value: 'Warm celebratory evening dining' },
      ],
    },
    {
      id: 3,
      title: 'Velvet Cloud Family Booths',
      subtitle: 'Deep-Plush Seating for Feasts up to 12',
      icon: '🛋️',
      color: 'bg-indigo-500/10 text-indigo-500',
      description:
        'Custom built with high-density ergonomic foam and upholstered in royal periwinkle velvet. Designed specifically for extended family dinners and birthday celebrations, keeping sound insulated and conversation private.',
      details: [
        { label: 'Capacity', value: 'Booths for 4, 6, and combined 12' },
        { label: 'Comfort', value: 'Deep velvet cushions & high acoustic back' },
        { label: 'Experience', value: '90-minute relaxed leisurely stay' },
      ],
    },
  ];

  const current = spaceFeatures[selectedFeature];

  return (
    <section id="our-space" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* Editorial Header */}
      <div className="max-w-2xl mb-10 sm:mb-12">
        <div className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Interior Architecture & Atmosphere
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          The Santorini Space
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Whitewashed organic curves, Greek periwinkle arches, and warm brass glow create Peshawar’s most tranquil dining sanctuary in Hayatabad Phase 1.
        </p>
      </div>

      {/* Main Interactive Space Showcase Card */}
      <div className="boutique-card overflow-hidden">
        {/* Navigation Selector Tabs (Horizontally Scrollable without Clipping on Mobile) */}
        <div className="p-2 sm:p-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {spaceFeatures.map((feat, idx) => {
              const isSelected = idx === selectedFeature;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setSelectedFeature(idx);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{feat.icon}</span>
                  <span>{feat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 p-6 sm:p-10 items-center">
          {/* Left: Atmospheric Architectural Visual Frame */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 dark:from-slate-850 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center shadow-inner">
              {/* Architectural Arches Backdrop */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-20">
                <div className="w-56 h-72 rounded-t-full border-4 border-dashed border-[#0189FE]" />
              </div>

              {/* Center Decorative Emblem */}
              <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/90 dark:bg-slate-800/90 shadow-xl border border-sky-200 dark:border-slate-700 flex items-center justify-center text-4xl sm:text-5xl mb-4 backdrop-blur-md">
                {current.icon}
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0189FE] block mb-1">
                  Hayatabad Sanctuary
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {current.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  {current.subtitle}
                </p>
              </div>

              {/* Bottom pill tag */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xs">
                  📍 Pirpal Plaza, Phase 1 Hayatabad, Peshawar
                </span>
              </div>
            </div>
          </div>

          {/* Right: Narrative & Design Specification */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans-clean">
                  Design Element 0{current.id + 1}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs font-semibold text-[#0189FE] mt-1">
                {current.subtitle}
              </p>

              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {current.description}
              </p>
            </div>

            {/* Design Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {current.details.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {item.label}
                  </span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quote on Design by Faisal Khan Marwat */}
            <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 italic font-serif">
              “Every arch, curve, and warm light was sketched to make our guests in Peshawar feel as if they stepped straight onto a Greek island terrace.”
              <span className="block not-italic font-sans font-bold text-slate-900 dark:text-white text-[11px] mt-1">
                — Faisal Khan Marwat, Founder
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
