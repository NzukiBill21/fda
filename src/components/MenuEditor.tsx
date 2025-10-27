import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { menuItems as staticMenuItems } from './MenuSection';
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
  Check
} from 'lucide-react';

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
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    category: 'appetizers',
    stock: 0,
    prepTime: 15,
    isAvailable: true,
    isFeatured: false
  });

  const categories = [
    'all', 'appetizers', 'main-courses', 'desserts', 'beverages', 
    'specials', 'deals', 'vegetarian', 'non-vegetarian'
  ];

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
        const apiItems = data.menuItems || [];
        const staticItems = staticMenuItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category.toLowerCase().replace(/\s+/g, '-'),
          isAvailable: true,
          isFeatured: item.popular || false,
          stock: Math.floor(Math.random() * 50) + 10,
          prepTime: Math.floor(Math.random() * 30) + 10,
          nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          allergens: []
        }));
        
        const combinedItems = [...staticItems];
        apiItems.forEach(apiItem => {
          const existingIndex = combinedItems.findIndex(item => item.id === apiItem.id);
          if (existingIndex >= 0) {
            combinedItems[existingIndex] = {
              ...combinedItems[existingIndex],
              ...apiItem,
              stock: apiItem.stock || combinedItems[existingIndex].stock,
              prepTime: apiItem.prepTime || combinedItems[existingIndex].prepTime,
              nutrition: apiItem.nutrition || combinedItems[existingIndex].nutrition,
              allergens: apiItem.allergens || combinedItems[existingIndex].allergens
            };
          } else {
            combinedItems.push({
              ...apiItem,
              stock: apiItem.stock || Math.floor(Math.random() * 50) + 10,
              prepTime: apiItem.prepTime || Math.floor(Math.random() * 30) + 10,
              nutrition: apiItem.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
              allergens: apiItem.allergens || []
            });
          }
        });
        
        setMenuItems(combinedItems);
        toast.success(`Menu loaded successfully! ${combinedItems.length} items`, { duration: 1500 });
      } else {
        throw new Error(data.error || 'Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items', { description: error.message });
      
      // Fallback: Show actual menu items from the app if API fails
      const convertedItems = staticMenuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category.toLowerCase().replace(/\s+/g, '-'),
        isAvailable: true,
        isFeatured: item.popular || false,
        stock: Math.floor(Math.random() * 50) + 10,
        prepTime: Math.floor(Math.random() * 30) + 10,
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        allergens: []
      }));
      setMenuItems(convertedItems);
      toast.info('Showing menu items from app', { description: 'API connection failed, using app data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSave = async (item: any) => {
    try {
      // Ensure price is a number
      const itemToSave = {
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
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
        fetchMenuItems();
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
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Menu item deleted successfully!');
        fetchMenuItems();
      } else {
        toast.error(data.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleAdd = async (newItem: any) => {
    try {
      // Ensure price is a number
      const itemToAdd = {
        ...newItem,
        price: typeof newItem.price === 'string' ? parseFloat(newItem.price) : newItem.price,
        stock: typeof newItem.stock === 'string' ? parseInt(newItem.stock) : newItem.stock,
        prepTime: typeof newItem.prepTime === 'string' ? parseInt(newItem.prepTime) : newItem.prepTime
      };

      const res = await fetch('http://localhost:5000/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemToAdd)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Menu item added successfully!');
        fetchMenuItems();
      } else {
        toast.error(data.error || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error('❌ Failed to add menu item');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         item.name.toLowerCase().includes(lowerSearchTerm) ||
                         item.description.toLowerCase().includes(lowerSearchTerm) ||
                         item.category.toLowerCase().includes(lowerSearchTerm);
    const lowerCategory = selectedCategory.toLowerCase();
    const itemCategory = item.category.toLowerCase();
    const matchesCategory = lowerCategory === 'all' || 
                           lowerCategory === itemCategory ||
                           itemCategory.includes(lowerCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-t-xl sm:rounded-2xl shadow-2xl w-full h-[100vh] sm:h-[90vh] sm:max-w-6xl flex flex-col relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Menu Editor</h2>
              <p className="text-orange-100 text-sm">Manage your restaurant menu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors border-2 border-white shadow-lg text-white font-bold flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'list', label: 'Menu Items', icon: Package },
            { id: 'add', label: 'Add New', icon: Plus },
            { id: 'deals', label: 'Deals', icon: Tag },
            { id: 'inventory', label: 'Inventory', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 border-b-2 border-orange-600 font-bold'
                    : 'text-gray-800 hover:text-orange-600 hover:bg-orange-50 font-semibold border-b-2 border-transparent hover:border-orange-200'
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
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold"
                  />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-md border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-xl hover:shadow-2xl cursor-pointer appearance-none text-sm sm:text-base font-bold pr-12 min-w-[160px] sm:min-w-[200px] text-gray-900"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23f97316' d='M8 12L2 6h12z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '16px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-white text-gray-900 font-bold py-2 px-3">
                        {category === 'all' ? '📋 All Categories' : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown indicator for better visibility */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-orange-500"></div>
                  </div>
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
                      className="bg-white border border-gray-200 rounded-xl p-2 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-24 sm:h-48 object-cover rounded-lg mb-3"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-600">
                            <Edit className="w-3 h-3" />
                            <span>Editable</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm sm:text-lg text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.description}</p>
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
                                category: item.category,
                                stock: item.stock || 0,
                                prepTime: item.prepTime || 15,
                                isAvailable: item.isAvailable,
                                isFeatured: item.isFeatured || false
                              });
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={newItem.image}
                    onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base break-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="appetizers">Appetizers</option>
                    <option value="main-courses">Main Courses</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                    <option value="specials">Specials</option>
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
                      setNewItem({name: '', description: '', price: '', image: '', category: 'main-courses', stock: 0, prepTime: 15, isAvailable: true, isFeatured: false});
                      setActiveTab('list');
                    } else {
                      await handleAdd(newItem);
                      setNewItem({name: '', description: '', price: '', image: '', category: 'main-courses', stock: 0, prepTime: 15, isAvailable: true, isFeatured: false});
                      setActiveTab('list');
                    }
                  }}
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  style={{backgroundColor: '#f97316'}}
                >
                  <Plus className="w-4 h-4" />
                  {editingItem ? 'Update' : 'Save & Publish'}
                </button>
                {editingItem && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setNewItem({name: '', description: '', price: '', image: '', category: 'main-courses', stock: 0, prepTime: 15, isAvailable: true, isFeatured: false});
                      setActiveTab('list');
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold text-base shadow-md hover:shadow-lg active:scale-95"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-orange-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Deals & Offers</h3>
              <p className="text-gray-600 mb-6">Coming soon! Manage special deals and promotions.</p>
              <button
                onClick={() => toast.info('Feature under development!')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explore Deal Ideas
              </button>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Inventory Management</h3>
              <p className="text-gray-600">Monitor and update stock levels for your menu items.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.stock || 0}
                        onChange={(e) => {
                          const newStock = parseInt(e.target.value) || 0;
                          setMenuItems(prev => prev.map(mi => mi.id === item.id ? { ...mi, stock: newStock } : mi));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => toast.success('Stock updated!')}
                        className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
                {menuItems.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-600">No menu items found. Add some items to manage inventory.</p>
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

export default MenuEditor;