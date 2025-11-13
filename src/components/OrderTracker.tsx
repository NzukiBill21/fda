import React, { useState, useEffect, useRef } from 'react';
import { createApiUrl } from '../config/api';;
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Truck, 
  Navigation, 
  Phone, 
  MessageCircle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { ORDER_STATUSES, STATUS_COLORS } from '../constants/orderStatuses';

interface OrderTracking {
  id: string;
  status: string;
  notes?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: string;
  deliveryNotes?: string;
  customerName: string;
  customerPhone: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: {
      id: string;
      name: string;
      price: number;
      image?: string;
    };
  }>;
  deliveryGuy?: {
    id: string;
    name: string;
    phone?: string;
    deliveryProfile?: {
      status: string;
      latitude?: number;
      longitude?: number;
    };
  };
  trackingHistory: OrderTracking[];
}

interface OrderTrackerProps {
  orderId: string;
  onClose: () => void;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!orderId) return; // Don't poll if no order ID
    
    fetchOrderDetails();
    
    // Set up real-time updates - only if order exists
    const interval = setInterval(() => {
      if (orderId) {
        fetchOrderDetails();
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (order && order.deliveryLatitude && order.deliveryLongitude) {
      setDeliveryLocation({
        lat: order.deliveryLatitude,
        lng: order.deliveryLongitude
      });
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    if (!orderId) return; // Guard against empty orderId
    
    try {
      const response = await fetch(createApiUrl(`api/orders/${orderId}`));
      
      if (response.status === 404) {
        // Order doesn't exist - stop polling
        console.warn(`Order ${orderId} not found - stopping tracker`);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.order) {
        setOrder(result.order);
        // Stop polling if order is delivered or cancelled
        if (result.order.status === ORDER_STATUSES.DELIVERED || result.order.status === ORDER_STATUSES.CANCELLED || result.order.status === ORDER_STATUSES.REJECTED) {
          // Will be cleaned up by useEffect cleanup
        }
      } else {
        console.error('Order fetch failed:', result.error);
        // Don't show error toast on every poll - only on first failure
        if (loading) {
          toast.error(result.error || 'Failed to fetch order details');
        }
      }
    } catch (error: any) {
      console.error('Fetch order error:', error);
      // Only show error on first load, not on every poll
      if (loading) {
        toast.error('Failed to fetch order details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />;
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5" />;
      case 'PREPARING': return <AlertCircle className="w-5 h-5" />;
      case 'OUT_FOR_DELIVERY': return <Truck className="w-5 h-5" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getEstimatedTime = () => {
    if (!order) return null;
    
    const createdTime = new Date(order.createdAt).getTime();
    const estimatedMinutes = order.estimatedDeliveryTime || 30;
    const estimatedDeliveryTime = new Date(createdTime + (estimatedMinutes * 60 * 1000));
    
    return estimatedDeliveryTime;
  };

  const formatTimeRemaining = () => {
    const estimatedTime = getEstimatedTime();
    if (!estimatedTime) return null;
    
    const now = new Date();
    const diff = estimatedTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Delayed';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const callDeliveryGuy = () => {
    if (order?.deliveryGuy?.phone) {
      window.open(`tel:${order.deliveryGuy.phone}`);
    }
  };

  const callCustomer = () => {
    if (order?.customerPhone) {
      window.open(`tel:${order.customerPhone}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
        <p className="text-gray-600">The order you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
              <p className="text-gray-600">Order placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">KES {order.total != null && typeof order.total === 'number' ? order.total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</div>
            <div className="text-sm text-gray-500">Cash on Delivery</div>
          </div>
        </div>
      </div>

      {/* Status and Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-2">{order.status}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Order Progress</span>
            <span>{formatTimeRemaining()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: order.status === 'DELIVERED' ? '100%' : 
                       order.status === 'OUT_FOR_DELIVERY' ? '80%' :
                       order.status === 'PREPARING' ? '60%' :
                       order.status === 'CONFIRMED' ? '40%' : '20%'
              }}
            />
          </div>
        </div>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Delivery Address
            </h3>
            <p className="text-gray-700">{order.deliveryAddress}</p>
            {order.deliveryNotes && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Notes:</span> {order.deliveryNotes}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Customer Information
            </h3>
            <p className="text-gray-700">{order.customerName}</p>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>
        </div>
      </div>

      {/* Delivery Guy Information */}
      {order.deliveryGuy && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-orange-500" />
            Delivery Driver
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {order.deliveryGuy.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{order.deliveryGuy.name}</h3>
                <p className="text-sm text-gray-600">{order.deliveryGuy.phone}</p>
                {order.deliveryGuy.deliveryProfile && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.deliveryGuy.deliveryProfile.status === 'online' 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      order.deliveryGuy.deliveryProfile.status === 'online' 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-gray-400'
                    }`} />
                    {order.deliveryGuy.deliveryProfile.status}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={callDeliveryGuy}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Call Driver"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={callCustomer}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Call Customer"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-orange-500" />
          Order Items
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                {item.menuItem.image ? (
                  <img 
                    src={item.menuItem.image} 
                    alt={item.menuItem.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-white font-bold">
                    {item.menuItem.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                <p className="text-sm text-gray-600">KES {item.menuItem?.price != null && typeof item.menuItem.price === 'number' ? item.menuItem.price.toLocaleString('en-KE') : '0'} × {item.quantity || 0}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  KES {item.menuItem?.price != null && typeof item.menuItem.price === 'number' && item.quantity != null ? (item.menuItem.price * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-500" />
          Tracking History
        </h2>
        <div className="space-y-4">
          {order.trackingHistory.map((tracking, index) => (
            <motion.div
              key={tracking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tracking.status)}`}>
                    {tracking.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tracking.timestamp ? (() => { const d = new Date(tracking.timestamp); return !isNaN(d.getTime()) ? d.toLocaleString() : 'N/A'; })() : 'N/A'}
                  </span>
                </div>
                {tracking.notes && (
                  <p className="text-sm text-gray-600">{tracking.notes}</p>
                )}
                {tracking.latitude && tracking.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Location: {tracking.latitude.toFixed(4)}, {tracking.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      {deliveryLocation && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-orange-500" />
            Delivery Location
          </h2>
          <div 
            ref={mapRef}
            className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-gray-600">Map integration coming soon</p>
              <p className="text-sm text-gray-500">
                Coordinates: {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-orange-500" />
            Delivery Location
          </h2>
          <div 
            ref={mapRef}
            className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-gray-600">Map integration coming soon</p>
              <p className="text-sm text-gray-500">
                Coordinates: {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;

