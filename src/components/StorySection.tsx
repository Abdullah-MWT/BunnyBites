import React from 'react';
import { CONFIG } from '../config';
import { ShieldCheck, Flame, Clock, ChefHat } from 'lucide-react';

export const StorySection: React.FC = () => {
  return (
    <section id="our-story" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start boutique-card p-8 sm:p-12">
        {/* Left: Brand Values & Faisal Khan's Philosophy */}
        <div className="lg:col-span-7">
          <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
            The Heritage & Philosophy
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            The Bunny Bites Story
          </h2>

          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {CONFIG.ownerStory}
          </p>

          {/* Pillars Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100 dark:border-slate-800">
            <div className="p-4 rounded-xl border border-stone-200/70 dark:border-slate-800 flex flex-col gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Pure Mozzarella</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Genuine dairy mozzarella and cream cheese with zero synthetic substitutes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200/70 dark:border-slate-800 flex flex-col gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">450°C Stone Oven</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Volcanic refractory stone deck baking for flash blistering and digestible crusts.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200/70 dark:border-slate-800 flex flex-col gap-2">
              <Clock className="w-5 h-5 text-[#0189FE]" />
              <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Open Till 3 AM</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Peshawar’s premier late-night dining hub for family gatherings and midnight feasts.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Founder Faisal Khan Card */}
        <div className="lg:col-span-5 flex flex-col items-center text-center p-8 rounded-2xl bg-stone-50 dark:bg-slate-800/40 border border-stone-200/70 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center mb-4 shadow-sm">
            <ChefHat className="w-8 h-8 text-amber-400" />
          </div>

          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Faisal Khan
          </h3>
          <p className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 font-sans-clean">
            Founder & Master Baker
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bunny Bites Hayatabad Phase 1, Peshawar
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-5 italic leading-relaxed font-serif p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-stone-200/60 dark:border-slate-700/60">
            “When we opened Bunny Bites in Hayatabad, our ambition was clear: bring world-class stone-baked pizza craft together with the warmth of Peshawar hospitality. Every cheese crown is folded with utmost care for your family.”
          </p>

          <a
            href={CONFIG.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
          >
            Watch Kitchen Videos on TikTok
          </a>
        </div>
      </div>
    </section>
  );
};
