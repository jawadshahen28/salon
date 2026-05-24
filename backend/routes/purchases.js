import express from 'express';
import { addPurchase, getPurchases, deletePurchase } from '../controllers/purchaseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPurchases);
router.post('/', addPurchase);
router.delete('/:id', deletePurchase);

export default router;
