import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusiness extends Document {
  userId: string; // Facebook user ID (owner)
  name: string;
  type: 'restaurant' | 'pizzeria' | 'retail' | 'service' | 'other';
  phone: string;
  email: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    language: string;
    businessHours?: {
      [day: string]: { open: string; close: string };
    };
  };
  whatsappAccountId?: mongoose.Types.ObjectId;
  status: 'active' | 'suspended' | 'trial' | 'pending_setup';
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    startDate: Date;
    expiresAt?: Date;
    features: string[];
  };
  onboarding: {
    completed: boolean;
    currentStep: number;
    stepsCompleted: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['restaurant', 'pizzeria', 'retail', 'service', 'other'],
      required: [true, 'Business type is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    settings: {
      currency: {
        type: String,
        default: 'ILS',
        enum: ['ILS', 'USD', 'EUR'],
      },
      timezone: {
        type: String,
        default: 'Asia/Jerusalem',
      },
      language: {
        type: String,
        default: 'he',
        enum: ['he', 'en', 'ar'],
      },
      businessHours: {
        type: Map,
        of: {
          open: String,
          close: String,
        },
      },
    },
    whatsappAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessWhatsAppAccount',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'pending_setup'],
      default: 'pending_setup',
      index: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      features: {
        type: [String],
        default: [],
      },
    },
    onboarding: {
      completed: {
        type: Boolean,
        default: false,
      },
      currentStep: {
        type: Number,
        default: 0,
      },
      stepsCompleted: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    collection: 'businesses',
  }
);

// Indexes
BusinessSchema.index({ userId: 1 });
BusinessSchema.index({ status: 1 });
BusinessSchema.index({ createdAt: -1 });
BusinessSchema.index({ userId: 1, status: 1 });

// Virtual for orders
BusinessSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'businessId',
});

// Virtual for customers
BusinessSchema.virtual('customers', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'businessId',
});

// Instance methods
BusinessSchema.methods.isActive = function (): boolean {
  return this.status === 'active';
};

BusinessSchema.methods.hasWhatsAppConnected = function (): boolean {
  return !!this.whatsappAccountId;
};

BusinessSchema.methods.isSubscriptionActive = function (): boolean {
  if (!this.subscription.expiresAt) return true; // No expiration
  return this.subscription.expiresAt > new Date();
};

// Prevent model overwrite
const Business: Model<IBusiness> =
  mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);

export default Business;
