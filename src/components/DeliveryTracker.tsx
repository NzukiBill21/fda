import { useState, useEffect, useRef } from 'react';
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

interface OrderStatus {
  status: string;
  createdAt: string;
  confirmedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
}

const deliveryStages = [
  { id: 1, icon: Package, label: 'Order Confirmed', statuses: ['PENDING', 'CONFIRMED'] },
  { id: 2, icon: Package, label: 'Preparing', statuses: ['PREPARING'] },
  { id: 3, icon: Truck, label: 'Out for Delivery', statuses: ['OUT_FOR_DELIVERY', 'READY'] },
  { id: 4, icon: CheckCircle, label: 'Delivered', statuses: ['DELIVERED'] },
];

export function DeliveryTracker({ orderId, estimatedTime, customerName, address, onDeliveryComplete }: DeliveryTrackerProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasTriggeredComplete = useRef(false);
  const readyTimestampRef = useRef<Date | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch order status from backend
  const fetchOrderStatus = async () => {
    try {
      const { createApiUrl } = await import('../config/api');
      const response = await fetch(createApiUrl(`api/orders/${orderId}`));
      const result = await response.json();
      
      if (result.success && result.order) {
        const order = result.order;
        const statusData: OrderStatus = {
          status: order.status || 'PENDING',
          createdAt: order.createdAt,
          confirmedAt: order.confirmedAt,
          preparingAt: order.preparingAt,
          readyAt: order.readyAt,
          pickedUpAt: order.pickedUpAt,
          deliveredAt: order.deliveredAt,
        };
        
        setOrderStatus(statusData);
        setIsLoading(false);

        // Track when order becomes READY for fallback mechanism
        // Use backend readyAt timestamp if available, otherwise use current time
        if (statusData.status === 'READY' && !readyTimestampRef.current) {
          readyTimestampRef.current = statusData.readyAt 
            ? new Date(statusData.readyAt) 
            : new Date();
        } else if (statusData.status !== 'READY' && readyTimestampRef.current) {
          // Reset if status changes away from READY (e.g., picked up or delivered)
          readyTimestampRef.current = null;
          // Clear any pending fallback timer
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      setIsLoading(false);
    }
  };

  // Poll order status every 5 seconds
  useEffect(() => {
    fetchOrderStatus(); // Initial fetch
    const interval = setInterval(fetchOrderStatus, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);

  // Map backend status to UI stage
  useEffect(() => {
    if (!orderStatus) return;

    const status = orderStatus.status;
    let newStage = 1;

    // Strict chronological mapping based on actual backend status
    if (status === 'DELIVERED') {
      newStage = 4;
    } else if (status === 'OUT_FOR_DELIVERY') {
      // Only show "Out for Delivery" when driver has actually picked it up and is en route
      newStage = 3;
    } else if (status === 'READY') {
      // Order is ready but driver hasn't picked up yet - show as "Ready for Pickup"
      // This is a transitional state, so we'll show it in stage 3 but with special label
      newStage = 3;
    } else if (status === 'PREPARING') {
      // Only show "Preparing" when caterer has clicked "Start Prep"
      newStage = 2;
    } else if (status === 'PENDING' || status === 'CONFIRMED') {
      newStage = 1;
    }

    setCurrentStage(newStage);
    
    // Calculate progress based on status
    let calculatedProgress = 0;
    if (status === 'DELIVERED') {
      calculatedProgress = 100;
    } else if (status === 'OUT_FOR_DELIVERY') {
      calculatedProgress = 75;
    } else if (status === 'PREPARING') {
      calculatedProgress = 25;
    } else if (status === 'READY') {
      calculatedProgress = 50; // Ready but waiting for pickup
    } else {
      calculatedProgress = 5; // PENDING/CONFIRMED
    }
    
    setProgress(calculatedProgress);
  }, [orderStatus]);

  // Handle delivery complete trigger - only when DELIVERED or fallback timer
  useEffect(() => {
    if (!orderStatus || hasTriggeredComplete.current) return;

    // Case 1: Order is marked as DELIVERED
    if (orderStatus.status === 'DELIVERED') {
      hasTriggeredComplete.current = true;
      // Clear any pending fallback timer
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setTimeout(() => {
        onDeliveryComplete();
      }, 1000);
      return;
    }

    // Case 2: Fallback - Start 3-minute timer when order becomes READY
    if (orderStatus.status === 'READY' && readyTimestampRef.current && !fallbackTimerRef.current) {
      // Calculate remaining time until 3 minutes mark
      const now = new Date();
      const readyTime = readyTimestampRef.current;
      const elapsedMs = now.getTime() - readyTime.getTime();
      const threeMinutesMs = 3 * 60 * 1000;
      const remainingMs = Math.max(0, threeMinutesMs - elapsedMs);

      // If 3 minutes have already passed, trigger immediately
      if (remainingMs === 0) {
        if (!hasTriggeredComplete.current) {
          hasTriggeredComplete.current = true;
          onDeliveryComplete();
        }
      } else {
        // Otherwise, set timer for remaining time
        fallbackTimerRef.current = setTimeout(() => {
          if (!hasTriggeredComplete.current && orderStatus?.status !== 'DELIVERED') {
            hasTriggeredComplete.current = true;
            onDeliveryComplete();
          }
          fallbackTimerRef.current = null;
        }, remainingMs);
      }
    }
  }, [orderStatus, onDeliveryComplete]);

  // Cleanup fallback timer
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  // Westlands coordinates
  const restaurantLat = -1.2667;
  const restaurantLng = 36.8167;
  
  // Simulate delivery path in Westlands area
  const deliveryLat = restaurantLat + 0.01;
  const deliveryLng = restaurantLng + 0.01;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${restaurantLng - 0.02},${restaurantLat - 0.02},${deliveryLng + 0.02},${deliveryLat + 0.02}&layer=mapnik&marker=${restaurantLat},${restaurantLng}`;

  // Get stage label based on current status
  const getStageLabel = (stageId: number) => {
    if (!orderStatus) return deliveryStages[stageId - 1]?.label || '';
    
    // If status is READY but we're showing stage 3, indicate it's waiting for pickup
    if (orderStatus.status === 'READY' && stageId === 3) {
      return 'Ready for Pickup';
    }
    
    return deliveryStages[stageId - 1]?.label || '';
  };

  // Calculate time remaining based on status
  const getTimeRemaining = () => {
    if (!orderStatus) return estimatedTime;
    
    const status = orderStatus.status;
    if (status === 'DELIVERED') return 0;
    if (status === 'OUT_FOR_DELIVERY') return Math.max(Math.floor(estimatedTime * 0.25), 5);
    if (status === 'PREPARING') return Math.max(Math.floor(estimatedTime * 0.7), 10);
    if (status === 'READY') return Math.max(Math.floor(estimatedTime * 0.4), 15);
    return estimatedTime;
  };

  if (isLoading) {
    return (
      <Card className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/90 backdrop-blur-2xl border-2 border-blue-200/50 shadow-2xl">
        <div className="flex items-center justify-center py-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"
          />
        </div>
      </Card>
    );
  }

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
            {getTimeRemaining()} min remaining
          </span>
        </div>
      </div>

      {/* Delivery Stages */}
      <div className="space-y-4 mb-10">
        {deliveryStages.map((stage, index) => {
          // Determine if stage is completed, current, or pending
          // Special handling: When READY, stages 1 and 2 are completed, stage 3 is current
          let isCompleted = false;
          let isCurrent = false;
          
          if (orderStatus) {
            const status = orderStatus.status;
            if (status === 'DELIVERED') {
              isCompleted = stage.id < 4;
              isCurrent = stage.id === 4;
            } else if (status === 'OUT_FOR_DELIVERY') {
              isCompleted = stage.id < 3;
              isCurrent = stage.id === 3;
            } else if (status === 'READY') {
              // READY means preparation is done, waiting for pickup
              isCompleted = stage.id < 3; // Stages 1 and 2 are done
              isCurrent = stage.id === 3; // Stage 3 is current (but with "Ready for Pickup" label)
            } else if (status === 'PREPARING') {
              isCompleted = stage.id < 2;
              isCurrent = stage.id === 2;
            } else {
              // PENDING or CONFIRMED
              isCompleted = stage.id < 1;
              isCurrent = stage.id === 1;
            }
          }
          
          const Icon = stage.icon;

          // Special handling for READY status - change label for stage 3
          let stageLabel = stage.label;
          if (orderStatus?.status === 'READY' && stage.id === 3) {
            stageLabel = 'Ready for Pickup';
          }

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
                  {stageLabel}
                </p>
                {isCurrent && (
                  <p className="text-sm text-gray-600 mt-1">
                    {orderStatus?.status === 'DELIVERED' && stage.id === 4
                      ? '🎉 Enjoy your meal! Thank you for choosing us! 😊'
                      : orderStatus?.status === 'READY' && stage.id === 3
                      ? 'Your order is ready and waiting for delivery driver to pick up...'
                      : `Your order is being ${stageLabel.toLowerCase()}...`}
                  </p>
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

      {/* Real World Map - Show when Out for Delivery or Ready */}
      {(currentStage >= 3 || orderStatus?.status === 'OUT_FOR_DELIVERY' || orderStatus?.status === 'READY') && (
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
            <h4 className="text-xl" style={{ fontWeight: '700' }}>
              {orderStatus?.status === 'READY' ? 'Waiting for Driver Pickup - Westlands, Nairobi' : 'Live GPS Tracking - Westlands, Nairobi'}
            </h4>
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
                    {orderStatus?.status === 'READY' 
                      ? 'Order ready - Waiting for driver assignment'
                      : 'Driver is on the way'}
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
                <span style={{ fontWeight: '600' }}>ETA: {getTimeRemaining()} min</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
