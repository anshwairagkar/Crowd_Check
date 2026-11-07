'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from './components/DashboardClient';

export default function CrowdMonitoringDashboard() {
  const router = useRouter();

  // Security check: Redirects to login if the user isn't authenticated
  useEffect(() => {
    const checkLogin = sessionStorage.getItem('isLoggedIn');
    if (!checkLogin) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <DashboardClient />
    </div>
  );
}
