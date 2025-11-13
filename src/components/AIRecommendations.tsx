import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Clock, ThumbsUp } from 'lucide-react';
import { Card } from './ui/card';
import { MenuItem } from './MenuSection';

interface AIRecommendationsProps {
  cartItems: any[];
  onAddToCart: (item: MenuItem) => void;
  allMenuItems: MenuItem[];
}

export function AIRecommendations({ cartItems, onAddToCart, allMenuItems }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);

  useEffect(() => {
    // ML-based recommendation logic
    const getRecommendations = () => {
      if (cartItems.length === 0) {
        // Popular items for new users
        return allMenuItems.filter(item => item.popular).slice(0, 3);
      }

      // Analyze cart for smart suggestions
      const hasMainCourse = cartItems.some(item => 
        ['Premium', 'African Specials', 'Burgers', 'Chicken'].includes(item.category)
      );
      
      const hasDrink = cartItems.some(item => item.category === 'Drinks');
      const hasSide = cartItems.some(item => ['Snacks', 'Pizza'].includes(item.category));

      let suggested: MenuItem[] = [];

      // Suggest drinks if missing
      if (!hasDrink && hasMainCourse) {
        const drinks = allMenuItems.filter(item => 
          item.name.toLowerCase().includes('drink') || 
          item.name.toLowerCase().includes('soda') ||
          item.name.toLowerCase().includes('milkshake')
        );
        suggested.push(...drinks.slice(0, 1));
      }

      // Suggest sides if missing
      if (!hasSide && hasMainCourse) {
        const sides = allMenuItems.filter(item => 
          item.category === 'Snacks' || 
          item.name.toLowerCase().includes('fries') ||
          item.name.toLowerCase().includes('nachos')
        );
        suggested.push(...sides.slice(0, 1));
      }

      // Add popular complementary items
      const complementary = allMenuItems.filter(item => 
        item.popular && !cartItems.some(cartItem => cartItem.id === item.id)
      );
      suggested.push(...complementary.slice(0, 2));

      return suggested.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      ).slice(0, 3);
    };

    setRecommendations(getRecommendations());
  }, [cartItems, allMenuItems]);

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200/50 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl text-gray-900">AI Recommendations</h3>
          <p className="text-sm text-gray-600">Personalized just for you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-purple-200/30 hover:border-purple-400/50 transition-all group cursor-pointer"
            onClick={() => onAddToCart(item)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover group-hover:scale-110 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-gray-900 truncate group-hover:text-purple-900 transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span>Match</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontWeight: '700' }}>
                  KES {item.price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <button
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                >
                  Add +
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
