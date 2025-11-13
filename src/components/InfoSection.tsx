import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Truck, Shield, FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface InfoSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function InfoSection({ id, title, icon, content, isOpen, onClose }: InfoSectionProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-2 border-gray-200/50 shadow-2xl rounded-3xl [&>button]:hidden">
        <DialogHeader className="pb-6 border-b-2 border-gray-200/50 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
                {icon}
              </div>
              <DialogTitle className="text-2xl lg:text-3xl font-bold text-gray-900">
                {title}
              </DialogTitle>
            </div>
          </div>
          {/* Prominent Exit Button - Positioned absolutely to override default close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-3 rounded-xl hover:bg-red-50 transition-all text-white bg-red-600 hover:bg-red-700 border-2 border-red-600 hover:border-red-700 font-semibold flex items-center gap-2 shadow-lg z-50"
            aria-label="Exit"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-bold">Exit</span>
          </button>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="prose prose-lg max-w-none pt-6"
        >
          {content}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export function AboutUsSection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <InfoSection
      id="about"
      title="About Us"
      icon={<Info className="w-8 h-8" />}
      isOpen={isOpen}
      onClose={onClose}
      content={
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            Welcome to <strong className="text-red-600">Mondas Snack Bar</strong>, your premier destination for delicious snacks and premium meals in Westlands, Nairobi. We are passionate about delivering exceptional food experiences that bring people together.
          </p>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
            <p className="leading-relaxed">
              Founded with a vision to revolutionize food delivery in Nairobi, Mondas Snack Bar combines traditional flavors with modern culinary techniques. We source the finest ingredients and prepare every dish with care and attention to detail.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
            <p className="leading-relaxed">
              To provide our customers with high-quality, delicious food delivered quickly and efficiently. We believe that great food should be accessible to everyone, and we're committed to making that happen.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Why Choose Us</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fresh, high-quality ingredients sourced locally</li>
              <li>Fast and reliable delivery service</li>
              <li>Wide variety of menu options to suit all tastes</li>
              <li>Professional and friendly customer service</li>
              <li>Eco-friendly packaging</li>
            </ul>
          </div>
        </div>
      }
    />
  );
}

export function DeliveryInfoSection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <InfoSection
      id="delivery-info"
      title="Delivery Information"
      icon={<Truck className="w-8 h-8" />}
      isOpen={isOpen}
      onClose={onClose}
      content={
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            We offer fast and reliable delivery service across Westlands, Nairobi. Here's everything you need to know about our delivery process.
          </p>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Delivery Areas</h3>
            <p className="leading-relaxed">
              We currently deliver to Westlands and surrounding areas in Nairobi. Delivery is available during our operating hours.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Delivery Time</h3>
            <p className="leading-relaxed">
              Standard delivery time is <strong className="text-red-600">30-45 minutes</strong> from the time your order is confirmed. During peak hours, delivery may take up to 60 minutes.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Delivery Fees</h3>
            <p className="leading-relaxed">
              Delivery fees vary based on your location. Fees are calculated at checkout and displayed before you confirm your order. Free delivery is available for orders above KSh 2,000.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Order Tracking</h3>
            <p className="leading-relaxed">
              Once your order is placed, you can track its progress in real-time through our app. You'll receive updates when your order is being prepared, when it's out for delivery, and when it arrives.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Contact Delivery</h3>
            <p className="leading-relaxed">
              If you have any questions about your delivery, please contact us at <a href="tel:+254700000000" className="text-red-600 hover:underline">+254 700 000 000</a> or <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
            </p>
          </div>
        </div>
      }
    />
  );
}

export function PrivacyPolicySection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <InfoSection
      id="privacy"
      title="Privacy Policy"
      icon={<Shield className="w-8 h-8" />}
      isOpen={isOpen}
      onClose={onClose}
      content={
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            At Mondas Snack Bar, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.
          </p>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Information We Collect</h3>
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
            <h3 className="text-2xl font-bold text-gray-900">How We Use Your Information</h3>
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
            <h3 className="text-2xl font-bold text-gray-900">Data Security</h3>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Your Rights</h3>
            <p className="leading-relaxed">
              You have the right to access, update, or delete your personal information at any time. You can also opt-out of marketing communications by contacting us or using the unsubscribe link in our emails.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
            </p>
            <p className="text-sm text-gray-500 italic">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      }
    />
  );
}

export function TermsConditionsSection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <InfoSection
      id="terms"
      title="Terms & Conditions"
      icon={<FileText className="w-8 h-8" />}
      isOpen={isOpen}
      onClose={onClose}
      content={
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            Please read these Terms and Conditions carefully before using our service. By placing an order, you agree to be bound by these terms.
          </p>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Order Acceptance</h3>
            <p className="leading-relaxed">
              All orders are subject to acceptance by Mondas Snack Bar. We reserve the right to refuse or cancel any order at our discretion.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Pricing and Payment</h3>
            <p className="leading-relaxed">
              All prices are displayed in Kenyan Shillings (KSh) and are subject to change without notice. Payment must be made at the time of order placement. We accept M-Pesa, cash on delivery, and card payments.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Cancellation and Refunds</h3>
            <p className="leading-relaxed">
              Orders can be cancelled within 5 minutes of placement. Once an order is being prepared, cancellation may not be possible. Refunds will be processed according to our refund policy.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Delivery</h3>
            <p className="leading-relaxed">
              We aim to deliver within the estimated time, but delivery times are approximate and not guaranteed. We are not liable for delays caused by circumstances beyond our control.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Food Quality</h3>
            <p className="leading-relaxed">
              We take great care in preparing your food. If you are not satisfied with your order, please contact us within 30 minutes of delivery for a refund or replacement.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Limitation of Liability</h3>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, Mondas Snack Bar shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
            <p className="leading-relaxed">
              For any questions about these Terms and Conditions, please contact us at <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
            </p>
            <p className="text-sm text-gray-500 italic">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      }
    />
  );
}

            <h3 className="text-2xl font-bold text-gray-900">Delivery</h3>
            <p className="leading-relaxed">
              We aim to deliver within the estimated time, but delivery times are approximate and not guaranteed. We are not liable for delays caused by circumstances beyond our control.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Food Quality</h3>
            <p className="leading-relaxed">
              We take great care in preparing your food. If you are not satisfied with your order, please contact us within 30 minutes of delivery for a refund or replacement.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Limitation of Liability</h3>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, Mondas Snack Bar shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
            <p className="leading-relaxed">
              For any questions about these Terms and Conditions, please contact us at <a href="mailto:hello@mondas.co.ke" className="text-red-600 hover:underline">hello@mondas.co.ke</a>.
            </p>
            <p className="text-sm text-gray-500 italic">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      }
    />
  );
}


