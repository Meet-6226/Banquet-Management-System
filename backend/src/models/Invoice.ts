import mongoose, { Schema, Document, Model } from 'mongoose';
import { type PaymentStatus } from '@/config/constants';

export interface IInvoice extends Document {
    bookingId: mongoose.Types.ObjectId;
    totalAmount: number;
    taxAmount: number;
    advancePaid: number;
    balanceDue: number;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: [true, 'Booking reference is required'] },
        totalAmount: { type: Number, required: [true, 'Total amount is required'], min: [0, 'Total amount cannot be negative'] },
        taxAmount: { type: Number, default: 0, min: [0, 'Tax amount cannot be negative'] },
        advancePaid: { type: Number, default: 0, min: [0, 'Advance paid cannot be negative'] },
        balanceDue: { type: Number, default: 0 },
        paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
    },
    { timestamps: true }
);

InvoiceSchema.pre('save', function (next) {
    this.balanceDue = this.totalAmount + this.taxAmount - this.advancePaid;
    if (this.balanceDue <= 0) {
        this.paymentStatus = 'Paid';
        this.balanceDue = 0;
    } else if (this.advancePaid > 0) {
        this.paymentStatus = 'Partial';
    } else {
        this.paymentStatus = 'Unpaid';
    }
    next();
});

InvoiceSchema.index({ bookingId: 1 });
InvoiceSchema.index({ paymentStatus: 1 });

const Invoice: Model<IInvoice> =
    mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
