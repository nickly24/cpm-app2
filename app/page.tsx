'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !isRedirecting) {
      setIsRedirecting(true);
      // Перенаправляем на соответствующий кабинет
      if (user.role === 'student') {
        router.push('/student');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'proctor') {
        router.push('/proctor');
      } else if (user.role === 'supervisor') {
        router.push('/supervisor');
      }
    }
  }, [user, isLoading, router, isRedirecting]);

  if (isLoading || (user && !isRedirecting)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  return <LoginPage />;
}
