import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentProviderType = 
  | 'stripe' 
  | 'paypal' 
  | 'tranzila' 
  | 'meshulam' 
  | 'cardcom'
  | 'payplus'
  | 'other';

export interface IPaymentProviderCredentials {
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  terminalId?: string;
  publicKey?: string;
  [key: string]: any; // Allow additional provider-specific fields
}

export interface IPaymentProvider extends Document {
  businessId: mongoose.Types.ObjectId;
  
  // Provider details
  provider: PaymentProviderType;
  providerName: string; // Display name
  
  // Credentials (encrypted)
  credentials: string; // Encrypted JSON string
  
  // Webhook configuration
  webhookSecret: string;
  webhookUrl?: string;
  
  // Configuration
  testMode: boolean;
  isActive: boolean;
  isPrimary: boolean; // Primary payment method for this business
  
  // Supported features
  supportedCurrencies: string[];
  supportedPaymentMethods: string[]; // e.g., ['card', 'apple_pay', 'google_pay']
  
  // Limits and fees
  minAmount?: number;
  maxAmount?: number;
  feePercentage?: number;
  fixedFee?: number;
  
  // Status tracking
  lastHealthCheck?: Date;
  healthStatus: 'healthy' | 'warning' | 'error' | 'unknown';
  errorMessage?: string;
  
  // Usage statistics
  transactionCount: number;
  totalVolume: number;
  lastTransactionAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isHealthy(): boolean;
  canProcessAmount(amount: number): boolean;
  calculateFee(amount: number): number;
  incrementTransaction(amount: number): Promise<void>;
  markAsError(errorMessage: string): Promise<void>;
}

const PaymentProviderSchema = new Schema<IPaymentProvider>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'tranzila', 'meshulam', 'cardcom', 'payplus', 'other'],
      required: [true, 'Provider type is required'],
      index: true,
    },
    providerName: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
    },
    
    credentials: {
      type: String,
      required: [true, 'Credentials are required'],
      select: false, // Don't return by default for security
    },
    
    webhookSecret: {
      type: String,
      required: true,
      select: false, // Don't return by default for security
    },
    webhookUrl: {
      type: String,
      trim: true,
    },
    
    testMode: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    supportedCurrencies: {
      type: [String],
      default: ['ILS'],
    },
    supportedPaymentMethods: {
      type: [String],
      default: ['card'],
    },
    
    minAmount: {
      type: Number,
      min: 0,
    },
    maxAmount: {
      type: Number,
      min: 0,
    },
    feePercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    fixedFee: {
      type: Number,
      min: 0,
    },
    
    lastHealthCheck: {
      type: Date,
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'warning', 'error', 'unknown'],
      default: 'unknown',
      index: true,
    },
    errorMessage: {
      type: String,
    },
    
    transactionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastTransactionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'payment_providers',
  }
);

// Indexes
PaymentProviderSchema.index({ businessId: 1, isActive: 1 });
PaymentProviderSchema.index({ businessId: 1, isPrimary: 1 });
PaymentProviderSchema.index({ businessId: 1, provider: 1 });

// Ensure only one primary provider per business
PaymentProviderSchema.index(
  { businessId: 1, isPrimary: 1 },
  { 
    unique: true, 
    partialFilterExpression: { isPrimary: true },
    name: 'unique_primary_provider'
  }
);

// Instance methods
PaymentProviderSchema.methods.isHealthy = function (): boolean {
  return this.healthStatus === 'healthy' && this.isActive;
};

PaymentProviderSchema.methods.canProcessAmount = function (amount: number): boolean {
  if (!this.isActive) return false;
  if (this.minAmount && amount < this.minAmount) return false;
  if (this.maxAmount && amount > this.maxAmount) return false;
  return true;
};

PaymentProviderSchema.methods.calculateFee = function (amount: number): number {
  let fee = 0;
  
  if (this.feePercentage) {
    fee += (amount * this.feePercentage) / 100;
  }
  
  if (this.fixedFee) {
    fee += this.fixedFee;
  }
  
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

PaymentProviderSchema.methods.incrementTransaction = async function (amount: number): Promise<void> {
  this.transactionCount += 1;
  this.totalVolume += amount;
  this.lastTransactionAt = new Date();
  await this.save();
};

PaymentProviderSchema.methods.markAsError = async function (errorMessage: string): Promise<void> {
  this.healthStatus = 'error';
  this.errorMessage = errorMessage;
  this.lastHealthCheck = new Date();
  await this.save();
};

// Static methods
PaymentProviderSchema.statics.findPrimaryProvider = async function (
  businessId: mongoose.Types.ObjectId
): Promise<IPaymentProvider | null> {
  return this.findOne({
    businessId,
    isPrimary: true,
    isActive: true,
  }).select('+credentials +webhookSecret');
};

PaymentProviderSchema.statics.findActiveProviders = async function (
  businessId: mongoose.Types.ObjectId
): Promise<IPaymentProvider[]> {
  return this.find({
    businessId,
    isActive: true,
  }).sort({ isPrimary: -1, createdAt: 1 });
};

PaymentProviderSchema.statics.setPrimary = async function (
  businessId: mongoose.Types.ObjectId,
  providerId: mongoose.Types.ObjectId
): Promise<void> {
  // Remove primary flag from all providers for this business
  await this.updateMany(
    { businessId },
    { $set: { isPrimary: false } }
  );
  
  // Set the new primary provider
  await this.updateOne(
    { _id: providerId, businessId },
    { $set: { isPrimary: true } }
  );
};

// Prevent model overwrite
const PaymentProvider: Model<IPaymentProvider> =
  mongoose.models.PaymentProvider ||
  mongoose.model<IPaymentProvider>('PaymentProvider', PaymentProviderSchema);

export default PaymentProvider;

