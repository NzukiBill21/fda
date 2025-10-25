import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initiate M-Pesa payment
router.post('/mpesa/initiate', authenticate, PaymentController.initiateMpesaPayment);

// M-Pesa callback (public - called by Safaricom)
router.post('/mpesa/callback', PaymentController.mpesaCallback);

// Query payment status
router.get('/mpesa/status/:checkoutRequestId', authenticate, PaymentController.queryMpesaStatus);

export default router;

