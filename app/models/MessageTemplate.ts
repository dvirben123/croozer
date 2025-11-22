import mongoose, { Schema, Document, Model } from 'mongoose';

export type MessageTemplateType = 
  | 'welcome' 
  | 'menu_presentation' 
  | 'order_confirmation' 
  | 'payment_reminder'
  | 'order_status_update'
  | 'custom';

export interface IMessageTemplate extends Document {
  businessId: mongoose.Types.ObjectId;
  
  // Template identification
  name: string;
  type: MessageTemplateType;
  
  // Content
  content: string; // English content
  contentHe?: string; // Hebrew content
  
  // Variables that can be used in the template
  variables: string[]; // e.g., ['customerName', 'total', 'orderNumber']
  
  // Meta WhatsApp Template details
  templateId?: string; // Meta's template ID after approval
  approved: boolean; // Whether Meta has approved this template
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  rejectionReason?: string;
  
  // Template configuration
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string; // e.g., 'en', 'he', 'en_US'
  
  // Components (for WhatsApp template structure)
  components?: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phoneNumber?: string;
    }>;
  }[];
  
  // Usage tracking
  usageCount: number;
  lastUsedAt?: Date;
  
  // Status
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  render(variables: Record<string, string>): string;
  incrementUsage(): Promise<void>;
}

const MessageTemplateSchema = new Schema<IMessageTemplate>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
    },

    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [100, 'Template name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['welcome', 'menu_presentation', 'order_confirmation', 'payment_reminder', 'order_status_update', 'custom'],
      required: [true, 'Template type is required'],
    },
    
    content: {
      type: String,
      required: [true, 'Template content is required'],
      maxlength: [4096, 'Template content cannot exceed 4096 characters'],
    },
    contentHe: {
      type: String,
      maxlength: [4096, 'Hebrew content cannot exceed 4096 characters'],
    },
    
    variables: {
      type: [String],
      default: [],
    },
    
    templateId: {
      type: String,
      sparse: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_submitted'],
      default: 'not_submitted',
    },
    rejectionReason: {
      type: String,
    },
    
    category: {
      type: String,
      enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
      default: 'UTILITY',
      required: true,
    },
    language: {
      type: String,
      default: 'he',
      required: true,
    },
    
    components: {
      type: Schema.Types.Mixed,
      default: [],
    },
    
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'message_templates',
  }
);

// Indexes
MessageTemplateSchema.index({ businessId: 1, type: 1 });
MessageTemplateSchema.index({ businessId: 1, isActive: 1 });
MessageTemplateSchema.index({ templateId: 1 }, { sparse: true });

// Instance methods
MessageTemplateSchema.methods.render = function (variables: Record<string, string>): string {
  let rendered = this.contentHe || this.content;
  
  // Replace variables in the format {variableName}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    rendered = rendered.replace(regex, value);
  });
  
  return rendered;
};

MessageTemplateSchema.methods.incrementUsage = async function (): Promise<void> {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

// Static methods
MessageTemplateSchema.statics.findActiveByType = async function (
  businessId: mongoose.Types.ObjectId,
  type: MessageTemplateType
): Promise<IMessageTemplate | null> {
  return this.findOne({
    businessId,
    type,
    isActive: true,
  });
};

MessageTemplateSchema.statics.createDefault = async function (
  businessId: mongoose.Types.ObjectId
): Promise<IMessageTemplate[]> {
  const defaultTemplates = [
    {
      businessId,
      name: 'Welcome Message',
      type: 'welcome',
      content: 'Welcome to {businessName}! 👋\n\nHow can we help you today?',
      contentHe: 'ברוכים הבאים ל{businessName}! 👋\n\nאיך נוכל לעזור לך היום?',
      variables: ['businessName'],
      category: 'UTILITY',
      language: 'he',
      isActive: true,
    },
    {
      businessId,
      name: 'Order Confirmation',
      type: 'order_confirmation',
      content: 'Thank you for your order #{orderNumber}!\n\nTotal: {total} {currency}\n\nWe will notify you when your order is ready.',
      contentHe: 'תודה על הזמנתך #{orderNumber}!\n\nסה"כ: {total} {currency}\n\nנודיע לך כשההזמנה תהיה מוכנה.',
      variables: ['orderNumber', 'total', 'currency'],
      category: 'UTILITY',
      language: 'he',
      isActive: true,
    },
    {
      businessId,
      name: 'Payment Reminder',
      type: 'payment_reminder',
      content: 'Your order #{orderNumber} is waiting for payment.\n\nTotal: {total} {currency}\n\nPlease complete payment: {paymentLink}',
      contentHe: 'הזמנתך #{orderNumber} ממתינה לתשלום.\n\nסה"כ: {total} {currency}\n\nאנא השלם תשלום: {paymentLink}',
      variables: ['orderNumber', 'total', 'currency', 'paymentLink'],
      category: 'UTILITY',
      language: 'he',
      isActive: true,
    },
  ];
  
  return this.insertMany(defaultTemplates as any) as any;
};

// Prevent model overwrite
const MessageTemplate: Model<IMessageTemplate> =
  mongoose.models.MessageTemplate ||
  mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema);

export default MessageTemplate;

