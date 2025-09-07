import mongoose, { Schema, Document } from 'mongoose';

export interface IContactLead extends Document {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
    source: string; // e.g., 'contact_form', 'pricing_section', 'hero_section'
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
    createdAt: Date;
    updatedAt: Date;
    emailSent: boolean;
    emailSentAt?: Date;
    notes?: string;
}

const ContactLeadSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxLength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',
            ],
        },
        phone: {
            type: String,
            trim: true,
            maxLength: [20, 'Phone number cannot exceed 20 characters'],
        },
        company: {
            type: String,
            trim: true,
            maxLength: [100, 'Company name cannot exceed 100 characters'],
        },
        message: {
            type: String,
            trim: true,
            maxLength: [1000, 'Message cannot exceed 1000 characters'],
        },
        source: {
            type: String,
            required: true,
            enum: ['contact_form', 'pricing_section', 'hero_section', 'whatsapp_button'],
            default: 'contact_form',
        },
        status: {
            type: String,
            enum: ['new', 'contacted', 'qualified', 'converted', 'closed'],
            default: 'new',
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
        emailSentAt: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
            maxLength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes for better query performance
ContactLeadSchema.index({ email: 1 });
ContactLeadSchema.index({ createdAt: -1 });
ContactLeadSchema.index({ status: 1 });

// Prevent duplicate model compilation in development
const ContactLead = mongoose.models.ContactLead || mongoose.model<IContactLead>('ContactLead', ContactLeadSchema);

export default ContactLead;
