import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChefHat, Clock, CheckCircle, Package, Utensils, Timer, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CatererDashboardProps {
  token: string;
  user: any;
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

export function CatererDashboard({ token, user }: CatererDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [preparationTime, setPreparationTime] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/caterer/orders', {
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
      const response = await fetch(`http://localhost:5000/api/caterer/orders/${orderId}/status`, {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CONFIRMED':
        return 'bg-blue-500';
      case 'PREPARING':
        return 'bg-orange-500';
      case 'READY':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
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

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border border-white/20"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Kitchen Dashboard</h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base">Manage order preparation</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchOrders}
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg sm:rounded-xl font-semibold flex items-center gap-1 sm:gap-2 transition-all text-xs sm:text-sm md:text-base"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-5 md:p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/80 font-semibold text-sm sm:text-base">Pending</h3>
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{pendingOrders.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-5 md:p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/80 font-semibold text-sm sm:text-base">Preparing</h3>
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{preparingOrders.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-5 md:p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/80 font-semibold text-sm sm:text-base">Ready</h3>
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{readyOrders.length}</p>
        </motion.div>
      </div>

      {/* Preparation Time Setting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/20"
      >
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
          <label className="text-white font-semibold text-sm sm:text-base">Default Prep Time (minutes):</label>
          <input
            type="number"
            min="1"
            max="120"
            value={preparationTime}
            onChange={(e) => setPreparationTime(Number(e.target.value))}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:border-orange-500 focus:outline-none w-20 sm:w-24 text-sm sm:text-base"
          />
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-4">
        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              Pending Orders ({pendingOrders.length})
            </h2>
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
          </div>
        )}

        {/* Preparing Orders */}
        {preparingOrders.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              Preparing Orders ({preparingOrders.length})
            </h2>
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
          </div>
        )}

        {/* Ready Orders */}
        {readyOrders.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Ready for Pickup ({readyOrders.length})
            </h2>
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
          </div>
        )}

        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20"
          >
            <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-white/50 mx-auto mb-3 sm:mb-4" />
            <p className="text-white/80 text-base sm:text-lg">No orders to prepare</p>
            <p className="text-white/60 text-xs sm:text-sm mt-2">Orders will appear here when customers place them</p>
          </motion.div>
        )}
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/20 hover:border-orange-400/50 transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <div className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </div>
          <p className="text-white/60 text-xs mt-1 truncate">Order #{order.orderNumber}</p>
        </div>
        <Clock className="w-4 h-4 text-white/60 flex-shrink-0 ml-2" />
      </div>

      <div className="mb-2 sm:mb-3">
        <p className="text-white font-semibold text-sm sm:text-base truncate">{order.customerName}</p>
        <p className="text-white/60 text-xs sm:text-sm">{order.customerPhone}</p>
      </div>

      <div className="mb-2 sm:mb-3 space-y-1">
        {order.items.slice(0, 2).map((item: any) => (
          <div key={item.id} className="flex justify-between text-xs sm:text-sm">
            <span className="text-white/80 truncate pr-2">{item.quantity}x {item.menuItem.name}</span>
            <span className="text-white/60 whitespace-nowrap flex-shrink-0">KES {item.price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-white/60 text-xs">+{order.items.length - 2} more items</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-white/20">
        <span className="text-base sm:text-lg font-bold text-white">
          KES {order.total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
        <span className="text-white/60 text-xs whitespace-nowrap">{timeAgo}</span>
      </div>

      <div className="mt-2 sm:mt-3 flex gap-2">
        {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onStartPreparation?.();
            }}
            disabled={isLoading}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all"
          >
            Start Prep
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
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all"
          >
            Mark Ready
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
}

function OrderDetailModal({ order, onClose, onStartPreparation, onMarkReady, preparationTime, isLoading, getStatusColor, getStatusLabel }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Order #{order.orderNumber}</h2>
              <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white mt-2 ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl sm:text-3xl flex-shrink-0">&times;</button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Customer Details</h3>
            <p className="text-gray-600 text-sm sm:text-base">Name: {order.customerName}</p>
            <p className="text-gray-600 text-sm sm:text-base">Phone: {order.customerPhone}</p>
            <p className="text-gray-600 text-sm sm:text-base break-words">Address: {order.deliveryAddress}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {item.menuItem.image && (
                      <img src={item.menuItem.image} alt={item.menuItem.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.menuItem.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.menuItem.prepTime && (
                        <p className="text-xs text-orange-600">Prep: {item.menuItem.prepTime} min</p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base whitespace-nowrap flex-shrink-0">
                    KES {(item.price * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
            <span className="text-lg sm:text-xl font-bold text-gray-800">Total:</span>
            <span className="text-xl sm:text-2xl font-bold text-orange-600">
              KES {order.total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartPreparation}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 transition-all"
              >
                <span className="hidden sm:inline">Start Preparation ({preparationTime} min)</span>
                <span className="sm:hidden">Start Prep ({preparationTime}min)</span>
              </motion.button>
            ) : order.status === 'PREPARING' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onMarkReady}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 transition-all"
              >
                <span className="hidden sm:inline">Mark as Ready for Pickup</span>
                <span className="sm:hidden">Mark Ready</span>
              </motion.button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

