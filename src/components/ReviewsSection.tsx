import React, { useState } from 'react';
import { CustomerReview } from '../types';
import { Star, CheckCircle } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
  onAddReview: (review: CustomerReview) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const approvedReviews = reviews.filter(r => r.approved);
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    soundEffects.playCartDing();
    setIsSubmitting(true);

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: authorName.trim(),
      rating,
      date: 'Just now',
      comment: comment.trim(),
      approved: true,
      isSample: false,
    };

    setTimeout(() => {
      onAddReview(newRev);
      setIsSubmitting(false);
      setShowSuccess(true);
      setAuthorName('');
      setComment('');
      setTimeout(() => setShowSuccess(false), 4000);
    }, 400);
  };

  return (
    <section id="reviews" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Guest Testimonials · {avgRating} / 5.0 Rating
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Praise from Peshawar
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Reflections from Hayatabad families, late-night regulars, and stone-crust enthusiasts.
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
                <span className="text-[10px] text-stone-400 dark:text-slate-500">
                  Verified Guest
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review Card */}
        <div className="lg:col-span-5 boutique-card p-6 sm:p-8">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Leave a Note for Chef Faisal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
            Shared your experience with our Crown Crust? We read and cherish every guest review.
          </p>

          {showSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your review has been added to our guestbook.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Tariq Afridi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Rating
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Feedback
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="How was the cheese pull, the crust blisters, or the Santorini atmosphere?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
