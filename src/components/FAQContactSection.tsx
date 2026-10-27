import React, { useState } from 'react';
import { CONFIG } from '../config';
import { soundEffects } from '../utils/audio';
import {
  ChevronDown,
  MapPin,
  Phone,
  Clock,
  Send,
  MessageCircle,
  Info,
} from 'lucide-react';

export const FAQContactSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [demoNotice, setDemoNotice] = useState(false);

  const faqs = [
    {
      q: 'What distinguishes a Crown Crust pizza?',
      a: 'The Crown Crust is our signature creation. The outer perimeter of the dough is hand-crimped into 18 symmetrical pockets, each sealed with melted Danish mozzarella and finished with a dollop of garlic herb cream cheese. Every slice provides a rich cheese burst from edge to center.',
    },
    {
      q: 'What are your delivery hours and coverage areas in Peshawar?',
      a: 'We deliver daily from 12:00 PM until 03:00 AM across Hayatabad (Phases 1 through 7), University Town, Board Bazaar, and neighboring areas. Free delivery is provided on all orders above Rs. 1,500.',
    },
    {
      q: 'Do you accept Cash on Delivery (COD)?',
      a: 'Yes, we operate on Cash on Delivery. You can pay our courier in cash upon arrival of your piping-hot meal.',
    },
    {
      q: 'How do table reservations operate?',
      a: 'You can reserve a table directly on our website up to 30 days in advance. Each reservation receives an illustrative booking preview and floor plan view.',
    },
    {
      q: 'Can spices and crust toppings be tailored?',
      a: 'Certainly. You can specify mild, medium, or tandoori spice levels, choose garlic butter brushes, and record kitchen instructions during checkout.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playCartDing();
    setDemoNotice(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setDemoNotice(false), 5000);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];

  return (
    <section id="faq-contact" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto mb-20">
        <div className="max-w-2xl mb-8">
          <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kitchen & Dining Inquiries
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="boutique-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setOpenFaq(isOpen ? null : idx);
                  }}
                  className="w-full px-6 py-4 text-left font-serif font-bold text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#0189FE] transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-stone-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Location & Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Location & Hours Card */}
        <div className="lg:col-span-7 boutique-card p-6 md:p-8">
          <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
            Santorini In Peshawar
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Visit Bunny Bites
          </h3>

          <div className="space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#0189FE] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">Address</strong>
                <span className="mt-0.5 block">{CONFIG.fullAddress}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#0189FE] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">Telephone Inquiries</strong>
                <a
                  href={`tel:${CONFIG.phone}`}
                  className="mt-0.5 block font-mono text-[#0189FE] hover:underline font-bold"
                >
                  {CONFIG.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">WhatsApp Kitchen Hotline</strong>
                <a
                  href={`https://wa.me/${CONFIG.whatsappOrders}?text=Hello%20Bunny%20Bites%20Peshawar!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  <span>+{CONFIG.whatsappOrders}</span>
                  <span className="text-xs font-sans text-emerald-700 dark:text-emerald-300">(Instant Chat & Orders)</span>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#0189FE] shrink-0 mt-0.5" />
              <div className="w-full">
                <strong className="block text-slate-900 dark:text-white font-semibold mb-2">Operating Hours</strong>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  {days.map(d => {
                    const isToday = d === todayName;
                    return (
                      <div
                        key={d}
                        className={`p-2 rounded-lg flex justify-between ${
                          isToday
                            ? 'bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                            : 'text-stone-500 dark:text-slate-400'
                        }`}
                      >
                        <span>{d}:</span>
                        <span>12 PM – 3 AM</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form Card */}
        <div className="lg:col-span-5 boutique-card p-6 md:p-8">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Send a Note
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
            Inquire with Faisal Khan Marwat and our management team in Hayatabad.
          </p>

          {demoNotice && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Shukriya! Your message has been sent to Bunny Bites management in Hayatabad.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Asad Ullah"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address or Phone
              </label>
              <input
                id="contact-email"
                type="text"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="name@example.com or 03xx-xxxxxxx"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="contact-msg" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Message
              </label>
              <textarea
                id="contact-msg"
                required
                rows={4}
                value={contactMsg}
                onChange={e => setContactMsg(e.target.value)}
                placeholder="How can we assist with your family gathering or catering in Hayatabad?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send Message to Bunny Bites</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
