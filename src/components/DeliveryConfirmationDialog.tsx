import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { CheckCircle, Package, Truck } from 'lucide-react';

interface DeliveryConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onConfirm: () => void;
}

export function DeliveryConfirmationDialog({ isOpen, onClose, orderId, onConfirm }: DeliveryConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            Delivery Arrived!
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirm that your order has been delivered
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-6">
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
              onClick={onClose}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

