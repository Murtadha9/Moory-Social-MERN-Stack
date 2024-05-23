import express from 'express';
import { getMe, google, signin, signout, signup } from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/verifyUser.js';



const router=express.Router();


router.post('/signup',signup)
router.post('/signin',signin)
router.post('/signout',signout)
router.post('/google',google)

router.get('/me', verifyToken, getMe);


export default router;