import express from 'express';
import { createCheckoutSession, handleStripeWebhook, downloadMap } from '../controllers/paymentController.js';
import bodyParser from 'body-parser';

const router = express.Router();

// Checkout
router.post('/checkout', createCheckoutSession);

// Download (free or purchased)
router.get('/download/:id', downloadMap);

// Stripe Webhook
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;