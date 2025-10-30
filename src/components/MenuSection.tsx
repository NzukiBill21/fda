import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Star, Heart, Flame, Leaf } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useCart } from '../contexts/CartContext';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
}

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
}

// Function to get appropriate Unsplash image for menu items
const getUnsplashImageForMenuItem = (name: string, category: string): string => {
  const imageMap: { [key: string]: string } = {
    // Burgers
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    'egbo': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    'deluxe': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    
    // Pasta
    'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    'carbonara': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    'spaghetti': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    
    // Salad
    'caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&h=800&fit=crop&q=85',
    'salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&h=800&fit=crop&q=85',
    
    // Pizza
    'pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&h=800&fit=crop&q=85',
    
    // Generic food fallback
    'delicious': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=85',
    'offer': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=85',
  };
  
  const lowerName = name.toLowerCase();
  for (const [key, url] of Object.entries(imageMap)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }
  
  // Category-based fallback
  const categoryMap: { [key: string]: string } = {
    'Premium': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
    'African Specials': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
    'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    'Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&h=800&fit=crop&q=85',
    'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    'Salads': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&h=800&fit=crop&q=85',
    'Chicken': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1200&h=800&fit=crop&q=85',
    'Drinks': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200&h=800&fit=crop&q=85',
    'Snacks': 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=1200&h=800&fit=crop&q=85',
    'Hot Dogs': 'https://images.unsplash.com/photo-1612392062798-2ad99e4f4e7e?w=1200&h=800&fit=crop&q=85',
  };
  
  return categoryMap[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=85';
};

export const menuItems: MenuItem[] = [
  // Premium
  {
    id: 'ribs-1',
    name: 'Tender BBQ Ribs',
    description: 'Fall-off-the-bone ribs glazed with our signature BBQ sauce',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
    category: 'Premium',
    rating: 5.0,
    reviews: 284,
    popular: true,
  },
  {
    id: 'steak-1',
    name: 'Premium Steak Combo',
    description: 'Perfectly grilled premium beef steak with seasonal vegetables',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&h=800&fit=crop&q=85',
    category: 'Premium',
    rating: 4.9,
    reviews: 156,
    popular: true,
  },
  {
    id: 'nyama-1',
    name: 'Nyama Choma Special',
    description: 'Authentic Kenyan roasted goat meat with kachumbari',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
    category: 'African Specials',
    rating: 4.9,
    reviews: 342,
    popular: true,
    spicy: true,
  },
  
  // African Specials
  {
    id: 'pilau-1',
    name: 'Beef Pilau',
    description: 'Aromatic spiced rice with tender beef chunks, steaming hot',
    price: 650,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&h=800&fit=crop&q=85',
    category: 'African Specials',
    rating: 4.8,
    reviews: 428,
    popular: true,
  },
  {
    id: 'biryani-1',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken',
    price: 750,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=800&fit=crop&q=85',
    category: 'African Specials',
    rating: 4.7,
    reviews: 215,
    spicy: true,
  },
  {
    id: 'tilapia-1',
    name: 'Grilled Tilapia',
    description: 'Fresh tilapia grilled to perfection with ugali and sukuma',
    price: 950,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&h=800&fit=crop&q=85',
    category: 'African Specials',
    rating: 4.8,
    reviews: 187,
  },
  {
    id: 'ugali-1',
    name: 'Ugali & Beef Stew',
    description: 'Traditional maize meal with rich beef stew and greens',
    price: 550,
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=1200&h=800&fit=crop&q=85',
    category: 'African Specials',
    rating: 4.6,
    reviews: 298,
  },
  {
    id: 'samosa-1',
    name: 'Beef Samosas (6pc)',
    description: 'Crispy golden pastry filled with spiced minced beef',
    price: 300,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&h=800&fit=crop&q=85',
    category: 'African Specials',
    rating: 4.7,
    reviews: 412,
  },
  
  // Burgers
  {
    id: '1',
    name: 'Classic Burger Combo',
    description: 'Juicy beef burger with crispy fries and special sauce',
    price: 850,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    category: 'Burgers',
    rating: 4.8,
    reviews: 124,
    popular: true,
  },
  
  // Chicken
  {
    id: '2',
    name: 'Spicy Chicken Wings',
    description: '8 pieces of spicy glazed wings with ranch dip',
    price: 650,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1200&h=800&fit=crop&q=85',
    category: 'Chicken',
    rating: 4.9,
    reviews: 98,
    spicy: true,
    popular: true,
  },
  
  // Snacks
  {
    id: '3',
    name: 'Loaded Nachos',
    description: 'Crispy nachos with cheese, jalapeños, and guacamole',
    price: 550,
    image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=1200&h=800&fit=crop&q=85',
    category: 'Snacks',
    rating: 4.6,
    reviews: 76,
    vegetarian: true,
  },
  {
    id: '6',
    name: 'Crispy French Fries',
    description: 'Golden crispy fries with your choice of sauce',
    price: 300,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&h=800&fit=crop&q=85',
    category: 'Snacks',
    rating: 4.4,
    reviews: 203,
    vegetarian: true,
  },
  
  // Pizza
  {
    id: '4',
    name: 'Pepperoni Pizza',
    description: 'Large pepperoni pizza with mozzarella cheese',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&h=800&fit=crop&q=85',
    category: 'Pizza',
    rating: 4.7,
    reviews: 145,
    popular: true,
  },
  
  // Hot Dogs
  {
    id: '5',
    name: 'Gourmet Hot Dog',
    description: 'Premium beef sausage with caramelized onions',
    price: 450,
    image: 'https://images.unsplash.com/photo-1612392062798-2ad99e4f4e7e?w=1200&h=800&fit=crop&q=85',
    category: 'Hot Dogs',
    rating: 4.5,
    reviews: 89,
  },
  
  // Drinks
  {
    id: 'drink-soda',
    name: 'Soft Drinks (500ml)',
    description: 'Coca Cola, Sprite, Fanta - Chilled to perfection',
    price: 150,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200&h=800&fit=crop&q=85',
    category: 'Drinks',
    rating: 4.5,
    reviews: 256,
  },
  {
    id: 'drink-shake',
    name: 'Milkshakes',
    description: 'Chocolate, Vanilla, or Strawberry milkshake',
    price: 400,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200&h=800&fit=crop&q=85',
    category: 'Drinks',
    rating: 4.8,
    reviews: 189,
  },
];

// Helper to sanitize image URLs
const sanitizeImageUrl = (url: string | undefined, name: string, category: string): string => {
  if (!url) return getUnsplashImageForMenuItem(name, category);
  if (url.includes('placeholder') || url.includes('via.placeholder') || url.match(/placeholder\.(com|net|io)/i)) {
    return getUnsplashImageForMenuItem(name, category);
  }
  return url;
};

export function MenuSection({ onAddToCart }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'any' | 'budget' | 'mid' | 'premium'>('any');
  const [onlyPopular, setOnlyPopular] = useState(false);
  const [onlySpicy, setOnlySpicy] = useState(false);
  const [onlyVeggie, setOnlyVeggie] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'priceAsc' | 'priceDesc' | 'ratingDesc'>('match');
  // Sanitize initial menuItems to remove any placeholder images
  const sanitizedInitialItems = menuItems.map(item => ({
    ...item,
    image: sanitizeImageUrl(item.image, item.name, item.category)
  }));
  const [currentMenuItems, setCurrentMenuItems] = useState<MenuItem[]>(sanitizedInitialItems);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/menu');
        const data = await res.json();
        if (data.success && data.menuItems) {
          const mappedItems = data.menuItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: sanitizeImageUrl(item.image, item.name, item.category),
            category: item.category,
            rating: item.rating || 4.5,
            reviews: 0,
            popular: item.isFeatured,
            spicy: false,
            vegetarian: item.isVegetarian || false
          }));
          // Merge with existing items to avoid duplicates, and sanitize all images
          setCurrentMenuItems(prevItems => {
            const existingIds = new Set(prevItems.map(i => i.id));
            const newItems = mappedItems.filter((item: any) => !existingIds.has(item.id));
            // Sanitize all items (existing and new) to ensure no placeholder images
            const allItems = [...prevItems, ...newItems].map(item => ({
              ...item,
              image: sanitizeImageUrl(item.image, item.name, item.category)
            }));
            return allItems;
          });
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      }
    };

    fetchMenuItems();
    
    // Also listen for menu updates from MenuEditor
    const handleMenuUpdate = (event: CustomEvent) => {
      console.log('Menu updated!', event.detail.menuItems.length, 'items');
      setCurrentMenuItems(event.detail.menuItems);
    };

    window.addEventListener('menuItemsUpdated', handleMenuUpdate as EventListener);
    
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdate as EventListener);
    };
  }, []);

  // Global hardening: replace any placeholder images anywhere in the page
  useEffect(() => {
    const handler = (e: Event) => {
      const img = e.target as HTMLImageElement;
      const src = img?.src || '';
      if (!img || !src) return;
      if (/via\.placeholder|placeholder\.(com|net|io)/i.test(src)) {
        const name = img.alt || 'delicious';
        // best effort: try using data-category attribute if present
        const category = (img.getAttribute('data-category') || 'Premium');
        img.src = getUnsplashImageForMenuItem(name, category);
      }
    };
    document.addEventListener('error', handler, true);
    return () => document.removeEventListener('error', handler, true);
  }, []);

  const categories = ['All', 'African Specials', 'Premium', ...Array.from(new Set(currentMenuItems.filter(i => i.category !== 'Premium' && i.category !== 'African Specials').map((item) => item.category)))];

  // Lightweight fuzzy search scoring for suggestions
  const suggestions = useMemo(() => {
    if (searchTerm.trim().length < 2) return [] as MenuItem[];
    const needle = searchTerm.toLowerCase();
    const score = (text: string) => {
      const hay = text.toLowerCase();
      if (hay.includes(needle)) return 200 - hay.indexOf(needle) * 2; // prefer early matches
      // partial ratio
      let matches = 0;
      let j = 0;
      for (let i = 0; i < hay.length && j < needle.length; i++) {
        if (hay[i] === needle[j]) { matches++; j++; }
      }
      return matches * 4; // weaker than includes
    };
    const base = selectedCategory === 'All' ? currentMenuItems : currentMenuItems.filter(i => i.category === selectedCategory);
    const applyBadgeFilters = (items: MenuItem[]) => {
      let list = items;
      if (onlyPopular) list = list.filter(i => i.popular);
      if (onlySpicy) list = list.filter(i => i.spicy);
      if (onlyVeggie) list = list.filter(i => i.vegetarian);
      // price filter
      if (priceFilter !== 'any') {
        list = list.filter((item) => {
          if (priceFilter === 'budget') return item.price < 500;
          if (priceFilter === 'mid') return item.price >= 500 && item.price <= 1000;
          return item.price > 1000;
        });
      }
      return list;
    };

    return applyBadgeFilters([...base])
      .map(item => ({ item, s: Math.max(
        score(item.name),
        score(item.description),
        score(item.category)
      )}))
      .filter(x => x.s >= Math.max(20, needle.length * 6))
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map(x => x.item);
  }, [searchTerm, currentMenuItems]);

  const filteredItems = (() => {
    let filtered = currentMenuItems;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => 
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        item.description.toLowerCase().includes(lowerSearchTerm) ||
        item.category.toLowerCase().includes(lowerSearchTerm)
      );
    }
    // Price filter
    if (priceFilter !== 'any') {
      filtered = filtered.filter((item) => {
        if (priceFilter === 'budget') return item.price < 500;
        if (priceFilter === 'mid') return item.price >= 500 && item.price <= 1000;
        return item.price > 1000; // premium
      });
    }
    // Badge filters
    if (onlyPopular) filtered = filtered.filter(i => i.popular);
    if (onlySpicy) filtered = filtered.filter(i => i.spicy);
    if (onlyVeggie) filtered = filtered.filter(i => i.vegetarian);
    // Sorting
    if (sortBy === 'priceAsc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === 'ratingDesc') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return filtered;
  })();

  const handleAddToCart = (item: MenuItem, event: React.MouseEvent) => {
    onAddToCart(item);
    
    // Create diamond sparkle effect
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Create multiple sparkles
    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.innerHTML = '💎';
      sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: 24px;
        pointer-events: none;
        z-index: 99999;
        animation: sparkleFloat${i} 1.2s ease-out forwards;
      `;
      
      const style = document.createElement('style');
      const angle = (i * 45) * (Math.PI / 180);
      const distance = 100;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      style.textContent = `
        @keyframes sparkleFloat${i} {
          0% { 
            opacity: 1; 
            transform: translate(0, 0) scale(0.5) rotate(0deg);
          }
          100% { 
            opacity: 0; 
            transform: translate(${endX}px, ${endY}px) scale(1.5) rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        document.body.removeChild(sparkle);
        document.head.removeChild(style);
      }, 1200);
    }
  };

  return (
    <section id="menu" className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-red-950/50 via-transparent to-yellow-900/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Collapsible offers/hero. When hidden, spacing collapses to minimize scroll. */}
        {/* Single compact offers block to avoid duplicates elsewhere */}
        {showOffers ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 lg:mb-10"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  borderColor: 'rgba(230, 57, 70, 0.4)',
                  boxShadow: '0 8px 32px rgba(230, 57, 70, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                }}
              >
                <Flame className="w-5 h-5 text-red-600" />
                <span className="text-sm font-bold" style={{ color: '#e63946' }}>DELICIOUS MENU</span>
              </motion.div>
              <button aria-label="Hide offers" onClick={() => setShowOffers(false)} className="ml-3 px-3 py-2 text-xs font-semibold rounded-full bg-white/70 hover:bg-white shadow border border-white/60">✕</button>
            </div>
            <h2 
              className="text-3xl sm:text-5xl md:text-6xl mb-3 font-black tracking-tight"
              style={{
                color: '#ffffff',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3), 2px 2px 4px rgba(220, 38, 38, 0.5)',
                WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.2)',
                letterSpacing: '-0.02em'
              }}
            >
              Our Signature Dishes
            </h2>
            <p 
              className="text-base sm:text-xl md:text-2xl max-w-2xl mx-auto font-semibold"
              style={{ color: '#ffffff' }}
            >
              From authentic African cuisine to international favorites
            </p>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center mb-3">
            <button onClick={() => setShowOffers(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-white shadow border border-gray-200 hover:bg-gray-50">
              <span>Show Offers</span>
              <span>▾</span>
            </button>
          </div>
        )}

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          {/* Compact, glassy search with suggestions */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white shadow-xl border border-gray-200 focus-within:border-red-500">
                <span className="text-red-600">🔎</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  placeholder="Search meals, drinks, categories..."
                  className="w-full bg-transparent outline-none text-base sm:text-lg font-semibold text-gray-800 placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setSearchTerm('')}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 mt-2 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/60 overflow-hidden z-20"
                >
                  {suggestions.map(s => (
                    <li key={s.id}>
                      <button
                        onMouseDown={() => { setSearchTerm(s.name); setSelectedCategory('All'); }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3"
                      >
                        <img src={s.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500 truncate">{s.category}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </motion.div>
          </div>

          {/* Compact filters row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5">
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full px-2 py-1 shadow">
              {[
                { v: 'any', label: 'Any' },
                { v: 'budget', label: '< 500' },
                { v: 'mid', label: '500-1000' },
                { v: 'premium', label: '> 1000' },
              ].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => { setPriceFilter(opt.v as any); setSelectedCategory('All'); }}
                  className={`px-2.5 py-1 text-xs sm:text-sm rounded-full font-semibold ${priceFilter===opt.v ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow' : 'text-gray-700 hover:bg-white'}`}
                >{opt.label}</button>
              ))}
            </div>

            <button onClick={() => { setOnlyPopular(p => !p); setSelectedCategory('All'); }} className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${onlyPopular ? 'bg-yellow-400 text-red-900 border-yellow-300' : 'bg-white/80 text-gray-800 border-white/60'} shadow`}>Popular</button>
            <button onClick={() => { setOnlySpicy(p => !p); setSelectedCategory('All'); }} className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${onlySpicy ? 'bg-red-600 text-white border-red-500' : 'bg-white/80 text-gray-800 border-white/60'} shadow`}>Spicy</button>
            <button onClick={() => { setOnlyVeggie(p => !p); setSelectedCategory('All'); }} className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${onlyVeggie ? 'bg-green-600 text-white border-green-500' : 'bg-white/80 text-gray-800 border-white/60'} shadow`}>Veggie</button>

            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full px-2 py-1 shadow">
              <span className="text-xs text-gray-600 pl-1">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-sm font-semibold px-2 py-1 rounded-full outline-none"
              >
                <option value="match">Best Match</option>
                <option value="priceAsc">Price Low</option>
                <option value="priceDesc">Price High</option>
                <option value="ratingDesc">Top Rated</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-10 lg:mb-14 w-full">
            <div className="overflow-x-scroll overflow-y-hidden w-full md:w-auto scrollbar-visible px-4">
              <TabsList className="inline-flex flex-nowrap p-2 rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border-2 border-gray-200/50 gap-2 min-w-max mx-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                    className="px-4 sm:px-6 lg:px-8 py-3 rounded-xl whitespace-nowrap text-sm sm:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:bg-gray-100"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            </div>
          </div>

          <TabsContent value={selectedCategory}>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ y: -8, boxShadow: '0 30px 60px rgba(220, 38, 38, 0.25)' }}
                    className="rounded-2xl lg:rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all overflow-hidden h-full flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-32 sm:h-48 lg:h-56 xl:h-64 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          // Replace broken placeholder images with fallback
                          const target = e.target as HTMLImageElement;
                          const fallbackImage = getUnsplashImageForMenuItem(item.name, item.category);
                          if (target.src !== fallbackImage) {
                            target.src = fallbackImage;
                          }
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2 flex-wrap">
                        {item.popular && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 border-0 shadow-lg">
                            ⭐ Popular
                          </Badge>
                        )}
                        <div className="flex gap-2">
                          {item.spicy && (
                            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg">
                              <Flame className="w-3 h-3 mr-1" /> Spicy
                            </Badge>
                          )}
                          {item.vegetarian && (
                            <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-lg">
                              <Leaf className="w-3 h-3 mr-1" /> Veggie
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Heart Icon */}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="w-5 h-5 text-red-600" />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-5 lg:p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm text-gray-900 font-semibold">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">({item.reviews})</span>
                      </div>

                      <h3 className="text-sm sm:text-lg lg:text-xl text-gray-900 mb-1 sm:mb-2 font-bold line-clamp-1">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2 flex-1">{item.description}</p>

                      <div className="flex items-center justify-between mt-auto gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wide hidden lg:inline">Price</span>
                          <div className="flex items-end gap-1">
                            <span className="text-sm sm:text-base font-semibold text-gray-600 leading-none">KES</span>
                            <span
                              className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none"
                              style={{ letterSpacing: '-0.02em' }}
                            >
                              {item.price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ 
                            scale: 1.15, 
                            rotate: 90,
                            boxShadow: '0 15px 40px rgba(220, 38, 38, 0.4)' 
                          }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAddToCart(item, e)}
                          className="p-2 sm:p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-br from-red-600 via-red-600 to-yellow-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 pointer-events-none" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
