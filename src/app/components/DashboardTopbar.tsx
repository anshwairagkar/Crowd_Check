'use client';

import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Activity, Bell, Settings, Shield, AlertTriangle, X } from 'lucide-react';
import { Venue } from './venueData';

interface DashboardTopbarProps {
  venues?: Venue[]; // Added to accept live venue data
  onOpenAlerts?: () => void;
  onOpenShield?: () => void;
  onOpenSettings?: () => void;
}

export default function DashboardTopbar({
  venues = [], // Default to empty array if not passed
  onOpenAlerts,
  onOpenShield,
  onOpenSettings,
}: DashboardTopbarProps) {
  // Local state to toggle the custom dropdown window
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Filter venues mathematically: Present Count / Max Capacity >= 90%
  const overcrowdedVenues = venues.filter(v => (v.presentCount / v.maxCapacity) >= 0.9);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(6, 12, 24, 0.92)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer">
              <AppLogo size={32} />
              <span
                className="font-semibold text-lg tracking-tight"
                style={{ color: 'var(--foreground)' }}
              >
                Crowd Check
                <span
                  className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--primary)' }}
                >
                  AI
                </span>
              </span>
            </div>
          </div>

          {/* Center status */}
          <div
            className="hidden md:flex items-center gap-2 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full live-pulse"
                style={{ background: 'var(--density-low)' }}
              />
              <span>Live Monitoring Active</span>
            </span>
            <span className="mx-2 opacity-30">|</span>
            <Activity size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--primary)' }} className="font-medium">
              AI Camera Feeds Online
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            
            {/* Bell / Alerts Button Wrapper */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="relative p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
                aria-label="Alerts"
              >
                <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
                {/* Only show the red dot if there are actual overcrowded venues */}
                {overcrowdedVenues.length > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ background: 'var(--density-high)' }}
                  />
                )}
              </button>

              {/* NEW ALERTS DROPDOWN WINDOW */}
              {isAlertsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl z-50 overflow-hidden" 
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Alerts</h3>
                    <button onClick={() => setIsAlertsOpen(false)} className="hover:bg-white/5 p-1 rounded transition-colors">
                      <X size={14} style={{ color: 'var(--muted-foreground)' }}/>
                    </button>
                  </div>
                  
                  {/* Dropdown Content */}
                  <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                    {overcrowdedVenues.length === 0 ? (
                      <div className="p-4 text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                        All venues are currently at safe capacity.
                      </div>
                    ) : (
                      overcrowdedVenues.map(v => {
                        const pct = Math.round((v.presentCount / v.maxCapacity) * 100);
                        return (
                          <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
                            <AlertTriangle size={16} style={{ color: '#ef4444', marginTop: '2px' }} className="flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Crowd Alert: {v.name}</p>
                              <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--muted-foreground)' }}>
                                Avoid going to {v.name} right now. It is currently <span className="font-bold text-red-400">{pct}% full</span>.
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shield / Security Button */}
            <button
              onClick={onOpenShield}
              className="p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
              aria-label="Shield status"
            >
              <Shield size={18} style={{ color: 'var(--muted-foreground)' }} />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
              aria-label="Settings"
            >
              <Settings size={18} style={{ color: 'var(--muted-foreground)' }} />
            </button>
            
            {/* User Profile */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ml-2"
              style={{ background: 'rgba(34,211,238,0.15)', color: 'var(--primary)' }}
            >
              AW
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Ansh Wairagkar
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
