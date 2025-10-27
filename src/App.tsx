import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isSuperAdmin = Array.isArray(user?.roles) && (user.roles.includes('SUPER_ADMIN') || user.roles.includes('Super Admin'));
  const isAdmin = Array.isArray(user?.roles) && (user.roles.includes('ADMIN') || user.roles.includes('Admin'));
  const isDelivery = Array.isArray(user?.roles) && (user.roles.includes('DELIVERY_GUY') || user.roles.includes('DELIVERY') || user.roles.includes('Delivery'));

  const handleAddToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
    } else {
      setCartItems(prev =>
        prev.map(item => item.id === id ? { ...item, quantity } : item)
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = (details: OrderDetails) => {
    const orderId = `ORD-${Date.now()}`;
    setOrderId(orderId);
    setOrderDetails(details);
    setOrderPlaced(true);
    setIsCheckoutOpen(false);
    setCartItems([]);
    toast.success('Order placed successfully!');
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setUser(user);
    setAuthToken(token);
    setIsAuthOpen(false);
    localStorage.setItem('authToken', token);
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  // Dashboard views for different user roles
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

  if (isDelivery && authToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900">
        <DeliveryDashboard token={authToken} user={user} />
        <BackendStatus />
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
            className="sticky top-16 sm:top-20 z-30 flex justify-center py-3 sm:py-4 px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSlideshow(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold mobile-sticky-btn"
            >
              Show Offers
            </motion.button>
          </motion.div>
        )}

        {/* Menu Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="py-20"
        >
          <div className="container mx-auto px-4 max-w-7xl">
            <MenuSection onAddToCart={handleAddToCart} />
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <ReviewsSection />
          </div>
        </motion.section>

        {/* Order Tracking - shows after order is placed */}
        {orderPlaced && orderDetails && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
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
        onReviewSubmit={() => {
          setIsReviewOpen(false);
          setOrderPlaced(false);
          setOrderDetails(null);
          setDeliveryComplete(false);
          toast.success('Thank you for your review!');
        }}
      />

      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <BackendStatus />
      <RoleIndicator user={user} />

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