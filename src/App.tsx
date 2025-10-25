import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSlideshow } from './components/HeroSlideshow';
import { MenuSection, MenuItem, menuItems } from './components/MenuSection';
import { CartSheet, CartItem } from './components/CartSheet';
import { CheckoutDialog, OrderDetails } from './components/CheckoutDialog';
import { ReviewsSection } from './components/ReviewsSection';
import { DeliveryTracker } from './components/DeliveryTracker';
import { ReviewDialog } from './components/ReviewDialog';
import { AIRecommendations } from './components/AIRecommendations';
import { Footer } from './components/Footer';
import { BackendStatus } from './components/BackendStatus';
import { AuthDialog } from './components/AuthDialog';
import { RoleIndicator } from './components/RoleIndicator';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DeliveryDashboard } from './components/DeliveryDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  // Always show slideshow on first load (don't remember dismissed state)
  const [showSlideshow, setShowSlideshow] = useState(true);
  const [deliveryComplete, setDeliveryComplete] = useState(false);
  
  // Authentication state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; roles: string[] } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Check for saved auth token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setAuthToken(savedToken);
          } else {
            localStorage.removeItem('authToken');
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        });
    }
  }, []);

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast.success(
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-semibold">Added to cart!</p>
              <p className="text-sm text-gray-600">{item.name}</p>
            </div>
          </div>,
          {
            duration: 1500,
            className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200',
          }
        );
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-600">Added to your cart</p>
          </div>
        </div>,
        {
          duration: 1500,
          className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200',
        }
      );
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info(
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗑️</span>
        <p>Item removed from cart</p>
      </div>,
      {
        duration: 1200,
        className: 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200',
      }
    );
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = (orderDetails: OrderDetails) => {
    const newOrderId = `MDN${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);
    setOrderDetails(orderDetails);
    setOrderPlaced(true);
    setCartItems([]);
    
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-3xl">💎</span>
        <div>
          <p className="font-bold text-lg">Order Confirmed!</p>
          <p className="text-sm text-gray-600">Order #{newOrderId}</p>
        </div>
      </div>,
      {
        duration: 2000,
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300',
      }
    );

    setTimeout(() => {
      const tracker = document.getElementById('delivery-tracker');
      if (tracker) {
        tracker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 600);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total =
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    (cartItems.length > 0 ? 200 : 0);

  const handleSubmitReview = (rating: number, comment: string) => {
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-3xl">⭐</span>
        <div>
          <p className="font-bold text-lg">Thank you for your review!</p>
          <p className="text-sm text-gray-600">We appreciate your feedback</p>
        </div>
      </div>,
      {
        duration: 2000,
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300',
      }
    );
  };

  // Check if user is admin and show appropriate dashboard
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN');
  const isAdmin = user?.roles.includes('ADMIN');
  const isDeliveryGuy = user?.roles.includes('DELIVERY_GUY');
  
  // Show admin dashboards if logged in as admin
  if (isSuperAdmin && authToken) {
    return (
      <div>
        <Header 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)}
          user={user}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
        <SuperAdminDashboard token={authToken} />
        <BackendStatus />
        <RoleIndicator user={user} />
        <AuthDialog
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              borderRadius: '1rem',
              padding: '1rem',
            },
          }}
        />
      </div>
    );
  }

  if (isAdmin && authToken) {
    return (
      <div>
        <Header 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)}
          user={user}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
        <AdminDashboard token={authToken} />
        <BackendStatus />
        <RoleIndicator user={user} />
        <AuthDialog
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              borderRadius: '1rem',
              padding: '1rem',
            },
          }}
        />
      </div>
    );
  }

  if (isDeliveryGuy && authToken) {
    return (
      <div>
        <Header 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)}
          user={user}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
        <DeliveryDashboard token={authToken} user={user} />
        <BackendStatus />
        <RoleIndicator user={user} />
        <AuthDialog
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              borderRadius: '1rem',
              padding: '1rem',
            },
          }}
        />
      </div>
    );
  }

  // Normal food ordering interface for customers
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-yellow-900">
      <Header 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      
      <main className="pt-16 sm:pt-20">
        <AnimatePresence>
          {showSlideshow && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.5 }}
            >
              <HeroSlideshow 
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
                onDismiss={() => setShowSlideshow(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Offers Button - appears when slideshow is dismissed */}
        {!showSlideshow && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-30 flex justify-center py-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowSlideshow(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 font-bold shadow-2xl hover:shadow-yellow-500/50 transition-all flex items-center gap-2"
            >
              <span className="text-2xl">🔥</span>
              <span>View Today's Special Offers</span>
            </motion.button>
          </motion.div>
        )}
        
        <MenuSection onAddToCart={handleAddToCart} />
        <ReviewsSection />
        
        {orderPlaced && orderDetails && (
          <motion.section
            id="delivery-tracker"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900"
          >
            <div className="container mx-auto px-4 max-w-5xl">
              <DeliveryTracker 
                orderId={orderId} 
                estimatedTime={35}
                customerName={orderDetails.name}
                address={orderDetails.address}
                onDeliveryComplete={() => {
                  if (!deliveryComplete) {
                    setDeliveryComplete(true);
                    setIsReviewOpen(true);
                  }
                }}
              />
            </div>
          </motion.section>
        )}
      </main>

      <Footer />

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onAddToCart={handleAddToCart}
        aiRecommendations={
          <AIRecommendations 
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            allMenuItems={menuItems}
          />
        }
      />

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        onConfirmOrder={handleConfirmOrder}
      />

      <ReviewDialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        orderId={orderId}
        onSubmitReview={handleSubmitReview}
      />

      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            borderRadius: '1rem',
            padding: '1rem',
          },
        }}
      />

      {/* Backend Connection Indicator */}
      <BackendStatus />

      {/* Role Indicator - Shows who is logged in */}
      <RoleIndicator user={user} />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
