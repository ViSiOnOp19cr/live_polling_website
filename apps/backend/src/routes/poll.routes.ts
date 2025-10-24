import express from 'express';
import { getPollResults, getPollResponses, getUserAttendedPolls } from '../controller/poll.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

export const pollRouter = express.Router();

//Get all polls user has attended/responded to
pollRouter.get('/user/attended', authMiddleware, getUserAttendedPolls);

//Get poll results with analytics
pollRouter.get('/:pollId/results', authMiddleware, getPollResults);

//Get all individual responses (teacher only)
pollRouter.get('/:pollId/responses', authMiddleware, getPollResponses);
