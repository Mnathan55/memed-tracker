import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { HttpError } from '../middleware/errorhandler';

const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(['brand', 'creator']),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function makeToken(id: string, role: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const data = signupSchema.parse(req.body);
  const email = data.email.toLowerCase();

  const exists = await User.findOne({ email });
  if (exists) throw new HttpError(409, 'Email is already registered');

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email,
    password: hashed,
    role: data.role,
  });

  const token = makeToken(user._id.toString(), user.role);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/login', async (req, res) => {
  const data = loginSchema.parse(req.body);
  const email = data.email.toLowerCase();

  const user = await User.findOne({ email });
  if (!user) throw new HttpError(401, 'Wrong email or password');

  const ok = await bcrypt.compare(data.password, user.password);
  if (!ok) throw new HttpError(401, 'Wrong email or password');

  const token = makeToken(user._id.toString(), user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;