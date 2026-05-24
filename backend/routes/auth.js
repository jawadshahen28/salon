import express from 'express';
import { login, getMe, verifyDashboardPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/verify-dashboard', protect, verifyDashboardPassword);

export default router;
