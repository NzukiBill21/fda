// src/utils/realtime.ts
import { logger } from './logger';

export class RealtimeManager {
  private static instance: RealtimeManager;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  connect(token: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      this.eventSource = new EventSource(`http://localhost:5000/api/realtime?token=${token}`);
      
      this.eventSource.onopen = () => {
        logger.info('Real-time connection established');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch (error) {
          logger.error('Failed to parse real-time message', { error: error.message });
        }
      };

      this.eventSource.addEventListener('order-update', (event) => {
        try {
          const orderData = JSON.parse(event.data);
          this.emit('order-update', orderData);
        } catch (error) {
          logger.error('Failed to parse order update', { error: error.message });
        }
      });

      this.eventSource.addEventListener('menu-update', (event) => {
        try {
          const menuData = JSON.parse(event.data);
          this.emit('menu-update', menuData);
        } catch (error) {
          logger.error('Failed to parse menu update', { error: error.message });
        }
      });

      this.eventSource.addEventListener('user-update', (event) => {
        try {
          const userData = JSON.parse(event.data);
          this.emit('user-update', userData);
        } catch (error) {
          logger.error('Failed to parse user update', { error: error.message });
        }
      });

      this.eventSource.onerror = (error) => {
        logger.error('Real-time connection error', { error });
        this.reconnect(token);
      };

    } catch (error) {
      logger.error('Failed to establish real-time connection', { error: error.message });
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      logger.info('Real-time connection closed');
    }
  }

  private reconnect(token: string): void {
    setTimeout(() => {
      logger.info('Attempting to reconnect real-time connection');
      this.connect(token);
    }, 5000);
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in real-time event callback', { event, error: error.message });
        }
      });
    }
  }

  // Send real-time updates to server
  async sendUpdate(type: string, data: any): Promise<void> {
    try {
      await fetch('http://localhost:5000/api/realtime/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ type, data })
      });
    } catch (error) {
      logger.error('Failed to send real-time update', { type, error: error.message });
    }
  }
}

export const realtimeManager = RealtimeManager.getInstance();

