import mongoose, { Schema, Document, Model } from 'mongoose';
import { type POStatus } from '@/config/constants';

export interface IPOItem {
    inventoryItemId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
}

const POItemSchema = new Schema<IPOItem>(
    {
        inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

export interface IPurchaseOrder extends Document {
    branchId: mongoose.Types.ObjectId;
    supplierId: mongoose.Types.ObjectId;
    items: IPOItem[];
    status: POStatus;
    totalCost: number;
    createdAt: Date;
    updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
    {
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, 'Branch is required'] },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: [true, 'Supplier is required'] },
        items: {
            type: [POItemSchema],
            validate: { validator: (v: IPOItem[]) => v.length > 0, message: 'At least one item is required' },
        },
        status: { type: String, enum: ['Pending', 'Approved', 'Delivered', 'Cancelled'], default: 'Pending' },
        totalCost: { type: Number, default: 0, min: [0, 'Total cost cannot be negative'] },
    },
    { timestamps: true }
);

PurchaseOrderSchema.pre('save', function (next) {
    this.totalCost = this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    next();
});

PurchaseOrderSchema.index({ branchId: 1, status: 1 });

const PurchaseOrder: Model<IPurchaseOrder> =
    mongoose.models.PurchaseOrder ||
    mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

export default PurchaseOrder;
