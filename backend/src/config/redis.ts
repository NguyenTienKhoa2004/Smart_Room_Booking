import Redis from 'ioredis';
import dotenv from 'dotenv';
import { logger } from './logger';
import Redlock from 'redlock';


dotenv.config();

const redisUrl = process.env.REDIS_URL;

const redis = redisUrl
    ? new Redis(redisUrl, {
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });

redis.on('connect', () => {
    logger.info('✅ Redis connected successfully');
});

redis.on('error', (err) => {
    logger.error('❌ Redis connection error:', err);
});

export const redlock = new Redlock(
    [redis],
    {
        driftFactor: 0.01,
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500,
    }
);

export default redis;