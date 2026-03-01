import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryItem extends Document {
    branchId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unit: string;
    threshold: number;
    supplierId?: mongoose.Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
    {
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, 'Branch is required'] },
        name: { type: String, required: [true, 'Item name is required'], trim: true },
        quantity: { type: Number, required: [true, 'Quantity is required'], min: [0, 'Quantity cannot be negative'] },
        unit: { type: String, required: [true, 'Unit is required'], trim: true },
        threshold: { type: Number, default: 0, min: [0, 'Threshold cannot be negative'] },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Vendor', default: null },
    },
    { timestamps: true }
);

InventoryItemSchema.index({ branchId: 1, name: 1 });

const InventoryItem: Model<IInventoryItem> =
    mongoose.models.InventoryItem ||
    mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

export default InventoryItem;
