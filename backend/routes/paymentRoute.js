import express from 'express';
import { createCheckoutSession, downloadMap } from '../controllers/paymentController.js';

const router = express.Router();

// Checkout
router.post('/checkout', createCheckoutSession);

// Download (free or purchased)
router.get('/download/:id', downloadMap);

export default router;