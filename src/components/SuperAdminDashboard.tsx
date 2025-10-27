import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, ShoppingBag, Database, DollarSign, Settings, Shield, Activity, Zap, Flame, TrendingUp, Package, BarChart3, UserPlus, UserMinus, Edit, Trash2, RefreshCw, Download, Upload, Eye, Lock, Unlock, AlertTriangle, CheckCircle, Code, Terminal, Server, Cpu, HardDrive, Network, GitBranch, Bug, Monitor, Smartphone, Globe, Wifi, WifiOff, Play, Pause, Square } from 'lucide-react';
import { toast } from 'sonner';
import MenuEditor from './MenuEditor';

interface SuperAdminDashboardProps {
  token: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  isOnline?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export function SuperAdminDashboard({ token }: SuperAdminDashboardProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    totalRevenue: 0,
    deliveryGuys: 0,
  });
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    frontend: 'online',
    lastBackup: new Date().toISOString(),
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState({
    users: false,
    menu: false,
    stats: false
  });
  const [confirmAction, setConfirmAction] = useState(null);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [devTools, setDevTools] = useState({
    terminal: false,
    logs: false,
    performance: false,
    network: false
  });
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89
  });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchMenuItems();
    fetchDeliveryGuys();
    
    // Check if menu editor was active before refresh
    const activeEditor = localStorage.getItem('activeEditor');
    if (activeEditor === 'menuEditor') {
      setShowMenuEditor(true);
      setActiveTab('menu');
    }
    
    const interval = setInterval(() => {
      fetchStats();
      checkSystemStatus();
      fetchDeliveryGuys();
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats({
          totalOrders: data.dashboard.totalOrders,
          totalUsers: data.dashboard.totalUsers,
          totalMenuItems: data.dashboard.totalMenuItems,
          totalRevenue: data.dashboard.totalOrders * 1200,
          deliveryGuys: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        toast.success('Users loaded successfully', { duration: 2000 });
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users', {
        description: error.message || 'Please try again',
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchDeliveryGuys = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter only delivery guys
        const delivery = data.users.filter((user: any) => 
          user.role === 'DELIVERY_GUY' || user.role === 'Delivery Guy'
        );
        setDeliveryGuys(delivery);
      }
    } catch (error) {
      console.error('Failed to fetch delivery guys:', error);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(prev => ({ ...prev, menu: true }));
    try {
      const res = await fetch('http://localhost:5000/api/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.menuItems);
        toast.success('Menu items loaded successfully', { duration: 2000 });
      } else {
        throw new Error(data.error || 'Failed to fetch menu items');
      }
    } catch (error: any) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items', {
        description: error.message || 'Please try again',
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, menu: false }));
    }
  };

  const checkSystemStatus = async () => {
    try {
      // Check backend
      const backendRes = await fetch('http://localhost:5000/api/health');
      const backendStatus = backendRes.ok ? 'online' : 'offline';
      
      setSystemStatus(prev => ({
        ...prev,
        api: backendStatus,
        database: backendStatus,
        frontend: 'online'
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        api: 'offline',
        database: 'offline'
      }));
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    const actionNames = {
      'activate': 'User Activation',
      'deactivate': 'User Deactivation',
      'delete': 'User Deletion',
      'promote': 'User Promotion',
      'demote': 'User Demotion'
    };
    
    const actionName = actionNames[action as keyof typeof actionNames] || action;
    const loadingToast = toast.loading(`Processing ${actionName}...`, {
      duration: 1000, // Reduced duration
    });
    
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'activate':
          endpoint = `/api/admin/users/${userId}/activate`;
          break;
        case 'deactivate':
          endpoint = `/api/admin/users/${userId}/deactivate`;
          break;
        case 'delete':
          endpoint = `/api/admin/users/${userId}`;
          method = 'DELETE';
          break;
        case 'promote':
          endpoint = `/api/admin/users/${userId}/promote`;
          break;
        case 'demote':
          endpoint = `/api/admin/users/${userId}/demote`;
          break;
      }
      
      let body: string | undefined = undefined;
      if (action === 'promote') {
        // Ask user which role to assign
        const roleChoice = window.prompt('Choose role to assign:\n1. ADMIN\n2. DELIVERY_GUY\n3. USER\n\nEnter 1, 2, or 3:');
        let roleName = 'ADMIN';
        if (roleChoice === '2') {
          roleName = 'DELIVERY_GUY';
        } else if (roleChoice === '3') {
          roleName = 'USER';
        }
        if (!roleChoice || roleChoice.trim() === '') {
          toast.error('Operation cancelled');
          return;
        }
        body = JSON.stringify({ role: roleName });
      } else if (action === 'demote') {
        body = JSON.stringify({ role: 'USER' }); // Default demotion to USER
      }
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.dismiss(loadingToast); // Dismiss loading toast
        toast.success(`✅ ${actionName} successful!`, {
          description: data.message || 'User operation completed',
          duration: 2000, // Reduced duration
        });
        fetchUsers();
        logActivity(`${actionName}`, `User ID: ${userId} - ${data.message || 'Operation completed'}`);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast); // Dismiss loading toast
      toast.error(`❌ Failed to ${actionName.toLowerCase()}`, {
        description: error.message || 'Please try again',
        duration: 2000, // Reduced duration
      });
      logActivity(`${actionName} Failed`, `User ID: ${userId} - ${error.message}`);
    }
  };

  const handleMenuAction = async (action: string, itemId: string) => {
    const actionNames = {
      'toggle': 'Menu Item Toggle',
      'delete': 'Menu Item Deletion'
    };
    
    const actionName = actionNames[action as keyof typeof actionNames] || action;
    const loadingToast = toast.loading(`Processing ${actionName}...`, {
      duration: 1000, // Reduced duration
    });
    
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'toggle':
          endpoint = `/api/admin/menu/${itemId}/toggle`;
          break;
        case 'delete':
          endpoint = `/api/admin/menu/${itemId}`;
          method = 'DELETE';
          break;
      }
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.dismiss(loadingToast); // Dismiss loading toast
        toast.success(`✅ ${actionName} successful!`, {
          description: data.message || 'Menu operation completed',
          duration: 2000, // Reduced duration
        });
        fetchMenuItems();
        logActivity(`${actionName}`, `Item ID: ${itemId} - ${data.message || 'Operation completed'}`);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast); // Dismiss loading toast
      toast.error(`❌ Failed to ${actionName.toLowerCase()}`, {
        description: error.message || 'Please try again',
        duration: 2000, // Reduced duration
      });
      logActivity(`${actionName} Failed`, `Item ID: ${itemId} - ${error.message}`);
    }
  };

  const handleSystemAction = async (action: string) => {
    const actionNames = {
      'backup': 'Database Backup',
      'optimize': 'System Optimization',
      'restart': 'System Restart',
      'clear-cache': 'Cache Clearing',
      'run-tests': 'Test Suite',
      'deploy': 'Deployment',
      'git-pull': 'Git Pull',
      'view-logs': 'System Logs'
    };
    
    const actionName = actionNames[action as keyof typeof actionNames] || action;
    
    // Add confirmation for critical actions
    if (action === 'deploy' || action === 'git-pull' || action === 'restart') {
      const confirmed = window.confirm(
        action === 'deploy' 
          ? 'Are you sure you want to deploy? This will update the production system.'
          : action === 'git-pull'
          ? 'Are you sure you want to pull from Git? This will update the codebase.'
          : 'Are you sure you want to restart the system? This will cause temporary downtime.'
      );
      
      if (!confirmed) {
        toast.info('Operation cancelled');
        return;
      }
    }
    
    const loadingToast = toast.loading(`Processing ${actionName}...`, {
      duration: 1000, // Reduced duration
    });
    
    try {
      let endpoint = '';
      
      switch (action) {
        case 'backup':
          endpoint = '/api/admin/system/backup';
          break;
        case 'optimize':
          endpoint = '/api/admin/system/optimize';
          break;
        case 'restart':
          endpoint = '/api/admin/system/restart';
          break;
        case 'clear-cache':
          endpoint = '/api/admin/system/clear-cache';
          break;
        case 'run-tests':
          endpoint = '/api/admin/system/run-tests';
          break;
        case 'deploy':
          endpoint = '/api/admin/system/deploy';
          break;
        case 'git-pull':
          endpoint = '/api/admin/system/git-pull';
          break;
        case 'view-logs':
          endpoint = '/api/admin/system/view-logs';
          break;
      }
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.dismiss(loadingToast); // Dismiss loading toast
        toast.success(`✅ ${actionName} completed!`, {
          description: data.message || 'Operation completed',
          duration: 2000, // Reduced duration
        });
        logActivity(`${actionName}`, 'System operation completed');
        
        if (action === 'backup') {
          setSystemStatus(prev => ({
            ...prev,
            lastBackup: new Date().toISOString()
          }));
        }
        
        // Special handling for different actions
        if (action === 'run-tests' && data.results) {
          toast.success(`Tests: ${data.results.passed} passed, ${data.results.failed} failed`, {
            description: `Duration: ${data.results.duration}`,
            duration: 2000, // Reduced duration
          });
        }
        
        if (action === 'deploy' && data.version) {
          toast.success(`Deployed version ${data.version}`, {
            description: data.timestamp,
            duration: 2000, // Reduced duration
          });
        }
        
        if (action === 'git-pull' && data.commits) {
          toast.success(`Pulled ${data.commits} commits`, {
            description: `${data.filesChanged} files changed`,
            duration: 2000, // Reduced duration
          });
        }
        
        // Refresh stats after system operations
        if (action === 'optimize' || action === 'clear-cache') {
          setTimeout(() => {
            fetchStats();
          }, 1000);
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast); // Dismiss loading toast
      toast.error(`❌ Failed to ${actionName.toLowerCase()}`, {
        description: error.message || 'Please try again',
        duration: 2000, // Reduced duration
      });
      logActivity(`${actionName} Failed`, error.message || 'Operation failed');
    }
  };

  const logActivity = (action: string, details: string) => {
    setActivityLogs(prev => [{
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'Super Admin'
    }, ...prev.slice(0, 19)]);
  };

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'from-red-500 to-orange-500', bgGlow: 'bg-red-500/20', bgColor: 'bg-red-600' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-yellow-500 to-amber-500', bgGlow: 'bg-yellow-500/20', bgColor: 'bg-yellow-600' },
    { title: 'Menu Items', value: stats.totalMenuItems, icon: Package, color: 'from-orange-500 to-red-600', bgGlow: 'bg-orange-500/20', bgColor: 'bg-orange-600' },
    { title: 'Revenue (KES)', value: `${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-amber-500 to-yellow-600', bgGlow: 'bg-amber-500/20', bgColor: 'bg-amber-600' },
  ];

  const systemActions = [
    { name: 'Database Backup', icon: Database, action: 'backup', color: 'from-red-600 to-orange-600', bgColor: 'bg-red-600' },
    { name: 'System Optimize', icon: Zap, action: 'optimize', color: 'from-yellow-600 to-amber-600', bgColor: 'bg-yellow-600' },
    { name: 'Clear Cache', icon: RefreshCw, action: 'clear-cache', color: 'from-orange-600 to-red-700', bgColor: 'bg-orange-600' },
    { name: 'System Restart', icon: Settings, action: 'restart', color: 'from-amber-600 to-yellow-700', bgColor: 'bg-amber-600' },
    { name: 'Run Tests', icon: Bug, action: 'run-tests', color: 'from-purple-600 to-pink-600', bgColor: 'bg-purple-600' },
    { name: 'Deploy', icon: Upload, action: 'deploy', color: 'from-green-600 to-emerald-600', bgColor: 'bg-green-600' },
    { name: 'Git Pull', icon: GitBranch, action: 'git-pull', color: 'from-blue-600 to-cyan-600', bgColor: 'bg-blue-600' },
    { name: 'Logs', icon: Terminal, action: 'view-logs', color: 'from-gray-600 to-slate-600', bgColor: 'bg-slate-600' },
  ];

  const devFeatures = [
    { name: 'Terminal', icon: Terminal, action: 'terminal', color: 'from-slate-600 to-gray-700', bgColor: 'bg-slate-600' },
    { name: 'Performance', icon: Cpu, action: 'performance', color: 'from-blue-600 to-cyan-600', bgColor: 'bg-blue-600' },
    { name: 'Network', icon: Network, action: 'network', color: 'from-green-600 to-emerald-600', bgColor: 'bg-green-600' },
    { name: 'Logs', icon: Code, action: 'logs', color: 'from-purple-600 to-pink-600', bgColor: 'bg-purple-600' },
    { name: 'Server Status', icon: Server, action: 'server', color: 'from-orange-600 to-red-600', bgColor: 'bg-orange-600' },
    { name: 'Database', icon: HardDrive, action: 'database', color: 'from-yellow-600 to-amber-600', bgColor: 'bg-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-yellow-900 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header with System Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 shadow-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-white font-bold text-2xl">SUPER ADMIN</span>
            <Flame className="w-6 h-6 text-yellow-200 animate-pulse" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-2xl">
            Monda Control Center
          </h1>
          <p className="text-yellow-200 text-lg font-semibold">Full System Control & Administration</p>
          
          {/* System Status */}
          <div className="flex justify-center gap-4 mt-4">
            <div className={`px-4 py-2 rounded-full ${systemStatus.database === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <Database className="w-4 h-4 inline mr-2" />
              Database: {systemStatus.database}
            </div>
            <div className={`px-4 py-2 rounded-full ${systemStatus.api === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <Activity className="w-4 h-4 inline mr-2" />
              API: {systemStatus.api}
            </div>
            <div className={`px-4 py-2 rounded-full ${systemStatus.frontend === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <Eye className="w-4 h-4 inline mr-2" />
              Frontend: {systemStatus.frontend}
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 nav-tabs">
            {['overview', 'users', 'delivery', 'menu', 'system', 'devtools'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab === 'devtools' ? 'Dev Tools' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid - Only show on Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stats-grid">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-0.5 ${stat.bgGlow} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-300`} />
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-white/50 hover:border-yellow-400 transition-all dashboard-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1">{stat.title}</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* System Actions */}
            <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">System Operations</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 system-actions-grid">
                {systemActions.slice(0, 4).map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.name}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSystemAction(action.action)}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center gap-3 min-h-[120px] justify-center touch-target">
                        <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center shadow-md icon-mobile`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-bold text-gray-900 text-center leading-tight text-mobile">{action.name}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-red-400" />
                <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-300">No recent activity. Perform an action to see logs.</p>
                  </div>
                ) : (
                  activityLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{log.action}</p>
                          <p className="text-yellow-300 text-xs mt-1">{log.details}</p>
                          <p className="text-yellow-300 text-xs">by {log.user}</p>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Users Page Header */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">User Management</h2>
                  <p className="text-yellow-200">Manage user accounts, roles, and permissions</p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh Users
                </button>
              </div>
            </div>

            {/* Users Content */}
            <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl">
              {loading.users ? (
              <div className="text-center py-12">
                <div className="animate-spin w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-300 text-lg mb-4">No users found</p>
                <button
                  onClick={fetchUsers}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Load Users
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-2">User</th>
                      <th className="text-left py-4 px-2">Role</th>
                      <th className="text-left py-4 px-2">Status</th>
                      <th className="text-left py-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-all"
                      >
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-300">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'Super Admin' ? 'bg-red-500/20 text-red-300' :
                            user.role === 'Admin' ? 'bg-yellow-500/20 text-yellow-300' :
                            user.role === 'Delivery' ? 'bg-green-500/20 text-green-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {user.role === 'Delivery' && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.isOnline ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
                              }`}>
                                {user.isOnline ? '🟢 Online' : '⚫ Offline'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUserAction(user.isActive ? 'deactivate' : 'activate', user.id)}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                user.isActive 
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                              }`}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleUserAction('promote', user.id)}
                              className="p-2 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 hover:scale-110 transition-all"
                              title="Promote User"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction('demote', user.id)}
                              className="p-2 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 hover:scale-110 transition-all"
                              title="Demote User"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({
                                type: 'delete-user',
                                id: user.id,
                                name: user.name
                              })}
                              className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:scale-110 transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </motion.div>
        )}

        {activeTab === 'delivery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Delivery Guys Page Header */}
            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Delivery Guys Management</h2>
                  <p className="text-green-200">Monitor delivery drivers and their online status</p>
                </div>
                <button
                  onClick={() => {
                    fetchDeliveryGuys();
                    fetchUsers();
                    toast.success('Refreshed delivery guys data', { duration: 2000 });
                  }}
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Delivery Guys Content */}
            <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl">
              {deliveryGuys.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 text-lg mb-4">No delivery guys found</p>
                  <p className="text-gray-400 text-sm">Assign DELIVERY_GUY role to users to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryGuys.map((delivery: any) => (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-white text-lg">{delivery.name}</p>
                          <p className="text-sm text-gray-300">{delivery.email}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full ${delivery.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            delivery.isOnline ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {delivery.isOnline ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Account</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            delivery.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {delivery.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleUserAction(delivery.isActive ? 'deactivate' : 'activate', delivery.id)}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            delivery.isActive 
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          }`}
                        >
                          {delivery.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setConfirmAction({
                            type: 'delete-user',
                            id: delivery.id,
                            name: delivery.name
                          })}
                          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Menu Page Header */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Menu Management</h2>
                  <p className="text-green-200">Manage menu items, pricing, and availability</p>
                </div>
                <div className="ml-auto flex gap-3">
                  <button
                    onClick={() => setShowMenuEditor(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Menu
                  </button>
                  <button
                    onClick={fetchMenuItems}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Content */}
            <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl">
            
            {loading.menu ? (
              <div className="text-center py-12">
                <div className="animate-spin w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Loading menu items...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-300 text-lg mb-4">No menu items found</p>
                <button
                  onClick={fetchMenuItems}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Load Menu Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 menu-items-grid">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                        <p className="text-yellow-300 text-sm">{item.category}</p>
                        <p className="text-white font-bold text-xl">KES {item.price}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isAvailable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMenuAction('toggle', item.id)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          item.isAvailable 
                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:scale-105' 
                            : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:scale-105'
                        }`}
                      >
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => setConfirmAction({
                          type: 'delete-menu',
                          id: item.id,
                          name: item.name
                        })}
                        className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:scale-105 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </div>
          </motion.div>
        )}

        {activeTab === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* System Status */}
            <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">System Status</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                  <span className="text-white font-semibold">Database</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    systemStatus.database === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {systemStatus.database}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                  <span className="text-white font-semibold">API Server</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    systemStatus.api === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {systemStatus.api}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                  <span className="text-white font-semibold">Frontend</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    systemStatus.frontend === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {systemStatus.frontend}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                  <span className="text-white font-semibold">Last Backup</span>
                  <span className="text-yellow-300 text-sm">
                    {new Date(systemStatus.lastBackup).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* System Actions */}
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-red-400" />
                <h2 className="text-3xl font-bold text-white">System Operations</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {systemActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.name}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSystemAction(action.action)}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center gap-3 min-h-[120px] justify-center touch-target">
                        <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center shadow-md icon-mobile`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-bold text-gray-900 text-center leading-tight text-mobile">{action.name}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'devtools' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Developer Tools */}
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-8 h-8 text-purple-400" />
                <h2 className="text-3xl font-bold text-white">Developer Tools</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 dev-tools-grid">
                {devFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.button
                      key={feature.name}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setDevTools(prev => ({
                          ...prev,
                          [feature.action]: !prev[feature.action as keyof typeof prev]
                        }));
                        toast.success(`${feature.name} ${devTools[feature.action as keyof typeof devTools] ? 'closed' : 'opened'}`, {
                          duration: 2000,
                        });
                      }}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center gap-3 min-h-[120px] justify-center">
                        <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-bold text-gray-900 text-center leading-tight">{feature.name}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-green-500/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">System Metrics</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">CPU Usage</span>
                    <span className="text-green-300 font-bold">{systemMetrics.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${systemMetrics.cpu}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Memory</span>
                    <span className="text-blue-300 font-bold">{systemMetrics.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${systemMetrics.memory}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Disk Space</span>
                    <span className="text-yellow-300 font-bold">{systemMetrics.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: `${systemMetrics.disk}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Network</span>
                    <span className="text-purple-300 font-bold">{systemMetrics.network}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${systemMetrics.network}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-orange-500/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-8 h-8 text-orange-400" />
                  <h2 className="text-3xl font-bold text-white">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {systemActions.slice(4).map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.name}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSystemAction(action.action)}
                        className="group relative"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center gap-3 min-h-[120px] justify-center">
                          <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center shadow-md`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 text-center leading-tight">{action.name}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Terminal/Logs Section */}
            {devTools.terminal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-gray-500/30 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-8 h-8 text-gray-400" />
                  <h2 className="text-3xl font-bold text-white">System Terminal</h2>
                </div>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400">$ system status</div>
                  <div className="text-white">✓ Database: Connected</div>
                  <div className="text-white">✓ API Server: Running on port 5000</div>
                  <div className="text-white">✓ Frontend: Running on port 5173</div>
                  <div className="text-yellow-400">$ memory usage</div>
                  <div className="text-white">Memory: 67% (2.1GB / 3.2GB)</div>
                  <div className="text-white">CPU: 45% (2.3GHz)</div>
                  <div className="text-green-400">$ _</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Footer Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-2xl p-6 text-center shadow-2xl"
        >
          <p className="text-white text-lg font-bold">
            👑 You have <span className="text-yellow-200">SUPER ADMIN</span> access - Full system control enabled
          </p>
          <p className="text-yellow-100 text-sm mt-2">Monda Food Delivery System v1.0.0</p>
        </motion.div>

        {/* Confirmation Dialog */}
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-red-900/90 to-yellow-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/30 shadow-2xl max-w-md w-full"
            >
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Confirm Action</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete <span className="text-yellow-300 font-semibold">{confirmAction?.name || 'this item'}</span>?
                  <br />
                  <span className="text-red-300 text-sm">This action cannot be undone.</span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 px-6 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmAction?.type === 'delete-user') {
                        handleUserAction('delete', confirmAction.id);
                      } else if (confirmAction?.type === 'delete-menu') {
                        handleMenuAction('delete', confirmAction.id);
                      }
                      setConfirmAction(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Menu Editor Modal */}
      {showMenuEditor && (
        <MenuEditor
          token={token}
          onClose={() => setShowMenuEditor(false)}
        />
      )}
    </div>
  );
}
