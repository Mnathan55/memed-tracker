import { Schema, model, Types } from 'mongoose';

export interface ISubmission {
  campaign: Types.ObjectId;
  creator: Types.ObjectId;
  postUrl: string;
  views: number;
  paidAmount: number; // total paid so far: prevents double payment
  flagged: boolean;
  lastViewsAt?: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    postUrl: { type: String, required: true, trim: true },
    views: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    flagged: { type: Boolean, default: false },
    lastViewsAt: { type: Date },
  },
  { timestamps: true }
);

// Same creator can't submit the same link twice to the same campaign
submissionSchema.index({ campaign: 1, creator: 1, postUrl: 1 }, { unique: true });

export const Submission = model<ISubmission>('Submission', submissionSchema);