import React, { useState } from 'react';
import { CONFIG } from '../config';
import { store, STORAGE_KEYS } from '../store';
import { soundEffects } from '../utils/audio';
import {
  ChevronDown,
  MapPin,
  Phone,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

export const FAQContactSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

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
      a: 'Yes, we operate seamlessly on Cash on Delivery. You can pay our courier in cash upon arrival of your piping-hot meal.',
    },
    {
      q: 'How do table reservations operate?',
      a: 'You can reserve a table directly on our website up to 30 days in advance. Same-day bookings require at least 45 minutes notice. Each reservation receives an instant booking reference and direct WhatsApp confirmation.',
    },
    {
      q: 'Can spices and crust toppings be tailored?',
      a: 'Certainly. You can specify mild, medium, or tandoori spice levels, choose garlic butter brushes, and record kitchen instructions during checkout.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playCartDing();
    const existing = store.getItem<any[]>(STORAGE_KEYS.CONTACT_MESSAGES, []);
    existing.unshift({
      id: `msg-${Date.now()}`,
      name: contactName.trim(),
      email: contactEmail.trim(),
      message: contactMsg.trim(),
      date: new Date().toLocaleString(),
    });
    store.setItem(STORAGE_KEYS.CONTACT_MESSAGES, existing);
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 4000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playPop();
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 4000);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];

  return (
    <section id="visit-us" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
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
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-6">
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
                <a href={`tel:${CONFIG.phone}`} className="mt-0.5 block font-mono hover:text-[#0189FE] underline">
                  {CONFIG.phone}
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

          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-slate-800 flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
                'Hello Bunny Bites! I would like to inquire about dining in or takeout delivery in Hayatabad.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>

        {/* Message Form Card */}
        <div className="lg:col-span-5 boutique-card p-6 md:p-8">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Send a Note
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
            Directly notify Faisal Khan and our management team in Hayatabad.
          </p>

          {contactSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! We will get back to you shortly.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Message
              </label>
              <textarea
                required
                rows={3}
                value={contactMsg}
                onChange={e => setContactMsg(e.target.value)}
                placeholder="Private catering, corporate orders, or feedback..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 font-semibold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
