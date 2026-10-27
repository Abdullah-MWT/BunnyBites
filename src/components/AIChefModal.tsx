import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChefHat,
  Users,
  Coins,
  Flame,
  ShoppingBag,
  Send,
  MessageSquare,
  Lightbulb,
  MapPin,
  Globe2,
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

type LanguageMode = 'roman' | 'ur' | 'en';

export const AIChefModal: React.FC<AIChefModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onAddMultipleToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'sommelier' | 'ask'>('sommelier');
  const [language, setLanguage] = useState<LanguageMode>('roman');

  // Sommelier inputs
  const [partySize, setPartySize] = useState<number>(4);
  const [budget, setBudget] = useState<number>(4500);
  const [craving, setCraving] = useState<string>('Lots of cheese, crispy chicken and spicy wings');
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<FeastRecommendation | null>(null);

  const getChefGreeting = (lang: LanguageMode) => {
    switch (lang) {
      case 'ur':
        return 'السلام علیکم! میں فیصل خان مروت ہوں، بنی بائٹس حیات آباد کا بانی۔ ہمارے 24 گھنٹے خمیر شدہ ڈو، اسٹون اوون بیکنگ، یا پشاور میں فیملی ڈائننگ کے بارے میں کچھ بھی پوچھیے!';
      case 'roman':
        return 'Assalam-o-Alaikum! Main Faisal Khan Marwat hoon, Bunny Bites Hayatabad ka founder. Hamare 24-hour dough, stone-deck baking, ya Peshawar mein family dining ke baare mein kuch bhi poochein!';
      default:
        return 'Assalam-o-Alaikum! I am Faisal Khan Marwat, founder of Bunny Bites Hayatabad. Ask me anything about our 24h fermented dough, stone-deck baking, or family dining in Peshawar!';
    }
  };

  // Ask Chef inputs
  const [chefQuestion, setChefQuestion] = useState<string>('');
  const [isAskingChef, setIsAskingChef] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'faisal'; text: string }[]>([
    {
      sender: 'faisal',
      text: getChefGreeting('roman'),
    },
  ]);

  if (!isOpen) return null;

  const handleLanguageChange = (newLang: LanguageMode) => {
    setLanguage(newLang);
    soundEffects.playPop();
    setChatHistory(prev => {
      if (prev.length <= 1) {
        return [{ sender: 'faisal', text: getChefGreeting(newLang) }];
      }
      return [
        ...prev,
        {
          sender: 'faisal',
          text:
            newLang === 'ur'
              ? 'زبان اردو منتخب ہوئی۔ اب آپ مجھ سے اردو میں کوئی بھی سوال پوچھ سکتے ہیں!'
              : newLang === 'roman'
              ? 'Language Roman Urdu set. Ab aap Roman Urdu mein sawal pooch sakte hain!'
              : 'Switched to English. Ask me anything about our kitchen and deals!',
        },
      ];
    });
  };

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
          language,
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

    const cartQueue: { item: MenuItem; size?: { name: string; price: number }; quantity: number }[] = [];

    recommendation.recommendedItems.forEach(rec => {
      const matched =
        menuItems.find(
          m =>
            m.name.toLowerCase().includes(rec.name.toLowerCase()) ||
            rec.name.toLowerCase().includes(m.name.toLowerCase())
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
          text:
            language === 'ur'
              ? 'السلام علیکم! ہماری کچن میں اس وقت گرما گرم پتھر کے اوون چل رہے ہیں۔ ہمارا ہر کراؤن کرسٹ خالص موزریلا سے ہاتھ سے تیار ہوتا ہے!'
              : language === 'roman'
              ? 'Assalam-o-Alaikum! Kitchen mein hot stone ovens chal rahe hain. Hamara har Crown Crust pure mozzarella se hand-crimped bake hota hai!'
              : 'Assalam-o-Alaikum! Our kitchen is bustling with hot stone ovens right now. Rest assured, every Crown Crust is hand-crimped with pure mozzarella and baked at 450°C!',
        },
      ]);
    } finally {
      setIsAskingChef(false);
    }
  };

  const suggestedQuestions = {
    ur: [
      'کراؤن کرسٹ پیزا میں کیا خاص بات ہے؟',
      'کیا آپ کی ڈو واقعی 24 گھنٹے خمیر ہوتی ہے؟',
      'حیات آباد میں رات گئے ڈلیوری کب تک ہوتی ہے؟',
      'فیملی کے لیے کونسا ٹیبل اور ڈیل بہترین ہے؟',
    ],
    roman: [
      'Crown Crust pizza mein kya khas baat hai?',
      'Kya dough sach mein 24 hours ferment hoti hai?',
      'Late night delivery kab tak open hoti hai?',
      'Family ke liye konsi table aur deal best hai?',
    ],
    en: [
      'What makes the 18-Crown Crust unique?',
      'How is the 24-hour dough fermented?',
      'Do you deliver late night in Hayatabad?',
      'Which table is best for a family gathering?',
    ],
  }[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0189FE] to-amber-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  Faisal Khan's AI Concierge
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                  اردو + EN
                </span>
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

        {/* Language Selection Ribbon */}
        <div className="px-5 py-2 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[#0189FE]" />
            <span>Select Language / زبان منتخب کریں:</span>
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleLanguageChange('roman')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'roman'
                  ? 'bg-[#0189FE] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Roman Urdu
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ur')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'ur'
                  ? 'bg-[#0189FE] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              اردو
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#0189FE] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
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
            <span>
              {language === 'ur'
                ? 'دعوت پلانر اور مینو کی تجاویز'
                : language === 'roman'
                ? 'Feast Sommelier & Meal Planner'
                : 'Feast Sommelier & Meal Planner'}
            </span>
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
            <span>
              {language === 'ur'
                ? 'شیف فیصل خان سے سوال پوچھیں'
                : language === 'roman'
                ? 'Ask Chef Faisal Khan (Urdu)'
                : 'Ask Chef Faisal Khan'}
            </span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'sommelier' ? (
            <div className="space-y-6">
              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Party Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0189FE]" />
                    <span>
                      {language === 'ur'
                        ? `افراد کی تعداد: ${partySize} مہمان`
                        : `Party Size: ${partySize} Guests`}
                    </span>
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
                    <span>
                      {language === 'ur'
                        ? `بجٹ کا ہدف: Rs. ${budget.toLocaleString()}`
                        : `Budget Target: Rs. ${budget.toLocaleString()}`}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1500"
                    max="10000"
                    step="500"
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Rs. 1,500</span>
                    <span>Rs. 5,000</span>
                    <span>Rs. 10,000</span>
                  </div>
                </div>
              </div>

              {/* Craving Input & Spice Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ur'
                      ? 'آپ کا دل کیا کھانے کو چاہ رہا ہے؟'
                      : language === 'roman'
                      ? 'Aapka kya khaney ka mood hai?'
                      : 'What flavors are you craving?'}
                  </label>
                  <input
                    type="text"
                    value={craving}
                    onChange={e => setCraving(e.target.value)}
                    placeholder={
                      language === 'ur'
                        ? 'مثال: زیادہ چیز، کرسپی چکن اور کولڈ ڈرنک'
                        : language === 'roman'
                        ? 'e.g. Bohat sari cheese, crispy chicken aur blue lagoon'
                        : 'e.g. Lots of cheese, crispy chicken, sweet wings'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0189FE]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>{language === 'ur' ? 'مرچ کی شدت' : 'Spice Level'}</span>
                  </label>
                  <div className="flex gap-1">
                    {(['mild', 'medium', 'hot'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSpiceLevel(lvl)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          spiceLevel === lvl
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateRecommendation}
                disabled={isLoadingRecommendation}
                className="w-full py-3 rounded-xl bg-[#0189FE] hover:bg-[#0170FE] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoadingRecommendation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {language === 'ur'
                        ? 'شیف فیصل خان خاص دعوت تیار کر رہے ہیں...'
                        : 'Chef Faisal is assembling your feast...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {language === 'ur'
                        ? 'میرے لیے دعوت کی تجویز تیار کریں'
                        : language === 'roman'
                        ? 'Assemble My Custom Feast'
                        : 'Assemble My Custom Feast'}
                    </span>
                  </>
                )}
              </button>

              {/* Recommendation Result */}
              {recommendation && (
                <div className="mt-4 p-5 rounded-2xl bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-sky-200/60 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0189FE]">
                        Curated Recommendation
                      </span>
                      <h4 className="font-serif font-black text-lg text-slate-900 dark:text-white">
                        {recommendation.feastTitle}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Est. Price</span>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {recommendation.totalEstimatedPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{recommendation.greeting}"
                  </p>

                  {/* Recommended Items */}
                  <div className="space-y-2">
                    {recommendation.recommendedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                    <span>
                      {language === 'ur'
                        ? 'پوری تجویز کردہ دعوت کارٹ میں شامل کریں'
                        : 'Add Entire Recommended Feast to Cart'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chat Thread */}
              <div className="space-y-3 min-h-[220px] max-h-[340px] overflow-y-auto pr-1">
                {chatHistory.map((msg, i) => {
                  const isUrduScript = /[\u0600-\u06FF]/.test(msg.text);
                  return (
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
                        dir={isUrduScript ? 'rtl' : 'ltr'}
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#0189FE] text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isAskingChef && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span>
                      {language === 'ur'
                        ? 'فیصل خان مروت جواب لکھ رہے ہیں...'
                        : 'Faisal Khan is answering...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Questions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'ur'
                    ? 'تجویز کردہ سوالات (کلک کریں)'
                    : language === 'roman'
                    ? 'Suggested Questions (Click to Ask)'
                    : 'Suggested Questions'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((q, i) => (
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
                  placeholder={
                    language === 'ur'
                      ? 'فیصل خان سے ڈو، اوون، ریسیپی، یا فیملی ٹیبل کے بارے میں پوچھیے...'
                      : language === 'roman'
                      ? 'Faisal Khan se dough, recipe, tables, ya spice ke baare mein poochein...'
                      : 'Ask Faisal Khan about dough, recipes, tables, spice...'
                  }
                  dir={language === 'ur' ? 'rtl' : 'ltr'}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0189FE]"
                />
                <button
                  type="submit"
                  disabled={!chefQuestion.trim() || isAskingChef}
                  className="px-4 py-2.5 rounded-xl bg-[#0189FE] hover:bg-[#0170FE] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'بھیجیں' : 'Send'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
