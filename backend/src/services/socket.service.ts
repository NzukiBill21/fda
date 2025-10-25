import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface OrderUpdate {
  orderId: string;
  status: string;
  location?: {
    lat: number;
    lng: number;
  };
  estimatedTime?: number;
}

export const setupSocketIO = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join order room
    socket.on('join_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
      logger.info(`Socket ${socket.id} joined order room: ${orderId}`);
    });

    // Leave order room
    socket.on('leave_order', (orderId: string) => {
      socket.leave(`order_${orderId}`);
      logger.info(`Socket ${socket.id} left order room: ${orderId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper function to emit order updates
export const emitOrderUpdate = (io: SocketIOServer, update: OrderUpdate) => {
  io.to(`order_${update.orderId}`).emit('order_update', update);
  logger.info(`Order update emitted for order: ${update.orderId}`);
};

