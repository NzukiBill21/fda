import { ShoppingCart, MapPin, Phone, Clock, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import mondasLogo from '../assets/logo';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  user?: { name: string; email: string; roles: string[] } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  showCart?: boolean;
}

export function Header({ cartCount, onCartClick, user, onLoginClick, onLogout, showCart = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-950/90 via-red-900/90 to-yellow-900/90 backdrop-blur-2xl border-b-2 border-yellow-600/30 shadow-2xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <img src={mondasLogo} alt="Mondas Snack Bar" className="h-10 sm:h-12 lg:h-14 w-auto object-contain" />
          </motion.div>

          {/* Info Bar - Hidden on mobile, shows on tablet+ */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 flex-1 justify-center">
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(234, 179, 8, 0.4)' }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg"
            >
              <MapPin className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-white">Westlands</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(234, 179, 8, 0.4)' }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg"
            >
              <Clock className="w-4 h-4 text-green-300" />
              <span className="text-sm text-white">Open Now</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(234, 179, 8, 0.4)' }}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg"
            >
              <Phone className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-white">+254 700 000 000</span>
            </motion.div>
          </div>

          {/* User / Login Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div 
                  className="hidden sm:block text-right px-4 py-2 rounded-xl backdrop-blur-xl shadow-2xl border-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <p className="text-sm font-bold" style={{ 
                    color: '#1a1a1a',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}>{user.name}</p>
                  <p 
                    className="text-xs font-semibold px-2 py-0.5 rounded-md inline-block mt-1"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      color: '#1a1a1a',
                      border: '1px solid rgba(251, 191, 36, 0.3)'
                    }}
                  >
                    {user.roles[0]}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="px-4 py-2 rounded-full border-2 text-white transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </motion.button>
            )}

            {/* Cart Button (hidden on admin/superadmin dashboards) */}
            {showCart && (
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 20px 60px rgba(220, 38, 38, 0.4)' 
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-red-600 via-red-600 to-yellow-500 text-white hover:from-red-700 hover:to-yellow-600 transition-all duration-300 shadow-2xl flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 min-w-[24px] h-6 px-2 rounded-full bg-yellow-400 text-red-900 border-2 border-white flex items-center justify-center shadow-lg"
                    style={{ fontWeight: '700', fontSize: '0.75rem' }}
                  >
                    {cartCount}
                  </motion.div>
                )}
              </div>
            </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
