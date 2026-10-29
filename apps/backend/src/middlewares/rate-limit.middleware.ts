import type { NextFunction, Request, Response } from 'express';

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const requestCounts = new Map<string, RateLimitEntry>();

export const authRateLimitMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const windowMs = 60_000;
    const maxRequests = 60;
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const entry = requestCounts.get(key);

    if (!entry || entry.resetAt <= now) {
        requestCounts.set(key, { count: 1, resetAt: now + windowMs });
        next();
        return;
    }

    if (entry.count >= maxRequests) {
        res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.'
        });
        return;
    }

    entry.count += 1;
    next();
};
