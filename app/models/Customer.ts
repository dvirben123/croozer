import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerAddress {
  street: string;
  city: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface ISavedAddress {
  label: string;
  address: ICustomerAddress;
}

export interface IDoNotDisturb {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface ICustomer extends Document {
  businessId: mongoose.Types.ObjectId;

  // Primary identifier
  whatsappPhone: string;

  // Customer details
  name?: string;
  email?: string;
  alternatePhone?: string;

  // Address
  defaultAddress?: ICustomerAddress;
  savedAddresses?: ISavedAddress[];

  // Statistics
  totalOrders: number;
  totalSpent: number;
  currency: string;
  averageOrderValue: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;

  // Preferences
  preferredPaymentMethod?: string;
  preferredDeliveryTime?: string;
  dietaryRestrictions?: string[];

  // Engagement
  tags: string[];
  segment?: string;
  notes?: string;

  // Communication preferences
  optInMarketing: boolean;
  preferredLanguage: string;
  doNotDisturb?: IDoNotDisturb;

  // WhatsApp specific
  whatsappName?: string;
  whatsappProfilePicture?: string;
  lastMessageAt?: Date;
  conversationStatus: 'active' | 'inactive' | 'blocked';

  createdAt: Date;
  updatedAt: Date;

  // Virtual methods
  isActive(): boolean;
  isVIP(): boolean;
  updateOrderStats(orderAmount: number): Promise<void>;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },

    // Primary identifier
    whatsappPhone: {
      type: String,
      required: [true, 'WhatsApp phone number is required'],
      trim: true,
      index: true,
    },

    // Customer details
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    alternatePhone: {
      type: String,
      trim: true,
    },

    // Address
    defaultAddress: {
      street: String,
      city: String,
      building: String,
      floor: String,
      apartment: String,
      notes: String,
      location: {
        lat: Number,
        lng: Number,
      },
    },
    savedAddresses: [
      {
        label: {
          type: String,
          required: true,
        },
        address: {
          street: String,
          city: String,
          building: String,
          floor: String,
          apartment: String,
          notes: String,
          location: {
            lat: Number,
            lng: Number,
          },
        },
      },
    ],

    // Statistics
    totalOrders: {
      type: Number,
      default: 0,
      min: [0, 'Total orders cannot be negative'],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative'],
    },
    currency: {
      type: String,
      default: 'ILS',
      enum: ['ILS', 'USD', 'EUR'],
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Average order value cannot be negative'],
    },
    lastOrderDate: {
      type: Date,
      index: true,
    },
    firstOrderDate: {
      type: Date,
    },

    // Preferences
    preferredPaymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'other'],
    },
    preferredDeliveryTime: {
      type: String,
    },
    dietaryRestrictions: [String],

    // Engagement
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    segment: {
      type: String,
      enum: ['new', 'regular', 'vip', 'at_risk', 'inactive'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    // Communication preferences
    optInMarketing: {
      type: Boolean,
      default: true,
    },
    preferredLanguage: {
      type: String,
      default: 'he',
      enum: ['he', 'en', 'ar'],
    },
    doNotDisturb: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: String,
      endTime: String,
    },

    // WhatsApp specific
    whatsappName: {
      type: String,
      trim: true,
    },
    whatsappProfilePicture: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    conversationStatus: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'customers',
  }
);

// Compound indexes
CustomerSchema.index({ businessId: 1, whatsappPhone: 1 }, { unique: true });
CustomerSchema.index({ businessId: 1, totalSpent: -1 });
CustomerSchema.index({ businessId: 1, lastOrderDate: -1 });
CustomerSchema.index({ businessId: 1, tags: 1 });

// Virtual for orders
CustomerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'customerId',
});

// Pre-save middleware to update segment based on statistics
CustomerSchema.pre('save', function (next) {
  if (this.isModified('totalOrders') || this.isModified('totalSpent')) {
    // Calculate average order value
    if (this.totalOrders > 0) {
      this.averageOrderValue = this.totalSpent / this.totalOrders;
    }

    // Auto-assign segment
    if (this.totalOrders === 0) {
      this.segment = 'new';
    } else if (this.totalSpent > 1000) {
      // VIP threshold (configurable)
      this.segment = 'vip';
    } else if (this.totalOrders >= 3) {
      this.segment = 'regular';
    } else {
      this.segment = 'new';
    }

    // Check for at-risk customers (no order in 30 days)
    if (this.lastOrderDate) {
      const daysSinceLastOrder = (Date.now() - this.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastOrder > 30 && this.totalOrders > 0) {
        this.segment = 'at_risk';
      }
      if (daysSinceLastOrder > 90) {
        this.segment = 'inactive';
      }
    }
  }

  next();
});

// Instance methods
CustomerSchema.methods.isActive = function (): boolean {
  return this.conversationStatus === 'active';
};

CustomerSchema.methods.isVIP = function (): boolean {
  return this.segment === 'vip' || this.totalSpent > 1000;
};

CustomerSchema.methods.updateOrderStats = async function (orderAmount: number): Promise<void> {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;
  this.lastOrderDate = new Date();

  if (!this.firstOrderDate) {
    this.firstOrderDate = new Date();
  }

  // Auto-tag VIP customers
  if (this.isVIP() && !this.tags.includes('VIP')) {
    this.tags.push('VIP');
  }

  await this.save();
};

// Static methods
CustomerSchema.statics.findByBusinessAndPhone = function (
  businessId: mongoose.Types.ObjectId,
  whatsappPhone: string
) {
  return this.findOne({ businessId, whatsappPhone });
};

CustomerSchema.statics.findOrCreate = async function (
  businessId: mongoose.Types.ObjectId,
  whatsappPhone: string,
  additionalData: Partial<ICustomer> = {}
) {
  let customer = await this.findOne({ businessId, whatsappPhone });

  if (!customer) {
    customer = await this.create({
      businessId,
      whatsappPhone,
      ...additionalData,
    });
  }

  return customer;
};

CustomerSchema.statics.findVIPCustomers = function (businessId: mongoose.Types.ObjectId) {
  return this.find({
    businessId,
    segment: 'vip',
  }).sort({ totalSpent: -1 });
};

CustomerSchema.statics.findAtRiskCustomers = function (businessId: mongoose.Types.ObjectId) {
  return this.find({
    businessId,
    segment: { $in: ['at_risk', 'inactive'] },
  }).sort({ lastOrderDate: 1 });
};

// Prevent model overwrite
const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
