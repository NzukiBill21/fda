import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import mondasLogo from '../assets/logo';

interface FooterProps {
  onOpenAboutUs?: () => void;
  onOpenDeliveryInfo?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTermsConditions?: () => void;
}

export function Footer({ onOpenAboutUs, onOpenDeliveryInfo, onOpenPrivacyPolicy, onOpenTermsConditions }: FooterProps) {
  return (
    <footer className="relative bg-gradient-to-br from-red-950 via-red-900 to-yellow-950 text-white py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={mondasLogo} 
              alt="Mondas Snack Bar" 
              className="h-16 w-auto mb-6" 
            />
            <p className="text-gray-400 leading-relaxed mb-4">
              Delivering delicious snacks and premium meals across Westlands, Nairobi. Quality food, fast service, unforgettable taste.
            </p>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                href="https://www.facebook.com/mondaske"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10"
                title="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                href="https://www.instagram.com/mondaske"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10"
                title="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                href="https://x.com/mondaske"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10"
                title="Follow us on X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl mb-6 text-white">Contact Us</h3>
            <div className="space-y-4">
              <motion.a
                whileHover={{ x: 5 }}
                href="tel:+254700000000"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2 rounded-lg bg-red-600/20 group-hover:bg-red-600/30 transition-colors">
                  <Phone className="w-4 h-4 text-red-400" />
                </div>
                <span>+254 700 000 000</span>
              </motion.a>
              <motion.a
                whileHover={{ x: 5 }}
                href="mailto:hello@mondas.co.ke"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2 rounded-lg bg-yellow-600/20 group-hover:bg-yellow-600/30 transition-colors">
                  <Mail className="w-4 h-4 text-yellow-400" />
                </div>
                <span>hello@mondas.co.ke</span>
              </motion.a>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-400 group"
              >
                <div className="p-2 rounded-lg bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <span>Ground Floor, Westlands, Nairobi</span>
              </motion.div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-xl mb-6 text-white">Opening Hours</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Clock className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                  </div>
                  <div className="text-sm text-gray-500">9:00 AM - 10:00 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Clock className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span>Saturday</span>
                  </div>
                  <div className="text-sm text-gray-500">10:00 AM - 11:00 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Clock className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span>Sunday</span>
                  </div>
                  <div className="text-sm text-gray-500">10:00 AM - 9:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl mb-6 text-white">Quick Links</h3>
            <div className="space-y-3">
              <motion.a
                whileHover={{ x: 5 }}
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Menu
              </motion.a>
              <motion.a
                whileHover={{ x: 5 }}
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAboutUs?.();
                }}
                className="block text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                About Us
              </motion.a>
              <motion.a
                whileHover={{ x: 5 }}
                href="#delivery-info"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenDeliveryInfo?.();
                }}
                className="block text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Delivery Info
              </motion.a>
              <motion.a
                whileHover={{ x: 5 }}
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPrivacyPolicy?.();
                }}
                className="block text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </motion.a>
              <motion.a
                whileHover={{ x: 5 }}
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTermsConditions?.();
                }}
                className="block text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Terms & Conditions
              </motion.a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 text-center sm:text-left">
              &copy; 2025 Mondas Snack Bar. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </motion.div>
              <span>in Nairobi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
          </div>
        </div>
      </div>
    </footer>
  );
}

