/**
 * Multi-Tenant WhatsApp Service
 *
 * Manages WhatsApp Business API operations for multiple businesses.
 * Each business has its own WhatsApp account with separate credentials.
 *
 * Features:
 * - Per-business WhatsApp account management
 * - Encrypted token storage
 * - Message sending with business-specific credentials
 * - Template message support
 * - Health checking and monitoring
 */

import mongoose from 'mongoose';
import BusinessWhatsAppAccount, { IBusinessWhatsAppAccount } from '../../models/BusinessWhatsAppAccount';
import { EncryptionService } from './EncryptionService';

const GRAPH_API_BASE = 'https://graph.facebook.com/v22.0';

// Types
export interface SendMessageRequest {
  phoneNumber: string;
  message: string;
}

export interface SendTemplateRequest {
  phoneNumber: string;
  templateName: string;
  languageCode?: string;
  components?: any[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * Multi-Tenant WhatsApp Service
 * Handles WhatsApp operations for multiple businesses
 */
export class MultiTenantWhatsAppService {
  /**
   * Get WhatsApp account for a business
   * @param businessId - MongoDB ObjectId of the business
   * @returns WhatsApp account with decrypted credentials
   */
  private static async getBusinessWhatsAppAccount(
    businessId: string | mongoose.Types.ObjectId
  ): Promise<IBusinessWhatsAppAccount> {
    const account = await BusinessWhatsAppAccount.findOne({ businessId });

    if (!account) {
      throw new Error('WhatsApp account not configured for this business. Please connect a WhatsApp Business account.');
    }

    if (account.status !== 'active') {
      throw new Error(`WhatsApp account is ${account.status}. Please reconnect your WhatsApp Business account.`);
    }

    return account;
  }

  /**
   * Decrypt access token from database
   * @param encryptedToken - Encrypted token from database
   * @returns Decrypted access token
   */
  private static decryptAccessToken(encryptedToken: string): string {
    try {
      return EncryptionService.decrypt(encryptedToken);
    } catch (error) {
      throw new Error('Failed to decrypt access token. Please reconnect your WhatsApp account.');
    }
  }

  /**
   * Send a text message via WhatsApp
   * @param businessId - Business ID that owns the WhatsApp account
   * @param request - Message request details
   */
  static async sendTextMessage(
    businessId: string | mongoose.Types.ObjectId,
    request: SendMessageRequest
  ): Promise<ApiResponse<WhatsAppMessageResponse>> {
    try {
      // Get business WhatsApp account
      const whatsappAccount = await this.getBusinessWhatsAppAccount(businessId);

      // Decrypt access token
      const accessToken = this.decryptAccessToken(whatsappAccount.accessToken);

      // Prepare message payload
      const payload = {
        messaging_product: 'whatsapp',
        to: request.phoneNumber.replace(/^\+/, ''), // Remove + if present
        type: 'text',
        text: {
          body: request.message,
        },
      };

      // Send message
      const response = await fetch(`${GRAPH_API_BASE}/${whatsappAccount.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as WhatsAppErrorResponse;
        console.error('WhatsApp API Error:', errorData);

        const errorMessage = errorData.error?.message || 'Failed to send message';
        const errorCode = errorData.error?.code;

        // Handle specific error cases
        if (errorMessage.includes('Message failed to send because more than 24 hours have passed')) {
          throw new Error('Cannot send text message: 24-hour window expired. Use template messages instead.');
        } else if (errorMessage.includes('This message is sent outside of allowed window')) {
          throw new Error('Cannot send text message outside 24-hour window. Use template messages for marketing.');
        } else if (errorCode === 131049) {
          throw new Error('Cannot send text message: Customer must message you first or use template messages.');
        }

        // Mark account as error if token is invalid
        if (errorCode === 190) {
          await whatsappAccount.markAsError('Access token expired or invalid');
        }

        throw new Error(errorMessage);
      }

      // Update last message sent timestamp
      await whatsappAccount.updateLastMessageSent();

      return {
        success: true,
        data: data as WhatsAppMessageResponse,
        message: 'Message sent successfully',
      };
    } catch (error) {
      console.error('Error sending text message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a template message via WhatsApp
   * @param businessId - Business ID that owns the WhatsApp account
   * @param request - Template message request details
   */
  static async sendTemplateMessage(
    businessId: string | mongoose.Types.ObjectId,
    request: SendTemplateRequest
  ): Promise<ApiResponse<WhatsAppMessageResponse>> {
    try {
      // Get business WhatsApp account
      const whatsappAccount = await this.getBusinessWhatsAppAccount(businessId);

      // Decrypt access token
      const accessToken = this.decryptAccessToken(whatsappAccount.accessToken);

      // Prepare template payload
      const payload = {
        messaging_product: 'whatsapp',
        to: request.phoneNumber.replace(/^\+/, ''), // Remove + if present
        type: 'template',
        template: {
          name: request.templateName,
          language: {
            code: request.languageCode || 'en_US',
          },
          ...(request.components && request.components.length > 0 && {
            components: request.components,
          }),
        },
      };

      // Send template message
      const response = await fetch(`${GRAPH_API_BASE}/${whatsappAccount.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as WhatsAppErrorResponse;
        console.error('WhatsApp API Error:', errorData);

        // Mark account as error if token is invalid
        if (errorData.error?.code === 190) {
          await whatsappAccount.markAsError('Access token expired or invalid');
        }

        throw new Error(errorData.error?.message || 'Failed to send template message');
      }

      // Update last message sent timestamp
      await whatsappAccount.updateLastMessageSent();

      return {
        success: true,
        data: data as WhatsAppMessageResponse,
        message: 'Template message sent successfully',
      };
    } catch (error) {
      console.error('Error sending template message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available message templates for a business
   * @param businessId - Business ID
   */
  static async getTemplates(businessId: string | mongoose.Types.ObjectId): Promise<ApiResponse<any[]>> {
    try {
      // Get business WhatsApp account
      const whatsappAccount = await this.getBusinessWhatsAppAccount(businessId);

      // Decrypt access token
      const accessToken = this.decryptAccessToken(whatsappAccount.accessToken);

      // Fetch templates
      const response = await fetch(
        `${GRAPH_API_BASE}/${whatsappAccount.whatsappBusinessAccountId}/message_templates?fields=id,name,status,category,language,components`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as WhatsAppErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to get templates');
      }

      return {
        success: true,
        data: data.data || [],
        message: 'Templates retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting templates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      };
    }
  }

  /**
   * Test WhatsApp connection for a business
   * @param businessId - Business ID
   */
  static async testConnection(businessId: string | mongoose.Types.ObjectId): Promise<ApiResponse> {
    try {
      // Get business WhatsApp account
      const whatsappAccount = await this.getBusinessWhatsAppAccount(businessId);

      // Decrypt access token
      const accessToken = this.decryptAccessToken(whatsappAccount.accessToken);

      // Test connection by getting phone number info
      const response = await fetch(
        `${GRAPH_API_BASE}/${whatsappAccount.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as WhatsAppErrorResponse;

        // Mark account as error if token is invalid
        if (errorData.error?.code === 190) {
          await whatsappAccount.markAsError('Access token expired or invalid');
        }

        throw new Error(errorData.error?.message || 'Connection test failed');
      }

      // Update health check timestamp
      whatsappAccount.lastHealthCheck = new Date();
      whatsappAccount.status = 'active';
      whatsappAccount.errorMessage = undefined;
      await whatsappAccount.save();

      return {
        success: true,
        data,
        message: 'Connection successful',
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if a business has an active WhatsApp account
   * @param businessId - Business ID
   */
  static async hasActiveAccount(businessId: string | mongoose.Types.ObjectId): Promise<boolean> {
    const account = await BusinessWhatsAppAccount.findOne({ businessId, status: 'active' });
    return !!account;
  }

  /**
   * Get WhatsApp account status for a business
   * @param businessId - Business ID
   */
  static async getAccountStatus(
    businessId: string | mongoose.Types.ObjectId
  ): Promise<{
    connected: boolean;
    status?: string;
    phoneNumber?: string;
    displayName?: string;
    lastMessageAt?: Date;
    errorMessage?: string;
  }> {
    const account = await BusinessWhatsAppAccount.findOne({ businessId });

    if (!account) {
      return { connected: false };
    }

    return {
      connected: true,
      status: account.status,
      phoneNumber: account.phoneNumber,
      displayName: account.displayName,
      lastMessageAt: account.lastMessageSentAt,
      errorMessage: account.errorMessage,
    };
  }
}

// Export singleton instance
export default MultiTenantWhatsAppService;
