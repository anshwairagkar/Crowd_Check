import React from 'react';
import DashboardTopbar from './components/DashboardTopbar';
import DashboardClient from './components/DashboardClient';

export default function CrowdMonitoringDashboard() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <DashboardTopbar />
      <DashboardClient />
    </div>
  );
}
