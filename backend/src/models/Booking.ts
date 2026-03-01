import mongoose, { Schema, Document, Model } from 'mongoose';
import { type BookingStatus } from '@/config/constants';

export interface IBooking extends Document {
    branchId: mongoose.Types.ObjectId;
    hallId: mongoose.Types.ObjectId;
    eventDate: Date;
    startTime: string;
    endTime: string;
    customerId: mongoose.Types.ObjectId;
    guestCount: number;
    status: BookingStatus;
    advancePayment: number;
    balancePayment: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, 'Branch is required'] },
        hallId: { type: Schema.Types.ObjectId, required: [true, 'Hall is required'] },
        eventDate: { type: Date, required: [true, 'Event date is required'] },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
        },
        customerId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Customer is required'] },
        guestCount: { type: Number, required: [true, 'Guest count is required'], min: [1, 'Must have at least 1 guest'] },
        status: {
            type: String,
            enum: ['Confirmed', 'Tentative', 'Cancelled'],
            default: 'Tentative',
        },
        advancePayment: { type: Number, default: 0, min: [0, 'Advance payment cannot be negative'] },
        balancePayment: { type: Number, default: 0, min: [0, 'Balance payment cannot be negative'] },
        totalAmount: { type: Number, required: [true, 'Total amount is required'], min: [0, 'Total amount cannot be negative'] },
    },
    { timestamps: true }
);

BookingSchema.pre('save', function (next) {
    this.balancePayment = this.totalAmount - this.advancePayment;
    next();
});

BookingSchema.index({ branchId: 1, eventDate: 1 });
BookingSchema.index({ hallId: 1, eventDate: 1 });
BookingSchema.index({ customerId: 1 });

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
