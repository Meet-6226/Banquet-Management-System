import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVendor extends Document {
    name: string;
    serviceType: string;
    contact: string;
    rating: number;
    branchId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
    {
        name: { type: String, required: [true, 'Vendor name is required'], trim: true },
        serviceType: { type: String, required: [true, 'Service type is required'], trim: true },
        contact: { type: String, required: [true, 'Contact is required'], trim: true },
        rating: { type: Number, default: 0, min: [0, 'Rating cannot be negative'], max: [5, 'Rating cannot exceed 5'] },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, 'Branch is required'] },
    },
    { timestamps: true }
);

VendorSchema.index({ branchId: 1 });
VendorSchema.index({ serviceType: 1 });

const Vendor: Model<IVendor> =
    mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;
