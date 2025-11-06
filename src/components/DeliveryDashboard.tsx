import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, CheckCircle, Clock, Navigation, Phone, MessageSquare, Star, Zap, Target, TrendingUp, DollarSign, Timer, AlertCircle, Wifi, WifiOff, Battery, Signal, Route, Car, Bike, User, Bell, Settings, RefreshCw, Eye, PhoneCall, Map, Compass, Wind, Sun, Moon, MapPin as Gps } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryDashboardProps {
  token: string;
  user: any;
}

export function DeliveryDashboard({ token, user }: DeliveryDashboardProps) {
  const [assignments, setAssignments] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState({ lat: -1.2921, lng: 36.8219 });
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [performance, setPerformance] = useState({ rating: 4.8, completed: 0, onTime: 0 });
  const [weather, setWeather] = useState({ temp: 28, condition: 'sunny', wind: 12, city: 'Nairobi' });
  const [battery, setBattery] = useState(85);
  const [signal, setSignal] = useState(4);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [profileImage, setProfileImage] = useState<string>('');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '',
    email: user?.email || '',
    licenseNumber: '',
    vehicleType: '',
    vehiclePlate: '',
    idNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchEarnings();
    fetchPerformance();
    // Only fetch profile data if user email is available
    if (user?.email) {
      fetchProfileData(); // Fetch saved profile data
    }
    fetchOrders(); // Fetch delivery orders
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(currentLocation);
          fetchWeather(currentLocation);
        },
        (error) => {
          // Handle geolocation errors gracefully
          if (error.code === 1) {
            // User denied permission
            console.log('Location permission denied - using default location');
            setLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
            fetchWeather({ lat: -1.2921, lng: 36.8219 });
          } else {
            console.error('Location error:', error);
            setLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
            fetchWeather({ lat: -1.2921, lng: 36.8219 });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Fallback to default location
      setLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
      fetchWeather({ lat: -1.2921, lng: 36.8219 });
    }

    // Set up periodic updates (more frequent for live orders)
    const interval = setInterval(() => {
      fetchAssignments();
      fetchEarnings();
      fetchPerformance();
      if (user?.email) {
        fetchProfileData(); // Refresh profile data periodically too
      }
      fetchOrders();
    }, 5000); // Update every 5 seconds

    // Auto-track location when online
    let locationInterval: NodeJS.Timeout | null = null;
    if (isOnline) {
      locationInterval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setLocation(newLocation);
              fetchWeather(newLocation);
            },
            () => console.log('Location update failed')
          );
        }
      }, 10000); // Update every 10 seconds when online
    }

    return () => {
      clearInterval(interval);
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [token, isOnline]);

  const fetchWeather = async (loc: { lat: number, lng: number }) => {
    try {
      // Using a free weather API or local data for now
      // Nairobi default weather
      const nairobiWeather = {
        temp: 25,
        condition: 'partly cloudy',
        wind: 15,
        city: 'Nairobi'
      };
      
      setWeather(nairobiWeather);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Keep default weather
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
        // Update earnings based on completed deliveries
        const completed = data.assignments?.filter((a: any) => a.status === 'DELIVERED') || [];
        const todayEarnings = completed.reduce((sum: number, order: any) => sum + (order.deliveryFee || 50), 0);
        setEarnings(prev => ({ ...prev, today: todayEarnings }));
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEarnings(data.earnings || { today: 0, week: 0, month: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPerformance(data.performance || { rating: 4.8, completed: 0, onTime: 95 });
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/delivery/orders/${orderId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          notes,
          latitude: location.lat,
          longitude: location.lng
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Order status updated successfully');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    
    try {
      // Update location if going online
      let currentLocation = location;
      if (newStatus && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setLocation(currentLocation);
          },
          () => {
            console.log('Using cached location');
          }
        );
      }

      const res = await fetch('http://localhost:5000/api/delivery/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus ? 'online' : 'offline',
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(newStatus);
        toast.success(newStatus ? '🚗 You are now ONLINE!' : '🛑 You are now OFFLINE', { duration: 3000 });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/delivery/accept/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Order accepted!');
        fetchAssignments();
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/delivery/complete/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Order delivered successfully!');
        fetchAssignments();
      }
    } catch (error) {
      console.error('Failed to complete order:', error);
      toast.error('Failed to complete order');
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large! Max size is 5MB');
        return;
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid image format! Use JPG, PNG, or WEBP');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfileImage(result);
        toast.success('✅ Image uploaded! Click Save to confirm.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage('');
    toast.success('📷 Image removed! Click Save to confirm.');
  };

  const fetchProfileData = async () => {
    let backendHasImage = false;
    
    try {
      // Fetch from backend first - this is the source of truth for profile picture
      const res = await fetch('http://localhost:5000/api/delivery/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          // Set profile image from backend (can be base64 or URL)
          // Backend stores base64 images, so they persist across sessions
          // Check for both null and empty string
          // avatarUrl can be base64 (data:image/...) or a URL
          if (data.profile.avatarUrl && typeof data.profile.avatarUrl === 'string' && data.profile.avatarUrl.trim() !== '') {
            const avatarValue = data.profile.avatarUrl.trim();
            console.log('Loading profile image from backend (length:', avatarValue.length, 'chars)');
            setProfileImage(avatarValue);
            backendHasImage = true;
          } else {
            // No avatarUrl in backend profile response - using default/placeholder
            // Don't clear existing image if backend doesn't have one - it might still be loading
          }
          
          // Set online status from backend
          if (data.profile.status) {
            setIsOnline(data.profile.status === 'online');
          }
        }
      } else {
        console.error('Backend profile fetch failed:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch profile from backend:', error);
    }
    
    // Fallback to localStorage for other profile data
    // Scope by user ID to prevent profile mixing between different delivery guys
    const userStorageKey = `deliveryProfile_${user?.email || 'unknown'}`;
    const savedData = localStorage.getItem(userStorageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Only use profileImage from localStorage if:
        // 1. Backend didn't return an image AND
        // 2. localStorage has a non-base64 URL (base64 images should be in backend)
        if (!backendHasImage && parsed.profileImage && !parsed.profileImage.startsWith('data:image/')) {
          console.log('Loading profile image from localStorage fallback');
          setProfileImage(parsed.profileImage);
        }
        
        // Load other profile fields from localStorage (always load these)
        setProfileData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Save to backend - include base64 images so they persist
      // The backend stores avatarUrl as a string, which can handle base64 data URLs
      const res = await fetch('http://localhost:5000/api/delivery/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          avatarUrl: profileImage || null, // Send base64 or URL to backend for persistence
          status: isOnline ? 'online' : 'offline'
        })
      });
      const data = await res.json();
      if (data.success) {
        // Save to localStorage - but EXCLUDE base64 images (too large for localStorage)
        // Profile picture is now stored in backend database, so we don't need it in localStorage
        const dataToSave: any = {
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email,
          licenseNumber: profileData.licenseNumber,
          vehicleType: profileData.vehicleType,
          vehiclePlate: profileData.vehiclePlate,
          idNumber: profileData.idNumber,
          emergencyContact: profileData.emergencyContact,
          emergencyPhone: profileData.emergencyPhone,
          address: profileData.address,
          bio: profileData.bio
        };
        
        // Only save non-base64 avatarUrl to localStorage (if it's a URL, not base64)
        if (profileImage && !profileImage.startsWith('data:image/') && data.profile?.avatarUrl) {
          dataToSave.profileImage = data.profile.avatarUrl;
        }
        
        try {
          // Scope by user ID to prevent profile mixing
          const userStorageKey = `deliveryProfile_${user?.email || 'unknown'}`;
          localStorage.setItem(userStorageKey, JSON.stringify(dataToSave));
        } catch (storageError: any) {
          if (storageError.name === 'QuotaExceededError') {
            // If still too large, try without profileImage
            delete dataToSave.profileImage;
            const userStorageKey = `deliveryProfile_${user?.email || 'unknown'}`;
            localStorage.setItem(userStorageKey, JSON.stringify(dataToSave));
            toast.warning('⚠️ Profile saved, but image was too large for local storage');
          } else {
            throw storageError;
          }
        }
        
        // Update local state with backend response - ensure profile image persists
        // Always use backend response if it has an avatarUrl (even if it's base64)
        if (data.profile?.avatarUrl && data.profile.avatarUrl.trim() !== '') {
          setProfileImage(data.profile.avatarUrl);
        } else {
          // If backend doesn't have image but we have one in state (just saved), keep it
          // This prevents the image from disappearing immediately after save
          if (!profileImage || profileImage === '') {
            console.log('No profile image in backend and no local image');
          }
        }
        
        toast.success('✅ Profile saved successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      
      // Fallback: Save to localStorage but exclude base64 images
      try {
        const dataToSave: any = { ...profileData };
        // Don't save base64 images to localStorage
        if (profileImage && !profileImage.startsWith('data:image/')) {
          dataToSave.profileImage = profileImage;
        }
        // Scope by user ID to prevent profile mixing
        const userStorageKey = `deliveryProfile_${user?.email || 'unknown'}`;
        localStorage.setItem(userStorageKey, JSON.stringify(dataToSave));
        toast.warning('⚠️ Saved locally only - backend unavailable');
      } catch (storageError: any) {
        if (storageError.name === 'QuotaExceededError') {
          // Last resort: save without image
          const dataToSave = { ...profileData };
          const userStorageKey = `deliveryProfile_${user?.email || 'unknown'}`;
          localStorage.setItem(userStorageKey, JSON.stringify(dataToSave));
          toast.error('⚠️ Local storage full - saved without image');
        } else {
          toast.error('⚠️ Failed to save profile');
        }
      }
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info('🔄 Refreshing data...', { duration: 2000 });
    await Promise.all([fetchAssignments(), fetchEarnings(), fetchPerformance()]);
    toast.success('✅ Data refreshed!', { duration: 3000 });
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const quickActions = [
    { name: 'Refresh', icon: RefreshCw, color: 'bg-blue-500', action: handleRefresh },
    { name: 'Call Support', icon: Phone, color: 'bg-green-500', action: () => { window.open('tel:+254700000000'); toast.success('📞 Opening phone dialer...', { duration: 2000 }); } },
    { name: 'View Map', icon: Map, color: 'bg-purple-500', action: () => { setActiveTab('orders'); toast.info('📍 Showing map...', { duration: 2000 }); } },
    { name: 'Report Issue', icon: AlertCircle, color: 'bg-red-500', action: () => { toast.success('⚠️ Issue reported!', { duration: 3000 }); } }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 pt-12 pb-24 px-3 sm:px-4">
      {/* Mobile Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-white text-sm font-medium">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Battery className="w-4 h-4 text-white" />
              <span className="text-white text-xs">{battery}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Signal className="w-4 h-4 text-white" />
              <span className="text-white text-xs">{signal}/4</span>
            </div>
            <div className="flex items-center gap-1">
              <Gps className="w-4 h-4 text-white" />
              <span className="text-white text-xs">GPS</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-lg"
              title="Logout"
            >
              <span className="text-white text-xs font-bold">🚪</span>
              <span className="text-white text-xs font-bold hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg border-t border-white/20 shadow-xl">
        <div className="flex justify-around py-2">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: Package },
            { id: 'orders', name: 'Orders', icon: Navigation },
            { id: 'earnings', name: 'Earnings', icon: DollarSign },
            { id: 'profile', name: 'Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 sm:px-3 rounded-lg transition-all active:scale-95 min-h-[60px] min-w-[60px] ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white active:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto max-w-md">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 pt-4">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
                  <p className="text-orange-100">Ready to deliver?</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-300" />
                    <span className="text-xl font-bold">{performance.rating}</span>
                  </div>
                  <p className="text-orange-100 text-sm">Rating</p>
                </div>
              </div>
              
              <button
                onClick={handleToggleOnline}
                className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl shadow-xl hover:shadow-2xl transition-all active:scale-95 ${
                  isOnline
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isOnline ? '🛑 Go Offline' : '🚗 Go Online'}
              </button>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white">
                      {assignments.filter((a) => a.status === 'PENDING').length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Navigation className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Active</p>
                    <p className="text-2xl font-bold text-white">
                      {assignments.filter((a) => a.status === 'OUT_FOR_DELIVERY').length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-white">
                      {assignments.filter((a) => a.status === 'DELIVERED').length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Today</p>
                    <p className="text-2xl font-bold text-white">KES {earnings.today}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Weather & Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <Sun className="w-8 h-8 text-yellow-400" />
                    <p className="text-white text-2xl font-bold">{weather.temp}°C</p>
                    <p className="text-gray-300 text-sm capitalize">{weather.condition}</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Current Location</p>
                    <p className="text-gray-300 text-sm">{weather.city}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Wind className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{weather.wind} km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <h3 className="text-white font-bold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const isLoading = action.name === 'Refresh' && isRefreshing;
                  return (
                    <button
                      key={action.name}
                      onClick={action.action}
                      disabled={isLoading}
                      className={`${action.color} rounded-xl p-4 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isLoading ? 'animate-spin' : ''}`} />
                      <p className="text-sm font-bold">{action.name}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4 pt-4">
            {/* Interactive Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg mb-3 relative overflow-hidden shadow-xl">
                <div className="aspect-square relative bg-blue-600">
                  {/* Interactive Map with native HTML5 embedded map */}
                  <iframe
                    key={`${location.lat}-${location.lng}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full"
                    scrolling="no"
                  />
                  
                  
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-lg rounded-lg px-3 py-2 shadow-lg z-30">
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <motion.span 
                        className="text-blue-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >📍</motion.span> {weather.city}
                    </p>
                    <p className="text-xs text-gray-600">{orders.length} {orders.length === 1 ? 'delivery' : 'deliveries'}</p>
                  </div>
                  {orders.length > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500/95 backdrop-blur-lg rounded-lg px-3 py-2 shadow-lg z-30">
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        <span>🚚</span> {orders.length} Active
                      </p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-green-500/95 backdrop-blur-lg rounded-lg px-3 py-2 shadow-lg z-30">
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      <span>🌡️</span> {weather.temp}°C {weather.condition}
                    </p>
                  </div>
                  
                  {/* Tap to View Full Map Overlay */}
                  <button
                    onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=15`, '_blank')}
                    className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-lg px-4 py-2 rounded-lg shadow-xl hover:bg-white transition-all active:scale-95 z-30 flex items-center gap-2"
                  >
                    <span className="text-sm font-semibold text-gray-900">🗺️</span>
                    <span className="text-xs font-bold text-gray-900 hidden sm:inline">Tap to zoom</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                          setLocation(newLocation);
                          fetchWeather(newLocation);
                          toast.success('📍 Location updated!', { duration: 2000 });
                        },
                        (error) => {
                          console.error('Geolocation error:', error);
                          if (error.code === 1) {
                            toast.error('📍 Location access denied. Please enable location services in your browser.', { duration: 5000 });
                          } else if (error.code === 2) {
                            toast.error('📍 Unable to determine location. Please check your network.', { duration: 5000 });
                          } else {
                            toast.error('📍 Failed to get location. Trying default...', { duration: 3000 });
                            setLocation({ lat: -1.2921, lng: 36.8219 });
                            fetchWeather({ lat: -1.2921, lng: 36.8219 });
                          }
                        },
                        { timeout: 10000, enableHighAccuracy: true }
                      );
                    } else {
                      toast.error('📍 Geolocation not supported by your browser.', { duration: 3000 });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all active:scale-95"
                >
                  🔄 Update Location
                </button>
                <button
                  onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=15`, '_blank')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all active:scale-95"
                >
                  🗺️ View Full Map
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-white font-bold text-xl mb-4">Your Deliveries</h2>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No deliveries assigned</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {isOnline ? 'Waiting for new orders...' : 'Go online to receive deliveries'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/10 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-bold text-lg">{order.orderNumber}</p>
                          <p className="text-gray-300">{order.customerName}</p>
                          <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-xl">
                            KES {order.total?.toLocaleString()}
                          </p>
                          <p
                            className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              order.status === 'DELIVERED'
                                ? 'bg-green-500 text-white'
                                : order.status === 'OUT_FOR_DELIVERY'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {order.status}
                          </p>
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-white font-semibold text-sm mb-1">Delivery Address:</p>
                            <p className="text-gray-300 text-sm">{order.deliveryAddress}</p>
                            {order.deliveryNotes && (
                              <p className="text-yellow-300 text-xs mt-1">
                                📝 Notes: {order.deliveryNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {(order.status === 'READY' || order.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 px-4 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base sm:text-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all active:scale-95"
                          >
                            {order.status === 'READY' ? '✅ Pick Up & Deliver' : '🚚 Start Delivery'}
                          </button>
                        )}
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <>
                            <button
                              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                              className="flex-1 px-3 py-3 sm:py-4 rounded-xl bg-blue-500 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center"
                            >
                              <Map className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="flex-1 px-4 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base sm:text-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all active:scale-95"
                            >
                              ✓ Mark Delivered
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => window.open(`tel:${order.customerPhone}`)}
                          className="px-3 py-3 sm:py-4 rounded-xl bg-gray-500 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-gray-600 transition-all active:scale-95"
                        >
                          📞
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white"
            >
              <h2 className="text-2xl font-bold mb-4">Your Earnings</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-emerald-100 text-sm">Today</p>
                  <p className="text-2xl font-bold">KES {earnings.today}</p>
                </div>
                <div className="text-center">
                  <p className="text-emerald-100 text-sm">This Week</p>
                  <p className="text-2xl font-bold">KES {earnings.week}</p>
                </div>
                <div className="text-center">
                  <p className="text-emerald-100 text-sm">This Month</p>
                  <p className="text-2xl font-bold">KES {earnings.month}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <h3 className="text-white font-bold mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-bold">{performance.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Completed Today</span>
                  <span className="text-white font-bold">{performance.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">On-Time Rate</span>
                  <span className="text-white font-bold">{performance.onTime}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 pt-4 pb-32 overflow-y-auto max-h-[calc(100vh-200px)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">My Profile</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                  >
                    Edit Profile
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-lg active:scale-95"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-orange-500 shadow-xl">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                      <label className="bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-all shadow-lg active:scale-95">
                        <Settings className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {profileImage && (
                        <button
                          onClick={handleRemoveImage}
                          className="bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition-all shadow-lg active:scale-95"
                        >
                          <Settings className="w-4 h-4 rotate-45" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <p className="text-white/80 font-semibold text-xs mt-4 text-center">Click green button to upload, red to remove</p>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-white font-bold text-sm">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-bold text-sm">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div>
                      <label className="text-white font-bold text-sm">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-bold text-sm">ID Number</label>
                      <input
                        type="text"
                        value={profileData.idNumber}
                        onChange={(e) => setProfileData({ ...profileData, idNumber: e.target.value })}
                        className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="ID Number"
                      />
                    </div>
                    <div>
                      <label className="text-white font-bold text-sm">License Number</label>
                      <input
                        type="text"
                        value={profileData.licenseNumber}
                        onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                        className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="License #"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-bold text-sm mb-2 block">Vehicle Type</label>
                    <select
                      value={profileData.vehicleType}
                      onChange={(e) => setProfileData({ ...profileData, vehicleType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/30 border-3 border-white/70 rounded-xl text-white font-bold text-base cursor-pointer hover:bg-white/40 hover:border-orange-400 transition-all duration-300 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-400/60 active:scale-[0.98]"
                      style={{ 
                        color: profileData.vehicleType ? '#ffffff' : '#ffffff',
                        fontWeight: 'bold'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>🏍️ Select vehicle type</option>
                      <option value="Motorcycle" style={{ backgroundColor: '#374151', color: '#ffffff', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>🏍️ Motorcycle</option>
                      <option value="Bicycle" style={{ backgroundColor: '#374151', color: '#ffffff', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>🚴 Bicycle</option>
                      <option value="Car" style={{ backgroundColor: '#374151', color: '#ffffff', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>🚗 Car</option>
                      <option value="Walking" style={{ backgroundColor: '#374151', color: '#ffffff', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>🚶 Walking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white font-bold text-sm">Vehicle Plate Number</label>
                    <input
                      type="text"
                      value={profileData.vehiclePlate}
                      onChange={(e) => setProfileData({ ...profileData, vehiclePlate: e.target.value })}
                      className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="KCA 123A"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-bold text-sm">Emergency Contact</label>
                      <input
                        type="text"
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                        className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Contact Name"
                      />
                    </div>
                    <div>
                      <label className="text-white font-bold text-sm">Emergency Phone</label>
                      <input
                        type="tel"
                        value={profileData.emergencyPhone}
                        onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                        className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-bold text-sm">Home Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Street, Area, City"
                    />
                  </div>

                  <div>
                    <label className="text-white font-bold text-sm">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={3}
                      className="w-full mt-1 px-4 py-3 bg-white/20 border-2 border-white/40 rounded-lg text-white font-semibold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <motion.button
                    onClick={handleSaveProfile}
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(249, 115, 22, 0.6)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-6 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white font-black text-2xl rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-[0_15px_50px_rgba(249,115,22,0.5)] border-4 border-yellow-400 cursor-pointer"
                    style={{ 
                      minHeight: '70px',
                      zIndex: 100,
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl">💾</span>
                      <span className="tracking-wide">SAVE PROFILE</span>
                      <span className="text-2xl">✓</span>
                    </div>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Name</span>
                    <span className="text-white font-semibold">{profileData.name || user?.name || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Phone</span>
                    <span className="text-white font-semibold">{profileData.phone || user?.phone || '+254 700 000 000'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email</span>
                    <span className="text-white font-semibold">{profileData.email || user?.email || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isOnline ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </div>
                  {profileData.vehicleType && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Vehicle</span>
                      <span className="text-white font-semibold">{profileData.vehicleType} - {profileData.vehiclePlate}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Location</span>
                    <span className="text-white font-semibold">Westlands, Nairobi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Performance</span>
                    <span className="text-white font-semibold">⭐ {performance.rating}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
