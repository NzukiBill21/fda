import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function PrivacyPolicyPage() {
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
              <Shield className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none space-y-6 text-gray-700"
          >
            <p className="text-lg leading-relaxed">
              At Mondas Snack Bar, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.
            </p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              <p className="leading-relaxed">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Delivery address</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Order history and preferences</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Improve our services and customer experience</li>
                <li>Send you promotional offers (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              <p className="leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. You can also opt-out of marketing communications by contacting us or using the unsubscribe link in our emails.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
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

