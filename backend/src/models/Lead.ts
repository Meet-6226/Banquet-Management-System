import mongoose, { Schema, Document, Model } from 'mongoose';
import { type LeadStatus } from '@/config/constants';

export interface ILead extends Document {
    name: string;
    contact: string;
    eventDate: Date;
    guestCount: number;
    budget: number;
    branchId: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
    status: LeadStatus;
    notes: string;
    followUpDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
    {
        name: { type: String, required: [true, 'Lead name is required'], trim: true },
        contact: { type: String, required: [true, 'Contact is required'], trim: true },
        eventDate: { type: Date, required: [true, 'Event date is required'] },
        guestCount: { type: Number, required: [true, 'Guest count is required'], min: [1, 'Guest count must be at least 1'] },
        budget: { type: Number, required: [true, 'Budget is required'], min: [0, 'Budget cannot be negative'] },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, 'Branch is required'] },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Assigned user is required'] },
        status: {
            type: String,
            enum: ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'],
            default: 'New',
        },
        notes: { type: String, default: '', trim: true },
        followUpDate: { type: Date, default: null },
    },
    { timestamps: true }
);

LeadSchema.index({ branchId: 1, status: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ eventDate: 1 });

const Lead: Model<ILead> =
    mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
