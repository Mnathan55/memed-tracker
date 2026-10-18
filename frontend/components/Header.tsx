'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout, User } from '@/lib/api';
import Logo from './Logo';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // read localStorage after the page loads, so server and browser html match
  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="nav">
      <Logo />
      <div className="nav-right">
        {user && <span className="pill pill-purple">{user.role}</span>}
        <span className="nav-name">{user?.name}</span>
        <button className="btn-small btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}