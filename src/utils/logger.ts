// Enterprise logging and monitoring system
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    // Initialize with environment-based log level
    this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: any,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack: error?.stack
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.userId;
        } catch {
          return undefined;
        }
      }
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('sessionId') || undefined;
    }
    return undefined;
  }

  private getRequestId(): string | undefined {
    if (typeof window !== 'undefined') {
      return (window as any).requestId || undefined;
    }
    return undefined;
  }

  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.createLogEntry(level, message, context, error);
    
    // Add to in-memory logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with colors
    const levelName = LogLevel[level];
    const timestamp = new Date().toLocaleTimeString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`🔍 [${timestamp}] DEBUG: ${message}${contextStr}`);
        break;
      case LogLevel.INFO:
        console.info(`ℹ️ [${timestamp}] INFO: ${message}${contextStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`⚠️ [${timestamp}] WARN: ${message}${contextStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`❌ [${timestamp}] ERROR: ${message}${contextStr}`);
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 [${timestamp}] CRITICAL: ${message}${contextStr}`);
        break;
    }

    // Send to external monitoring service
    this.sendToMonitoringService(logEntry);
  }

  private async sendToMonitoringService(logEntry: LogEntry): Promise<void> {
    // Send critical and error logs to monitoring service
    if (logEntry.level >= LogLevel.ERROR) {
      try {
        // Example: Send to your monitoring service
        const { createApiUrl } = await import('../config/api');
        await fetch(createApiUrl('api/logs'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry)
        });
      } catch (error) {
        console.error('Failed to send log to monitoring service:', error);
      }
    }
  }

  public debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public critical(message: string, context?: any, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      logger.info(`Performance: ${label} took ${duration.toFixed(2)}ms`);
      
      // Alert if performance is poor
      if (duration > 1000) {
        logger.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  public getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((times, label) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      result[label] = { avg, min, max, count: times.length };
    });
    
    return result;
  }

  public clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// API monitoring
export const monitorApiCall = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const endTiming = performanceMonitor.startTiming(`API: ${endpoint}`);
  
  try {
    const result = await apiCall();
    logger.info(`API call successful: ${endpoint}`);
    return result;
  } catch (error) {
    logger.error(`API call failed: ${endpoint}`, { error: error.message });
    throw error;
  } finally {
    endTiming();
  }
};

