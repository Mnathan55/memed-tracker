import { Router } from 'express';
import { z } from 'zod';
import { Submission } from '../models/Submission';
import { authenticate, requireRole } from '../middleware/auth';
import { updateViews } from '../services/submission.service';

const router = Router();

// creator sees own posts and total earnings
router.get('/mine', authenticate, requireRole('creator'), async (req, res) => {
  const list = await Submission.find({ creator: req.user!.id })
    .populate('campaign', 'name platform')
    .sort({ createdAt: -1 });

  const totalEarnings = list.reduce((sum, s) => sum + s.paidAmount, 0);
  res.json({ totalEarnings, submissions: list });
});

const viewsSchema = z.object({
  views: z.number().int().min(0),
});

// simulates platform data, no role check on purpose
router.patch('/:id/views', async (req, res) => {
  const data = viewsSchema.parse(req.body);
  const result = await updateViews(req.params.id as string, data.views);
  res.json(result);
});

export default router;