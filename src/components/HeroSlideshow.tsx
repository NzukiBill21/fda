import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Slide {
  id: string | number;
  image: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  emoji: string;
}

interface HeroSlideshowProps {
  onAddToCart: (item: any) => void;
  onOpenCart: () => void;
  onDismiss: () => void;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=2400&h=1600&fit=crop&q=90&auto=format',
    title: 'Tender BBQ Ribs',
    description: 'Fall-off-the-bone ribs with signature sauce + Ice Cold Soda',
    price: 'KSh 4,000',
    priceValue: 4000,
    emoji: '🍖',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=2400&h=1600&fit=crop&q=90&auto=format',
    title: 'Premium Steak Combo',
    description: 'Juicy grilled steak with sides + Chilled Beverage',
    price: 'KSh 8,000',
    priceValue: 8000,
    emoji: '🥩',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=2400&h=1600&fit=crop&q=90&auto=format',
    title: 'Classic Burger Deluxe',
    description: 'Gourmet burger with crispy fries + Cold Drink',
    price: 'KSh 1,200',
    priceValue: 1200,
    emoji: '🍔',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=2400&h=1600&fit=crop&q=90&auto=format',
    title: 'Spicy Wings Feast',
    description: '12 pieces of glazed wings + Refreshing Canned Drink',
    price: 'KSh 900',
    priceValue: 900,
    emoji: '🍗',
  },
];

export function HeroSlideshow({ onAddToCart, onOpenCart, onDismiss }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);

  // Fetch menu items from API to reflect real-time updates
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/menu');
        const data = await res.json();
        
        if (data.success && data.menuItems && data.menuItems.length > 0) {
          // Use API menu items, preferably featured items or first 4 items
          const featuredItems = data.menuItems.filter((item: any) => item.isFeatured);
          const itemsToUse = featuredItems.length > 0 ? featuredItems : data.menuItems.slice(0, 4);
          
          const slidesFromAPI = itemsToUse.map((item: any) => ({
            id: item.id,
            image: item.image,
            title: item.name,
            description: item.description,
            price: `KSh ${item.price.toLocaleString()}`,
            priceValue: item.price,
            emoji: '⭐',
          }));
          
          if (slidesFromAPI.length > 0) {
            setSlides(slidesFromAPI);
          }
        }
      } catch (error: any) {
        // Only log if not a connection refused error
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.error('Failed to fetch menu items for slideshow:', error);
        }
        // Keep using default slides if API fails
      }
    };

    fetchMenuItems();
    
    // Refresh every 60 seconds to catch updates (reduced frequency for performance)
    const interval = setInterval(fetchMenuItems, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => {
      const next = prev + newDirection;
      if (next < 0) return slides.length - 1;
      if (next >= slides.length) return 0;
      return next;
    });
  };

  const handleOrderNow = () => {
    const currentOffer = slides[currentSlide];
    onAddToCart({
      id: `offer-${currentOffer.id}`,
      name: currentOffer.title,
      description: currentOffer.description,
      price: currentOffer.priceValue,
      image: currentOffer.image,
      category: 'Special Offers',
      rating: 5.0,
      reviews: 100,
      popular: true,
    });
    // Small delay then open cart
    setTimeout(() => {
      onOpenCart();
    }, 800);
  };

  return (
    <div className="relative h-[75vh] w-full overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-yellow-900 hero-slideshow-mobile">
      {/* Dismiss Button - Smaller and more subtle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDismiss}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 rounded-full bg-red-600/70 backdrop-blur-md border border-white/40 text-white hover:bg-red-700/80 transition-all shadow-lg"
        aria-label="Dismiss offer"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-red-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
        >
          <div className="container mx-auto px-3 sm:px-4 md:px-6 h-full flex items-center py-4 sm:py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center w-full">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-white z-10 order-2 lg:order-1"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-2 sm:mb-3 md:mb-4 shadow-lg"
                >
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-yellow-300" />
                  <span className="text-[10px] sm:text-xs md:text-sm tracking-wide font-semibold">FRESH DAILY SPECIALS</span>
                </motion.div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-2 sm:mb-3 md:mb-4 text-white drop-shadow-2xl leading-tight tracking-tight font-extrabold">
                  {slides[currentSlide].title}
                </h1>

                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-yellow-100 mb-3 sm:mb-4 md:mb-6 drop-shadow-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>

                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <div className="px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xl border-2 border-white/30 shadow-xl">
                    <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight drop-shadow-xl font-extrabold">
                      {slides[currentSlide].price}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  >
                    {slides[currentSlide].emoji}
                  </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOrderNow}
                    className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-red-900 shadow-xl hover:shadow-yellow-500/50 transition-all duration-300 text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 font-bold"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>🛒 Order This Deal</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-xl hover:bg-white/30 transition-all duration-300 text-sm sm:text-base md:text-lg font-bold"
                  >
                    📋 Browse Menu
                  </motion.button>
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative order-1 lg:order-2 h-[30vh] sm:h-[35vh] md:h-[40vh] lg:h-[50vh] xl:h-auto"
              >
                <div className="relative w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-3 md:border-4 lg:border-8 border-white/10">
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchpriority="high"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                  
                  {/* Subtle Overlay - very light */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
                </div>

                {/* Floating Elements - Reduced size */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg sm:rounded-xl bg-red-600/90 backdrop-blur-md text-white shadow-lg border border-white/20"
                >
                  <div className="text-[10px] sm:text-xs md:text-sm font-semibold">🔥 HOT DEAL</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons - Smaller and more compact */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-0 right-0 z-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              className="p-2 sm:p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </motion.button>

            {/* Dots */}
            <div className="flex gap-2 sm:gap-2.5 md:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentSlide ? 1 : -1);
                    setCurrentSlide(index);
                  }}
                  className={`transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 md:h-3 bg-yellow-400 rounded-full'
                      : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-white/40 rounded-full hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              className="p-2 sm:p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
