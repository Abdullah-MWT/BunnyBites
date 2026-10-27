import React from 'react';

interface FoodIllustrationProps {
  type: string;
  className?: string;
}

/**
 * Minimalist Boutique Restaurant Vector Icon Set
 * Replaces generic cartoons with refined, artisanal culinary line emblems.
 */
export const FoodIllustration: React.FC<FoodIllustrationProps> = ({ type, className = 'w-16 h-16' }) => {
  switch (type) {
    case 'crown-pizza':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#0189FE]" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Outer crust ring */}
            <circle cx="50" cy="50" r="42" strokeWidth="1.8" className="stroke-slate-300 dark:stroke-slate-600" />
            <circle cx="50" cy="50" r="34" strokeWidth="1.2" strokeDasharray="3 3" className="stroke-[#0189FE]/60 dark:stroke-sky-400/60" />
            
            {/* 12 Minimalist Crown Bump Geometry */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const cx = 50 + Math.cos(rad) * 38;
              const cy = 50 + Math.sin(rad) * 38;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  className="fill-amber-400/20 dark:fill-amber-400/30 stroke-amber-500 dark:stroke-amber-400"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Inner stone-oven cheese field */}
            <circle cx="50" cy="50" r="26" className="fill-sky-50/60 dark:fill-sky-950/30 stroke-[#0189FE] dark:stroke-sky-400" strokeWidth="1.5" />
            
            {/* Minimalist toppings: olives and basil accents */}
            <circle cx="43" cy="42" r="2" className="fill-slate-700 dark:fill-slate-300" stroke="none" />
            <circle cx="58" cy="45" r="2" className="fill-slate-700 dark:fill-slate-300" stroke="none" />
            <circle cx="48" cy="58" r="2" className="fill-slate-700 dark:fill-slate-300" stroke="none" />
            <path d="M48 46C51 44 54 47 52 50" strokeWidth="1.2" strokeLinecap="round" className="stroke-emerald-600 dark:stroke-emerald-400" />
            <path d="M40 52C43 51 45 54 43 56" strokeWidth="1.2" strokeLinecap="round" className="stroke-emerald-600 dark:stroke-emerald-400" />
          </svg>
        </div>
      );

    case 'chicken':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Crisp drumstick outline */}
            <path
              d="M36 68L26 78C24 80 21 80 19 78C17 76 17 73 19 71L29 61"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-stone-400 dark:stroke-slate-500"
            />
            <circle cx="21" cy="80" r="3.5" className="fill-stone-100 dark:fill-slate-800 stroke-stone-400 dark:stroke-slate-500" strokeWidth="1.5" />
            <circle cx="17" cy="76" r="3.5" className="fill-stone-100 dark:fill-slate-800 stroke-stone-400 dark:stroke-slate-500" strokeWidth="1.5" />

            {/* Golden crispy meat contour */}
            <path
              d="M34 66C26 54 30 38 42 26C54 14 70 16 78 27C86 38 82 58 70 68C59 76 41 76 34 66Z"
              className="fill-amber-500/10 dark:fill-amber-400/15 stroke-amber-600 dark:stroke-amber-400"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Delicate crunch hatching */}
            <path d="M45 34C52 30 62 32 69 38" strokeWidth="1.4" strokeLinecap="round" className="stroke-amber-600/70 dark:stroke-amber-400/80" />
            <path d="M42 47C50 43 64 45 72 53" strokeWidth="1.4" strokeLinecap="round" className="stroke-amber-600/70 dark:stroke-amber-400/80" />
            <path d="M40 59C47 56 58 58 64 64" strokeWidth="1.4" strokeLinecap="round" className="stroke-amber-600/70 dark:stroke-amber-400/80" />
          </svg>
        </div>
      );

    case 'wings':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Glazed wing silhouette */}
            <path
              d="M26 56C20 42 30 25 46 22C61 20 78 30 81 46C82 58 70 73 55 71C41 69 30 65 26 56Z"
              className="fill-rose-500/10 dark:fill-rose-400/15 stroke-rose-600 dark:stroke-rose-400"
              strokeWidth="1.8"
            />
            {/* Wing bone notch */}
            <path d="M78 40L88 34" strokeWidth="1.8" strokeLinecap="round" className="stroke-stone-400 dark:stroke-slate-500" />

            {/* Subtle glaze luster strokes */}
            <path d="M38 32C49 27 65 32 72 44" strokeWidth="1.4" strokeLinecap="round" className="stroke-rose-500/70 dark:stroke-rose-400/70" />
            <path d="M36 47C45 43 58 45 67 54" strokeWidth="1.4" strokeLinecap="round" className="stroke-rose-500/70 dark:stroke-rose-400/70" />

            {/* Minimalist sesame seed specks */}
            <circle cx="48" cy="38" r="1.2" className="fill-amber-500" stroke="none" />
            <circle cx="58" cy="45" r="1.2" className="fill-amber-500" stroke="none" />
            <circle cx="44" cy="52" r="1.2" className="fill-amber-500" stroke="none" />
            <circle cx="64" cy="54" r="1.2" className="fill-amber-500" stroke="none" />
          </svg>
        </div>
      );

    case 'burger':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Top Brioche Bun */}
            <path
              d="M26 50C26 30 38 20 50 20C62 20 74 30 74 50Z"
              className="fill-amber-500/10 dark:fill-amber-400/15 stroke-amber-600 dark:stroke-amber-400"
              strokeWidth="1.8"
            />
            {/* Sesame seeds */}
            <circle cx="42" cy="32" r="1" className="fill-amber-600 dark:fill-amber-300" stroke="none" />
            <circle cx="50" cy="28" r="1" className="fill-amber-600 dark:fill-amber-300" stroke="none" />
            <circle cx="58" cy="32" r="1" className="fill-amber-600 dark:fill-amber-300" stroke="none" />

            {/* Lettuce ruffle */}
            <path
              d="M24 53Q30 50 36 53Q42 56 48 53Q54 50 60 53Q66 56 72 53Q74 53 76 53"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="stroke-emerald-600 dark:stroke-emerald-400"
            />

            {/* Patty */}
            <rect x="24" y="58" width="52" height="9" rx="4.5" className="fill-stone-700/15 dark:fill-stone-300/15 stroke-stone-700 dark:stroke-stone-300" strokeWidth="1.6" />

            {/* Bottom Bun */}
            <path
              d="M26 71C26 71 28 78 50 78C72 78 74 71 74 71Z"
              className="fill-amber-500/10 dark:fill-amber-400/15 stroke-amber-600 dark:stroke-amber-400"
              strokeWidth="1.8"
            />
          </svg>
        </div>
      );

    case 'pasta':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Ceramic Pasta Bowl */}
            <path
              d="M22 48C22 70 36 78 50 78C64 78 78 70 78 48L22 48Z"
              className="fill-slate-100 dark:fill-slate-800/80 stroke-slate-400 dark:stroke-slate-500"
              strokeWidth="1.8"
            />
            {/* Swirling Alfredo pasta line-art */}
            <ellipse cx="50" cy="48" rx="26" ry="10" className="fill-amber-400/20 stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.4" />
            <path d="M38 46C42 42 50 44 54 48C58 52 64 50 66 46" strokeWidth="1.4" strokeLinecap="round" className="stroke-amber-600 dark:stroke-amber-300" />
            {/* Fresh basil leaf */}
            <path d="M48 40C45 34 53 32 55 38C57 32 64 34 61 40Z" className="fill-emerald-600/20 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.2" />
          </svg>
        </div>
      );

    case 'drink':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Slender Tumbler Glass */}
            <path
              d="M34 26L38 74C39 78 43 80 50 80C57 80 61 78 62 74L66 26Z"
              className="fill-sky-500/10 dark:fill-sky-400/15 stroke-[#0189FE] dark:stroke-sky-400"
              strokeWidth="1.8"
            />
            {/* Liquid level */}
            <path d="M36 44L38 72C39 75 43 77 50 77C57 77 61 75 62 72L64 44Z" className="fill-[#0189FE]/20 dark:fill-sky-400/20" stroke="none" />
            {/* Citrus Wheel */}
            <circle cx="36" cy="28" r="8" className="fill-amber-400/20 stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.4" />
            <circle cx="36" cy="28" r="5" strokeWidth="1" strokeDasharray="2 2" className="stroke-amber-600 dark:stroke-amber-300" />
            {/* Straw */}
            <path d="M52 14L54 30L50 72" strokeWidth="2" strokeLinecap="round" className="stroke-slate-400 dark:stroke-slate-500" />
          </svg>
        </div>
      );

    case 'combo':
    default:
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Cloche dome */}
            <path
              d="M24 64C24 42 36 32 50 32C64 32 76 42 76 64Z"
              className="fill-amber-500/10 dark:fill-amber-400/15 stroke-amber-600 dark:stroke-amber-400"
              strokeWidth="1.8"
            />
            {/* Cloche handle */}
            <circle cx="50" cy="28" r="3.5" className="fill-amber-500 stroke-amber-600" strokeWidth="1.2" />
            {/* Serving platter line */}
            <line x1="18" y1="64" x2="82" y2="64" strokeWidth="2" strokeLinecap="round" className="stroke-slate-400 dark:stroke-slate-500" />
            <line x1="26" y1="68" x2="74" y2="68" strokeWidth="1.2" strokeLinecap="round" className="stroke-slate-300 dark:stroke-slate-600" />
          </svg>
        </div>
      );
  }
};
