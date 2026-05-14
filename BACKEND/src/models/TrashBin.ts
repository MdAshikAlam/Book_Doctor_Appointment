import mongoose, { Schema, Document } from 'mongoose';

export interface ITrashBin extends Document {
  originalId: mongoose.Types.ObjectId;
  collectionName: string;
  data: any;
  deletedBy: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId; // The admin this data belongs to (to group related items)
  deletedAt: Date;
}

const trashBinSchema = new Schema<ITrashBin>(
  {
    originalId: { type: Schema.Types.ObjectId, required: true },
    collectionName: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// TTL Index: Automatically delete after 60 days (60 * 24 * 60 * 60 seconds)
trashBinSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 5184000 });
trashBinSchema.index({ adminId: 1 });

const TrashBin = mongoose.model<ITrashBin>('TrashBin', trashBinSchema);
export default TrashBin;
