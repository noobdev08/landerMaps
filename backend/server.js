import 'dotenv/config'
import cors from 'cors';
import express from 'express';
import authRoute from './routes/authRoute.js'
import publicRoute from './routes/publicRoute.js'
import adminRoute from './routes/adminRoutes.js'
import paymentRoute from './routes/paymentRoute.js'
import { handleStripeWebhook } from './controllers/paymentController.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Middlware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://map-buildz.vercel.app'
  ]
}));

// Routes
app.use('/', publicRoute)
app.use('/auth', authRoute);
app.use('/admin', authMiddleware, adminRoute)
app.use('/api', paymentRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})