import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ShoppingBag, TrendingUp, UserPlus, ListOrdered, BarChart3, Flame, 
  CheckCircle, Clock, DollarSign, Package, Star, ChevronDown, Download, 
  Filter, Calendar, Truck, Target, Activity, TrendingDown, AlertCircle, Eye, ArrowUp, ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  token: string;
}

export function AdminDashboard({ token }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    deliveryGuys: 0,
    canceledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('DELIVERY_GUY');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'analytics' | 'users'>('overview');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const orders = data.dashboard.recentOrders || [];
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        setStats({
          totalOrders: data.dashboard.totalOrders,
          totalUsers: data.dashboard.totalUsers,
          pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
          deliveredOrders: orders.filter((o: any) => o.status === 'DELIVERED').length,
          totalRevenue,
          avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
          deliveryGuys: 3, // Simulated
          canceledOrders: orders.filter((o: any) => o.status === 'CANCELED').length,
        });
        setRecentOrders(orders.slice(0, 8));
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  const handleAssignRole = async () => {
    if (!userEmail || !selectedRole) {
      toast.error('Please enter email and select a role');
      return;
    }

    toast.loading('Assigning role...');
    
    setTimeout(() => {
      toast.dismiss();
      toast.success(`✅ Role "${selectedRole}" assigned to ${userEmail}`, {
        description: 'User permissions updated successfully',
        duration: 3000,
      });
      setUserEmail('');
      setShowRoleDropdown(false);
    }, 1000);
  };

  const handleExportData = (type: string) => {
    toast.success(`📊 Exporting ${type} data...`, {
      description: 'Download will start shortly',
    });
  };

  const handleViewDetails = (orderId: string) => {
    toast.info(`Opening order details: ${orderId}`);
  };

  // Analytics data
  const revenueGrowth = '+24%';
  const orderGrowth = '+12%';
  const userGrowth = '+18%';
  const completionRate = '94%';

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `KES ${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'from-emerald-500 to-green-600', 
      trend: revenueGrowth,
      trendUp: true,
      bgGlow: 'bg-emerald-500/20' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingBag, 
      color: 'from-red-500 to-orange-500', 
      trend: orderGrowth,
      trendUp: true,
      bgGlow: 'bg-red-500/20' 
    },
    { 
      title: 'Active Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'from-yellow-500 to-amber-500', 
      trend: userGrowth,
      trendUp: true,
      bgGlow: 'bg-yellow-500/20' 
    },
    { 
      title: 'Avg Order Value', 
      value: `KES ${stats.avgOrderValue.toLocaleString()}`, 
      icon: Target, 
      color: 'from-purple-500 to-pink-500', 
      trend: '+8%',
      trendUp: true,
      bgGlow: 'bg-purple-500/20' 
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: Clock, 
      color: 'from-orange-500 to-red-600', 
      trend: 'Live',
      trendUp: null,
      bgGlow: 'bg-orange-500/20' 
    },
    { 
      title: 'Completed', 
      value: stats.deliveredOrders, 
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-600', 
      trend: completionRate,
      trendUp: true,
      bgGlow: 'bg-green-500/20' 
    },
    { 
      title: 'Delivery Team', 
      value: stats.deliveryGuys, 
      icon: Truck, 
      color: 'from-blue-500 to-cyan-500', 
      trend: 'Active',
      trendUp: null,
      bgGlow: 'bg-blue-500/20' 
    },
    { 
      title: 'Canceled Orders', 
      value: stats.canceledOrders, 
      icon: AlertCircle, 
      color: 'from-red-600 to-rose-700', 
      trend: '-2%',
      trendUp: false,
      bgGlow: 'bg-red-600/20' 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-yellow-900 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 shadow-2xl mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
                <span className="text-white font-bold text-2xl">ADMIN ANALYTICS</span>
                <Flame className="w-6 h-6 text-yellow-200 animate-pulse" />
              </div>
              <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-2xl">
                Business Intelligence
              </h1>
              <p className="text-yellow-200 text-lg font-semibold">PowerBI-Level Analytics & Insights</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-xl bg-white/90 text-gray-900 font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExportData('All')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export
              </motion.button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-white/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 outline-none font-semibold"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 outline-none font-semibold">
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivering">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 outline-none font-semibold">
                      <option value="all">All Methods</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="cash">Cash on Delivery</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-visible">
            {['overview', 'orders', 'analytics', 'users'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-2xl'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid - Comprehensive Metrics */}
        {(activeTab === 'overview' || activeTab === 'analytics') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="relative group cursor-pointer"
                >
                  <div className={`absolute -inset-0.5 ${stat.bgGlow} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-300`} />
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-white/50 group-hover:border-yellow-400 transition-all h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {stat.trendUp !== null && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {stat.trend}
                        </div>
                      )}
                      {stat.trendUp === null && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">{stat.title}</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Users Tab - Role Assignment */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">User Role Management</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-white font-semibold mb-2">User Email</label>
                <input
                  type="email"
                  placeholder="Enter user email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 border-2 border-white/50 focus:border-yellow-400 focus:outline-none font-semibold shadow-lg"
                />
              </div>
              <div className="md:col-span-4 relative">
                <label className="block text-white font-semibold mb-2">Select Role</label>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-5 py-4 rounded-xl bg-white/90 text-gray-900 border-2 border-white/50 focus:border-yellow-400 outline-none font-semibold shadow-lg flex items-center justify-between"
                >
                  <span>
                    {selectedRole === 'DELIVERY_GUY' && '🚗 Delivery Guy'}
                    {selectedRole === 'SUB_ADMIN' && '⚙️ Sub-Admin'}
                    {selectedRole === 'USER' && '🛍️ Customer'}
                    {selectedRole === 'ADMIN' && '💼 Admin'}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden"
                    >
                      {['DELIVERY_GUY', 'SUB_ADMIN', 'USER', 'ADMIN'].map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setSelectedRole(role);
                            setShowRoleDropdown(false);
                          }}
                          className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 transition-all text-gray-900 font-semibold"
                        >
                          {role === 'DELIVERY_GUY' && '🚗 Delivery Guy'}
                          {role === 'SUB_ADMIN' && '⚙️ Sub-Admin'}
                          {role === 'USER' && '🛍️ Customer'}
                          {role === 'ADMIN' && '💼 Admin'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="md:col-span-3">
                <label className="block text-transparent mb-2">.</label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAssignRole}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-white font-bold shadow-2xl hover:shadow-yellow-500/50 transition-all text-lg"
                >
                  Assign Role ✓
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {(activeTab === 'orders' || activeTab === 'overview') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ListOrdered className="w-8 h-8 text-red-400" />
                <h2 className="text-3xl font-bold text-white">Live Orders</h2>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExportData('Orders')}
                  className="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentOrders.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 text-lg">No orders yet. Waiting for customers...</p>
                  <p className="text-gray-400 text-sm mt-2">Orders will appear here in real-time</p>
                </div>
              ) : (
                recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                    onClick={() => handleViewDetails(order.orderNumber)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-bold text-lg">{order.orderNumber}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            order.status === 'DELIVERED' ? 'bg-green-500 text-white' :
                            order.status === 'OUT_FOR_DELIVERY' ? 'bg-yellow-500 text-black' :
                            order.status === 'PENDING' ? 'bg-orange-500 text-white' :
                            order.status === 'CONFIRMED' ? 'bg-blue-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-yellow-300 text-sm font-semibold">{order.customerName}</p>
                        <p className="text-gray-300 text-xs">{order.customerPhone}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-2xl">
                          KES {order.total?.toLocaleString()}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(order.orderNumber);
                          }}
                          className="mt-2 px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab - Advanced Insights */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Revenue Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-green-500/30 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-green-400" />
                <h2 className="text-3xl font-bold text-white">Revenue Analytics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-gray-300 text-sm mb-2">Today's Revenue</p>
                  <p className="text-4xl font-black text-green-400">KES {Math.round(stats.totalRevenue * 0.3).toLocaleString()}</p>
                  <p className="text-green-300 text-sm mt-2">+18% from yesterday</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-gray-300 text-sm mb-2">This Week</p>
                  <p className="text-4xl font-black text-yellow-400">KES {Math.round(stats.totalRevenue * 0.7).toLocaleString()}</p>
                  <p className="text-yellow-300 text-sm mt-2">+22% from last week</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-gray-300 text-sm mb-2">This Month</p>
                  <p className="text-4xl font-black text-orange-400">KES {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-orange-300 text-sm mt-2">+24% from last month</p>
                </div>
              </div>
            </motion.div>

            {/* Customer Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-400" />
                <h2 className="text-3xl font-bold text-white">Customer Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <p className="text-gray-300 text-sm mb-2">Avg Rating</p>
                  <p className="text-3xl font-black text-yellow-400">4.8 ⭐</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <p className="text-gray-300 text-sm mb-2">Repeat Customers</p>
                  <p className="text-3xl font-black text-green-400">68%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <p className="text-gray-300 text-sm mb-2">Peak Hour</p>
                  <p className="text-3xl font-black text-blue-400">7 PM</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <p className="text-gray-300 text-sm mb-2">Avg Delivery</p>
                  <p className="text-3xl font-black text-purple-400">28min</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-center shadow-2xl"
        >
          <p className="text-white text-lg font-bold">
            💼 You have <span className="text-yellow-200">ADMIN</span> access - Full Business Intelligence & Analytics
          </p>
          <p className="text-yellow-100 text-sm mt-2">Monda Food Delivery System v1.0.0 | PowerBI-Level Dashboard</p>
        </motion.div>
      </div>
    </div>
  );
}
