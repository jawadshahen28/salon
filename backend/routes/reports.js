import express from 'express';
import { getDailyReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/daily', getDailyReport);

export default router;
