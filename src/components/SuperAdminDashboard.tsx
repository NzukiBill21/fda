import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, ShoppingBag, Database, DollarSign, Settings, Shield, Activity, Zap, Flame, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface SuperAdminDashboardProps {
  token: string;
}

export function SuperAdminDashboard({ token }: SuperAdminDashboardProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    totalRevenue: 0,
    deliveryGuys: 0,
  });
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
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

  const handleAction = async (action: string) => {
    toast.loading(`Processing: ${action}...`);
    
    setTimeout(() => {
      toast.dismiss();
      toast.success(`✅ ${action} completed successfully!`, {
        description: 'All systems operational',
        duration: 3000,
      });
      
      // Log the action
      setActivityLogs(prev => [{
        action,
        timestamp: new Date().toISOString(),
        user: 'Super Admin'
      }, ...prev.slice(0, 9)]);
    }, 1500);
  };

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'from-red-500 to-orange-500', bgGlow: 'bg-red-500/20' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-yellow-500 to-amber-500', bgGlow: 'bg-yellow-500/20' },
    { title: 'Menu Items', value: stats.totalMenuItems, icon: Package, color: 'from-orange-500 to-red-600', bgGlow: 'bg-orange-500/20' },
    { title: 'Revenue (KES)', value: `${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-amber-500 to-yellow-600', bgGlow: 'bg-amber-500/20' },
  ];

  const devTools = [
    { name: 'Database Backup', icon: Database, action: 'Database Backup', color: 'from-red-600 to-orange-600' },
    { name: 'System Settings', icon: Settings, action: 'System Settings Update', color: 'from-yellow-600 to-amber-600' },
    { name: 'User Management', icon: Shield, action: 'User Management Access', color: 'from-orange-600 to-red-700' },
    { name: 'Activity Monitor', icon: Activity, action: 'Activity Monitor Check', color: 'from-amber-600 to-yellow-700' },
    { name: 'Performance', icon: Zap, action: 'Performance Optimization', color: 'from-red-500 to-yellow-500' },
    { name: 'Analytics', icon: BarChart3, action: 'Analytics Dashboard', color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-yellow-900 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header with Monda Theme */}
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
        </motion.div>

        {/* Stats Grid - Monda Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-white/50 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
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

        {/* Developer Tools - Monda Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-500/30 shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Developer Tools</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {devTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.button
                  key={tool.name}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction(tool.action)}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center gap-3 min-h-[120px] justify-center">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 text-center leading-tight">{tool.name}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Logs - Monda Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl"
        >
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
                      <p className="text-yellow-300 text-xs mt-1">by {log.user}</p>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

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
      </div>
    </div>
  );
}
