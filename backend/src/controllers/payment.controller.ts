import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MpesaService } from '../services/payment/mpesa.service';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { SMSService } from '../services/notification/sms.service';

export class PaymentController {
  static async initiateMpesaPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, phone } = req.body;
      const userId = req.user!.id;

      // Get order
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { user: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.paymentStatus === 'COMPLETED') {
        throw new AppError('Order already paid', 400);
      }

      // Initiate M-Pesa STK Push
      const mpesaResponse = await MpesaService.initiateSTKPush({
        phone: phone || order.user.phone,
        amount: order.total,
        accountReference: order.orderNumber,
        description: `Payment for order ${order.orderNumber}`,
      });

      // Update order with checkout request ID
      await prisma.order.update({
        where: { id: orderId },
        data: { transactionId: mpesaResponse.CheckoutRequestID },
      });

      res.json({
        status: 'success',
        message: 'M-Pesa payment initiated. Check your phone for prompt.',
        data: {
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          merchantRequestId: mpesaResponse.MerchantRequestID,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async mpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const callbackData = req.body;
      const result = await MpesaService.processCallback(callbackData);

      if (result.success && result.transactionId) {
        // Find and update order
        const order = await prisma.order.findFirst({
          where: { transactionId: callbackData.Body.stkCallback.CheckoutRequestID },
          include: { user: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            },
          });

          // Send confirmation SMS
          await SMSService.sendPaymentConfirmation(
            order.user.phone,
            order.orderNumber,
            result.amount!,
            result.transactionId
          );
        }
      }

      res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
      res.json({ ResultCode: 1, ResultDesc: 'Failed' });
    }
  }

  static async queryMpesaStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { checkoutRequestId } = req.params;

      const status = await MpesaService.querySTKPushStatus(checkoutRequestId);

      res.json({ status: 'success', data: status });
    } catch (error) {
      next(error);
    }
  }
}

