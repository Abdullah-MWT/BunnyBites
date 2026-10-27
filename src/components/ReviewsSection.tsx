import React, { useState } from 'react';
import { CustomerReview } from '../types';
import { Star, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
  onAddReview: (review: CustomerReview) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);

  const approvedReviews = reviews.filter(r => r.approved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    soundEffects.playCartDing();
    setIsSubmitting(true);

    setTimeout(() => {
      const newReview: CustomerReview = {
        id: `rev-${Date.now()}`,
        author: authorName.trim(),
        rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        approved: true,
        verifiedGuest: true,
      };

      onAddReview(newReview);
      soundEffects.playFanfare();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

      setIsSubmitting(false);
      setShowSuccessNotice(true);
      setAuthorName('');
      setComment('');
      setTimeout(() => setShowSuccessNotice(false), 5000);
    }, 300);
  };

  return (
    <section id="reviews" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Guest Notes & Testimonials
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Praise from Peshawar
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Real experiences from Hayatabad families, late-night foodies, and stone-crust enthusiasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Reviews List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {approvedReviews.map(r => (
            <div
              key={r.id}
              className="boutique-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 dark:text-slate-500">
                    {r.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  “{r.comment}”
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {r.author}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span>✓</span>
                  <span>Verified Diner</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review Card */}
        <div className="lg:col-span-5 boutique-card p-6 sm:p-8">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Leave a Note for Chef Faisal Khan Marwat
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
            Shared your experience with our Crown Crust? We read and cherish every guest review.
          </p>

          {showSuccessNotice && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Shukriya! Your review has been added to our guest wall.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="review-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Name
              </label>
              <input
                id="review-name"
                type="text"
                required
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Tariq Afridi"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="review-rating" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Rating
              </label>
              <div id="review-rating" className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      soundEffects.playPop();
                      setRating(star);
                    }}
                    aria-label={`${star} star rating`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-comment" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Review
              </label>
              <textarea
                id="review-comment"
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about the cheese pull, flavor, and crust texture..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Guest Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
