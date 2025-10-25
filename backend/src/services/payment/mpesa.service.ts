import axios from 'axios';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

export class MpesaService {
  private static consumerKey = process.env.MPESA_CONSUMER_KEY;
  private static consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  private static passkey = process.env.MPESA_PASSKEY;
  private static shortcode = process.env.MPESA_SHORTCODE;
  private static callbackUrl = process.env.MPESA_CALLBACK_URL;

  // Get OAuth token
  private static async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      logger.error('M-Pesa OAuth error:', error);
      throw new AppError('Failed to authenticate with M-Pesa', 500);
    }
  }

  // Generate timestamp
  private static getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Generate password
  private static generatePassword(timestamp: string): string {
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  // Initiate STK Push
  static async initiateSTKPush(data: {
    phone: string;
    amount: number;
    accountReference: string;
    description: string;
  }): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      // Format phone number (remove + and spaces)
      let phone = data.phone.replace(/\s+/g, '');
      if (phone.startsWith('+254')) {
        phone = phone.substring(1);
      } else if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      } else if (phone.startsWith('254')) {
        // Already formatted
      } else {
        phone = '254' + phone;
      }

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(data.amount),
        PartyA: phone,
        PartyB: this.shortcode,
        PhoneNumber: phone,
        CallBackURL: this.callbackUrl,
        AccountReference: data.accountReference,
        TransactionDesc: data.description,
      };

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('M-Pesa STK Push initiated:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('M-Pesa STK Push error:', error.response?.data || error.message);
      throw new AppError('Failed to initiate M-Pesa payment', 500);
    }
  }

  // Query STK Push status
  static async querySTKPushStatus(checkoutRequestID: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('M-Pesa query error:', error.response?.data || error.message);
      throw new AppError('Failed to query M-Pesa payment status', 500);
    }
  }

  // Process callback
  static async processCallback(callbackData: any): Promise<{
    success: boolean;
    transactionId?: string;
    amount?: number;
  }> {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;

      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
        const transactionId = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;

        logger.info(`M-Pesa payment successful: ${transactionId}`);
        return { success: true, transactionId, amount };
      } else {
        // Payment failed
        logger.warn(`M-Pesa payment failed: ${stkCallback.ResultDesc}`);
        return { success: false };
      }
    } catch (error) {
      logger.error('M-Pesa callback processing error:', error);
      return { success: false };
    }
  }
}

