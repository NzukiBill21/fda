import { motion } from 'motion/react';
import { Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function AboutUsPage() {
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
              <Info className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              About Us
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none space-y-6 text-gray-700"
          >
            <p className="text-lg leading-relaxed">
              Welcome to <strong className="text-red-600">Mondas Snack Bar</strong>, your premier destination for delicious snacks and premium meals in Westlands, Nairobi. We are passionate about delivering exceptional food experiences that bring people together.
            </p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
              <p className="leading-relaxed">
                Founded with a vision to revolutionize food delivery in Nairobi, Mondas Snack Bar combines traditional flavors with modern culinary techniques. We source the finest ingredients and prepare every dish with care and attention to detail.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="leading-relaxed">
                To provide our customers with high-quality, delicious food delivered quickly and efficiently. We believe that great food should be accessible to everyone, and we're committed to making that happen.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Why Choose Us</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fresh, high-quality ingredients sourced locally</li>
                <li>Fast and reliable delivery service</li>
                <li>Wide variety of menu options to suit all tastes</li>
                <li>Professional and friendly customer service</li>
                <li>Eco-friendly packaging</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

