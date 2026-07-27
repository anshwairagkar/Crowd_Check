'use client';

import React from 'react';
import { Users, AlertTriangle, Activity, Clock, TrendingUp, Eye } from 'lucide-react';
import { Venue, getDensityLevel } from './venueData';
import Icon from '@/components/ui/AppIcon';


interface SummaryKPIRowProps {
  venues: Venue[];
  onVenuesAtRiskClick?: () => void;
}

export default function SummaryKPIRow({ venues, onVenuesAtRiskClick }: SummaryKPIRowProps) {
  const totalPeople = venues.reduce((s, v) => s + v.presentCount, 0);
  const totalWaiting = venues.reduce((s, v) => s + v.waitingCount, 0);
  const totalCapacity = venues.reduce((s, v) => s + v.maxCapacity, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalPeople / totalCapacity) * 100) : 0;

  const highRisk = venues.filter(v => {
    const l = getDensityLevel(v.presentCount, v.maxCapacity);
    return l === 'HIGH' || l === 'CRITICAL';
  }).length;

  const totalCameras = venues.reduce((s, v) => s + v.cameraCount, 0);

  const kpis = [
    {
      id: 'kpi-total-people',
      label: 'People Monitored',
      value: totalPeople.toLocaleString(),
      subtext: `across ${venues.length} venues`,
      icon: Users,
      color: 'var(--primary)',
      bg: 'rgba(34,211,238,0.08)',
      border: 'rgba(34,211,238,0.15)',
      trend: null,
    },
    {
      id: 'kpi-high-risk',
      label: 'Venues at Risk',
      value: highRisk.toString(),
      subtext: highRisk > 0 ? 'require attention' : 'all clear',
      icon: AlertTriangle,
      color: highRisk > 0 ? 'var(--density-high)' : 'var(--density-low)',
      bg: highRisk > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.06)',
      border: highRisk > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)',
      trend: null,
      alert: highRisk > 0,
    },
    {
      id: 'kpi-avg-occupancy',
      label: 'Avg Occupancy',
      value: `${avgOccupancy}%`,
      subtext: 'network-wide',
      icon: Activity,
      color: avgOccupancy > 85 ? 'var(--density-high)' : avgOccupancy > 50 ? 'var(--density-medium)' : 'var(--density-low)',
      bg: avgOccupancy > 85 ? 'rgba(239,68,68,0.08)' : avgOccupancy > 50 ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.06)',
      border: avgOccupancy > 85 ? 'rgba(239,68,68,0.2)' : avgOccupancy > 50 ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)',
      trend: null,
    },
    {
      id: 'kpi-waiting',
      label: 'Waiting Outside',
      value: totalWaiting.toLocaleString(),
      subtext: 'in queues',
      icon: Clock,
      color: totalWaiting > 200 ? 'var(--density-medium)' : 'var(--muted-foreground)',
      bg: 'rgba(30,41,59,0.6)',
      border: 'var(--border)',
      trend: null,
    },
    {
      id: 'kpi-cameras',
      label: 'AI Cameras Online',
      value: totalCameras.toString(),
      subtext: 'all feeds active',
      icon: Eye,
      color: 'var(--density-low)',
      bg: 'rgba(34,197,94,0.06)',
      border: 'rgba(34,197,94,0.15)',
      trend: null,
    },
    {
      id: 'kpi-total-capacity',
      label: 'Total Capacity',
      value: totalCapacity.toLocaleString(),
      subtext: 'max simultaneous',
      icon: TrendingUp,
      color: 'var(--muted-foreground)',
      bg: 'rgba(30,41,59,0.6)',
      border: 'var(--border)',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        const isVenuesAtRisk = kpi.id === 'kpi-high-risk';
        return (
          <div
            key={kpi.id}
            className="rounded-xl border p-4 flex flex-col gap-2 card-hover"
            style={{
              background: kpi.bg,
              borderColor: kpi.border,
              cursor: isVenuesAtRisk && onVenuesAtRiskClick ? 'pointer' : 'default',
            }}
            onClick={isVenuesAtRisk && onVenuesAtRiskClick ? onVenuesAtRiskClick : undefined}
            role={isVenuesAtRisk && onVenuesAtRiskClick ? 'button' : undefined}
            tabIndex={isVenuesAtRisk && onVenuesAtRiskClick ? 0 : undefined}
            onKeyDown={isVenuesAtRisk && onVenuesAtRiskClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onVenuesAtRiskClick(); } : undefined}
            aria-label={isVenuesAtRisk ? 'Filter to show venues at risk' : undefined}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {kpi.label}
              </p>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}18` }}
              >
                <Icon size={14} style={{ color: kpi.color }} />
              </div>
            </div>
            <p
              className="text-2xl font-bold text-tabular leading-none"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {kpi.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
