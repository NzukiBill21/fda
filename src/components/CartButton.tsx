import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, XCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import OrderSummary from './OrderSummary';
import { toast } from 'sonner';

const CartButton: React.FC = () => {
  const { cartItems, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showCartDetails, setShowCartDetails] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Debug: Log cart state
  console.log('CartButton - cartItems:', cartItems);
  console.log('CartButton - totalItems:', totalItems);

  const handleOrderSuccess = (order: any) => {
    console.log('Order placed successfully:', order);
    // Clear the cart after successful order
    clearCart();
    setShowOrderSummary(false);
    toast.success('Order placed successfully! 🎉');
  };

  return (
    <>
      {/* Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCartDetails(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl z-[9999] hover:shadow-3xl transition-all duration-300 border-4 border-yellow-400"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Cart Details Popup */}
      <AnimatePresence>
        {showCartDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-[9998] p-6 max-w-sm w-full mx-4 border-2 border-orange-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Cart Summary</h3>
              <button
                onClick={() => setShowCartDetails(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.menuItem.name}</h4>
                      <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-bold text-xl text-orange-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCartDetails(false);
                    setShowOrderSummary(true);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Summary Modal */}
      <AnimatePresence>
        {showOrderSummary && (
          <OrderSummary
            cartItems={cartItems}
            onClose={() => setShowOrderSummary(false)}
            onOrderSuccess={handleOrderSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CartButton;
