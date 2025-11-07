import { motion } from 'motion/react';
import { Truck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function DeliveryInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header 
        cartCount={0}
        onCartClick={() => navigate('/')}
        user={null}
        onLoginClick={() => {}}
        onLogout={() => {}}
        showCart={false}
      />
      
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white mb-6 shadow-lg"
            >
              <Truck className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Delivery Information
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none space-y-6 text-gray-700"
          >
            <p className="text-lg leading-relaxed">
              We offer fast and reliable delivery service across Westlands, Nairobi. Here's everything you need to know about our delivery process.
            </p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Areas</h2>
              <p className="leading-relaxed">
                We currently deliver to Westlands and surrounding areas in Nairobi. Delivery is available during our operating hours.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Time</h2>
              <p className="leading-relaxed">
                Standard delivery time is <strong className="text-red-600">30-45 minutes</strong> from the time your order is confirmed. During peak hours, delivery may take up to 60 minutes.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Fees</h2>
              <p className="leading-relaxed">
                Delivery fees vary based on your location. Fees are calculated at checkout and displayed before you confirm your order. Free delivery is available for orders above KSh 2,000.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
              <p className="leading-relaxed">
                Once your order is placed, you can track its progress in real-time through our app. You'll receive updates when your order is being prepared, when it's out for delivery, and when it arrives.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Delivery</h2>
              <p className="leading-relaxed">
                If you have any questions about your delivery, please contact us at <a href="tel:+254700000000" className="text-red-600 hover:underline">+254 700 000 000</a> or <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

