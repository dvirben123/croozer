// Direct WhatsApp Graph API integration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '789427540931519';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_SYSTEM_USER_ACCESS_TOKEN || '';

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

class WhatsAppAPI {
    private baseUrl: string;
    private phoneNumberId: string;
    private accessToken: string;

    constructor() {
        this.baseUrl = WHATSAPP_API_URL;
        this.phoneNumberId = PHONE_NUMBER_ID;
        this.accessToken = ACCESS_TOKEN;
    }

    /**
     * Send a text message via WhatsApp
     */
    async sendTextMessage(request: SendMessageRequest): Promise<ApiResponse<WhatsAppMessageResponse>> {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: request.phoneNumber.replace(/^\+/, ''), // Remove + if present
                type: "text",
                text: {
                    body: request.message
                }
            };

            const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
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
                const errorSubcode = errorData.error?.error_subcode;

                // Provide more specific error messages
                if (errorMessage.includes('Message failed to send because more than 24 hours have passed')) {
                    throw new Error('Cannot send text message: 24-hour window expired. Use template messages instead.');
                } else if (errorMessage.includes('This message is sent outside of allowed window')) {
                    throw new Error('Cannot send text message outside 24-hour window. Use template messages for marketing.');
                } else if (errorCode === 131049) {
                    throw new Error('Cannot send text message: User must message you first or use template messages.');
                }

                throw new Error(`${errorMessage} (Code: ${errorCode}${errorSubcode ? `, Subcode: ${errorSubcode}` : ''})`);
            }

            return {
                success: true,
                data: data as WhatsAppMessageResponse,
                message: 'Message sent successfully'
            };
        } catch (error) {
            console.error('Error sending text message:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Send a template message via WhatsApp
     */
    async sendTemplateMessage(request: SendTemplateRequest): Promise<ApiResponse<WhatsAppMessageResponse>> {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: request.phoneNumber.replace(/^\+/, ''), // Remove + if present
                type: "template",
                template: {
                    name: request.templateName,
                    language: {
                        code: request.languageCode || "en_US"
                    },
                    ...(request.components && request.components.length > 0 && {
                        components: request.components
                    })
                }
            };

            const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as WhatsAppErrorResponse;
                throw new Error(errorData.error?.message || 'Failed to send template message');
            }

            return {
                success: true,
                data: data as WhatsAppMessageResponse,
                message: 'Template message sent successfully'
            };
        } catch (error) {
            console.error('Error sending template message:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get available templates
     */
    async getTemplates(): Promise<ApiResponse<any[]>> {
        try {
            // Get templates from WhatsApp Business Account
            const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1980175552606363';
            const response = await fetch(`${this.baseUrl}/${wabaId}/message_templates?fields=id,name,status,category,language,components`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as WhatsAppErrorResponse;
                throw new Error(errorData.error?.message || 'Failed to get templates');
            }

            return {
                success: true,
                data: data.data || [],
                message: 'Templates retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting templates:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                data: []
            };
        }
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<ApiResponse> {
        try {
            // Test by getting phone number info
            const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}?fields=id,display_phone_number,verified_name`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as WhatsAppErrorResponse;
                throw new Error(errorData.error?.message || 'Connection test failed');
            }

            return {
                success: true,
                data,
                message: 'Connection successful'
            };
        } catch (error) {
            console.error('Error testing connection:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export const whatsappAPI = new WhatsAppAPI();
export default whatsappAPI;
