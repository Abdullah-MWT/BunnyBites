import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChefHat,
  Users,
  Coins,
  Flame,
  Check,
  ShoppingBag,
  Send,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import { MenuItem } from '../types';

interface RecommendedItem {
  name: string;
  size: string;
  price: number;
  reason: string;
}

interface FeastRecommendation {
  feastTitle: string;
  greeting: string;
  recommendedItems: RecommendedItem[];
  totalEstimatedPrice: number;
  chefTip: string;
  ambienceSuggestion: string;
}

interface AIChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onAddMultipleToCart: (items: { item: MenuItem; size?: { name: string; price: number }; quantity: number }[]) => void;
}

export const AIChefModal: React.FC<AIChefModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onAddMultipleToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'sommelier' | 'ask'>('sommelier');

  // Sommelier inputs
  const [partySize, setPartySize] = useState<number>(4);
  const [budget, setBudget] = useState<number>(4500);
  const [craving, setCraving] = useState<string>('Lots of cheese, crispy chicken and spicy wings');
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<FeastRecommendation | null>(null);

  // Ask Chef inputs
  const [chefQuestion, setChefQuestion] = useState<string>('');
  const [isAskingChef, setIsAskingChef] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'faisal'; text: string }[]>([
    {
      sender: 'faisal',
      text: 'Assalam-o-Alaikum! I am Faisal Khan, founder of Bunny Bites Hayatabad. Ask me anything about our 24h fermented dough, stone-deck baking, or family dining in Peshawar!',
    },
  ]);

  if (!isOpen) return null;

  const handleGenerateRecommendation = async () => {
    soundEffects.playPop();
    setIsLoadingRecommendation(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partySize,
          budget,
          craving,
          spiceLevel,
        }),
      });

      if (!res.ok) throw new Error('Failed to get recommendation');
      const data: FeastRecommendation = await res.json();
      setRecommendation(data);
      soundEffects.playCartDing();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const handleAddFeastToCart = () => {
    if (!recommendation) return;
    soundEffects.playCartDing();

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0189FE', '#F5C45E', '#10B981'],
      });
    } catch {}

    // Match recommended items with existing menu items or generate synthetic cart items
    const cartQueue: { item: MenuItem; size?: { name: string; price: number }; quantity: number }[] = [];

    recommendation.recommendedItems.forEach(rec => {
      const matched = menuItems.find(
        m => m.name.toLowerCase().includes(rec.name.toLowerCase()) || rec.name.toLowerCase().includes(m.name.toLowerCase())
      ) || menuItems[0];

      cartQueue.push({
        item: matched,
        size: { name: rec.size, price: rec.price },
        quantity: 1,
      });
    });

    onAddMultipleToCart(cartQueue);
    onClose();
  };

  const handleAskChef = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = customQuestion || chefQuestion;
    if (!query.trim()) return;

    soundEffects.playPop();
    const newHistory = [...chatHistory, { sender: 'user' as const, text: query }];
    setChatHistory(newHistory);
    setChefQuestion('');
    setIsAskingChef(true);

    try {
      const res = await fetch('/api/ai/ask-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) throw new Error('Chef was unavailable');
      const data = await res.json();
      setChatHistory([...newHistory, { sender: 'faisal' as const, text: data.answer }]);
      soundEffects.playPop();
    } catch (err) {
      setChatHistory([
        ...newHistory,
        {
          sender: 'faisal',
          text: 'Assalam-o-Alaikum! Our kitchen is bustling with hot stone ovens right now. Rest assured, every Crown Crust is hand-crimped with pure mozzarella and baked at 450°C!',
        },
      ]);
    } finally {
      setIsAskingChef(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0189FE] to-amber-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  Faisal Khan's AI Concierge
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hayatabad Phase 1 • Peshawar's Premier Artisan Pizzeria
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Single Straight Line) */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('sommelier')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sommelier'
                ? 'border-[#0189FE] text-[#0189FE]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Feast Sommelier & Meal Planner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ask')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ask'
                ? 'border-[#0189FE] text-[#0189FE]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Chef Faisal Khan</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'sommelier' ? (
            <div className="space-y-6">
              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Party Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0189FE]" />
                    <span>Party Size: {partySize} Guests</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={partySize}
                    onChange={e => setPartySize(Number(e.target.value))}
                    className="w-full accent-[#0189FE] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>1 (Solo)</span>
                    <span>4 (Family)</span>
                    <span>8+ (Party)</span>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Budget Target: Rs. {budget.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="1200"
                    max="12000"
                    step="500"
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Rs. 1,200</span>
                    <span>Rs. 5,000</span>
                    <span>Rs. 12,000</span>
                  </div>
                </div>
              </div>

              {/* Craving / Vibe Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  What are you craving tonight?
                </label>
                <input
                  type="text"
                  value={craving}
                  onChange={e => setCraving(e.target.value)}
                  placeholder="e.g. Lots of cheese pull, spicy wings, chilled mocktail"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0189FE]"
                />
                {/* Quick Craving Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Crown Crust Cheese Pull',
                    'Extra Spicy Khyber Crunch',
                    'Late Night 2 AM Feast',
                    'Kids Favorite Mild',
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCraving(tag)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Spice:
                </span>
                {(['mild', 'medium', 'hot'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpiceLevel(lvl)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      spiceLevel === lvl
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateRecommendation}
                disabled={isLoadingRecommendation}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0189FE] to-[#2563EB] hover:from-[#0170FE] hover:to-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoadingRecommendation ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Faisal Khan is Crafting Your Feast...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Tailored Feast Recommendation</span>
                  </>
                )}
              </button>

              {/* Recommendation Card */}
              {recommendation && (
                <div className="p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-200/60 dark:border-slate-700 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-2 border-b border-sky-200/40 dark:border-slate-700 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#0F4C81] dark:text-sky-300">
                        {recommendation.feastTitle}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                        “{recommendation.greeting}”
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Estimate</div>
                      <div className="text-sm font-black text-[#0189FE]">
                        Rs. {recommendation.totalEstimatedPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {recommendation.recommendedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.size}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.reason}</p>
                        </div>
                        <div className="font-black text-[#0189FE] ml-3 whitespace-nowrap">
                          Rs. {item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chef Tip & Table Ambience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                      <span className="font-bold flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Chef Tip
                      </span>
                      <p className="text-[11px] leading-relaxed">{recommendation.chefTip}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200">
                      <span className="font-bold flex items-center gap-1 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Table Recommendation
                      </span>
                      <p className="text-[11px] leading-relaxed">{recommendation.ambienceSuggestion}</p>
                    </div>
                  </div>

                  {/* Add Entire Feast to Cart */}
                  <button
                    type="button"
                    onClick={handleAddFeastToCart}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Entire Recommended Feast to Cart</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chat Thread */}
              <div className="space-y-3 min-h-[220px] max-h-[340px] overflow-y-auto pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'faisal' && (
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                        FK
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0189FE] text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAskingChef && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span>Faisal Khan is answering...</span>
                  </div>
                )}
              </div>

              {/* Quick Questions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Suggested Questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'What makes your Crown Crust different from regular stuffed crust?',
                    'How long do you ferment your dough?',
                    'Can we bring a family of 10 for dinner?',
                    'What is your most popular chicken deal?',
                  ].map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAskChef(undefined, q)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskChef} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={chefQuestion}
                  onChange={e => setChefQuestion(e.target.value)}
                  placeholder="Ask Faisal Khan about dough, recipes, tables, spice..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0189FE]"
                />
                <button
                  type="submit"
                  disabled={!chefQuestion.trim() || isAskingChef}
                  className="px-4 py-2.5 rounded-xl bg-[#0189FE] hover:bg-[#0170FE] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
