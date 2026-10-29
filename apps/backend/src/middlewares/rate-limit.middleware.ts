import { rateLimit } from 'express-rate-limit';

export const authRateLimitMiddleware = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    }
});
