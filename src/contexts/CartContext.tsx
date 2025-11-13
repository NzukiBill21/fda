import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  menuItemId: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (menuItem: any) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Handle both old and new cart structures
        if (parsedCart.length > 0 && parsedCart[0].id && !parsedCart[0].menuItemId) {
          // Convert old structure to new structure
          const convertedCart = parsedCart.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            menuItem: {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              category: item.category
            }
          }));
          setCartItems(convertedCart);
        } else {
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        localStorage.removeItem('cart'); // Clear corrupted data
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (menuItem: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItemId === menuItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, {
          menuItemId: menuItem.id,
          quantity: 1,
          menuItem: {
            id: menuItem.id,
            name: menuItem.name,
            description: menuItem.description,
            price: menuItem.price,
            image: menuItem.image,
            category: menuItem.category
          }
        }];
      }
    });
    
    toast.success(`${menuItem.name} added to cart! 🛒`);
  };

  const removeFromCart = (menuItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.menuItemId !== menuItemId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
