import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import db from './config/database';
import redis from './config/redis';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import bookingRoutes from './routes/booking.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin';
import ragRoutes from './routes/rag.routes';

import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rate-limiter.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { logger } from './config/logger';


dotenv.config();

const app: Application = express();

app.use(requestIdMiddleware);

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        await redis.ping();
        res.json({
            status: 'ok',
            database: 'connected',
            redis: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Service unavailable'
        });
    }
});

app.get('/test-root', (req, res) => {
    res.json({ message: 'root ok' });
});

// app.use('/api/rooms', roomRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/auth', authRoutes);

app.use('/api/v1', apiLimiter);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/rag', ragRoutes);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

export default app;