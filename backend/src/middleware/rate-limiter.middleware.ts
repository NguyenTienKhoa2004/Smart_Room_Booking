import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Standard limit for API requests
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts, please try again after 15 minutes',
    },
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5, // Strict limit for authentication attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts, please try again after an hour',
    },
});
