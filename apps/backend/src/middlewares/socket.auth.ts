import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwt_scret } from '../config.ts';
import prisma from '../db.ts';

declare module 'socket.io' {
    interface Socket {
        user?: {
            id: string,
            username: string,
            role: string
        };
    }
}
export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('unauthorized'));
        }
        const decoded = jwt.verify(token, jwt_scret);
        if (!decoded || typeof decoded === 'string') {
            return next(new Error('unauthorized'));
        }
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                username: true,
                role: true
            }
        });
        if (!user) {
            return next(new Error('user not found'));
        }
        socket.user = user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        next(new Error('unauthorized or invalied token'))
    }
};

