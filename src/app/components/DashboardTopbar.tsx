'use client';

import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Activity, Bell, Settings, Shield, AlertTriangle, X, Lock, EyeOff, Server, SlidersHorizontal } from 'lucide-react';
import { Venue } from './venueData';

interface DashboardTopbarProps {
  venues?: Venue[];
}

export default function DashboardTopbar({
  venues = [],
}: DashboardTopbarProps) {
  // Local state for all three dropdowns
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isShieldOpen, setIsShieldOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filter venues mathematically: Present Count / Max Capacity >= 90%
  const overcrowdedVenues = venues.filter(v => (v.presentCount / v.maxCapacity) >= 0.9);

  // Helper to close others when opening one
  const toggleDropdown = (menu: 'alerts' | 'shield' | 'settings') => {
    setIsAlertsOpen(menu === 'alerts' ? !isAlertsOpen : false);
    setIsShieldOpen(menu === 'shield' ? !isShieldOpen : false);
    setIsSettingsOpen(menu === 'settings' ? !isSettingsOpen : false);
  };

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
            
            {/* --- BELL / ALERTS --- */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('alerts')}
                className="relative p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
                aria-label="Alerts"
              >
                <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
                {overcrowdedVenues.length > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ background: 'var(--density-high)' }}
                  />
                )}
              </button>

              {isAlertsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl z-50 overflow-hidden" 
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Alerts</h3>
                    <button onClick={() => setIsAlertsOpen(false)} className="hover:bg-white/5 p-1 rounded transition-colors">
                      <X size={14} style={{ color: 'var(--muted-foreground)' }}/>
                    </button>
                  </div>
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

            {/* --- SHIELD / SECURITY --- */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('shield')}
                className="p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
                aria-label="Shield status"
              >
                <Shield size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>

              {isShieldOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl border shadow-xl z-50 overflow-hidden" 
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Network Security</h3>
                    <button onClick={() => setIsShieldOpen(false)} className="hover:bg-white/5 p-1 rounded transition-colors">
                      <X size={14} style={{ color: 'var(--muted-foreground)' }}/>
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock size={14} style={{ color: '#22c55e' }} />
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>AES-256 Encryption</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server size={14} style={{ color: '#22c55e' }} />
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>Mainframe Uplink</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Secure</span>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <EyeOff size={14} style={{ color: 'var(--primary)' }} />
                          <span className="text-sm" style={{ color: 'var(--foreground)' }}>Privacy Masking</span>
                        </div>
                        {/* Mock Toggle Switch */}
                        <div className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer" style={{ background: 'var(--primary)' }}>
                          <div className="w-3 h-3 rounded-full bg-white transform translate-x-4"></div>
                        </div>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>AI automatically blurs faces in CCTV feeds to protect identity.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- SETTINGS / PREFERENCES --- */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('settings')}
                className="p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
                aria-label="Settings"
              >
                <Settings size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>

              {isSettingsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl border shadow-xl z-50 overflow-hidden" 
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Preferences</h3>
                    <button onClick={() => setIsSettingsOpen(false)} className="hover:bg-white/5 p-1 rounded transition-colors">
                      <X size={14} style={{ color: 'var(--muted-foreground)' }}/>
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>Alert Threshold</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>90%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--surface-3)' }}>
                        <div className="w-[90%] h-full rounded-full" style={{ background: 'var(--primary)' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>Refresh Rate</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>3s</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1 text-xs rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>1s</button>
                        <button className="flex-1 py-1 text-xs rounded border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(34,211,238,0.1)' }}>3s</button>
                        <button className="flex-1 py-1 text-xs rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>10s</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
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
