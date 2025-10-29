import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Minus, Plus, Trash2, ShoppingBag, Sparkles } from 'lucide-react';
import { MenuItem } from './MenuSection';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from './ui/scroll-area';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'drinks' | 'sides' | 'desserts';
}

const addOns: AddOn[] = [
  {
    id: 'drink-1',
    name: 'Coca Cola (500ml)',
    price: 150,
    image: 'https://images.unsplash.com/photo-1624797375978-8c2f746bdd3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xhJTIwY2FuJTIwZHJpbmslMjBpY2V8ZW58MXx8fHwxNzYwNjAzMTUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'drinks',
  },
  {
    id: 'drink-2',
    name: 'Fresh Juice',
    price: 200,
    image: 'https://images.unsplash.com/photo-1610873167013-2dd675d30ef4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwZHJpbmslMjBzb2RhfGVufDF8fHx8MTc2MDQ0MjYzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'drinks',
  },
  {
    id: 'drink-3',
    name: 'Milkshake',
    price: 400,
    image: 'https://images.unsplash.com/photo-1534449369274-82e4ad08bf35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrc2hha2UlMjBkcmlua3xlbnwxfHx8fDE3NjA0MzM2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'drinks',
  },
  {
    id: 'side-1',
    name: 'Garden Salad',
    price: 350,
    image: 'https://images.unsplash.com/photo-1620019989479-d52fcedd99fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwYm93bHxlbnwxfHx8fDE3NjA1NTE1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'sides',
  },
  {
    id: 'dessert-1',
    name: 'Chocolate Cake',
    price: 450,
    image: 'https://images.unsplash.com/photo-1736840334919-aac2d5af73e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBkZXNzZXJ0JTIwY2FrZXxlbnwxfHx8fDE3NjA1NTg0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'desserts',
  },
  {
    id: 'dessert-2',
    name: 'Ice Cream',
    price: 300,
    image: 'https://images.unsplash.com/photo-1663904458920-f153c162fa79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2UlMjBjcmVhbSUyMGRlc3NlcnR8ZW58MXx8fHwxNzYwNTEwMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'desserts',
  },
];

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onAddToCart: (item: any) => void;
  aiRecommendations?: React.ReactNode;
}

export function CartSheet({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onAddToCart,
  aiRecommendations,
}: CartSheetProps) {
  const [selectedAddOnCategory, setSelectedAddOnCategory] = useState<'drinks' | 'sides' | 'desserts'>('drinks');
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 5000 ? 0 : 200; // Free delivery for orders over KES 5,000
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    onCheckout();
    onClose();
  };

  const filteredAddOns = addOns.filter(addon => addon.category === selectedAddOnCategory);

  const handleAddAddon = (addon: AddOn) => {
    onAddToCart({
      ...addon,
      description: `Add-on: ${addon.name}`,
      image: addon.image,
      category: addon.category,
      rating: 4.5,
      reviews: 50,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-gradient-to-br from-red-100/95 via-orange-50/95 to-yellow-100/95 backdrop-blur-2xl border-l-4 border-red-300/50 shadow-2xl flex flex-col p-0 h-full overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b-2 border-gray-200/50 flex-shrink-0">
          <SheetTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-600 to-yellow-500 text-white shadow-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="p-8 rounded-full bg-gradient-to-br from-red-100 to-yellow-100 mb-6"
              >
                <ShoppingBag className="w-20 h-20 text-red-600" />
              </motion.div>
              <h3 className="text-2xl text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 shadow-xl text-lg px-8 py-6"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6">
                <div className="space-y-4 py-4">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-lg hover:shadow-xl hover:border-orange-300/50 hover:scale-[1.02] transition-all duration-300"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full rounded-xl object-cover shadow-md"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 mb-1 truncate">{item.name}</h4>
                          <p 
                            className="bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent mb-3"
                            style={{ 
                              fontWeight: '700',
                              fontSize: '1.125rem',
                              fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}
                          >
                            KES {item.price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-100 hover:to-yellow-100 flex items-center justify-center transition-all shadow-md"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            
                            <span 
                              className="w-10 text-center text-gray-900"
                              style={{ fontWeight: '600', fontSize: '1.125rem' }}
                            >
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemoveItem(item.id)}
                          className="self-start p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add-Ons Section */}
                {items.length > 0 && (
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <h4 className="text-lg text-gray-900">Complete Your Meal</h4>
                    </div>
                    
                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-4">
                      {(['drinks', 'sides', 'desserts'] as const).map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedAddOnCategory(category)}
                          className={`flex-1 px-4 py-2.5 rounded-xl transition-all text-sm ${
                            selectedAddOnCategory === category
                              ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
                              : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Add-Ons Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {filteredAddOns.map((addon) => (
                        <motion.div
                          key={addon.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAddAddon(addon)}
                          className="p-3 rounded-xl bg-white/80 border-2 border-gray-200/50 hover:border-red-300 cursor-pointer transition-all shadow-md hover:shadow-lg"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden mb-2">
                            <ImageWithFallback
                              src={addon.image}
                              alt={addon.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-900 mb-1 truncate">{addon.name}</p>
                          <p 
                            className="text-sm bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent"
                            style={{ fontWeight: '600' }}
                          >
                            +KES {addon.price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* AI Recommendations */}
                {aiRecommendations}
              </div>

              {/* Summary */}
              <div className="px-6 py-6 border-t-2 border-gray-200/50 bg-white/80 backdrop-blur-xl space-y-4 flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>KES {subtotal.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span style={{ fontWeight: '600' }}>KES {deliveryFee.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (16%)</span>
                    <span style={{ fontWeight: '600' }}>KES {tax.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  <Separator className="bg-gradient-to-r from-red-200 to-yellow-200" />
                  <div className="flex justify-between text-xl lg:text-2xl text-gray-900">
                    <span style={{ fontWeight: '700' }}>Total</span>
                    <span 
                      className="bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent"
                      style={{ 
                        fontWeight: '800',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      KES {total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleCheckout}
                    className="w-full py-6 lg:py-7 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 shadow-2xl hover:shadow-red-500/50 transition-all text-lg"
                  >
                    Proceed to Checkout
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
