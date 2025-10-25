import AfricasTalking from 'africastalking';
import { logger } from '../../utils/logger';

const credentials = {
  apiKey: process.env.AFRICASTALKING_API_KEY || '',
  username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
};

const africastalking = AfricasTalking(credentials);
const sms = africastalking.SMS;

export class SMSService {
  // Send SMS
  static async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      // Format phone number
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+254' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('254')) {
          formattedPhone = '+' + formattedPhone;
        } else {
          formattedPhone = '+254' + formattedPhone;
        }
      }

      const result = await sms.send({
        to: [formattedPhone],
        message,
        from: process.env.AFRICASTALKING_SENDER_ID,
      });

      logger.info('SMS sent successfully:', result);
      return true;
    } catch (error) {
      logger.error('SMS sending error:', error);
      return false;
    }
  }

  // Order confirmation SMS
  static async sendOrderConfirmation(phone: string, orderNumber: string, total: number): Promise<boolean> {
    const message = `Order Confirmed! 🎉\nOrder #${orderNumber}\nTotal: KSh ${total.toLocaleString()}\nEstimated delivery: 30-45 mins\nThank you for choosing Mondas Snack Bar!`;
    return this.sendSMS(phone, message);
  }

  // Order status update SMS
  static async sendOrderStatusUpdate(
    phone: string,
    orderNumber: string,
    status: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      CONFIRMED: `Your order #${orderNumber} has been confirmed! 👨‍🍳 We're preparing your delicious meal.`,
      PREPARING: `Good news! Your order #${orderNumber} is being prepared with love. 🍳`,
      READY: `Your order #${orderNumber} is ready! 📦 Our driver will pick it up soon.`,
      OUT_FOR_DELIVERY: `On the way! 🚗 Your order #${orderNumber} is out for delivery. Track it in the app!`,
      DELIVERED: `Enjoy your meal! 🍽️ Order #${orderNumber} has been delivered. Bon appétit!`,
    };

    const message = statusMessages[status] || `Order #${orderNumber} status: ${status}`;
    return this.sendSMS(phone, message);
  }

  // Delivery ETA update
  static async sendETAUpdate(phone: string, orderNumber: string, minutes: number): Promise<boolean> {
    const message = `Your order #${orderNumber} will arrive in approximately ${minutes} minutes! 🕐`;
    return this.sendSMS(phone, message);
  }

  // Payment confirmation SMS
  static async sendPaymentConfirmation(
    phone: string,
    orderNumber: string,
    amount: number,
    transactionId: string
  ): Promise<boolean> {
    const message = `Payment Received ✅\nOrder #${orderNumber}\nAmount: KSh ${amount.toLocaleString()}\nTransaction ID: ${transactionId}\nThank you!`;
    return this.sendSMS(phone, message);
  }

  // Promotional SMS
  static async sendPromotion(phone: string, promoText: string): Promise<boolean> {
    const message = `🎁 Special Offer from Mondas Snack Bar!\n${promoText}\nOrder now at mondas.co.ke`;
    return this.sendSMS(phone, message);
  }
}

