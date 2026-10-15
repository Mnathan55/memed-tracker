import { Router } from 'express';
import { z } from 'zod';
import { Campaign } from '../models/Campaign';
import { Submission } from '../models/Submission';
import { authenticate, requireRole } from '../middleware/auth';
import { HttpError } from '../middleware/errorhandler';

const router = Router();

const targetSchema = z.object({
  views: z.number().int().positive(),
  payout: z.number().positive(),
});

const campaignSchema = z.object({
  name: z.string().trim().min(1),
  platform: z.enum(['instagram', 'youtube']),
  totalBudget: z.number().positive(),
  targets: z.array(targetSchema).min(1),
});

// brand creates a campaign
router.post('/', authenticate, requireRole('brand'), async (req, res) => {
  const data = campaignSchema.parse(req.body);

  // highest payout cannot be more than the whole budget
  const biggest = Math.max(...data.targets.map((t) => t.payout));
  if (biggest > data.totalBudget) {
    throw new HttpError(400, 'A target payout cannot be more than the total budget');
  }

  const campaign = await Campaign.create({ ...data, brand: req.user!.id });
  res.status(201).json(campaign);
});

// brand sees own campaigns with spent and remaining
router.get('/mine', authenticate, requireRole('brand'), async (req, res) => {
  const list = await Campaign.find({ brand: req.user!.id }).sort({ createdAt: -1 });

  const result = list.map((c) => ({
    id: c._id,
    name: c.name,
    platform: c.platform,
    totalBudget: c.totalBudget,
    spent: c.spent,
    remaining: c.totalBudget - c.spent,
    targets: c.targets,
    status: c.status,
  }));

  res.json(result);
});

// creator sees live campaigns
router.get('/', authenticate, requireRole('creator'), async (_req, res) => {
  const list = await Campaign.find({ status: 'live' }).sort({ createdAt: -1 });
  res.json(list);
});

// creator submits a post link
const submitSchema = z.object({
  postUrl: z.string().trim().url(),
});

router.post('/:id/submissions', authenticate, requireRole('creator'), async (req, res) => {
  const data = submitSchema.parse(req.body);

  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new HttpError(404, 'Campaign not found');
  if (campaign.status !== 'live') throw new HttpError(400, 'This campaign is not live');

  // link must match the platform
  const host = new URL(data.postUrl).hostname.replace('www.', '');
  const instagramOk = campaign.platform === 'instagram' && host === 'instagram.com';
  const youtubeOk =
    campaign.platform === 'youtube' && (host === 'youtube.com' || host === 'youtu.be');
  if (!instagramOk && !youtubeOk) {
    throw new HttpError(400, `Link must be a ${campaign.platform} link`);
  }

  const submission = await Submission.create({
    campaign: campaign._id,
    creator: req.user!.id,
    postUrl: data.postUrl,
  });

  res.status(201).json(submission);
});

export default router;