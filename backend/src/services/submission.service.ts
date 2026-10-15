import mongoose from 'mongoose';
import { Submission } from '../models/Submission';
import { Campaign } from '../models/Campaign';
import { computePayoutDelta } from './payout';
import { HttpError } from '../middleware/errorhandler';

export async function updateViews(id: string, views: number) {
  const session = await mongoose.startSession();

  try {
    let result = { views: 0, paid: 0, totalPaid: 0 };

    await session.withTransaction(async () => {
      const submission = await Submission.findById(id).session(session);
      if (!submission) throw new HttpError(404, 'Submission not found');

      const campaign = await Campaign.findById(submission.campaign).session(session);
      if (!campaign) throw new HttpError(404, 'Campaign not found');

      const remaining = campaign.totalBudget - campaign.spent;
      const toPay = computePayoutDelta(views, campaign.targets, submission.paidAmount, remaining);

      if (toPay > 0) {
        // only succeeds if the money still fits right now
        const updated = await Campaign.findOneAndUpdate(
          { _id: campaign._id, $expr: { $lte: [{ $add: ['$spent', toPay] }, '$totalBudget'] } },
          { $inc: { spent: toPay } },
          { session, new: true }
        );
        if (!updated) throw new HttpError(409, 'Budget changed, please try again');

        // budget finished, close the campaign
        if (updated.spent >= updated.totalBudget) {
          updated.status = 'exhausted';
          await updated.save({ session });
        }
      }

      // views never go down
      submission.views = Math.max(submission.views, views);
      submission.paidAmount += toPay;
      submission.lastViewsAt = new Date();
      await submission.save({ session });

      result = { views: submission.views, paid: toPay, totalPaid: submission.paidAmount };
    });

    return result;
  } finally {
    await session.endSession();
  }
}