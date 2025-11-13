import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../config/api';;
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  MapPin, 
  Clock, 
  CreditCard, 
  User, 
  Phone, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
}

interface CartItem {
  menuItemId: string;
  quantity: number;
  menuItem: MenuItem;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  onClose: () => void;
  onOrderSuccess: (order: any) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  cartItems, 
  onClose, 
  onOrderSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryLatitude, setDeliveryLatitude] = useState<number | null>(null);
  const [deliveryLongitude, setDeliveryLongitude] = useState<number | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(30);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = subtotal > 5000 ? 0 : 200; // Free delivery over KES 5,000
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setDeliveryLatitude(position.coords.latitude);
          setDeliveryLongitude(position.coords.longitude);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleSubmitOrder = async () => {
    if (!deliveryAddress || !customerName || !customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userId: localStorage.getItem('userId') || 'guest',
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        })),
        deliveryAddress,
        deliveryNotes,
        customerName,
        customerPhone,
        deliveryLatitude,
        deliveryLongitude,
        estimatedDeliveryTime
      };

      console.log('Submitting order:', orderData);

      const response = await fetch(createApiUrl('api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('Order response:', result);

      if (result.success) {
        toast.success(`Order ${result.order.orderNumber} placed successfully! 🎉`);
        onOrderSuccess(result.order);
        onClose();
      } else {
        toast.error(result.error || 'Failed to place order');
        console.error('Order creation failed:', result);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
      case 'PREPARING': return 'text-orange-600 bg-orange-100';
      case 'OUT_FOR_DELIVERY': return 'text-purple-600 bg-purple-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Order Summary</h2>
                  <p className="text-orange-100">Cash on Delivery</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Order Items */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                Order Items ({cartItems.length})
              </h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.menuItemId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                      {item.menuItem.image ? (
                        <img 
                          src={item.menuItem.image} 
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {item.menuItem.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-600">{item.menuItem.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-orange-600 font-bold">
                          KES {item.menuItem?.price != null && typeof item.menuItem.price === 'number' ? item.menuItem.price.toLocaleString('en-KE') : '0'}
                        </span>
                        <span className="text-gray-500">×</span>
                        <span className="text-gray-700 font-medium">{item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        KES {item.menuItem?.price != null && typeof item.menuItem.price === 'number' && item.quantity != null ? (item.menuItem.price * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                Delivery Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Special instructions for delivery..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time
                  </label>
                  <select
                    value={estimatedDeliveryTime}
                    onChange={(e) => setEstimatedDeliveryTime(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                Payment Summary
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">KES {subtotal != null && typeof subtotal === 'number' ? subtotal.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee != null && typeof deliveryFee === 'number' ? deliveryFee.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">KES {tax != null && typeof tax === 'number' ? tax.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">KES {total != null && typeof total === 'number' ? total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center space-x-2 text-orange-800">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold">Cash on Delivery</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Pay with cash when your order arrives
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !deliveryAddress || !customerName || !customerPhone}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Place Order - KES {total != null && typeof total === 'number' ? total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </>
              )}
            </motion.button>
            
            <p className="text-center text-sm text-gray-500 mt-3">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderSummary;
