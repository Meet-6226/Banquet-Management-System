import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHall {
    name: string;
    capacity: number;
    amenities: string[];
}

const HallSchema = new Schema<IHall>(
    {
        name: { type: String, required: true, trim: true },
        capacity: { type: Number, required: true, min: 1 },
        amenities: [{ type: String, trim: true }],
    },
    { _id: true }
);

export interface IBranch extends Document {
    name: string;
    location: string;
    halls: IHall[];
    managerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
    {
        name: {
            type: String,
            required: [true, 'Branch name is required'],
            trim: true,
            maxlength: [150, 'Branch name cannot exceed 150 characters'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        halls: { type: [HallSchema], default: [] },
        managerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

BranchSchema.index({ name: 1 });

const Branch: Model<IBranch> =
    mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);

export default Branch;
