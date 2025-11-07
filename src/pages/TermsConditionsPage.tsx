import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function TermsConditionsPage() {
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
              <FileText className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none space-y-6 text-gray-700"
          >
            <p className="text-lg leading-relaxed">
              Please read these Terms and Conditions carefully before using our service. By placing an order, you agree to be bound by these terms.
            </p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Order Acceptance</h2>
              <p className="leading-relaxed">
                All orders are subject to acceptance by Mondas Snack Bar. We reserve the right to refuse or cancel any order at our discretion.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Pricing and Payment</h2>
              <p className="leading-relaxed">
                All prices are displayed in Kenyan Shillings (KSh) and are subject to change without notice. Payment must be made at the time of order placement. We accept M-Pesa, cash on delivery, and card payments.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Cancellation and Refunds</h2>
              <p className="leading-relaxed">
                Orders can be cancelled within 5 minutes of placement. Once an order is being prepared, cancellation may not be possible. Refunds will be processed according to our refund policy.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Delivery</h2>
              <p className="leading-relaxed">
                We aim to deliver within the estimated time, but delivery times are approximate and not guaranteed. We are not liable for delays caused by circumstances beyond our control.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Food Quality</h2>
              <p className="leading-relaxed">
                We take great care in preparing your food. If you are not satisfied with your order, please contact us within 30 minutes of delivery for a refund or replacement.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Mondas Snack Bar shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="leading-relaxed">
                For any questions about these Terms and Conditions, please contact us at <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
              </p>
              <p className="text-sm text-gray-500 italic">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

