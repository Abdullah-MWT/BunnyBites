import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, X, Volume2, Sparkles, MessageSquare, Bot } from 'lucide-react';
import { MenuItem } from '../types';
import { CONFIG } from '../config';
import { isRestaurantOpen } from '../utils/rules';
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

export const VoiceConcierge: React.FC<VoiceConciergeProps> = ({
  menuItems,
  onVoiceAddItem,
  onVoiceOpenCart,
  onVoiceScrollTo,
  onSpeakingChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'bunny',
      text: "Hi, thanks for visiting Bunny Bites Peshawar, this is Bunny! Would you like to order our signature Crown Crust, book a table, or hear what's popular?",
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechRecognition(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } catch {
      setHasSpeechRecognition(false);
    }
  }, []);

  // Cheerful SpeechSynthesis helper
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[^\w\s.,?!'-]/gi, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.25; // Friendly, cheerful bunny pitch

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingChange(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingChange(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onSpeakingChange(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    soundEffects.playPop();
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  // NLU query matcher and action executor
  const handleUserQuery = async (query: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);

    const q = query.toLowerCase();
    let reply = '';

    // 1. Check popularity / recommendations
    if (q.includes('popular') || q.includes('recommend') || q.includes('bestseller') || q.includes('favorite')) {
      reply =
        'Our top star is the Signature Crown Crust Pizza with 18 mozzarella crowns and white garlic dollops! The Big Bunny Crunch Burger and Honey Glazed Wings are also super popular!';
      onVoiceScrollTo('signature-crown');
    }
    // 2. Add to cart commands
    else if (q.includes('add') || q.includes('order') || q.includes('want')) {
      if (q.includes('crown') || q.includes('pizza')) {
        const pizza = menuItems.find(i => i.id === 'pizza-crown-signature') || menuItems[0];
        onVoiceAddItem(pizza, 1);
        reply = 'I added 1 Signature Bunny Crown Crust Pizza to your feast cart! Anything to drink with that?';
      } else if (q.includes('chicken') || q.includes('crispy')) {
        const item = menuItems.find(i => i.category.includes('Chicken')) || menuItems[1];
        onVoiceAddItem(item, 1);
        reply = 'Added 1 Golden Bunny Crispy Chicken to your cart! Fresh and extra crunchy!';
      } else if (q.includes('burger')) {
        const burger = menuItems.find(i => i.category.includes('Burger')) || menuItems[2];
        onVoiceAddItem(burger, 1);
        reply = 'Added 1 Big Bunny Crunch Burger to your cart! You have great taste!';
      } else if (q.includes('wing')) {
        const wings = menuItems.find(i => i.id === 'wings-honey-glazed') || menuItems[3];
        onVoiceAddItem(wings, 1);
        reply = 'Added Sweet Honey Garlic Glazed Wings to your cart!';
      } else if (q.includes('drink') || q.includes('pepsi') || q.includes('cooler')) {
        const drink = menuItems.find(i => i.category.includes('Drink')) || menuItems[menuItems.length - 1];
        onVoiceAddItem(drink, 1);
        reply = 'Added a refreshing chilled drink to your cart!';
      } else {
        reply = 'I can help you add our Crown Crust pizza, crispy chicken, wings, or burgers. Which one would you love?';
      }
    }
    // 3. Cart commands
    else if (q.includes('cart') || q.includes('checkout') || q.includes('total')) {
      onVoiceOpenCart();
      reply = 'Opening your feast cart right now! You can check your total and enter your delivery address.';
    }
    // 4. Hours and status
    else if (q.includes('hour') || q.includes('open') || q.includes('close') || q.includes('time')) {
      const openStatus = isRestaurantOpen();
      reply = `We are open daily from 12:00 PM until 03:00 AM in Hayatabad! Right now we are ${openStatus.message}.`;
    }
    // 5. Reservation commands
    else if (q.includes('table') || q.includes('reserve') || q.includes('book')) {
      onVoiceScrollTo('reservations');
      reply = 'Scrolling down to our Santorini Table Reservation section! You can select your date, time, and party size.';
    }
    // 6. Location / Address
    else if (q.includes('where') || q.includes('location') || q.includes('address')) {
      reply = 'We are located at Pirpal Plaza, Bilal Market, Phase 1, Hayatabad, Peshawar! We also deliver all across Hayatabad.';
      onVoiceScrollTo('visit-us');
    }
    // 7. Small talk & jokes
    else if (q.includes('joke') || q.includes('pun')) {
      reply = 'Why did the bunny take a slice of Crown Crust? Because it was ear-resistibly cheesy!';
    } else {
      // Query Faisal Khan via server-side Gemini API
      try {
        const res = await fetch('/api/ai/ask-chef', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.answer || 'Welcome to Bunny Bites Hayatabad! How can I delight your tastebuds tonight?';
        } else {
          reply = 'Welcome to Bunny Bites Hayatabad! You can order our signature Crown Crust pizza, crispy chicken, or reserve a table.';
        }
      } catch {
        reply = 'Welcome to Bunny Bites Hayatabad! You can order our signature Crown Crust pizza, crispy chicken, or reserve a table.';
      }
    }

    const bunnyMsg: ChatMessage = { id: `b-${Date.now()}`, sender: 'bunny', text: reply };
    setMessages(prev => [...prev, bunnyMsg]);
    speakText(reply);
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput.trim();
    setTypedInput('');
    handleUserQuery(text);
  };

  return (
    <>
      {/* Floating Mic Button Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            soundEffects.playPop();
            setIsOpen(!isOpen);
          }}
          aria-label="Open Bunny Voice & Chat Assistant"
          className="relative p-4 rounded-full bg-gradient-to-r from-[#0189FE] to-[#2F5E9E] hover:from-[#2F5E9E] hover:to-[#0189FE] text-white shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-white/80 dark:ring-slate-800"
        >
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          )}
          <Bot className="w-6 h-6" />
        </button>
      </div>

      {/* Voice & Typed Chat Modal Popover */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 rounded-3xl bg-white/95 dark:bg-[#1A2536]/95 border-2 border-[#8DBCE8] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#2F5E9E] to-[#648BC3] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white text-2xl flex items-center justify-center shadow-sm">
                🐰
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">Bunny Voice Concierge</h4>
                <span className="text-[10px] text-sky-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ready to assist in Peshawar
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
                onSpeakingChange(false);
                setIsOpen(false);
              }}
              className="p-1 rounded-full hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Transcript / Conversation History */}
          <div className="flex-1 max-h-72 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'bunny' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                    m.sender === 'bunny'
                      ? 'bg-sky-50 dark:bg-slate-800 text-[#2F5E9E] dark:text-sky-200 border border-[#8DBCE8]/30'
                      : 'bg-[#0189FE] text-white shadow-xs font-semibold'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Interactive Speech & Typed Input Bar */}
          <div className="p-3 border-t border-[#8DBCE8]/30 bg-white/70 dark:bg-slate-900/60">
            {hasSpeechRecognition && (
              <div className="flex justify-center mb-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-sky-100 dark:bg-slate-800 text-[#2F5E9E] dark:text-sky-300 hover:bg-sky-200'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isListening ? 'Listening to your voice...' : 'Tap Mic to Speak'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleTypedSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={typedInput}
                onChange={e => setTypedInput(e.target.value)}
                placeholder="Ask 'What is popular?' or 'Add crown pizza'..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#0189FE]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#0189FE] hover:bg-[#2F5E9E] text-white transition-colors cursor-pointer"
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
