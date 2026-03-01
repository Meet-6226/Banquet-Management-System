import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem {
    name: string;
    qtyPerGuest: number;
    unitCost: number;
}

const MenuItemSchema = new Schema<IMenuItem>(
    {
        name: { type: String, required: true, trim: true },
        qtyPerGuest: { type: Number, required: true, min: 0 },
        unitCost: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

export interface IEvent extends Document {
    bookingId: mongoose.Types.ObjectId;
    menuItems: IMenuItem[];
    vendors: mongoose.Types.ObjectId[];
    checklistStatus: Record<string, boolean>;
    guestCount: number;
    extraCharges: number;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: [true, 'Booking reference is required'] },
        menuItems: { type: [MenuItemSchema], default: [] },
        vendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
        checklistStatus: { type: Schema.Types.Mixed, default: {} },
        guestCount: { type: Number, required: [true, 'Guest count is required'], min: [1, 'Guest count must be at least 1'] },
        extraCharges: { type: Number, default: 0, min: [0, 'Extra charges cannot be negative'] },
    },
    { timestamps: true }
);

EventSchema.index({ bookingId: 1 });

const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
