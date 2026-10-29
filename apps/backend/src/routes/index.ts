import express from 'express'
import {login, signup, me} from '../controller/auth.controller.ts'
import { authMiddleware } from '../middlewares/auth.middleware.ts';

export const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, me);