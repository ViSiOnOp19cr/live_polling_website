import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { teacherMiddleware } from '../middlewares/teacher.middleware.ts';
import {
    createRoom,
    getTeacherRooms,
    updateRoom,
    deleteRoom,
    createPoll,
    updatePoll,
    deletePoll,
    getTeacherAnalytics
} from '../controller/teacher.controller.ts';

export const teacherRouter = express.Router();

// Apply authentication middleware to all teacher routes
teacherRouter.use(authMiddleware);
teacherRouter.use(teacherMiddleware);

// Room management routes
teacherRouter.post('/rooms', createRoom);
teacherRouter.get('/rooms', getTeacherRooms);
teacherRouter.put('/rooms/:roomId', updateRoom);
teacherRouter.delete('/rooms/:roomId', deleteRoom);

// Poll management routes
teacherRouter.post('/polls', createPoll);
teacherRouter.put('/polls/:pollId', updatePoll);
teacherRouter.delete('/polls/:pollId', deletePoll);

// Analytics route
teacherRouter.get('/analytics', getTeacherAnalytics);
