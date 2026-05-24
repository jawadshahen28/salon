import express from 'express';
import {
  addCustomer,
  updateCustomerStatus,
  getTodayQueue,
  deleteCustomer,
  getDashboardStats
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/queue', getTodayQueue);
router.get('/dashboard', getDashboardStats);
router.post('/', addCustomer);
router.put('/:id/status', updateCustomerStatus);
router.delete('/:id', deleteCustomer);

export default router;
