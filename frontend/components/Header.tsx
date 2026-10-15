'use client';

import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/api';

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="header">
      <h1>{title}</h1>
      <div>
        <span>{user?.name} </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}