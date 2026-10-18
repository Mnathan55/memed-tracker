'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveLogin, Role, User } from '@/lib/api';
import Logo from './Logo';

interface AuthReply {
  token: string;
  user: User;
}

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('creator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = mode === 'signup' ? { name, email, password, role } : { email, password };
      const data = await api<AuthReply>(`/api/auth/${mode}`, { method: 'POST', body });

      saveLogin(data.token, data.user);
      router.push(data.user.role === 'brand' ? '/brand' : '/creator');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="hero">
  <Logo />
  <h1 style={{ marginTop: 16 }}>
    Run campaigns. <span className="hl-green">Hit milestones.</span>{' '}
    <span className="hl-pink">Get paid.</span>
  </h1>
  <p>
    Meme&apos;d is a creator marketplace. Brands launch campaigns on Instagram or YouTube,
    creators post for them, and payouts unlock as each post crosses a views milestone.
  </p>

  <div className="ladder">
  <div><span>Instagram</span><span>Reels and posts</span></div>
  <div><span>YouTube</span><span>Videos and shorts</span></div>
 
</div>
</div>
      <div className="card">
        <h2>{mode === 'signup' ? 'Join the squad ✨' : 'Welcome back 👋'}</h2>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {mode === 'signup' && (
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="creator">I am a creator</option>
              <option value="brand">I am a brand</option>
            </select>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : mode === 'signup' ? 'Sign up' : 'Login'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 14 }}>
          {mode === 'signup' ? (
            <>Already in? <Link href="/login">Login</Link></>
          ) : (
            <>New here? <Link href="/signup">Create an account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}