import { Router } from 'express';
import { social, signin, login, signup, verifyOTP, forgetPassword, resetPassword } from '../controllers/auth.controller.js';
// import rateLimit from 'express-rate-limit';

const router = Router();

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // Limit each IP to 100 requests per window
//     message: "Too many requests from this IP, please try again later.",
//     standardHeaders: true, 
// 	legacyHeaders: false,
// });

router.post('/auth/social', social);
router.post('/auth/login', login);
router.post('/auth/signin', signin);
router.post('/auth/signup', signup);
router.patch('/auth/verify-otp', verifyOTP);
router.post('/auth/forget-password', forgetPassword);
router.patch('/auth/reset-password/:token', resetPassword);

export default router;