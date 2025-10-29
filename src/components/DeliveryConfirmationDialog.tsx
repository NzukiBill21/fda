import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Package, Truck, HelpCircle, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeliveryConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onConfirm: () => void;
}

export function DeliveryConfirmationDialog({ isOpen, onClose, orderId, onConfirm }: DeliveryConfirmationDialogProps) {
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [kitchenStaffNumber, setKitchenStaffNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotYet = () => {
    setShowHelpForm(true);
  };

  const handleSubmitHelpRequest = async () => {
    if (!kitchenStaffNumber.trim()) {
      toast.error('Please enter your kitchen or staff number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Send help request to backend
      const response = await fetch('http://localhost:5000/api/orders/support-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          kitchenStaffNumber: kitchenStaffNumber.trim(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('✅ Help request submitted! Our team will contact you shortly.');
        setShowHelpForm(false);
        setKitchenStaffNumber('');
        onClose();
      } else {
        throw new Error('Failed to submit help request');
      }
    } catch (error) {
      console.error('Help request error:', error);
      // Even if backend fails, show success message with contact info
      toast.success(`✅ Help request noted! Please contact support with Order #${orderId} and Staff #${kitchenStaffNumber.trim()}`);
      setShowHelpForm(false);
      setKitchenStaffNumber('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowHelpForm(false);
    setKitchenStaffNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 backdrop-blur-2xl border-2 border-green-300/50 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6 border-b-2 border-green-200/50">
          <DialogTitle className="text-2xl lg:text-3xl flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg"
            >
              <Package className="w-6 h-6" />
            </motion.div>
            {showHelpForm ? 'Need Help?' : 'Delivery Arrived!'}
          </DialogTitle>
          <DialogDescription className={showHelpForm ? 'text-gray-600 text-sm mt-2' : 'sr-only'}>
            {showHelpForm ? 'Provide your kitchen or staff number to get assistance from our trusted team members' : 'Confirm that your order has been delivered'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showHelpForm ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pt-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <p className="text-gray-700 mb-2 text-lg font-semibold">Order #{orderId}</p>
                <p className="text-gray-600 text-base">
                  Has your order been delivered? Please confirm that you have received your food.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-green-600" />
                  <p className="text-sm text-gray-700 font-medium">
                    Once you confirm, you'll be able to leave a review about your experience.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleNotYet}
                  className="flex-1 rounded-2xl py-6 border-2 text-base hover:bg-red-50 hover:border-red-300"
                >
                  Not Yet
                </Button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 rounded-2xl py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-xl text-base transition-all"
                >
                  ✓ Yes, I Received It
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="help-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pt-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-xl"
                >
                  <HelpCircle className="w-12 h-12 text-white" />
                </motion.div>
                <p className="text-gray-700 mb-2 text-lg font-semibold">Order #{orderId}</p>
                <p className="text-gray-600 text-base">
                  Don't worry! Provide your kitchen or staff number below and our trusted team members will assist you right away.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-5 border-2 border-orange-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-orange-600" />
                    <p className="text-sm text-gray-700 font-semibold">
                      Trusted Staff Support
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="staff-number" className="block text-sm font-medium text-gray-700 mb-2">
                      Kitchen / Staff Number *
                    </label>
                    <Input
                      id="staff-number"
                      type="text"
                      placeholder="Enter your kitchen or staff number"
                      value={kitchenStaffNumber}
                      onChange={(e) => setKitchenStaffNumber(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 py-3 px-4 text-base"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This helps us route your request to the right team member
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-700">
                        <p className="font-semibold mb-1">Quick Support Contacts:</p>
                        <p>📞 Kitchen: +254 700 000 000</p>
                        <p>📞 Staff: +254 700 000 001</p>
                        <p>📧 Email: support@monda.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowHelpForm(false);
                    setKitchenStaffNumber('');
                  }}
                  className="flex-1 rounded-2xl py-6 border-2 text-base hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitHelpRequest}
                  disabled={isSubmitting || !kitchenStaffNumber.trim()}
                  className="flex-1 rounded-2xl py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Request Help
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
