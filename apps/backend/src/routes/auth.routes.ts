import express from 'express'
import {login, signup, me} from '../controller/auth.controller.ts'
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { authRateLimitMiddleware } from '../middlewares/rate-limit.middleware.ts';

export const router = express.Router();

//AUTHENTICATION ROUTES
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authRateLimitMiddleware, authMiddleware, me);