import type { Response, NextFunction } from 'express';
import type { extendedRequest } from '../types';

export const teacherMiddleware = (req: extendedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'User not authenticated'
        });
    }

    if (req.user.role !== 'TEACHER') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Teacher role required'
        });
    }

    next();
};
