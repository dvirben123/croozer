import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrderItem } from './Order';

export type ConversationStep = 
  | 'welcome' 
  | 'category_selection' 
  | 'product_selection' 
  | 'variant_selection' 
  | 'cart' 
  | 'checkout' 
  | 'payment' 
  | 'completed';

export interface IConversationState extends Document {
  businessId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  phoneNumber: string;
  
  // Conversation flow tracking
  currentStep: ConversationStep;
  previousStep?: ConversationStep;
  
  // Shopping cart
  cart: IOrderItem[];
  
  // Context for current step
  context: {
    selectedCategory?: string;
    selectedProduct?: mongoose.Types.ObjectId;
    currentVariantIndex?: number;
    awaitingInput?: string;
    lastBotMessage?: string;
    metadata?: Record<string, any>;
  };
  
  // Timestamps
  lastMessageAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isExpired(): boolean;
  addToCart(item: IOrderItem): void;
  removeFromCart(index: number): void;
  clearCart(): void;
  calculateTotal(): number;
  moveToStep(step: ConversationStep): Promise<void>;
}

const ConversationStateSchema = new Schema<IConversationState>(
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
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    
    currentStep: {
      type: String,
      enum: ['welcome', 'category_selection', 'product_selection', 'variant_selection', 'cart', 'checkout', 'payment', 'completed'],
      default: 'welcome',
      required: true,
    },
    previousStep: {
      type: String,
      enum: ['welcome', 'category_selection', 'product_selection', 'variant_selection', 'cart', 'checkout', 'payment', 'completed'],
    },
    
    cart: {
      type: [{
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, default: 'ILS' },
        variants: [String],
        notes: String,
        subtotal: { type: Number, required: true },
      }],
      default: [],
    },
    
    context: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'conversation_states',
  }
);

// Indexes
ConversationStateSchema.index({ businessId: 1, phoneNumber: 1 });
ConversationStateSchema.index({ customerId: 1, businessId: 1 });
ConversationStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Instance methods
ConversationStateSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

ConversationStateSchema.methods.addToCart = function (item: IOrderItem): void {
  this.cart.push(item);
  this.markModified('cart');
};

ConversationStateSchema.methods.removeFromCart = function (index: number): void {
  if (index >= 0 && index < this.cart.length) {
    this.cart.splice(index, 1);
    this.markModified('cart');
  }
};

ConversationStateSchema.methods.clearCart = function (): void {
  this.cart = [];
  this.markModified('cart');
};

ConversationStateSchema.methods.calculateTotal = function (): number {
  return this.cart.reduce((total: number, item: IOrderItem) => total + item.subtotal, 0);
};

ConversationStateSchema.methods.moveToStep = async function (step: ConversationStep): Promise<void> {
  this.previousStep = this.currentStep;
  this.currentStep = step;
  this.lastMessageAt = new Date();
  await this.save();
};

// Static methods
ConversationStateSchema.statics.findOrCreate = async function (
  businessId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId,
  phoneNumber: string
): Promise<IConversationState> {
  let conversation = await this.findOne({
    businessId,
    phoneNumber,
    expiresAt: { $gt: new Date() },
  });

  if (!conversation) {
    // Create new conversation with 24-hour expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    conversation = await this.create({
      businessId,
      customerId,
      phoneNumber,
      currentStep: 'welcome',
      cart: [],
      context: {},
      lastMessageAt: new Date(),
      expiresAt,
    });
  }

  return conversation;
};

ConversationStateSchema.statics.cleanupExpired = async function (): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount || 0;
};

// Prevent model overwrite
const ConversationState: Model<IConversationState> =
  mongoose.models.ConversationState ||
  mongoose.model<IConversationState>('ConversationState', ConversationStateSchema);

export default ConversationState;

