import { Star, Quote, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  initials: string;
  helpful: number;
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Sarah Mwangi',
    rating: 5,
    comment:
      'Best burgers in Westlands! The delivery was super fast and the food arrived hot. The packaging was eco-friendly too. Will definitely order again! 🍔',
    date: 'Today',
    initials: 'SM',
    helpful: 24,
  },
];

const avatarColors = [
  'from-red-500 to-orange-500',
];

interface ReviewsSectionProps { onWriteReview?: () => void }

export function ReviewsSection({ onWriteReview }: ReviewsSectionProps) {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-yellow-900/50 via-orange-900/30 to-red-950/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200 mb-6"
          >
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm text-yellow-900">CUSTOMER REVIEWS</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-gray-900">What Our Customers Say</h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-7 h-7 ${
                      i < Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span 
                className="text-2xl bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent"
                style={{ fontWeight: '700' }}
              >
                {averageRating.toFixed(1)}
              </span>
            </div>
            <div className="text-gray-600">
              <span className="text-lg">out of 5</span>
              <span className="mx-2">•</span>
              <span className="text-lg">{totalReviews} reviews</span>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center max-w-2xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="w-full"
            >
              <Card className="p-6 rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col group">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className={`w-14 h-14 bg-gradient-to-br ${avatarColors[index % avatarColors.length]} shadow-lg`}>
                    <AvatarFallback className="text-white text-lg" style={{ fontWeight: '600' }}>
                      {review.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h4 className="text-gray-900 truncate">{review.name}</h4>
                      <span className="text-sm text-gray-500 whitespace-nowrap">{review.date}</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 mb-4">
                  <Quote className="absolute -top-1 -left-1 w-8 h-8 text-red-200 opacity-50" />
                  <p className="text-gray-700 leading-relaxed pl-6">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-yellow-50 transition-all group"
                  >
                    <ThumbsUp className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Helpful ({review.helpful})
                    </span>
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-red-600 via-red-600 to-yellow-500 shadow-2xl">
            <h3 className="text-2xl lg:text-3xl text-white mb-3">Love our food? Leave a review!</h3>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              Share your experience and help others discover great food
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onWriteReview}
              className="px-8 py-4 rounded-full bg-white text-red-600 hover:bg-yellow-100 transition-all shadow-xl"
              style={{ fontWeight: '700' }}
            >
              Write a Review
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
