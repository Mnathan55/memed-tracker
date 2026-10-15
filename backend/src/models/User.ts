import { Schema, model } from 'mongoose';

export type Role = 'brand' | 'creator';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['brand', 'creator'], required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);