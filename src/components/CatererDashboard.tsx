import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Clock, CheckCircle, Package, Utensils, Timer, AlertCircle, RefreshCw, LogOut, ChevronDown, ChevronUp, X, Phone, MapPin, User, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface CatererDashboardProps {
  token: string;
  user: any;
  onLogout?: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: {
      id: string;
      name: string;
      image?: string;
      prepTime?: number;
    };
  }>;
  trackingHistory?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
}

export function CatererDashboard({ token, user, onLogout }: CatererDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [preparationTime, setPreparationTime] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    pending: true,
    preparing: true,
    ready: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      const { createApiUrl } = await import('../config/api');
      const response = await fetch(createApiUrl('api/caterer/orders'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.orders);
      } else {
        toast.error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  const updateOrderStatus = async (orderId: string, status: 'PREPARING' | 'READY') => {
    setIsLoading(true);
    try {
      const response = await fetch(createApiUrl(`api/caterer/orders/${orderId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          preparationTime: status === 'PREPARING' ? preparationTime : undefined
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Order ${status === 'PREPARING' ? 'preparation started' : 'marked as ready'}!`);
        setSelectedOrder(null);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(result.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update order error:', error);
      toast.error('Failed to update order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-red-600 text-white';
      case 'CONFIRMED':
        return 'bg-red-600 text-white';
      case 'PREPARING':
        return 'bg-red-600 text-white';
      case 'READY':
        return 'bg-red-600 text-white';
      default:
        return 'bg-red-600 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PREPARING':
        return 'Preparing';
      case 'READY':
        return 'Ready';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query)
    );
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const preparingOrders = filteredOrders.filter(o => o.status === 'PREPARING');
  const readyOrders = filteredOrders.filter(o => o.status === 'READY');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="min-h-screen bg-yellow-400 relative overflow-hidden">
      {/* Mondas Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)`
        }}></div>
      </div>

      <div className="relative z-10 p-2 sm:p-4 md:p-6">
        {/* Header - Mondas Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-2xl border-4 border-red-600"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="p-3 sm:p-4 md:p-5 rounded-2xl bg-red-600 text-white shadow-xl border-4 border-white"
              >
                <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-red-600 drop-shadow-[3px_3px_0px_rgba(255,255,255,1)]" style={{ textShadow: '3px 3px 0 white, 5px 5px 0 rgba(0,0,0,0.1)' }}>
                  MONDAS KITCHEN
                </h1>
                <p className="text-yellow-900 font-bold text-sm sm:text-base md:text-lg mt-1" style={{ textShadow: '1px 1px 0 white' }}>
                  {user?.name || 'Chef'} • Order Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchOrders}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg border-4 border-white text-sm md:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg border-4 border-white text-sm md:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-6"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders by number, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border-4 border-red-600 focus:border-red-700 focus:outline-none shadow-xl text-sm sm:text-base placeholder:text-gray-500 font-semibold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 transition-colors font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats - Mondas Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-4 border-red-600 shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-600 font-black text-sm sm:text-base md:text-lg" style={{ textShadow: '1px 1px 0 white' }}>PENDING</h3>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600">{pendingOrders.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-4 border-red-600 shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-600 font-black text-sm sm:text-base md:text-lg" style={{ textShadow: '1px 1px 0 white' }}>PREPARING</h3>
              <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600">{preparingOrders.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-4 border-red-600 shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-600 font-black text-sm sm:text-base md:text-lg" style={{ textShadow: '1px 1px 0 white' }}>READY</h3>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600">{readyOrders.length}</p>
          </motion.div>
        </div>

        {/* Preparation Time Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 border-4 border-red-600 shadow-xl"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
            <label className="text-red-600 font-black text-sm sm:text-base md:text-lg">Default Prep Time (minutes):</label>
            <input
              type="number"
              min="1"
              max="120"
              value={preparationTime}
              onChange={(e) => setPreparationTime(Number(e.target.value))}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-yellow-400 text-red-600 border-4 border-red-600 focus:border-red-700 focus:outline-none w-20 sm:w-24 font-black text-sm sm:text-base shadow-md"
            />
          </div>
        </motion.div>

        {/* Orders List with Dropdown Categories */}
        <div className="space-y-4 sm:space-y-6">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl border-4 border-red-600 shadow-xl overflow-hidden"
            >
              <motion.button
                onClick={() => toggleCategory('pending')}
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-red-600 text-white font-black"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl md:text-2xl">
                    PENDING ORDERS ({pendingOrders.length})
                  </h2>
                </div>
                {expandedCategories.pending ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
              
              <AnimatePresence>
                {expandedCategories.pending && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 sm:p-4 md:p-6 bg-yellow-400"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {pendingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onSelect={() => setSelectedOrder(order)}
                          onStartPreparation={() => updateOrderStatus(order.id, 'PREPARING')}
                          preparationTime={preparationTime}
                          isLoading={isLoading}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl border-4 border-red-600 shadow-xl overflow-hidden"
            >
              <motion.button
                onClick={() => toggleCategory('preparing')}
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-red-600 text-white font-black"
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl md:text-2xl">
                    PREPARING ORDERS ({preparingOrders.length})
                  </h2>
                </div>
                {expandedCategories.preparing ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
              
              <AnimatePresence>
                {expandedCategories.preparing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 sm:p-4 md:p-6 bg-yellow-400"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {preparingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onSelect={() => setSelectedOrder(order)}
                          onMarkReady={() => updateOrderStatus(order.id, 'READY')}
                          preparationTime={preparationTime}
                          isLoading={isLoading}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl border-4 border-red-600 shadow-xl overflow-hidden"
            >
              <motion.button
                onClick={() => toggleCategory('ready')}
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-red-600 text-white font-black"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl md:text-2xl">
                    READY FOR PICKUP ({readyOrders.length})
                  </h2>
                </div>
                {expandedCategories.ready ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
              
              <AnimatePresence>
                {expandedCategories.ready && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 sm:p-4 md:p-6 bg-yellow-400"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {readyOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onSelect={() => setSelectedOrder(order)}
                          preparationTime={preparationTime}
                          isLoading={isLoading}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center border-4 border-red-600 shadow-xl"
            >
              <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 text-base sm:text-lg font-black">
                {searchQuery ? 'No orders match your search' : 'No orders to prepare'}
              </p>
              <p className="text-yellow-900 text-sm sm:text-base mt-2 font-semibold">
                {searchQuery ? 'Try a different search term' : 'Orders will appear here when customers place them'}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStartPreparation={() => {
            updateOrderStatus(selectedOrder.id, 'PREPARING');
          }}
          onMarkReady={() => {
            updateOrderStatus(selectedOrder.id, 'READY');
          }}
          preparationTime={preparationTime}
          isLoading={isLoading}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      )}
    </div>
  );
}

function OrderCard({ order, onSelect, onStartPreparation, onMarkReady, preparationTime, isLoading, getStatusColor, getStatusLabel }: any) {
  const timeAgo = new Date(order.createdAt).toLocaleTimeString();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-4 border-red-600 cursor-pointer shadow-xl hover:shadow-2xl transition-all"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-black text-white mb-2 ${getStatusColor(order.status)} border-2 border-white`}>
            {getStatusLabel(order.status)}
          </div>
          <p className="text-red-600 text-xs sm:text-sm truncate font-black">Order #{order.orderNumber}</p>
        </div>
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 ml-2" />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-red-600" />
        <div className="flex-1 min-w-0">
          <p className="text-red-600 font-black text-sm sm:text-base truncate">{order.customerName}</p>
          <p className="text-yellow-900 text-xs sm:text-sm flex items-center gap-1 font-semibold">
            <Phone className="w-3 h-3" />
            {order.customerPhone}
          </p>
        </div>
      </div>

      <div className="mb-3 space-y-1.5">
        {order.items.slice(0, 2).map((item: any) => (
          <div key={item.id} className="flex justify-between text-xs sm:text-sm bg-yellow-400 px-2 py-1 rounded border-2 border-red-600">
            <span className="text-red-600 truncate pr-2 font-black">{item.quantity}x {item.menuItem.name}</span>
            <span className="text-red-600 whitespace-nowrap flex-shrink-0 font-black">
              KES {item.price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-red-600 text-xs font-black">+{order.items.length - 2} more items</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t-2 border-red-600">
        <span className="text-lg sm:text-xl font-black text-red-600">
          KES {order.total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
        <span className="text-yellow-900 text-xs whitespace-nowrap font-black">{timeAgo}</span>
      </div>

      <div className="mt-3 flex gap-2">
        {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onStartPreparation?.();
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-xs sm:text-sm disabled:opacity-50 transition-all shadow-lg border-4 border-white"
          >
            START PREP
          </motion.button>
        ) : order.status === 'PREPARING' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onMarkReady?.();
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-xs sm:text-sm disabled:opacity-50 transition-all shadow-lg border-4 border-white"
          >
            MARK READY
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
}

function OrderDetailModal({ order, onClose, onStartPreparation, onMarkReady, preparationTime, isLoading, getStatusColor, getStatusLabel }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-yellow-400 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-red-600"
      >
        <div className="p-4 sm:p-6 border-b-4 border-red-600 sticky top-0 bg-red-600 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>Order #{order.orderNumber}</h2>
              <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-black text-white mt-2 bg-white text-red-600 border-2 border-white`}>
                {getStatusLabel(order.status)}
              </div>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:text-yellow-400 text-3xl sm:text-4xl flex-shrink-0 transition-colors font-black"
            >
              &times;
            </motion.button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-yellow-400">
          <div className="bg-white rounded-xl p-4 border-4 border-red-600">
            <h3 className="font-black text-red-600 mb-3 text-base sm:text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              CUSTOMER DETAILS
            </h3>
            <p className="text-red-600 text-sm sm:text-base font-black mb-1">Name: <span className="text-yellow-900">{order.customerName}</span></p>
            <p className="text-red-600 text-sm sm:text-base font-black mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone: <span className="text-yellow-900">{order.customerPhone}</span>
            </p>
            <p className="text-red-600 text-sm sm:text-base font-black flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address: <span className="text-yellow-900 break-words">{order.deliveryAddress}</span>
            </p>
          </div>

          <div>
            <h3 className="font-black text-red-600 mb-3 text-base sm:text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              ORDER ITEMS
            </h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl gap-3 border-4 border-red-600">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.menuItem.image && (
                      <img src={item.menuItem.image} alt={item.menuItem.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0 border-2 border-red-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-red-600 text-sm sm:text-base truncate">{item.menuItem.name}</p>
                      <p className="text-xs sm:text-sm text-yellow-900 font-black">Qty: {item.quantity}</p>
                      {item.menuItem.prepTime && (
                        <p className="text-xs text-red-600 font-black">Prep: {item.menuItem.prepTime} min</p>
                      )}
                    </div>
                  </div>
                  <p className="font-black text-red-600 text-sm sm:text-base whitespace-nowrap flex-shrink-0">
                    KES {(item.price * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t-4 border-red-600">
            <span className="text-xl sm:text-2xl font-black text-red-600">TOTAL:</span>
            <span className="text-2xl sm:text-3xl font-black text-red-600">
              KES {order.total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartPreparation}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base disabled:opacity-50 transition-all shadow-xl border-4 border-white"
              >
                <span className="hidden sm:inline">START PREPARATION ({preparationTime} min)</span>
                <span className="sm:hidden">START PREP ({preparationTime}min)</span>
              </motion.button>
            ) : order.status === 'PREPARING' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onMarkReady}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base disabled:opacity-50 transition-all shadow-xl border-4 border-white"
              >
                <span className="hidden sm:inline">MARK AS READY FOR PICKUP</span>
                <span className="sm:hidden">MARK READY</span>
              </motion.button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
