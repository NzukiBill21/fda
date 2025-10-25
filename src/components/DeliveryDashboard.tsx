import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, CheckCircle, Clock, Navigation, Phone, MessageSquare, Star, Zap, Target, TrendingUp, DollarSign, Timer, AlertCircle, Wifi, WifiOff, Battery, Signal, Route, Car, Bike, User, Bell, Settings, RefreshCw, Eye, PhoneCall, Map, Compass, Wind, Sun, Moon, MapPin as Gps } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryDashboardProps {
  token: string;
  user: any;
}

export function DeliveryDashboard({ token, user }: DeliveryDashboardProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [performance, setPerformance] = useState({ rating: 4.8, completed: 0, onTime: 0 });
  const [weather, setWeather] = useState({ temp: 28, condition: 'sunny', wind: 12 });
  const [battery, setBattery] = useState(85);
  const [signal, setSignal] = useState(4);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState([
    { name: 'Call Customer', icon: Phone, color: 'bg-green-500' },
    { name: 'Navigate', icon: Map, color: 'bg-blue-500' },
    { name: 'Mark Delivered', icon: CheckCircle, color: 'bg-emerald-500' },
    { name: 'Report Issue', icon: AlertCircle, color: 'bg-red-500' }
  ]);

  useEffect(() => {
    fetchAssignments();
    fetchEarnings();
    fetchPerformance();
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Handle geolocation errors gracefully
          if (error.code === 1) {
            // User denied permission
            console.log('Location permission denied - using default location');
            setLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
          } else {
            console.error('Location error:', error);
            setLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
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
    }

    // Set up periodic updates
    const interval = setInterval(() => {
      fetchAssignments();
      fetchEarnings();
      fetchPerformance();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

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

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    try {
      const res = await fetch('http://localhost:5000/api/delivery/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus ? 'online' : 'offline',
          latitude: location.lat,
          longitude: location.lng
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(newStatus);
        toast.success(newStatus ? '🚗 You are now ONLINE!' : '🛑 You are now OFFLINE');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 pt-16 pb-20 px-2">
      {/* Mobile Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
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
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-t border-white/10">
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
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:text-white'
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
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
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
                    <p className="text-gray-300 text-sm">Westlands, Nairobi</p>
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
                  return (
                    <button
                      key={action.name}
                      className={`${action.color} rounded-xl p-4 text-white font-semibold transition-all hover:scale-105`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">{action.name}</p>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-white font-bold text-xl mb-4">Your Deliveries</h2>

              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No deliveries assigned</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {isOnline ? 'Waiting for new orders...' : 'Go online to receive deliveries'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((order: any) => (
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
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-600 hover:to-teal-600 transition-all"
                          >
                            Accept Delivery
                          </button>
                        )}
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <>
                            <button
                              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                              className="flex-1 px-3 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
                            >
                              <Map className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                            >
                              Mark Delivered
                            </button>
                          </>
                        )}
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
          <div className="space-y-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-white font-bold text-xl">{user?.name}</h2>
                <p className="text-gray-300">Delivery Driver</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Phone</span>
                  <span className="text-white">{user?.phone || '+254 700 000 000'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Location</span>
                  <span className="text-white">Westlands, Nairobi</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}


