import mongoose, { Schema, Document } from 'mongoose';

export interface IIncomingMessage extends Document {
  // Message identifiers
  messageId: string;
  whatsappBusinessAccountId: string;
  
  // Sender information
  from: string;
  fromName?: string;
  
  // Message content
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | 'sticker' | 'reaction';
  timestamp: Date;
  
  // Content based on type
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  documentUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  
  // Metadata
  context?: {
    from: string;
    id: string;
  };
  
  // Processing status
  processed: boolean;
  processedAt?: Date;
  replied: boolean;
  repliedAt?: Date;
  
  // Business reference (for multi-tenant)
  businessId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const IncomingMessageSchema = new Schema<IIncomingMessage>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    whatsappBusinessAccountId: {
      type: String,
      required: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      index: true,
    },
    fromName: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contacts', 'sticker', 'reaction'],
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    text: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    documentUrl: {
      type: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      name: String,
      address: String,
    },
    context: {
      from: String,
      id: String,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    processedAt: {
      type: Date,
    },
    replied: {
      type: Boolean,
      default: false,
    },
    repliedAt: {
      type: Date,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
IncomingMessageSchema.index({ from: 1, timestamp: -1 });
IncomingMessageSchema.index({ whatsappBusinessAccountId: 1, timestamp: -1 });
IncomingMessageSchema.index({ processed: 1, timestamp: 1 });

export const IncomingMessage =
  mongoose.models.IncomingMessage ||
  mongoose.model<IIncomingMessage>('IncomingMessage', IncomingMessageSchema);

