import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Thermometer,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface CookingStage {
  id: number;
  stageNumber: string;
  title: string;
  subtitle: string;
  duration: string;
  temperature: string;
  hydration: string;
  chefQuote: string;
  description: string;
  sensoryHighlights: {
    aroma: string;
    texture: string;
    secret: string;
  };
  visualHighlights: string[];
}

const COOKING_STAGES: CookingStage[] = [
  {
    id: 1,
    stageNumber: '01',
    title: '24-Hour Cold Fermentation',
    subtitle: 'High-Hydration Neapolitan Dough',
    duration: '24 Hours',
    temperature: '4°C Chill',
    hydration: '68% Hydration',
    chefQuote:
      'We never rush the dough. Slow cold fermentation breaks down complex starches, developing deep flavor and giving you an airy crust that never feels heavy in the stomach.',
    description:
      'Milled double-zero flour is mixed with pure filtered water, extra virgin olive oil, and sea salt. The dough rests in chilled fermentation vaults for a full 24 hours, blooming millions of tiny micro-bubbles.',
    sensoryHighlights: {
      aroma: 'Subtle notes of toasted sourdough and fresh yeast',
      texture: 'Feather-light, pillowy interior with crisp outer skin',
      secret: 'Chilled 24h rest produces easily digestible, featherweight crust',
    },
    visualHighlights: ['68% Hydration Hydrated Core', 'Living Yeast Fermentation', 'Zero Artificial Preservatives'],
  },
  {
    id: 2,
    stageNumber: '02',
    title: 'Hand-Pinching the 18 Crowns',
    subtitle: 'The Signature Cheese Pockets',
    duration: '3 Minutes',
    temperature: 'Ambient Kitchen',
    hydration: 'Precision Crimp',
    chefQuote:
      'Every single bump is folded by hand. We place a measured cube of mozzarella and cream cheese into each fold, crimping it tight like a royal crown so nothing leaks until you take the first bite.',
    description:
      'Our pizzaiolos stretch the dough by hand over semolina flour. Along the outer perimeter, eighteen uniform pockets are folded and sealed with double cheese, creating the world-famous Crown Crust.',
    sensoryHighlights: {
      aroma: 'Sweet dairy creaminess blending with semolina dust',
      texture: 'Velvety molten cheese bursting on every bite',
      secret: 'Dual cheese blend: Danish mozzarella for pull + cream cheese for richness',
    },
    visualHighlights: ['18 Symmetry Pockets', 'Double Cheese Injection', 'Garlic Butter Base Seal'],
  },
  {
    id: 3,
    stageNumber: '03',
    title: 'Khyber Tandoori & Smoked Marinade',
    subtitle: 'Charcoal-Grilled Spices Meets Mediterranean Toppings',
    duration: '12-Hour Marinate',
    temperature: 'Charcoal Pit',
    hydration: 'Spice Emulsion',
    chefQuote:
      'We marry Peshawar’s charcoal-grilled tandoori heritage with fresh Mediterranean capsicum and Kalamata olives. The chicken is smoked over hickory coal before it ever touches the pizza.',
    description:
      'Tender chicken fillets are brined for 12 hours in Greek yogurt, smoked paprika, roasted coriander, and crushed Kashmiri chilies. Sliced thin and flame-charred to seal in natural juices.',
    sensoryHighlights: {
      aroma: 'Smoky mesquite wood smoke and toasted cumin',
      texture: 'Succulent charred chicken contrasting creamy cheese',
      secret: 'Buttermilk brine breaks down protein fibers for ultra-tender bite',
    },
    visualHighlights: ['Hickory Coal Infusion', 'Greek Kalamata Olives', 'Farm-Fresh Green Capsicum'],
  },
  {
    id: 4,
    stageNumber: '04',
    title: '450°C Volcanic Stone Deck Blast',
    subtitle: 'The 180-Second Flash Blister',
    duration: '180 Seconds',
    temperature: '450°C Deck',
    hydration: 'Flash Caramelization',
    chefQuote:
      'Standard conveyor ovens bake at 240°C for 8 minutes, which dries out the crust. Our stone decks hit 450°C, blistering the dough in 180 seconds flat so the inside stays steaming soft like fresh naan.',
    description:
      'The raw pie is slid onto volcanic refractory stone decks. In 180 seconds, intense bottom-up conduction causes rapid cornicione rise, creating leopard spots and caramelizing natural sugars.',
    sensoryHighlights: {
      aroma: 'Caramelized whey, charred grain, and bubbling cheese oils',
      texture: 'Paper-thin blistered crust cracking into pillowy warmth',
      secret: 'Refractory stone draws moisture away immediately for crisp bottom',
    },
    visualHighlights: ['Authentic Leopard Blistering', 'Zero Soggy Crust Bottom', 'Triple-Layer Heat Retention'],
  },
  {
    id: 5,
    stageNumber: '05',
    title: 'Garlic-Herb Finish & Silver Cloche',
    subtitle: 'The Table Presentation Ritual',
    duration: '30 Seconds',
    temperature: 'Hot Serving',
    hydration: 'Herb Glaze',
    chefQuote:
      'The moment the pizza leaves the stone deck, we brush every cheese bump with hot garlic-infused olive oil and oregano. It arrives under a polished dome, sealing in the initial fragrance.',
    description:
      'A hot swirl of house-churned garlic butter and fresh Mediterranean oregano is brushed across the molten crown bumps. Covered immediately under our signature cloche for delivery or table service.',
    sensoryHighlights: {
      aroma: 'Sizzling roasted garlic and pungent Mediterranean oregano bloom',
      texture: 'Glistening fragrant sheen with molten cheese pull',
      secret: 'Cloche dome traps aromatic steam until lifted at the table',
    },
    visualHighlights: ['Cold-Pressed Garlic Olive Oil', 'Wild Mediterranean Oregano', 'Signature Silver Cloche Service'],
  },
];

export const CookingCraftSection: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const currentStage = COOKING_STAGES[activeStageIndex];

  const handleNext = () => {
    soundEffects.playPop();
    setActiveStageIndex(prev => (prev + 1) % COOKING_STAGES.length);
  };

  const handlePrev = () => {
    soundEffects.playPop();
    setActiveStageIndex(prev => (prev - 1 + COOKING_STAGES.length) % COOKING_STAGES.length);
  };

  return (
    <section id="cooking-craft" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* Editorial Header */}
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          The Craft of Stone Baking
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          How We Bake The Crown Crust
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Behind every single pie is a five-stage artisan ritual. Discover the exact science of high hydration, 450°C stone decks, and 18 hand-crimped mozzarella crowns.
        </p>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="boutique-card overflow-hidden">
        {/* Stage Timeline Navigation Bar */}
        <div className="border-b border-stone-200/80 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-900/40 p-2 sm:p-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {COOKING_STAGES.map((stage, idx) => {
              const isActive = idx === activeStageIndex;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveStageIndex(idx);
                  }}
                  className={`flex-1 min-w-[130px] sm:min-w-[160px] p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#131B2A] border border-stone-200 dark:border-slate-700 shadow-xs text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono tabular-nums font-semibold text-stone-400 dark:text-slate-500">
                      Stage {stage.stageNumber}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{stage.duration}</span>
                  </div>
                  <h4 className="text-xs sm:text-xs font-semibold truncate">{stage.title}</h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Details Grid */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-7 border border-slate-800">
              <div className="flex items-center justify-between mb-5 text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider text-sky-400">
                  Ritual {currentStage.stageNumber} / 05
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Hayatabad Kitchen
                </span>
              </div>

              {/* Dial Metrics */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Thermometer className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Temperature</div>
                  <div className="text-xs font-bold text-white mt-0.5">{currentStage.temperature}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Duration</div>
                  <div className="text-xs font-bold text-white mt-0.5">{currentStage.duration}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Hydration</div>
                  <div className="text-xs font-bold text-white mt-0.5">{currentStage.hydration}</div>
                </div>
              </div>

              {/* Quality Standards */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Craft Standards
                </div>
                {currentStage.visualHighlights.map((hl, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg border border-stone-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-mono tabular-nums text-slate-400">
                {activeStageIndex + 1} / {COOKING_STAGES.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Narrative & Quote */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <span>Stage {currentStage.stageNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{currentStage.subtitle}</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {currentStage.title}
              </h3>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {currentStage.description}
              </p>
            </div>

            {/* Quote Card (Clean Hairline Border, Zero Left Accent Strip) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-slate-800/50 border border-stone-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs tracking-wider">
                  FKM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Faisal Khan Marwat
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">Founder & Executive Pizzaiolo</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed pt-1 font-serif">
                “{currentStage.chefQuote}”
              </p>
            </div>

            {/* Sensory Highlights Trio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-stone-200/70 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Aroma
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {currentStage.sensoryHighlights.aroma}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200/70 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Texture
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {currentStage.sensoryHighlights.texture}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200/70 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Technique
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {currentStage.sensoryHighlights.secret}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
