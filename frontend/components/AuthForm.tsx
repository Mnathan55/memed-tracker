'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveLogin, Role, User } from '@/lib/api';

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
    <div className="box small">
      <h1>{mode === 'signup' ? 'Create account' : 'Login'}</h1>

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
          {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Login'}
        </button>
      </form>

      <p>
        {mode === 'signup' ? (
          <>Already have an account? <Link href="/login">Login</Link></>
        ) : (
          <>New here? <Link href="/signup">Sign up</Link></>
        )}
      </p>
    </div>
  );
}