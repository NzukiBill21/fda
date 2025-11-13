import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export function AuthDialog({ isOpen, onClose, onLoginSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;

      const { createApiUrl } = await import('../config/api');
      const response = await fetch(createApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      toast.success(mode === 'login' ? 'Logged in successfully!' : 'Account created!');
      onLoginSuccess(data.user, data.token);
      onClose();
      setFormData({ email: '', password: '', name: '', phone: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-8"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '2px solid #e0e0e0',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2" style={{
                background: 'linear-gradient(135deg, #E63946, #F77F00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Poppins, sans-serif',
              }}>
                {mode === 'login' ? 'Welcome Back!' : 'Join Monda'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login' ? 'Login to your account' : 'Create a new account'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required={mode === 'register'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="+254 700 000 000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #E63946, #F77F00)',
                }}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setFormData({ email: '', password: '', name: '', phone: '' });
                }}
                className="text-sm text-gray-600 hover:text-orange-600 font-semibold"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>

            {/* Quick Login Guide */}
            {mode === 'login' && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-center text-gray-700 mb-2">
                  🔐 Test Accounts:
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                   {/* <button/}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'admin@monda.com', password: 'admin123' });
                    }}
                    className="p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    {/* <p className="text-xs font-bold text-yellow-800">👑 Super Admin</p> */}
                    {/* <p className="text-[10px] text-yellow-600">admin@monda.com</p>*/}
                  {/* </button>*/}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'manager@monda.com', password: 'admin123' });
                    }}
                    className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <p className="text-xs font-bold text-purple-800">💼 Admin</p>
                    <p className="text-[10px] text-purple-600">manager@monda.com</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'delivery@monda.com', password: 'admin123' });
                    }}
                    className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <p className="text-xs font-bold text-green-800">🚗 Delivery</p>
                    <p className="text-[10px] text-green-600">delivery@monda.com</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'customer@test.com', password: 'customer123' });
                    }}
                    className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <p className="text-xs font-bold text-gray-800">👤 Customer</p>
                    <p className="text-[10px] text-gray-600">customer@test.com</p>
                  </button>
                </div>
                
                <p className="text-[10px] text-center text-gray-500 mt-2">
                  Click any card to auto-fill credentials
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

