import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Package, Truck, CheckCircle, Clock, Navigation, User } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface DeliveryTrackerProps {
  orderId: string;
  estimatedTime: number;
  customerName: string;
  address: string;
  onDeliveryComplete: () => void;
}

const deliveryStages = [
  { id: 1, icon: Package, label: 'Order Confirmed', time: 0 },
  { id: 2, icon: Package, label: 'Preparing', time: 25 },
  { id: 3, icon: Truck, label: 'Out for Delivery', time: 60 },
  { id: 4, icon: CheckCircle, label: 'Delivered', time: 100 },
];

export function DeliveryTracker({ orderId, estimatedTime, customerName, address, onDeliveryComplete }: DeliveryTrackerProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 2, 100);
        
        // Update stage based on progress
        if (newProgress >= 100) {
          setCurrentStage(4);
          // Trigger review dialog when delivered
          setTimeout(() => {
            onDeliveryComplete();
          }, 1000);
        } else if (newProgress >= 75) {
          setCurrentStage(4);
        } else if (newProgress >= 50) {
          setCurrentStage(3);
        } else if (newProgress >= 20) {
          setCurrentStage(2);
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDeliveryComplete]);

  // Westlands coordinates
  const restaurantLat = -1.2667;
  const restaurantLng = 36.8167;
  
  // Simulate delivery path in Westlands area
  const deliveryLat = restaurantLat + 0.01;
  const deliveryLng = restaurantLng + 0.01;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${restaurantLng - 0.02},${restaurantLat - 0.02},${deliveryLng + 0.02},${deliveryLat + 0.02}&layer=mapnik&marker=${restaurantLat},${restaurantLng}`;

  return (
    <Card className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/90 backdrop-blur-2xl border-2 border-blue-200/50 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-gray-200/50">
        <div>
          <h3 className="text-2xl lg:text-3xl text-gray-900 mb-2">Track Your Order</h3>
          <div className="space-y-1">
            <p className="text-gray-600 flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-yellow-100 text-red-900 text-sm" style={{ fontWeight: '600' }}>
                #{orderId}
              </span>
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              {customerName}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {address}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-xl"
        >
          <Navigation className="w-7 h-7" />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="relative">
          <Progress value={progress} className="h-4 bg-gray-200 rounded-full" />
          <div 
            className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 transition-all duration-500 shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-4">
          <span className="text-sm text-gray-700" style={{ fontWeight: '600' }}>
            {progress}% Complete
          </span>
          <span className="text-sm text-gray-700 flex items-center gap-1" style={{ fontWeight: '600' }}>
            <Clock className="w-4 h-4 text-red-600" />
            {Math.max(estimatedTime - Math.floor(progress / 100 * estimatedTime), 0)} min remaining
          </span>
        </div>
      </div>

      {/* Delivery Stages */}
      <div className="space-y-4 mb-10">
        {deliveryStages.map((stage, index) => {
          const isCompleted = progress >= stage.time;
          const isCurrent = currentStage === stage.id;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${
                isCurrent
                  ? 'bg-gradient-to-r from-red-50 via-yellow-50 to-orange-50 border-2 border-red-300 shadow-xl scale-105'
                  : isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md'
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div
                className={`p-4 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-xl'
                    : isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`text-lg ${isCurrent ? 'text-red-900' : 'text-gray-900'}`} style={{ fontWeight: '600' }}>
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-gray-600 mt-1">Your order is being {stage.label.toLowerCase()}...</p>
                )}
              </div>
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-4 h-4 rounded-full bg-red-500 shadow-lg"
                />
              )}
              {isCompleted && !isCurrent && (
                <CheckCircle className="w-7 h-7 text-green-500" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Real World Map - Always Visible When Out for Delivery */}
      {currentStage >= 3 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl overflow-hidden border-4 border-blue-300 shadow-2xl ring-4 ring-blue-100"
        >
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white px-6 py-5 flex items-center gap-3 shadow-lg">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <MapPin className="w-6 h-6" />
            </motion.div>
            <h4 className="text-xl" style={{ fontWeight: '700' }}>Live GPS Tracking - Westlands, Nairobi</h4>
          </div>
          <div className="relative bg-white p-2">
            <iframe
              width="100%"
              height="500"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              style={{ border: 0, borderRadius: '0.75rem' }}
              className="shadow-inner"
              title="Delivery Map"
            />
            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border-3 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 text-white animate-pulse">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900" style={{ fontWeight: '600' }}>
                    Driver is on the way
                  </p>
                  <p className="text-xs text-gray-600">
                    Location: Westlands, Nairobi ({restaurantLat.toFixed(4)}°, {restaurantLng.toFixed(4)}°)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span style={{ fontWeight: '600' }}>ETA: {Math.max(estimatedTime - Math.floor(progress / 100 * estimatedTime), 0)} min</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
