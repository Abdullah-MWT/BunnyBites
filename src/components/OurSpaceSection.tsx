import React, { useState } from 'react';
import { Eye, MapPin, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export const OurSpaceSection: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const hotspots = [
    {
      id: 'arches',
      title: 'Periwinkle Santorini Arches',
      desc: 'Inspired by the cliffside doorways of Oia, finished in calming Greek periwinkle with soft ambient perimeter illumination.',
      x: '24%',
      y: '35%',
    },
    {
      id: 'bunny-wall',
      title: 'Sculptural Bunny Feature',
      desc: 'Our white architectural mascot emblem peeking through sculpted cloud wall cutouts.',
      x: '50%',
      y: '26%',
    },
    {
      id: 'blue-roses',
      title: 'Blue Floral & Brass Halo Chandelier',
      desc: 'Cascading floral installations of Santorini blue roses woven into brushed brass ring lamps.',
      x: '75%',
      y: '32%',
    },
    {
      id: 'blue-booths',
      title: 'Velvet Cloud Dining Booths',
      desc: 'Deep plush periwinkle seating with curved ergonomic backrests for intimate family feasts.',
      x: '50%',
      y: '78%',
    },
  ];

  return (
    <section id="our-space" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Interior Architecture
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          The Santorini Space
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Whitewashed organic curves, Greek periwinkle arches, and warm brass glow create Peshawar’s most tranquil dining sanctuary.
        </p>
      </div>

      {/* Interactive Room Canvas */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-800 shadow-sm bg-stone-100 dark:bg-slate-900">
        {/* Architectural Arch Silhouette */}
        <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-80">
          {/* Left Arch */}
          <div className="w-40 md:w-52 h-76 rounded-t-full border border-sky-300 dark:border-sky-800 bg-white/40 dark:bg-slate-850/40 relative overflow-hidden">
            <div className="absolute inset-x-4 top-16 flex flex-col gap-2 opacity-40">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-1 bg-sky-400 rounded-full" />
              ))}
            </div>
          </div>

          {/* Center Main Arch */}
          <div className="w-60 md:w-80 h-92 rounded-t-full border border-sky-400 dark:border-sky-700 bg-white/80 dark:bg-slate-800/80 shadow-md relative flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 flex items-center justify-center mb-3 shadow-xs">
              <span className="font-serif text-xl font-bold text-slate-900 dark:text-white">BB</span>
            </div>
            <div className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Bunny Bites Sanctuary
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-sans-clean">
              Phase 1 · Hayatabad, Peshawar
            </p>
          </div>

          {/* Right Arch */}
          <div className="w-40 md:w-52 h-76 rounded-t-full border border-sky-300 dark:border-sky-800 bg-white/40 dark:bg-slate-850/40 relative overflow-hidden">
            <div className="absolute inset-x-4 top-16 flex flex-col gap-2 opacity-40">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-1 bg-sky-400 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Halo Brass Ring Accents */}
        <div className="absolute top-8 left-1/4 w-24 h-6 rounded-full border border-amber-400/80 pointer-events-none" />
        <div className="absolute top-8 right-1/4 w-24 h-6 rounded-full border border-amber-400/80 pointer-events-none" />

        {/* Bottom Dining Row */}
        <div className="absolute inset-x-0 bottom-0 py-3.5 bg-slate-900/90 text-white flex items-center justify-center text-xs border-t border-slate-800">
          <div className="flex items-center gap-6 text-slate-300 font-sans-clean">
            <span>Velvet Cloud Family Booths</span>
            <span>·</span>
            <span>Hanging Santorini Blue Roses</span>
            <span>·</span>
            <span>Warm 3000K Architectural Lighting</span>
          </div>
        </div>

        {/* Interactive Hotspots */}
        {hotspots.map(spot => {
          const isActive = activeHotspot === spot.id;
          return (
            <div
              key={spot.id}
              style={{ left: spot.x, top: spot.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setActiveHotspot(isActive ? null : spot.id);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white scale-110'
                    : 'bg-white text-slate-800 hover:scale-105 border border-stone-200'
                }`}
                aria-label={`Explore ${spot.title}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0189FE]" />
              </button>

              {/* Popover */}
              {isActive && (
                <div className="absolute bottom-10 -left-28 w-60 p-4 rounded-xl bg-white dark:bg-[#131B2A] text-slate-900 dark:text-white shadow-xl border border-stone-200 dark:border-slate-800 text-xs backdrop-blur-md z-30 animate-in fade-in zoom-in-95">
                  <h4 className="font-serif font-bold text-slate-900 dark:text-white mb-1">{spot.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{spot.desc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
