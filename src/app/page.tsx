import React from 'react';
import DashboardClient from './components/DashboardClient';

export default function CrowdMonitoringDashboard() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <DashboardClient />
    </div>
  );
}
