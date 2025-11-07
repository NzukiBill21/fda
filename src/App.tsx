import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeaderWithCart } from './components/HeaderWithCart';
import { HeroSlideshow } from './components/HeroSlideshow';
import { MenuSection, MenuItem, menuItems } from './components/MenuSection';
import { CheckoutDialog, OrderDetails } from './components/CheckoutDialog';
import { ReviewsSection } from './components/ReviewsSection';
import { DeliveryTracker } from './components/DeliveryTracker';
import { ReviewDialog } from './components/ReviewDialog';
import { DeliveryConfirmationDialog } from './components/DeliveryConfirmationDialog';
import { AIRecommendations } from './components/AIRecommendations';
import { Footer } from './components/Footer';
import { BackendStatus } from './components/BackendStatus';
import { AuthDialog } from './components/AuthDialog';
import { RoleIndicator } from './components/RoleIndicator';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DeliveryDashboard } from './components/DeliveryDashboard';
import { CatererDashboard } from './components/CatererDashboard';
import { CartSheet } from './components/CartSheet';
import { PasswordChangeDialog } from './components/PasswordChangeDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  quantity: number;
  menuItemId?: string;
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDeliveryConfirmationOpen, setIsDeliveryConfirmationOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(true);
  const [deliveryComplete, setDeliveryComplete] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(() => sessionStorage.getItem('activeRole') || localStorage.getItem('activeRole'));

  // Authentication state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ id?: string; name: string; email: string; roles: string[]; mustChangePassword?: boolean } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Check for saved auth token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
        .then(res => res.json())
        .catch((error: any) => {
          // Silently handle connection errors
          if (!error.message?.includes('Failed to fetch') && !error.message?.includes('ERR_CONNECTION_REFUSED')) {
            console.error('Auth check error:', error);
          }
        })
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setAuthToken(savedToken);
            localStorage.setItem('lastView', (data.user.roles || [])[0] || 'USER');
            
            // Check if password change is required on mount
            if (data.user.mustChangePassword && (data.user.roles?.includes('ADMIN') || data.user.roles?.includes('SUPER_ADMIN'))) {
              setShowPasswordChange(true);
            }
          } else {
            localStorage.removeItem('authToken');
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        });
    }
  }, []);

  // Storage helpers for isolated sessions per user/guest
  const getCartStorageKey = (u: typeof user | null) => {
    const id = u?.id || u?.email || 'guest';
    return `cart_${id}`;
  };

  // Restore persisted UI state (offers visibility)
  useEffect(() => {
    const show = localStorage.getItem('showSlideshow');
    if (show === 'false') setShowSlideshow(false);
  }, []);

  // Load cart whenever user context becomes known
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getCartStorageKey(user));
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {}
  }, [user?.id, user?.email]);

  // Persist cart on changes, namespaced per user/guest
  useEffect(() => {
    try {
      localStorage.setItem(getCartStorageKey(user), JSON.stringify(cartItems));
    } catch {}
  }, [cartItems, user?.id, user?.email]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isSuperAdmin = Array.isArray(user?.roles) && (user.roles.includes('SUPER_ADMIN') || user.roles.includes('Super Admin'));
  const isAdmin = Array.isArray(user?.roles) && (user.roles.includes('ADMIN') || user.roles.includes('Admin'));
  const isDelivery = Array.isArray(user?.roles) && (user.roles.includes('DELIVERY_GUY') || user.roles.includes('DELIVERY') || user.roles.includes('Delivery'));
  const isCaterer = Array.isArray(user?.roles) && (user.roles.includes('CATERER') || user.roles.includes('Caterer'));

  // Decide which dashboard to render using a persisted preferred role if available
  const availableRoles: string[] = [];
  if (isSuperAdmin) availableRoles.push('SUPER_ADMIN');
  if (isAdmin) availableRoles.push('ADMIN');
  if (isDelivery) availableRoles.push('DELIVERY_GUY');
  if (isCaterer) availableRoles.push('CATERER');

  const priority = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_GUY', 'CATERER'];
  const roleToRender = authToken ? (
    (activeRole && availableRoles.includes(activeRole) ? activeRole : priority.find(r => availableRoles.includes(r)) || null)
  ) : null;

  useEffect(() => {
    if (roleToRender) {
      setActiveRole(roleToRender);
      // Persist per-tab to lock each tab to its dashboard; also mirror to local as a fallback default
      sessionStorage.setItem('activeRole', roleToRender);
      localStorage.setItem('activeRole', roleToRender);
    } else {
      sessionStorage.removeItem('activeRole');
      localStorage.removeItem('activeRole');
    }
  }, [roleToRender]);

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
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (details: OrderDetails) => {
    try {
      // Use user ID if logged in, otherwise use email (backend will find or create user)
      const orderUserId = user?.id || user?.email || `guest_${details.phone}@monda.com`;
      
      // Create order via API
      const orderData = {
        userId: orderUserId,
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId || item.id,
          quantity: item.quantity,
          price: item.price // Include price from cart for calculation
        })),
        deliveryAddress: details.address,
        deliveryNotes: details.notes,
        customerName: details.name,
        customerPhone: details.phone,
        deliveryLatitude: 0,
        deliveryLongitude: 0,
        estimatedDeliveryTime: 30
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        const orderId = order.order?.id || `ORD-${Date.now()}`;

        setOrderId(orderId);
        setOrderDetails(details);
        setOrderPlaced(true);
        setIsCheckoutOpen(false);
        setCartItems([]);
        toast.success('Order placed successfully!');

        // Scroll to delivery tracker
        setTimeout(() => {
          const trackerElement = document.querySelector('[data-delivery-tracker]');
          if (trackerElement) {
            trackerElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        // Try demo order endpoint as fallback
        const demoResponse = await fetch('http://localhost:5000/api/demo/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: details.name,
            customerPhone: details.phone,
            deliveryAddress: details.address,
            deliveryNotes: details.notes
          })
        });

        if (demoResponse.ok) {
          const demoOrder = await demoResponse.json();
          const orderId = demoOrder.order?.id || `DEMO-${Date.now()}`;

          setOrderId(orderId);
          setOrderDetails(details);
          setOrderPlaced(true);
          setIsCheckoutOpen(false);
          setCartItems([]);
          toast.success('Order placed successfully! (Demo mode)');

          // Scroll to delivery tracker
          setTimeout(() => {
            const trackerElement = document.querySelector('[data-delivery-tracker]');
            if (trackerElement) {
              trackerElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        } else {
          throw new Error('Failed to create order');
        }
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      // Fallback to local order with delivery tracking
      const orderId = `ORD-${Date.now()}`;
      setOrderId(orderId);
      setOrderDetails(details);
      setOrderPlaced(true);
      setIsCheckoutOpen(false);
      setCartItems([]);
      toast.success('Order placed successfully! (Local tracking)');
      
      // Scroll to delivery tracker
      setTimeout(() => {
        const trackerElement = document.querySelector('[data-delivery-tracker]');
        if (trackerElement) {
          trackerElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setUser(user);
    setAuthToken(token);
    setIsAuthOpen(false);
    localStorage.setItem('authToken', token);
    
    // Check if password change is required (for managers/admins on first login)
    if (user.mustChangePassword && (user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN'))) {
      setShowPasswordChange(true);
      toast.info('Please change your password to access your account', { duration: 5000 });
    } else {
      toast.success(`Welcome back, ${user.name}!`);
    }
  };

  const handlePasswordChanged = async () => {
    // Refresh user data to get updated mustChangePassword status
    if (authToken) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setShowPasswordChange(false);
          toast.success('Password changed successfully! You can now access your account.');
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.setItem('lastView', 'USER');
    toast.success('Logged out successfully');
  };

  // Dashboard views for different user roles
  // Show password change dialog if required (blocks dashboard access)
  if (showPasswordChange && authToken) {
    return (
      <div>
        <PasswordChangeDialog
          isOpen={showPasswordChange}
          token={authToken}
          onPasswordChanged={handlePasswordChanged}
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

  if (roleToRender === 'SUPER_ADMIN' && authToken) {
    return (
      <div>
        <SuperAdminDashboard token={authToken} onLogout={handleLogout} />
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

  if (roleToRender === 'ADMIN' && authToken && !showPasswordChange) {
    return (
      <div>
        <AdminDashboard token={authToken} setIsAuthOpen={setIsAuthOpen} onLogout={handleLogout} />
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

  if (roleToRender === 'CATERER' && authToken) {
    return (
      <div className="min-h-screen">
        <CatererDashboard token={authToken} user={user} onLogout={handleLogout} />
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

  if (roleToRender === 'DELIVERY_GUY' && authToken) {
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
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-yellow-900 relative">
      {/* Mondas watermark background - consistent with manager dashboard - more visible */}
      <div className="pointer-events-none select-none absolute inset-0 opacity-20" style={{backgroundImage: 'url(/src/assets/b75535c69f22b26f18a7d3210cd25415150770f2.png)', backgroundSize: '800px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -50px top -40px', filter: 'blur(0.5px)'}} />
      <div className="pointer-events-none select-none absolute inset-0 opacity-15" style={{backgroundImage: 'url(/src/assets/b75535c69f22b26f18a7d3210cd25415150770f2.png)', backgroundSize: '700px', backgroundRepeat: 'no-repeat', backgroundPosition: 'left -30px bottom -30px', filter: 'blur(0.5px)'}} />
      <div className="pointer-events-none select-none absolute inset-0 opacity-12" style={{backgroundImage: 'url(/src/assets/b75535c69f22b26f18a7d3210cd25415150770f2.png)', backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', filter: 'blur(1px)'}} />
      
        <Header 
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          showCart={true}
      />
      
      <main className="pt-16 sm:pt-20 relative z-10">
        <AnimatePresence>
          {showSlideshow && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.5 }}
            >
              <HeroSlideshow 
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCheckoutOpen(true)}
                onDismiss={() => { setShowSlideshow(false); localStorage.setItem('showSlideshow', 'false'); }}
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
              onClick={() => { setShowSlideshow(true); localStorage.setItem('showSlideshow', 'true'); }}
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
            <ReviewsSection onWriteReview={() => setIsReviewOpen(true)} />
          </div>
        </motion.section>

        {/* Order Tracking - shows after order is placed */}
        {orderPlaced && orderDetails && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900"
            data-delivery-tracker
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
                    setIsDeliveryConfirmationOpen(true);
                  }
                }}
              />
            </div>
          </motion.section>
        )}
      </main>

      <Footer />

      {/* Sophisticated Cart Sheet */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=85',
          category: item.category,
          quantity: item.quantity,
          rating: 4.5,
          reviews: 50,
          popular: false,
          spicy: false,
          vegetarian: false,
          menuItemId: item.menuItemId || item.id,
        }))}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onAddToCart={handleAddToCart}
        aiRecommendations={
          cartItems.length > 0 ? (
            <AIRecommendations
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              allMenuItems={menuItems}
            />
          ) : undefined
        }
      />

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        onConfirmOrder={handleConfirmOrder}
      />

      <DeliveryConfirmationDialog
        isOpen={isDeliveryConfirmationOpen}
        onClose={() => setIsDeliveryConfirmationOpen(false)}
        orderId={orderId}
        onConfirm={() => {
          setIsDeliveryConfirmationOpen(false);
          setDeliveryConfirmed(true);
          setIsReviewOpen(true);
          toast.success('✅ Delivery confirmed! Thank you for confirming.');
        }}
      />

      <ReviewDialog
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setDeliveryConfirmed(false);
        }}
        orderId={orderId}
        onSubmitReview={() => {
          setIsReviewOpen(false);
          setOrderPlaced(false);
          setOrderDetails(null);
          setDeliveryComplete(false);
          setDeliveryConfirmed(false);
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