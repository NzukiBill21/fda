import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

export const initializeRedis = async () => {
  await redisClient.connect();
};

// Cache helper functions
export const setCache = async (key: string, value: any, expirationSeconds: number = 3600) => {
  try {
    await redisClient.setEx(key, expirationSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error('Redis set error:', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis delete error:', error);
  }
};

export const clearCachePattern = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Redis clear pattern error:', error);
  }
};

export default redisClient;

