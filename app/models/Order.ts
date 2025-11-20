import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  variants?: string[];
  notes?: string;
  subtotal: number;
}

export interface IDeliveryAddress {
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

export interface IOrderTimeline {
  status: string;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
}

export interface IOrder extends Document {
  businessId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;

  // Order details
  orderNumber: string;
  items: IOrderItem[];

  // Pricing
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  currency: string;

  // Status tracking
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online' | 'other';
  paymentProviderId?: mongoose.Types.ObjectId; // Reference to PaymentProvider used
  paymentLinkUrl?: string; // Payment link sent to customer

  // Source tracking
  source: 'whatsapp' | 'manual' | 'web' | 'phone';
  whatsappMessageId?: string;
  whatsappConversationId?: string;

  // Customer details
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;

  // Delivery details
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: IDeliveryAddress;
  deliveryTime?: Date;

  // Additional info
  notes?: string;
  customerNotes?: string;
  specialInstructions?: string;

  // Timeline
  timeline: IOrderTimeline[];

  // Timestamps
  orderedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Virtual methods
  isPending(): boolean;
  isCompleted(): boolean;
  isCancelled(): boolean;
  canBeCancelled(): boolean;
  calculateTotal(): number;
}

const OrderSchema = new Schema<IOrder>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },

    // Order details
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: {
          type: String,
          required: [true, 'Item name is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },
        currency: {
          type: String,
          required: true,
          default: 'ILS',
        },
        variants: [String],
        notes: String,
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      min: [0, 'Delivery fee cannot be negative'],
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'ILS',
      enum: ['ILS', 'USD', 'EUR'],
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'other'],
    },
    paymentProviderId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentProvider',
    },
    paymentLinkUrl: {
      type: String,
      trim: true,
    },

    // Source tracking
    source: {
      type: String,
      enum: ['whatsapp', 'manual', 'web', 'phone'],
      required: true,
      default: 'whatsapp',
    },
    whatsappMessageId: {
      type: String,
      index: true,
    },
    whatsappConversationId: {
      type: String,
    },

    // Customer details
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      index: true,
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
      lowercase: true,
    },

    // Delivery details
    deliveryType: {
      type: String,
      enum: ['pickup', 'delivery'],
    },
    deliveryAddress: {
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
    deliveryTime: {
      type: Date,
    },

    // Additional info
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    customerNotes: {
      type: String,
      maxlength: [500, 'Customer notes cannot exceed 500 characters'],
    },
    specialInstructions: {
      type: String,
      maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    },

    // Timeline
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: String,
          required: true,
        },
        notes: String,
      },
    ],

    // Timestamps
    orderedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    confirmedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

// Compound indexes
OrderSchema.index({ businessId: 1, createdAt: -1 });
OrderSchema.index({ businessId: 1, status: 1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ whatsappMessageId: 1 });

// Pre-save middleware to calculate total and add timeline
OrderSchema.pre('save', function (next) {
  // Calculate total if not set
  if (this.isModified('items') || this.isModified('subtotal')) {
    this.total = this.subtotal + (this.tax || 0) + (this.deliveryFee || 0) - (this.discount || 0);
  }

  // Add timeline entry if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: 'system', // Will be overridden by actual user
      notes: undefined,
    });

    // Update status-specific timestamps
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = new Date();
    }
    if (this.status === 'delivered' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }

  next();
});

// Instance methods
OrderSchema.methods.isPending = function (): boolean {
  return this.status === 'pending';
};

OrderSchema.methods.isCompleted = function (): boolean {
  return this.status === 'delivered';
};

OrderSchema.methods.isCancelled = function (): boolean {
  return this.status === 'cancelled';
};

OrderSchema.methods.canBeCancelled = function (): boolean {
  return !['delivered', 'cancelled'].includes(this.status);
};

OrderSchema.methods.calculateTotal = function (): number {
  const subtotal = this.items.reduce((sum: number, item: IOrderItem) => sum + item.subtotal, 0);
  return subtotal + (this.tax || 0) + (this.deliveryFee || 0) - (this.discount || 0);
};

// Static methods
OrderSchema.statics.generateOrderNumber = async function (businessId: mongoose.Types.ObjectId): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Count orders for this business today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const count = await this.countDocuments({
    businessId,
    createdAt: { $gte: startOfDay },
  });

  const orderNum = (count + 1).toString().padStart(4, '0');
  return `ORD-${dateStr}-${orderNum}`;
};

OrderSchema.statics.findByBusinessId = function (businessId: mongoose.Types.ObjectId, filters = {}) {
  return this.find({ businessId, ...filters }).sort({ createdAt: -1 });
};

OrderSchema.statics.findPendingOrders = function (businessId: mongoose.Types.ObjectId) {
  return this.find({
    businessId,
    status: { $in: ['pending', 'confirmed', 'preparing'] },
  }).sort({ createdAt: -1 });
};

// Prevent model overwrite
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
