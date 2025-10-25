import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSubmitReview: (rating: number, comment: string) => void;
}

export function ReviewDialog({ isOpen, onClose, orderId, onSubmitReview }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmitReview(rating, comment);
      onClose();
      setRating(0);
      setComment('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 backdrop-blur-2xl border-2 border-red-200/50 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6 border-b-2 border-red-200/50">
          <DialogTitle className="text-2xl lg:text-3xl flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            How was your experience?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Rate your order and share your feedback with us
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          <div className="text-center">
            <p className="text-gray-700 mb-6 text-lg">Order #{orderId}</p>
            
            {/* Star Rating */}
            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-12 h-12 transition-all ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-600 mb-6"
              >
                {rating === 5 && '🎉 Excellent!'}
                {rating === 4 && '😊 Great!'}
                {rating === 3 && '👍 Good!'}
                {rating === 2 && '😐 Fair'}
                {rating === 1 && '😔 Poor'}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label className="text-gray-900 text-lg">Tell us more (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with us..."
              className="min-h-[150px] rounded-2xl border-2 border-red-200 focus:border-red-400 bg-white/80 backdrop-blur-sm text-base resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl py-6 border-2 text-base"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 rounded-2xl py-6 bg-gradient-to-r from-red-600 via-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 shadow-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
