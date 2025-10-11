import express from 'express'
import {login, signup} from '../controller/auth.controller.ts'

export const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);