import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Send,
  X,
  Sparkles,
  Bot,
  AlertCircle,
  Square,
  Globe2,
} from 'lucide-react';
import { MenuItem } from '../types';
import { soundEffects } from '../utils/audio';

interface VoiceConciergeProps {
  menuItems: MenuItem[];
  onVoiceAddItem: (item: MenuItem, qty: number) => void;
  onVoiceOpenCart: () => void;
  onVoiceScrollTo: (sectionId: string) => void;
  onSpeakingChange: (isSpeaking: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bunny' | 'user';
  text: string;
}

type AssistantStatus = 'idle' | 'listening' | 'processing' | 'unavailable';
type LanguageMode = 'roman' | 'ur' | 'en';

export const VoiceConcierge: React.FC<VoiceConciergeProps> = ({
  menuItems: _menuItems,
  onVoiceAddItem: _onVoiceAddItem,
  onVoiceOpenCart,
  onVoiceScrollTo,
  onSpeakingChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageMode>('roman');
  const [sessionActive, setSessionActive] = useState(false);
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [typedInput, setTypedInput] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const getGreeting = (lang: LanguageMode) => {
    switch (lang) {
      case 'ur':
        return 'السلام علیکم! میں آپ کا بنی وائس دربان ہوں۔ کراؤن کرسٹ، 24 گھنٹے خمیر شدہ ڈو، یا ٹیبل بکنگ کے بارے میں کچھ بھی پوچھیے۔';
      case 'roman':
        return 'Assalam-o-Alaikum! Main aapka Bunny Voice Concierge hoon. Hamare 18-crown crust pizza, artisan dough, ya table booking ke baare mein poochein!';
      default:
        return 'Hello! I am your Bunny Voice Concierge. Ask about our 18-crown crust pizzas, artisan dough, or family combos!';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'bunny',
      text: getGreeting('roman'),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update greeting when language changes if only initial message exists
  const handleLanguageChange = (newLang: LanguageMode) => {
    setLanguage(newLang);
    soundEffects.playPop();
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{ id: `init-${Date.now()}`, sender: 'bunny', text: getGreeting(newLang) }];
      }
      return [
        ...prev,
        {
          id: `lang-${Date.now()}`,
          sender: 'bunny',
          text:
            newLang === 'ur'
              ? 'زبان اردو منتخب ہو گئی۔ اب آپ اردو میں بول یا لکھ سکتے ہیں!'
              : newLang === 'roman'
              ? 'Language Roman Urdu set. Ab aap Roman Urdu mein bol ya type kar sakte hain!'
              : 'Language switched to English. You can now speak or type in English!',
        },
      ];
    });
  };

  // Cheerful SpeechSynthesis helper with Urdu & Hindi phonetic voice support
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setStatus('idle');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Remove unprintable control characters without removing Urdu Unicode letters
      const cleanText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
      if (!cleanText) {
        setStatus('idle');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices();
      if (language === 'ur') {
        const urVoice = voices.find(
          v => v.lang.startsWith('ur') || v.lang.startsWith('hi') || v.lang.includes('PK')
        );
        if (urVoice) utterance.voice = urVoice;
        utterance.lang = 'ur-PK';
      } else if (language === 'roman') {
        const pakVoice = voices.find(
          v => v.lang.includes('PK') || v.lang.includes('IN') || v.lang.startsWith('hi')
        );
        if (pakVoice) utterance.voice = pakVoice;
      }

      utterance.onstart = () => {
        onSpeakingChange(true);
      };

      utterance.onend = () => {
        onSpeakingChange(false);
        setStatus('idle');
      };

      utterance.onerror = () => {
        onSpeakingChange(false);
        setStatus('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      onSpeakingChange(false);
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    onSpeakingChange(false);
    setSessionActive(false);
    setStatus('idle');
  };

  const startSession = () => {
    if (sessionActive || status === 'listening') return;

    soundEffects.playPop();
    setMicError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus('unavailable');
      setMicError(
        language === 'ur'
          ? 'اس براؤزر پر آواز کی شناخت کی سہولت دستیاب نہیں ہے۔ براہ کرم نیچے لکھ کر پوچھیں۔'
          : language === 'roman'
          ? 'Browser speech recognition support nahi karta. Aap neechay text type kar saktay hain.'
          : 'Speech recognition is unsupported on this browser. You can type your questions below.'
      );
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      // Set Urdu for both Urdu and Roman Urdu speech recognition
      rec.lang = language === 'en' ? 'en-US' : 'ur-PK';

      rec.onstart = () => {
        setSessionActive(true);
        setStatus('listening');
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError(
            language === 'ur'
              ? 'مائیکروفون کی اجازت نہیں ملی۔ نیچے ٹائپ کر کے سوال پوچھیں۔'
              : 'Microphone permission was denied. Please allow mic access or type below.'
          );
        } else {
          setMicError(`Voice input error (${event.error || 'error'}). Please type below.`);
        }
        stopSession();
      };

      rec.onend = () => {
        setStatus(prev => (prev === 'listening' ? 'idle' : prev));
        setSessionActive(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setStatus('unavailable');
      setMicError('Microphone access could not be initialized. Please type your question.');
      stopSession();
    }
  };

  const handleUserQuery = async (query: string) => {
    setStatus('processing');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);

    const q = query.toLowerCase();
    let reply = '';

    // Quick direct navigation triggers
    if (
      q.includes('crown') ||
      q.includes('crust') ||
      q.includes('کراؤن') ||
      q.includes('کرسٹ') ||
      q.includes('پنیر')
    ) {
      reply =
        language === 'ur'
          ? 'ہمارا دستخطی بنی کراؤن کرسٹ پیزا 18 ہاتھ سے بنے موزریلا بمپس کے ساتھ آتا ہے۔ میں آپ کو کراؤن کرسٹ سیکشن پر لے جا رہا ہوں!'
          : language === 'roman'
          ? 'Hamara signature Bunny Crown Crust pizza 18 hand-crimped mozzarella cheese bumps ke sath aata hai. Main aapko Crown Crust section par le ja raha hoon!'
          : 'Our signature is the Bunny Crown Crust pizza with 18 hand-crimped mozzarella cheese pockets! Taking you right there.';
      onVoiceScrollTo('signature-crown');
    } else if (
      q.includes('menu') ||
      q.includes('food') ||
      q.includes('burger') ||
      q.includes('chicken') ||
      q.includes('مینو') ||
      q.includes('کھانا') ||
      q.includes('پیزا')
    ) {
      reply =
        language === 'ur'
          ? 'میں نے مینو کھول دیا ہے! پتھر کے اوون میں پکے پیزا، خیبر کرسپی چکن، اور فیملی ڈیلز حاضر ہیں۔'
          : language === 'roman'
          ? 'Maine menu open kar diya hai! Stone-baked pizzas, crispy fried chicken, aur family deals check karein.'
          : 'I opened our menu for you! We have stone-baked Crown Crust pizzas, crispy chicken, and family feast deals.';
      onVoiceScrollTo('menu');
    } else if (
      q.includes('reserve') ||
      q.includes('table') ||
      q.includes('book') ||
      q.includes('jagah') ||
      q.includes('ریزرو') ||
      q.includes('ٹیبل') ||
      q.includes('نشست')
    ) {
      reply =
        language === 'ur'
          ? 'آپ کو براہ راست فلور پلان اور ٹیبل بکنگ انجن پر لے جایا جا رہا ہے!'
          : language === 'roman'
          ? 'Aapko seedha floor plan aur table reservation engine par le ja raha hoon!'
          : 'Taking you right to the table reservation engine and floor plan view!';
      onVoiceScrollTo('reservations');
    } else if (
      q.includes('cart') ||
      q.includes('bag') ||
      q.includes('order') ||
      q.includes('mangwana') ||
      q.includes('کارٹ') ||
      q.includes('آرڈر') ||
      q.includes('تھَیلا')
    ) {
      reply =
        language === 'ur'
          ? 'آپ کا آرڈر بیگ کھول دیا گیا ہے!'
          : language === 'roman'
          ? 'Aapka order bag open kar diya hai!'
          : 'Opening your order bag now!';
      onVoiceOpenCart();
    } else {
      // Connect to Gemini 3.8 Flash Ask Chef endpoint for intelligent trilingual culinary replies!
      try {
        const res = await fetch('/api/ai/ask-chef', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.answer;
        } else {
          throw new Error('Fallback');
        }
      } catch {
        reply =
          language === 'ur'
            ? 'السلام علیکم! حیات آباد فیز 1 میں ہمارا کراؤن کرسٹ پیزا، 24 گھنٹے خمیر شدہ ڈو اور خیبر مصالحہ چکن ہر روز رات 3 بجے تک تازہ ملتا ہے۔'
            : language === 'roman'
            ? 'Assalam-o-Alaikum! Hayatabad Phase 1 mein hamara Crown Crust pizza aur crispy chicken rozana raat 3:00 AM tak fresh ready hota hai.'
            : 'Welcome to Bunny Bites Hayatabad! Ask about our Crown Crust, 24h fermented dough, or reserve a table.';
      }
    }

    const bunnyMsg: ChatMessage = { id: `b-${Date.now()}`, sender: 'bunny', text: reply };
    setMessages(prev => [...prev, bunnyMsg]);
    speakText(reply);
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const query = typedInput.trim();
    setTypedInput('');
    handleUserQuery(query);
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const quickPrompts = {
    ur: ['کراؤن کرسٹ دکھاؤ', 'ٹیبل بک کرو', 'مینو کھولو', 'ڈو کی خاصیت؟'],
    roman: ['Crown Crust dikhao', 'Table book karo', 'Menu kholo', 'Dough recipe?'],
    en: ['Show Crown Crust', 'Book a Table', 'Open Menu', 'Special Dough?'],
  }[language];

  return (
    <>
      {/* Floating Widget Launcher Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => {
            soundEffects.playPop();
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? 'Close Bunny Voice Concierge' : 'Open Bunny Voice Concierge'}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative border border-slate-700/50"
        >
          {sessionActive && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
            </span>
          )}
          <Bot className="w-6 h-6" />
        </button>
      </div>

      {/* Voice Concierge Drawer / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bunny Voice Concierge"
          className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-slate-900 text-xl flex items-center justify-center font-bold">
                🐰
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  Bunny Voice Concierge
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    اردو + EN
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === 'listening'
                        ? 'bg-rose-500 animate-pulse'
                        : status === 'processing'
                        ? 'bg-amber-400 animate-spin'
                        : status === 'unavailable'
                        ? 'bg-slate-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="capitalize">
                    Status:{' '}
                    {status === 'listening'
                      ? 'Listening in Urdu / English...'
                      : status === 'processing'
                      ? 'Thinking...'
                      : status}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopSession();
                setIsOpen(false);
              }}
              aria-label="Close concierge"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector Bar */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-[#0189FE]" />
              <span>Language / زبان:</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('roman')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'roman'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Roman Urdu
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('ur')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'ur'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Helpful Concierge Guide */}
          <div className="px-3 py-1.5 bg-sky-50 dark:bg-slate-800/50 border-b border-sky-100 dark:border-slate-800 text-sky-800 dark:text-sky-200 text-[11px] leading-snug flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0189FE] shrink-0" />
            <span className="truncate">
              {language === 'ur'
                ? 'کراؤن کرسٹ، ڈو ریسیپی، یا ٹیبل بکنگ کے بارے میں پوچھیے!'
                : language === 'roman'
                ? 'Crown Crust, dough recipe, ya table booking ke baare mein poochein!'
                : 'Ask about Crown Crust pizza, add items to bag, or book a table!'}
            </span>
          </div>

          {/* Transcript / Conversation History */}
          <div className="flex-1 max-h-56 overflow-y-auto p-3 space-y-2.5 text-xs">
            {messages.map(m => {
              const isUrduScript = /[\u0600-\u06FF]/.test(m.text);
              return (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'bunny' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    dir={isUrduScript ? 'rtl' : 'ltr'}
                    className={`max-w-[88%] px-3.5 py-2 rounded-2xl leading-relaxed ${
                      m.sender === 'bunny'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        : 'bg-[#0189FE] text-white font-medium shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUserQuery(prompt)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#0189FE] hover:text-[#0189FE] transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Mic Error Notice */}
          {micError && (
            <div className="mx-3 my-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-200 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{micError}</span>
            </div>
          )}

          {/* Controls Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
            <div className="flex gap-2">
              {!sessionActive ? (
                <button
                  type="button"
                  onClick={startSession}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-[#0189FE] hover:bg-blue-600 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Mic className="w-4 h-4" />
                  <span>
                    {language === 'ur'
                      ? 'اردو میں بولیں (Start Mic)'
                      : language === 'roman'
                      ? 'Boliye (Start Mic)'
                      : 'Speak Now (Start Mic)'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopSession}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {language === 'ur'
                      ? 'آواز روکیں (Stop)'
                      : language === 'roman'
                      ? 'Aawaz Rokein (Stop)'
                      : 'Stop Session'}
                  </span>
                </button>
              )}
            </div>

            {/* Fallback Typed Input */}
            <form onSubmit={handleTypedSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={typedInput}
                onChange={e => setTypedInput(e.target.value)}
                placeholder={
                  language === 'ur'
                    ? 'اردو یا رومن میں ٹائپ کریں...'
                    : language === 'roman'
                    ? 'Type in Roman Urdu or English...'
                    : 'Type a question in Urdu or English...'
                }
                dir={language === 'ur' ? 'rtl' : 'ltr'}
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#0189FE] outline-hidden text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                aria-label="Send query"
                className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
