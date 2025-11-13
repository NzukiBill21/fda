import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Shield, UserCog, User, Truck } from 'lucide-react';

interface RoleIndicatorProps {
  user: { name: string; email: string; roles: string[] } | null;
}

export function RoleIndicator({ user }: RoleIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  const role = user.roles[0];

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          icon: Crown,
          label: 'Super Admin',
          color: 'from-yellow-400 to-orange-500',
          bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-400',
          emoji: '👑',
        };
      case 'ADMIN':
        return {
          icon: Shield,
          label: 'Admin',
          color: 'from-purple-400 to-pink-500',
          bgColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
          borderColor: 'border-purple-400',
          emoji: '💼',
        };
      case 'SUB_ADMIN':
        return {
          icon: UserCog,
          label: 'Sub Admin',
          color: 'from-blue-400 to-cyan-500',
          bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-400',
          emoji: '⚙️',
        };
      case 'DELIVERY_GUY':
        return {
          icon: Truck,
          label: 'Delivery Driver',
          color: 'from-green-400 to-emerald-500',
          bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-400',
          emoji: '🚗',
        };
      case 'USER':
      default:
        return {
          icon: User,
          label: 'Customer',
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20',
          borderColor: 'border-gray-400',
          emoji: '👤',
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 right-4 z-40 cursor-pointer"
          onClick={() => setIsVisible(false)}
        >
          <div
            className={`border-2 rounded-2xl p-4 shadow-2xl hover:shadow-3xl transition-shadow`}
            style={{
              minWidth: '220px',
              background: 'rgba(255, 255, 255, 0.98)',
              borderColor: config.borderColor === 'border-yellow-400' ? '#fbbf24' : 
                           config.borderColor === 'border-purple-400' ? '#c084fc' :
                           config.borderColor === 'border-green-400' ? '#4ade80' :
                           config.borderColor === 'border-blue-400' ? '#60a5fa' : '#9ca3af',
              backdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Close hint */}
            <div className="absolute top-2 right-2 text-xs text-gray-400 font-medium">
              ✕
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p 
                  className="text-xs font-medium mb-1"
                  style={{ color: '#6b7280' }}
                >
                  Logged in as
                </p>
                <p
                  className="font-extrabold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${
                      config.label === 'Super Admin' ? '#fbbf24, #f59e0b' :
                      config.label === 'Admin' ? '#c084fc, #ec4899' :
                      config.label === 'Delivery Driver' ? '#4ade80, #10b981' :
                      config.label === 'Sub Admin' ? '#60a5fa, #06b6d4' :
                      '#9ca3af, #6b7280'
                    })`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {config.label}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p 
                className="text-sm font-bold mb-1"
                style={{ 
                  color: '#1a1a1a',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                }}
              >
                {user.name}
              </p>
              <p 
                className="text-xs font-medium"
                style={{ color: '#6b7280' }}
              >
                {user.email}
              </p>
            </div>

            {/* Role Badge with Emoji */}
            <div className="mt-3 flex items-center justify-center">
              <div
                className={`px-3 py-1 rounded-full bg-gradient-to-r ${config.color} text-white text-xs font-bold flex items-center gap-2`}
              >
                <span>{config.emoji}</span>
                <span>{role}</span>
              </div>
            </div>

            {/* Auto-hide hint */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Auto-hides in 4s • Click to dismiss
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

