import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  X, 
  Image as ImageIcon, 
  DollarSign, 
  Tag, 
  Package, 
  Star,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  Settings,
  FolderOpen
} from 'lucide-react';

// Image compression function - crops to card-friendly aspect ratio (4:3) while maintaining quality
const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetAspectRatio = 4 / 3; // Card-friendly aspect ratio
        let width = img.width;
        let height = img.height;
        const imageAspectRatio = width / height;

        // Calculate dimensions to fit maxWidth while maintaining aspect ratio
        if (width > maxWidth) {
          width = maxWidth;
          height = width / targetAspectRatio;
        } else {
          // If image is smaller, scale up to maxWidth but maintain aspect
          if (imageAspectRatio > targetAspectRatio) {
            // Image is wider - fit to width
            height = width / imageAspectRatio;
          } else {
            // Image is taller - fit to height
            width = height * imageAspectRatio;
            if (width > maxWidth) {
              width = maxWidth;
              height = width / imageAspectRatio;
            }
          }
        }

        // Crop to target aspect ratio (center crop)
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        
        if (imageAspectRatio > targetAspectRatio) {
          // Image is wider - crop sides
          sourceHeight = img.height;
          sourceWidth = img.height * targetAspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          // Image is taller - crop top/bottom
          sourceWidth = img.width;
          sourceHeight = img.width / targetAspectRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw cropped image with high quality
        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

        // Convert to base64 with quality setting
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  stock?: number;
  prepTime?: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens?: string[];
}

interface MenuEditorProps {
  token: string;
  onClose: () => void;
}

const MenuEditor = ({ token, onClose }: MenuEditorProps) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    imageFile: null as File | null,
    imagePreview: '',
    category: 'Appetizers',
    stock: 0,
    prepTime: 15,
    isAvailable: true,
    isFeatured: false
  });

  // Simple base categories
  const baseCategories = [
    'Appetizers', 'Main Courses', 'Desserts', 'Beverages', 
    'Specials', 'Deals', 'Vegetarian', 'Non-Vegetarian',
    'African Specials', 'Premium'
  ];

  // Extract unique categories from menu items
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Update available categories from menu items
  useEffect(() => {
    const uniqueCategories = new Set<string>();
    menuItems.forEach((item: any) => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });
    setAvailableCategories(Array.from(uniqueCategories));
  }, [menuItems]);

  // Combine base categories and available categories from items
  const allCategories = [
    ...baseCategories,
    ...availableCategories.filter(c => !baseCategories.includes(c))
  ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  // Load custom categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.categories) {
            setCustomCategories(data.categories);
          }
        }
      } catch (error) {
        // Categories endpoint might not exist yet, that's okay
        console.log('Categories endpoint not available');
      }
    };
    loadCategories();
  }, [token]);

  // Set menu editor as active in localStorage
  useEffect(() => {
    localStorage.setItem('activeEditor', 'menuEditor');
    return () => {
      localStorage.removeItem('activeEditor');
    };
  }, []);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/menu', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.success) {
        // Only load items from API, no static items
        const apiItems = data.menuItems || [];
        setMenuItems(apiItems);
        // Dispatch event to update MenuSection with backend items
        window.dispatchEvent(new CustomEvent('menuItemsUpdated', { 
          detail: { menuItems: apiItems } 
        }));
        if (apiItems.length > 0) {
          toast.success(`Menu loaded successfully! ${apiItems.length} items`, { duration: 1500 });
        } else {
          toast.info('Menu is empty. Start by adding new items!', { duration: 2000 });
        }
      } else {
        throw new Error(data.error || 'Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      // Start with empty menu
      setMenuItems([]);
      toast.info('Menu is empty. Start by adding new items!', { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSave = async (item: any) => {
    try {
      // Ensure price is a number and category is a string
      const itemToSave = {
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        category: item.category || 'Main Courses'
      };

      const res = await fetch(`http://localhost:5000/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemToSave)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Menu item updated successfully!');
        await fetchMenuItems();
        // MenuSection will be updated via the event dispatched in fetchMenuItems
      } else {
        toast.error(data.error || 'Failed to update menu item');
      }
    } catch (error: any) {
      console.error('Failed to save menu item:', error);
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        toast.error(`❌ This menu item doesn't exist in the database. It may have been deleted or is a static item that cannot be edited.`);
      } else {
        toast.error('❌ Failed to save menu item. Please check your internet connection.');
      }
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    // Check if ID looks invalid (not a UUID format)
    const isInvalidId = itemId && !itemId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        
        // If invalid ID format, ALWAYS remove from UI (these don't exist in database)
        if (isInvalidId) {
          toast.info('Invalid item ID. Removing from list...');
          setMenuItems((prev: any[]) => prev.filter((item: any) => item.id !== itemId));
          await fetchMenuItems();
          return;
        }
        
        // Check if it's a foreign key constraint error (only for valid IDs)
        if (res.status === 400 && (errorMessage.includes('referenced') || 
            errorMessage.includes('orders') || 
            errorMessage.includes('carts') ||
            errorMessage.includes('Foreign key'))) {
          toast.error('Cannot delete: This item is in orders or carts. Mark it as unavailable instead.', {
            duration: 5000
          });
          return;
        }
        
        // If 400 or 404 error - item doesn't exist, remove from UI
        if (res.status === 404 || res.status === 400) {
          toast.info('Item not found in database. Removing from list...');
          setMenuItems((prev: any[]) => prev.filter((item: any) => item.id !== itemId));
          await fetchMenuItems();
          return;
        }
        
        // Also check error message for "not found" patterns
        if (errorMessage.includes('not found') || 
            errorMessage.includes('P2025') ||
            errorMessage.includes('Record to delete does not exist') ||
            errorMessage.includes('Menu item not found')) {
          toast.info('Item not found in database. Removing from list...');
          setMenuItems((prev: any[]) => prev.filter((item: any) => item.id !== itemId));
          await fetchMenuItems();
          return;
        }
        
        // For other errors, show the error but still try to refresh
        toast.error(`Error: ${errorMessage}. Refreshing menu...`);
        await fetchMenuItems();
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        toast.success('Menu item deleted successfully!');
        await fetchMenuItems();
        // MenuSection will be updated via the event dispatched in fetchMenuItems
      } else {
        toast.error(data.error || 'Failed to delete menu item');
      }
    } catch (error: any) {
      console.error('Failed to delete menu item:', error);
      // If invalid ID or network error, remove from UI
      if (isInvalidId || error.message?.includes('not exist') || error.message?.includes('P2025') || error.message?.includes('Failed to fetch')) {
        toast.info('Item may not exist in database. Removing from list...');
        // Remove from local state immediately
        setMenuItems((prev: any[]) => prev.filter((item: any) => item.id !== itemId));
        await fetchMenuItems();
      } else {
        toast.error(`Failed to delete menu item: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleAdd = async (newItem: any) => {
    try {
      let imageUrl = newItem.image;
      
      // If image file is uploaded, compress it to avoid payload size issues
      if (newItem.imageFile) {
        toast.loading('Compressing image to maintain quality...', { id: 'image-compress' });
        try {
          // Compress image while maintaining quality
          const compressedImage = await compressImage(newItem.imageFile, 1920, 0.85);
          imageUrl = compressedImage;
          toast.success('Image compressed successfully!', { id: 'image-compress' });
        } catch (error) {
          toast.error('Failed to compress image, using original', { id: 'image-compress' });
          imageUrl = newItem.imagePreview || newItem.image;
        }
      }

      // Ensure price is a number and category is a string
      const itemToAdd = {
        ...newItem,
        image: imageUrl,
        price: typeof newItem.price === 'string' ? parseFloat(newItem.price) : newItem.price,
        stock: typeof newItem.stock === 'string' ? parseInt(newItem.stock) : newItem.stock,
        prepTime: typeof newItem.prepTime === 'string' ? parseInt(newItem.prepTime) : newItem.prepTime,
        category: newItem.category || 'Main Courses'
      };

      // Remove imageFile from payload
      delete itemToAdd.imageFile;
      delete itemToAdd.imagePreview;

      const res = await fetch('http://localhost:5000/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemToAdd)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Menu item added successfully!');
        setNewItem({
          name: '',
          description: '',
          price: '',
          image: '',
          imageFile: null,
          imagePreview: '',
                                category: 'Appetizers',
          stock: 0,
          prepTime: 15,
          isAvailable: true,
          isFeatured: false
        });
        await fetchMenuItems();
        // MenuSection will be updated via the event dispatched in fetchMenuItems
      } else {
        toast.error(data.error || 'Failed to add menu item');
      }
    } catch (error: any) {
      console.error('Failed to add menu item:', error);
      if (error.message?.includes('413') || error.message?.includes('Payload Too Large')) {
        toast.error('❌ Image too large! Please use a smaller image or compress it further.');
      } else {
        toast.error('❌ Failed to add menu item: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const filteredItems = menuItems.filter(item => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         item.name.toLowerCase().includes(lowerSearchTerm) ||
                         item.description.toLowerCase().includes(lowerSearchTerm) ||
                         (item.category && item.category.toLowerCase().includes(lowerSearchTerm));
    
    // Category filter - match exact category name
    const matchesCategory = selectedCategory === 'all' || 
                           (item.category && item.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-t-xl sm:rounded-2xl w-full h-[100vh] sm:h-[90vh] sm:max-w-6xl flex flex-col relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-gray-100 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Menu Editor</h2>
              <p className="text-orange-100 text-sm">Manage your restaurant menu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors border-2 border-white shadow-lg text-white font-bold flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-100 bg-white">
          {[
            { id: 'list', label: 'Menu Items', icon: Package },
            { id: 'add', label: 'Add New', icon: Plus },
            { id: 'deals', label: 'Categories', icon: Tag },
            { id: 'inventory', label: 'Inventory', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-4 border-orange-600 font-bold bg-orange-50/50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50 border-b-4 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-orange-600' : 'text-gray-700'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-32" style={{maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overflowX: 'hidden'}}>
          {activeTab === 'list' && (
            <div className="space-y-6">
              {/* Search and Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all text-sm sm:text-base font-semibold shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-64 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all text-sm sm:text-base font-semibold shadow-sm hover:shadow-md cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23333' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '16px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="all">📋 All Categories</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Menu Items Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading menu items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or add new items.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add New Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {filteredItems.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border-2 border-gray-100 rounded-2xl p-3 sm:p-5 transition-all cursor-pointer group hover:border-orange-200 flex flex-col"
                      style={{ height: '380px' }}
                    >
                      <div className="relative flex-shrink-0 overflow-hidden rounded-lg mb-3 bg-gray-100" style={{ height: '160px', width: '100%' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{ 
                            height: '160px', 
                            width: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            minWidth: '100%',
                            minHeight: '100%'
                          }}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-600">
                            <Edit className="w-3 h-3" />
                            <span>Editable</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 flex-1 flex flex-col" style={{ minHeight: '140px', maxHeight: '140px' }}>
                        <h3 className="font-semibold text-sm sm:text-lg text-gray-900 line-clamp-2 flex-shrink-0">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 flex-1 overflow-hidden">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg sm:text-xl font-bold text-orange-600">KES {item.price}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{item.prepTime || 15} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{item.stock || 0} in stock</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setActiveTab('add');
                              setNewItem({
                                name: item.name,
                                description: item.description,
                                price: item.price.toString(),
                                image: item.image,
                                imageFile: null,
                                imagePreview: item.image,
                                category: item.category || 'Main Courses',
                                stock: item.stock || 0,
                                prepTime: item.prepTime || 15,
                                isAvailable: item.isAvailable,
                                isFeatured: item.isFeatured || false
                              });
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all text-xs sm:text-sm font-bold flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="space-y-4 px-4 sm:px-6 pb-32">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Classic Burger"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="A delicious description..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Image Upload (All formats supported - PNG, JPG, JPEG, WEBP, GIF, SVG, etc.)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Check file size (max 50MB for high resolution)
                              if (file.size > 50 * 1024 * 1024) {
                                toast.error('Image too large! Maximum size is 50MB');
                                return;
                              }
                              
                              // Create preview immediately
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewItem({
                                  ...newItem,
                                  imageFile: file,
                                  imagePreview: reader.result as string,
                                  image: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                              toast.success(`Image selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). Will be compressed on save.`);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors bg-gray-50 hover:bg-orange-50 text-center cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supports all image formats • High resolution supported (up to 50MB)
                          </p>
                        </div>
                      </label>
                    </div>
                    {newItem.imagePreview && (
                      <div className="relative group">
                        <img
                          src={newItem.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                          onError={(e) => {
                            toast.error('Failed to load image preview');
                            setNewItem({...newItem, imageFile: null, imagePreview: '', image: ''});
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setNewItem({...newItem, imageFile: null, imagePreview: '', image: ''})}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {newItem.imageFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            File: {newItem.imageFile.name} ({(newItem.imageFile.size / 1024 / 1024).toFixed(2)}MB)
                          </p>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <p>💡 Tip: You can also paste an image URL below</p>
                      <input
                        type="url"
                        value={newItem.image && !newItem.imagePreview ? newItem.image : ''}
                        onChange={(e) => {
                          if (!newItem.imagePreview) {
                            setNewItem({...newItem, image: e.target.value});
                          }
                        }}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                        placeholder="Or paste image URL here..."
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={newItem.prepTime}
                    onChange={(e) => setNewItem({...newItem, prepTime: parseInt(e.target.value) || 15})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    if (!newItem.name || !newItem.price || !newItem.image) {
                      toast.error('Please fill in all required fields');
                      return;
                    }
                    if (editingItem) {
                      await handleSave({...editingItem, ...newItem});
                      setEditingItem(null);
                      setNewItem({name: '', description: '', price: '', image: '', imageFile: null, imagePreview: '', category: 'Main Courses', stock: 0, prepTime: 15, isAvailable: true, isFeatured: false});
                      setActiveTab('list');
                    } else {
                      await handleAdd(newItem);
                      setNewItem({name: '', description: '', price: '', image: '', imageFile: null, imagePreview: '', category: 'Main Courses', stock: 0, prepTime: 15, isAvailable: true, isFeatured: false});
                      setActiveTab('list');
                    }
                  }}
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold text-base flex items-center justify-center gap-2 active:scale-95"
                  style={{backgroundColor: '#f97316'}}
                >
                  <Plus className="w-4 h-4" />
                  {editingItem ? 'Update' : 'Save & Publish'}
                </button>
                {editingItem && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setNewItem({name: '', description: '', price: '', image: '', imageFile: null, imagePreview: '', category: 'Main Courses', stock: 0, prepTime: 15, isAvailable: true, isFeatured: false});
                      setActiveTab('list');
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold text-base active:scale-95"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Categories</h3>
                  <p className="text-sm text-gray-500">Manage food & drink categories</p>
                </div>
                <button
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      const categorySlug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
                      if (!customCategories.includes(categorySlug) && !baseCategories.includes(categorySlug)) {
                        setCustomCategories([...customCategories, categorySlug]);
                        setNewCategoryName('');
                        toast.success(`Category "${newCategoryName}" added!`);
                      } else {
                        toast.error('Category already exists!');
                      }
                    } else {
                      toast.error('Please enter a category name');
                    }
                  }}
                  className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      const categorySlug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
                      if (!customCategories.includes(categorySlug) && !baseCategories.includes(categorySlug)) {
                        setCustomCategories([...customCategories, categorySlug]);
                        setNewCategoryName('');
                        toast.success(`Category "${newCategoryName}" added!`);
                      }
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Default</h4>
                <div className="flex flex-wrap gap-2">
                  {baseCategories.filter(c => c !== 'all').map(cat => (
                    <div key={cat} className="bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1.5">
                      <span className="text-xs font-medium text-gray-700">
                        {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>

                {customCategories.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-gray-700 mt-4">Custom</h4>
                    <div className="flex flex-wrap gap-2">
                      {customCategories.map(cat => (
                        <div key={cat} className="bg-orange-100 border border-orange-300 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 group">
                          <span className="text-xs font-medium text-orange-700">
                            {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm(`Delete category "${cat}"?`)) {
                                setCustomCategories(customCategories.filter(c => c !== cat));
                                toast.success('Category deleted!');
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-200 rounded"
                            title="Delete category"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Inventory Management</h3>
                  <p className="text-gray-600">Monitor and update stock levels for your menu items.</p>
                </div>
                <button
                  onClick={fetchMenuItems}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <InventoryItemCard 
                    key={item.id} 
                    item={item} 
                    token={token}
                    onUpdate={fetchMenuItems}
                  />
                ))}
                {menuItems.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No menu items found</h4>
                    <p className="text-gray-600 mb-4">Add menu items to manage their inventory.</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Add New Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
      </motion.div>
    </div>
  );
};

// Inventory Item Card Component
const InventoryItemCard = ({ item, token, onUpdate }: { item: any, token: string, onUpdate: () => Promise<void> }) => {
  const [stockValue, setStockValue] = useState(item.stock || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setStockValue(item.stock || 0);
  }, [item.stock]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, stock: stockValue })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(`Stock updated for ${item.name}!`);
          onUpdate();
        } else {
          throw new Error(data.error || 'Update failed');
        }
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error: any) {
      toast.error(`Failed to update stock: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-orange-200 transition-all">
      <h4 className="font-bold text-gray-900 mb-3">{item.name}</h4>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={stockValue}
          onChange={(e) => {
            const newStock = parseInt(e.target.value) || 0;
            setStockValue(newStock);
          }}
          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          min="0"
        />
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? '...' : 'Update'}
        </button>
      </div>
    </div>
  );
};

export default MenuEditor;