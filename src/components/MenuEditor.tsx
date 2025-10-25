import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isFeatured: boolean;
  stock: number;
  deal?: {
    type: 'percentage' | 'fixed' | 'buy_x_get_y';
    value: number;
    description: string;
    validUntil?: string;
  };
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens?: string[];
  prepTime: number; // in minutes
}

interface MenuEditorProps {
  token: string;
  onClose: () => void;
}

const MenuEditor: React.FC<MenuEditorProps> = ({ token, onClose }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'deals' | 'inventory'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all', 'appetizers', 'main-courses', 'desserts', 'beverages', 
    'specials', 'deals', 'vegetarian', 'non-vegetarian'
  ];

  const dealTemplates = [
    {
      name: 'Percentage Off',
      type: 'percentage' as const,
      description: 'Get X% off on this item',
      icon: '📊'
    },
    {
      name: 'Fixed Discount',
      type: 'fixed' as const,
      description: 'Get KES X off on this item',
      icon: '💰'
    },
    {
      name: 'Buy X Get Y',
      type: 'buy_x_get_y' as const,
      description: 'Buy X items, get Y free',
      icon: '🎁'
    }
  ];

  const menuTemplates = [
    {
      name: 'Classic Burger',
      template: {
        name: '',
        description: 'Juicy beef patty with fresh vegetables and special sauce',
        price: 450,
        category: 'main-courses',
        prepTime: 15,
        nutrition: {
          calories: 650,
          protein: 35,
          carbs: 45,
          fat: 28
        },
        allergens: ['gluten', 'dairy']
      }
    },
    {
      name: 'African Delight',
      template: {
        name: '',
        description: 'Traditional African dish with authentic spices',
        price: 350,
        category: 'main-courses',
        prepTime: 25,
        nutrition: {
          calories: 420,
          protein: 25,
          carbs: 35,
          fat: 15
        },
        allergens: []
      }
    },
    {
      name: 'Fresh Salad',
      template: {
        name: '',
        description: 'Fresh mixed greens with seasonal vegetables',
        price: 280,
        category: 'appetizers',
        prepTime: 10,
        nutrition: {
          calories: 120,
          protein: 8,
          carbs: 15,
          fat: 3
        },
        allergens: []
      }
    }
  ];

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'main-courses',
    isAvailable: true,
    isFeatured: false,
    stock: 0,
    prepTime: 15,
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    allergens: []
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.menuItems || []);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = editingItem 
        ? `http://localhost:5000/api/admin/menu/${editingItem.id}`
        : 'http://localhost:5000/api/admin/menu';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingItem ? 'Menu item updated!' : 'Menu item created!');
        setShowForm(false);
        setEditingItem(null);
        setFormData({
          name: '',
          description: '',
          price: 0,
          image: '',
          category: 'main-courses',
          isAvailable: true,
          isFeatured: false,
          stock: 0,
          prepTime: 15,
          nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          allergens: []
        });
        fetchMenuItems();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save menu item');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Menu item deleted!');
        fetchMenuItems();
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
    setActiveTab('add');
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...formData,
      ...template.template,
      name: '', // Clear name so user can enter their own
    });
    toast.success(`Template "${template.name}" applied!`);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Menu Management</h2>
              <p className="text-orange-100 mt-1">Manage your menu items, deals, and inventory</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-4">
            {[
              { id: 'list', name: 'Menu Items', icon: Package },
              { id: 'add', name: 'Add New', icon: Plus },
              { id: 'deals', name: 'Deals', icon: Tag },
              { id: 'inventory', name: 'Inventory', icon: Package }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'list' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="relative">
                      <img
                        src={item.image || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      {item.isFeatured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </div>
                      )}
                      {item.deal && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Deal
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <span className="text-2xl font-bold text-orange-500">
                          KES {item.price}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.prepTime}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Stock: {item.stock}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          item.isAvailable ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {item.isAvailable ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      {item.deal && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                          <p className="text-red-700 text-sm font-semibold">{item.deal.description}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="space-y-6">
              {/* Templates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {menuTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">{template.template.category === 'main-courses' ? '🍔' : template.template.category === 'appetizers' ? '🥗' : '🍽️'}</div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-600">KES {template.template.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Item Form */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter menu item name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Describe the menu item"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES) *</label>
                        <input
                          type="number"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                        <input
                          type="number"
                          value={formData.prepTime || ''}
                          onChange={(e) => setFormData({ ...formData, prepTime: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="appetizers">Appetizers</option>
                        <option value="main-courses">Main Courses</option>
                        <option value="desserts">Desserts</option>
                        <option value="beverages">Beverages</option>
                        <option value="specials">Specials</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="non-vegetarian">Non-Vegetarian</option>
                      </select>
                    </div>
                  </div>

                  {/* Image and Status */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={formData.stock || ''}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable || false}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Available for order</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured || false}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured item</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all font-medium"
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: 0,
                        image: '',
                        category: 'main-courses',
                        isAvailable: true,
                        isFeatured: false,
                        stock: 0,
                        prepTime: 15,
                        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                        allergens: []
                      });
                    }}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Deals Management</h3>
              <p className="text-gray-500">Coming soon - Manage special offers and deals</p>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Inventory Management</h3>
              <p className="text-gray-500">Coming soon - Track stock levels and inventory</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MenuEditor;
