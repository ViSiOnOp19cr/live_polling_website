import express from 'express'
import {login, signup, me} from '../controller/auth.controller.ts'

export const router = express.Router();

//AUTHENTICATION ROUTES
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', me);