import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CreditCard, Banknote, MapPin, User, Phone, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmOrder: (orderDetails: OrderDetails) => void;
}

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: 'mpesa' | 'cash';
  mpesaNumber?: string;
}

export function CheckoutDialog({ isOpen, onClose, total, onConfirmOrder }: CheckoutDialogProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [formData, setFormData] = useState<OrderDetails>({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'mpesa',
    mpesaNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('success');
      setTimeout(() => {
        onConfirmOrder(formData);
        onClose();
        setStep('details');
        setFormData({
          name: '',
          phone: '',
          address: '',
          notes: '',
          paymentMethod: 'mpesa',
          mpesaNumber: '',
        });
      }, 2500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-2xl border-2 border-white/40 shadow-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader className="pb-6 border-b-2 border-gray-200/50">
          <DialogTitle className="text-2xl lg:text-3xl flex items-center gap-3">
            {step === 'details' && (
              <>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                Delivery Details
              </>
            )}
            {step === 'payment' && (
              <>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
                Payment Method
              </>
            )}
            {step === 'success' && (
              <>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                Order Confirmed!
              </>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {step === 'details' && 'Enter your delivery information for order completion'}
            {step === 'payment' && 'Select your preferred payment method'}
            {step === 'success' && 'Your order has been successfully placed'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto mb-6 p-6 w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center"
              >
                <CheckCircle className="w-16 h-16 text-green-600" />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl text-gray-900 mb-3"
              >
                Order Placed Successfully!
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-2"
              >
                Your delicious meal is on its way! 🎉
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500"
              >
                Estimated delivery: <strong>30-45 minutes</strong>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200"
              >
                <p className="text-sm text-gray-700">
                  Track your order status via SMS at <strong>{formData.phone}</strong>
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <AnimatePresence mode="wait">
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2 text-base">
                          <User className="w-4 h-4 text-red-600" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="rounded-xl border-2 border-gray-300 focus:border-red-500 py-6 text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-base">
                          <Phone className="w-4 h-4 text-red-600" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+254 700 000 000"
                          className="rounded-xl border-2 border-gray-300 focus:border-red-500 py-6 text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2 text-base">
                        <MapPin className="w-4 h-4 text-red-600" />
                        Delivery Address
                      </Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g., Chiromo Lane, Westlands"
                        className="rounded-xl border-2 border-gray-300 focus:border-red-500 py-6 text-base"
                      />
                      <p className="text-sm text-gray-500 pl-1">Delivery available in Westlands area only</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-base">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Gate code, building name, dietary preferences..."
                        className="rounded-xl border-2 border-gray-300 focus:border-red-500 min-h-[120px] text-base"
                      />
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">📦 Delivery Time:</span>
                          <span className="font-semibold text-gray-900">30-45 minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">🚚 Delivery Fee:</span>
                          <span className="font-semibold text-gray-900">KSh 200</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg text-gray-700">Total Amount:</span>
                        <span 
                          className="text-3xl lg:text-4xl bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent"
                          style={{ 
                            fontWeight: '800',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          KSh {total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg">Choose Payment Method</Label>
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value: 'mpesa' | 'cash') =>
                          setFormData({ ...formData, paymentMethod: value })
                        }
                        className="space-y-4"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'mpesa'
                              ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <RadioGroupItem value="mpesa" id="mpesa" className="w-5 h-5" />
                          <Label htmlFor="mpesa" className="flex items-center gap-4 cursor-pointer flex-1">
                            <div className={`p-3 rounded-xl ${
                              formData.paymentMethod === 'mpesa' 
                                ? 'bg-green-600 shadow-lg' 
                                : 'bg-green-100'
                            }`}>
                              <Smartphone className={`w-7 h-7 ${
                                formData.paymentMethod === 'mpesa' ? 'text-white' : 'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-lg text-gray-900">M-Pesa</p>
                              <p className="text-sm text-gray-600">Pay securely with M-Pesa STK Push</p>
                            </div>
                          </Label>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'cash'
                              ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <RadioGroupItem value="cash" id="cash" className="w-5 h-5" />
                          <Label htmlFor="cash" className="flex items-center gap-4 cursor-pointer flex-1">
                            <div className={`p-3 rounded-xl ${
                              formData.paymentMethod === 'cash' 
                                ? 'bg-blue-600 shadow-lg' 
                                : 'bg-blue-100'
                            }`}>
                              <Banknote className={`w-7 h-7 ${
                                formData.paymentMethod === 'cash' ? 'text-white' : 'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-lg text-gray-900">Cash on Delivery</p>
                              <p className="text-sm text-gray-600">Pay with cash when you receive your order</p>
                            </div>
                          </Label>
                        </motion.div>
                      </RadioGroup>
                    </div>

                    {formData.paymentMethod === 'mpesa' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="mpesaNumber" className="text-base">M-Pesa Number</Label>
                        <Input
                          id="mpesaNumber"
                          required={formData.paymentMethod === 'mpesa'}
                          type="tel"
                          value={formData.mpesaNumber}
                          onChange={(e) => setFormData({ ...formData, mpesaNumber: e.target.value })}
                          placeholder="+254 700 000 000"
                          className="rounded-xl border-2 border-gray-300 focus:border-green-500 py-6 text-base"
                        />
                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                          <p className="text-sm text-gray-700">
                            💡 You will receive an M-Pesa STK push prompt on this number to complete payment
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 pt-4">
                {step === 'payment' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="flex-1 rounded-xl py-6 border-2 text-base"
                  >
                    ← Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 rounded-xl py-6 bg-gradient-to-r from-red-600 via-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 shadow-xl text-base"
                >
                  {step === 'details' ? 'Continue to Payment →' : 'Confirm Order 🎉'}
                </Button>
              </div>
            </form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
