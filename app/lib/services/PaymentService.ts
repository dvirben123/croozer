import mongoose from 'mongoose';
import PaymentProvider from '@/models/PaymentProvider';
import Order from '@/models/Order';
import { EncryptionService } from './EncryptionService';

export interface PaymentLinkData {
  orderId: string;
  amount: number;
  currency: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}

export interface PaymentLinkResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

export class PaymentService {
  /**
   * Create payment link for an order
   */
  static async createPaymentLink(
    businessId: mongoose.Types.ObjectId,
    data: PaymentLinkData
  ): Promise<PaymentLinkResponse> {
    try {
      // Get primary payment provider for business
      const provider = await PaymentProvider.findPrimaryProvider(businessId);

      if (!provider) {
        return {
          success: false,
          error: 'No payment provider configured',
        };
      }

      if (!provider.canProcessAmount(data.amount)) {
        return {
          success: false,
          error: `Amount ${data.amount} is outside allowed range`,
        };
      }

      // Decrypt credentials
      const credentialsJson = EncryptionService.decrypt(provider.credentials);
      const credentials = JSON.parse(credentialsJson);

      // Route to appropriate provider
      let paymentUrl: string;

      switch (provider.provider) {
        case 'stripe':
          paymentUrl = await this.createStripePaymentLink(data, credentials, provider.testMode);
          break;

        case 'paypal':
          paymentUrl = await this.createPayPalPaymentLink(data, credentials, provider.testMode);
          break;

        case 'tranzila':
          paymentUrl = await this.createTranzilaPaymentLink(data, credentials, provider.testMode);
          break;

        case 'meshulam':
          paymentUrl = await this.createMeshulamPaymentLink(data, credentials, provider.testMode);
          break;

        case 'cardcom':
          paymentUrl = await this.createCardcomPaymentLink(data, credentials, provider.testMode);
          break;

        default:
          return {
            success: false,
            error: `Payment provider ${provider.provider} not supported`,
          };
      }

      // Update order with payment link
      await Order.findByIdAndUpdate(data.orderId, {
        paymentLinkUrl: paymentUrl,
        paymentProviderId: provider._id,
      });

      // Increment provider transaction count
      await provider.incrementTransaction(data.amount);

      return {
        success: true,
        paymentUrl,
      };
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment link',
      };
    }
  }

  /**
   * Create Stripe payment link
   */
  private static async createStripePaymentLink(
    data: PaymentLinkData,
    credentials: any,
    testMode: boolean
  ): Promise<string> {
    // Stripe implementation
    // This is a simplified example - actual implementation would use Stripe SDK
    const apiKey = testMode ? credentials.testApiKey : credentials.apiKey;

    const response = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price_data][currency]': data.currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': data.description || 'Order',
        'line_items[0][price_data][unit_amount]': (data.amount * 100).toString(),
        'line_items[0][quantity]': '1',
        'metadata[order_id]': data.orderId,
        'metadata[customer_phone]': data.customerPhone,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Stripe payment link creation failed');
    }

    return result.url;
  }

  /**
   * Create PayPal payment link
   */
  private static async createPayPalPaymentLink(
    data: PaymentLinkData,
    credentials: any,
    testMode: boolean
  ): Promise<string> {
    // PayPal implementation
    const baseUrl = testMode ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const clientId = testMode ? credentials.testClientId : credentials.clientId;
    const clientSecret = testMode ? credentials.testClientSecret : credentials.clientSecret;

    // Get access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: data.currency,
            value: data.amount.toFixed(2),
          },
          description: data.description || 'Order',
          custom_id: data.orderId,
        }],
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.message || 'PayPal payment link creation failed');
    }

    // Get approval URL
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('PayPal approval URL not found');
    }

    return approvalUrl;
  }

  /**
   * Create Tranzila payment link (Israeli provider)
   */
  private static async createTranzilaPaymentLink(
    data: PaymentLinkData,
    credentials: any,
    testMode: boolean
  ): Promise<string> {
    // Tranzila implementation
    const terminalName = credentials.terminalName;
    const terminalPassword = credentials.terminalPassword;

    // Tranzila uses a simple URL-based payment page
    const params = new URLSearchParams({
      supplier: terminalName,
      sum: data.amount.toFixed(2),
      currency: data.currency === 'ILS' ? '1' : '2',
      cred_type: '1',
      order_id: data.orderId,
      phone: data.customerPhone,
      ...(testMode && { test_mode: '1' }),
    });

    return `https://direct.tranzila.com/${terminalName}/iframenew.php?${params.toString()}`;
  }

  /**
   * Create Meshulam payment link (Israeli provider)
   */
  private static async createMeshulamPaymentLink(
    data: PaymentLinkData,
    credentials: any,
    testMode: boolean
  ): Promise<string> {
    // Meshulam implementation
    const apiUrl = testMode ? 'https://sandbox.meshulam.co.il' : 'https://secure.meshulam.co.il';
    const pageCode = credentials.pageCode;
    const apiKey = credentials.apiKey;

    const response = await fetch(`${apiUrl}/api/light/server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageCode,
        apiKey,
        action: 'createPaymentProcess',
        sum: data.amount,
        currency: data.currency,
        description: data.description || 'Order',
        customFields: {
          orderId: data.orderId,
          customerPhone: data.customerPhone,
        },
      }),
    });

    const result = await response.json();

    if (result.status !== 'success') {
      throw new Error(result.message || 'Meshulam payment link creation failed');
    }

    return result.data.paymentUrl;
  }

  /**
   * Create Cardcom payment link (Israeli provider)
   */
  private static async createCardcomPaymentLink(
    data: PaymentLinkData,
    credentials: any,
    testMode: boolean
  ): Promise<string> {
    // Cardcom implementation
    const terminalNumber = credentials.terminalNumber;
    const username = credentials.username;
    const apiKey = credentials.apiKey;

    const apiUrl = testMode ? 'https://test.cardcom.solutions' : 'https://secure.cardcom.solutions';

    const response = await fetch(`${apiUrl}/api/v11/LowProfile/Create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        TerminalNumber: terminalNumber,
        UserName: username,
        APIKey: apiKey,
        Operation: {
          Amount: data.amount,
          Currency: data.currency === 'ILS' ? 1 : 2,
          Description: data.description || 'Order',
        },
        Customer: {
          Phone: data.customerPhone,
          Email: data.customerEmail,
        },
        CustomFields: {
          OrderId: data.orderId,
        },
      }),
    });

    const result = await response.json();

    if (!result.ResponseCode || result.ResponseCode !== '0') {
      throw new Error(result.Description || 'Cardcom payment link creation failed');
    }

    return result.Url;
  }

  /**
   * Verify payment webhook signature
   */
  static verifyWebhookSignature(
    provider: string,
    signature: string,
    payload: string,
    secret: string
  ): boolean {
    // Implementation depends on provider
    // Each provider has their own signature verification method
    return true; // Simplified for now
  }

  /**
   * Handle payment completion
   */
  static async handlePaymentComplete(
    orderId: string,
    transactionId: string
  ): Promise<void> {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      order.timeline.push({
        status: 'confirmed',
        timestamp: new Date(),
        updatedBy: 'system',
        notes: `Payment completed. Transaction ID: ${transactionId}`,
      });

      await order.save();

      // TODO: Send confirmation message to customer via WhatsApp
      // TODO: Notify business owner

      console.log(`✅ Payment completed for order ${orderId}`);
    } catch (error) {
      console.error('Error handling payment completion:', error);
      throw error;
    }
  }
}

