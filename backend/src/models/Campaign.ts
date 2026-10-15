import { Schema, model, Types } from 'mongoose';
import { Target } from '../services/payout';

export interface ICampaign {
  brand: Types.ObjectId;
  name: string;
  platform: 'instagram' | 'youtube';
  totalBudget: number;
  spent: number;
  targets: Target[];
  status: 'live' | 'exhausted';
}

const targetSchema = new Schema<Target>(
  {
    views: { type: Number, required: true, min: 1 },
    payout: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// views and payout must both go up from one target to the next
function targetsAreValid(list: Target[]): boolean {
  if (list.length === 0) return false;

  for (let i = 1; i < list.length; i++) {
    const before = list[i - 1];
    const now = list[i];
    if (now.views <= before.views || now.payout <= before.payout) {
      return false;
    }
  }

  return true;
}

const campaignSchema = new Schema<ICampaign>(
  {
    brand: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['instagram', 'youtube'], required: true },
    totalBudget: { type: Number, required: true, min: 1 },
    spent: { type: Number, default: 0, min: 0 },
    targets: {
      type: [targetSchema],
      validate: {
        validator: targetsAreValid,
        message: 'Targets must be in increasing order of views and payout',
      },
    },
    status: { type: String, enum: ['live', 'exhausted'], default: 'live', index: true },
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>('Campaign', campaignSchema);