import { motion } from 'motion/react';
import { Sparkles, Truck, Clock, Shield } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-[600px] bg-gradient-to-br from-red-600 via-red-500 to-yellow-400 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-red-400/30 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">NOW OPEN - Ground Floor</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl mb-6 text-white drop-shadow-lg">
              Delicious Snacks
              <br />
              <span className="text-yellow-300">Delivered Fast</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Order from Mondas Snack Bar and get your favorite burgers, fries, and more delivered fresh to your door in Westlands
            </p>

            <button
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full bg-white text-red-600 hover:bg-yellow-300 hover:text-red-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Browse Menu
            </button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16"
          >
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Truck className="w-8 h-8 text-yellow-300 mb-3 mx-auto" />
              <h3 className="text-white mb-2">Fast Delivery</h3>
              <p className="text-white/80 text-sm">30-45 mins delivery time</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Clock className="w-8 h-8 text-yellow-300 mb-3 mx-auto" />
              <h3 className="text-white mb-2">Track Order</h3>
              <p className="text-white/80 text-sm">Real-time order tracking</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="w-8 h-8 text-yellow-300 mb-3 mx-auto" />
              <h3 className="text-white mb-2">Secure Payment</h3>
              <p className="text-white/80 text-sm">M-Pesa & Cash options</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
