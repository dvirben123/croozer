import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusinessWhatsAppAccount extends Document {
  businessId: mongoose.Types.ObjectId;
  userId: string; // Croozer user ID (from session)
  facebookUserId?: string; // Facebook user ID (who performed embedded signup)

  // WhatsApp Business Account details
  whatsappBusinessAccountId: string;
  phoneNumberId: string;
  phoneNumber: string;
  displayName: string;

  // Access credentials (ENCRYPTED)
  accessToken: string; // Will be encrypted before saving
  tokenType: 'permanent' | 'temporary';
  tokenExpiresAt?: Date;
  refreshToken?: string; // Will be encrypted before saving

  // Webhook configuration
  webhookVerifyToken: string;
  webhookSubscribed: boolean;
  subscribedFields: string[];

  // Permissions and limits
  permissions: string[];
  tier: 'free' | 'core' | 'business' | 'unlimited';
  messagingLimit: number;

  // Status and health
  status: 'pending' | 'active' | 'suspended' | 'disconnected' | 'error';
  lastHealthCheck?: Date;
  errorMessage?: string;

  // Metadata
  connectedAt: Date;
  lastMessageSentAt?: Date;
  lastMessageReceivedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isActive(): boolean;
  isHealthy(): boolean;
  needsTokenRefresh(): boolean;
  updateLastMessageSent(): Promise<void>;
  updateLastMessageReceived(): Promise<void>;
  markAsError(errorMessage: string): Promise<void>;
}

const BusinessWhatsAppAccountSchema = new Schema<IBusinessWhatsAppAccount>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    facebookUserId: {
      type: String,
      required: false,
    },

    // WhatsApp Business Account details
    whatsappBusinessAccountId: {
      type: String,
      required: [true, 'WhatsApp Business Account ID is required'],
    },
    phoneNumberId: {
      type: String,
      required: [true, 'Phone Number ID is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },

    // Access credentials (will be encrypted)
    accessToken: {
      type: String,
      required: [true, 'Access token is required'],
    },
    tokenType: {
      type: String,
      enum: ['permanent', 'temporary'],
      default: 'permanent',
    },
    tokenExpiresAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },

    // Webhook configuration
    webhookVerifyToken: {
      type: String,
      required: true,
    },
    webhookSubscribed: {
      type: Boolean,
      default: false,
    },
    subscribedFields: {
      type: [String],
      default: ['messages', 'message_status'],
    },

    // Permissions and limits
    permissions: {
      type: [String],
      default: [],
    },
    tier: {
      type: String,
      enum: ['free', 'core', 'business', 'unlimited'],
      default: 'free',
    },
    messagingLimit: {
      type: Number,
      default: 1000, // Messages per 24 hours
    },

    // Status and health
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'disconnected', 'error'],
      default: 'pending',
    },
    lastHealthCheck: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },

    // Metadata
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageSentAt: {
      type: Date,
    },
    lastMessageReceivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'business_whatsapp_accounts',
  }
);

// Indexes
BusinessWhatsAppAccountSchema.index({ businessId: 1 }, { unique: true });
BusinessWhatsAppAccountSchema.index({ whatsappBusinessAccountId: 1 }, { unique: true });
BusinessWhatsAppAccountSchema.index({ phoneNumberId: 1 });
BusinessWhatsAppAccountSchema.index({ status: 1 });
BusinessWhatsAppAccountSchema.index({ userId: 1 });

// Instance methods
BusinessWhatsAppAccountSchema.methods.isActive = function (): boolean {
  return this.status === 'active';
};

BusinessWhatsAppAccountSchema.methods.isHealthy = function (): boolean {
  if (!this.lastHealthCheck) return false;
  const hoursSinceCheck = (Date.now() - this.lastHealthCheck.getTime()) / (1000 * 60 * 60);
  return hoursSinceCheck < 24 && this.status === 'active';
};

BusinessWhatsAppAccountSchema.methods.needsTokenRefresh = function (): boolean {
  if (this.tokenType === 'permanent') return false;
  if (!this.tokenExpiresAt) return false;
  const hoursUntilExpiry = (this.tokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntilExpiry < 24; // Refresh if less than 24 hours remaining
};

BusinessWhatsAppAccountSchema.methods.updateLastMessageSent = async function (): Promise<void> {
  this.lastMessageSentAt = new Date();
  await this.save();
};

BusinessWhatsAppAccountSchema.methods.updateLastMessageReceived = async function (): Promise<void> {
  this.lastMessageReceivedAt = new Date();
  await this.save();
};

BusinessWhatsAppAccountSchema.methods.markAsError = async function (errorMessage: string): Promise<void> {
  this.status = 'error';
  this.errorMessage = errorMessage;
  await this.save();
};

// Static methods
BusinessWhatsAppAccountSchema.statics.findByPhoneNumberId = function (phoneNumberId: string) {
  return this.findOne({ phoneNumberId });
};

BusinessWhatsAppAccountSchema.statics.findByBusinessId = function (businessId: mongoose.Types.ObjectId) {
  return this.findOne({ businessId });
};

// Prevent model overwrite
const BusinessWhatsAppAccount: Model<IBusinessWhatsAppAccount> =
  mongoose.models.BusinessWhatsAppAccount ||
  mongoose.model<IBusinessWhatsAppAccount>('BusinessWhatsAppAccount', BusinessWhatsAppAccountSchema);

export default BusinessWhatsAppAccount;
