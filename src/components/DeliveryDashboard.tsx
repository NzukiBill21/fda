import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, CheckCircle, Clock, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryDashboardProps {
  token: string;
  user: any;
}

export function DeliveryDashboard({ token, user }: DeliveryDashboardProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    fetchAssignments();
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
          console.error('Location error:', error);
          toast.error('Could not get your location');
        }
      );
    }
  }, [token]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-10 h-10 text-green-400" />
            Delivery Dashboard
          </h1>
          <p className="text-gray-300">Welcome, {user?.name}! Ready to deliver?</p>
        </motion.div>

        {/* Online/Offline Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Status</h2>
              <p className="text-gray-300">
                {isOnline ? '🟢 You are ONLINE and accepting deliveries' : '🔴 You are OFFLINE'}
              </p>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                isOnline
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20"
          >
            <div className="flex items-center gap-4">
              <Package className="w-12 h-12 text-yellow-400" />
              <div>
                <p className="text-gray-300 mb-1">Pending</p>
                <p className="text-4xl font-bold text-white">
                  {assignments.filter((a) => a.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20"
          >
            <div className="flex items-center gap-4">
              <Navigation className="w-12 h-12 text-blue-400" />
              <div>
                <p className="text-gray-300 mb-1">In Progress</p>
                <p className="text-4xl font-bold text-white">
                  {assignments.filter((a) => a.status === 'OUT_FOR_DELIVERY').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20"
          >
            <div className="flex items-center gap-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <div>
                <p className="text-gray-300 mb-1">Completed Today</p>
                <p className="text-4xl font-bold text-white">
                  {assignments.filter((a) => a.status === 'DELIVERED').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Deliveries</h2>

          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No deliveries assigned yet</p>
              <p className="text-gray-400 text-sm mt-2">
                {isOnline ? 'Waiting for new orders...' : 'Go online to receive deliveries'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white/10 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-bold text-xl">{order.orderNumber}</p>
                      <p className="text-gray-300">{order.customerName}</p>
                      <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-2xl">
                        KES {order.total?.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm px-3 py-1 rounded-full inline-block mt-1 ${
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

                  <div className="bg-black/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold mb-1">Delivery Address:</p>
                        <p className="text-gray-300">{order.deliveryAddress}</p>
                        {order.deliveryNotes && (
                          <p className="text-yellow-300 text-sm mt-2">
                            📝 Notes: {order.deliveryNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-600 hover:to-teal-600 transition-all"
                      >
                        Accept Delivery
                      </button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <>
                        <button
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                          className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
                        >
                          Open in Maps
                        </button>
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                        >
                          Mark as Delivered
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-green-500/20 border-2 border-green-400/30 rounded-xl p-4 text-center"
        >
          <p className="text-green-200 text-sm">
            🚗 You are a <span className="font-bold text-green-400">DELIVERY GUY</span> - Accept and complete deliveries
          </p>
        </motion.div>
      </div>
    </div>
  );
}


