'use client';

import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { AppSettings } from './DashboardClient';
import { 
  Activity, Bell, Settings, Shield, AlertTriangle, X, 
  Lock, EyeOff, Server, BrainCircuit, Eye, CloudRain, 
  Gauge, LayoutGrid, Moon 
} from 'lucide-react';
import { Venue } from './venueData';

interface DashboardTopbarProps {
  venues?: Venue[];
}

export default function DashboardTopbar({
  venues = [],
  venues?: Venue[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}: DashboardTopbarProps) {
  // Main dropdown toggles
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isShieldOpen, setIsShieldOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings Tabs and UI Mock States
  const [settingsTab, setSettingsTab] = useState<'ai' | 'accessibility'>('ai');
  
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

            {/* --- SETTINGS / PREFERENCES (NEW TABBED WINDOW) --- */}
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
                  className="absolute right-0 mt-2 w-[340px] rounded-xl border shadow-xl z-50 overflow-hidden" 
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Preferences</h3>
                    <button onClick={() => setIsSettingsOpen(false)} className="hover:bg-white/5 p-1 rounded transition-colors">
                      <X size={14} style={{ color: 'var(--muted-foreground)' }}/>
                    </button>
                  </div>
                  
                  {/* Tabs Header */}
                  <div className="flex border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <button 
                      onClick={() => setSettingsTab('ai')}
                      className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${settingsTab === 'ai' ? 'border-b-2' : ''}`}
                      style={{ 
                        borderColor: settingsTab === 'ai' ? 'var(--primary)' : 'transparent',
                        color: settingsTab === 'ai' ? 'var(--primary)' : 'var(--muted-foreground)'
                      }}
                    >
                      <BrainCircuit size={14} />
                      AI Engine
                    </button>
                    <button 
                      onClick={() => setSettingsTab('accessibility')}
                      className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${settingsTab === 'accessibility' ? 'border-b-2' : ''}`}
                      style={{ 
                        borderColor: settingsTab === 'accessibility' ? 'var(--primary)' : 'transparent',
                        color: settingsTab === 'accessibility' ? 'var(--primary)' : 'var(--muted-foreground)'
                      }}
                    >
                      <Eye size={14} />
                      Control Room
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 space-y-5">
                    
                    {/* AI ENGINE TAB */}
                    {settingsTab === 'ai' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Activity size={14} style={{ color: 'var(--foreground)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Predictive Forecasting</span>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Shift timeline +30 mins based on trends</p>
                          </div>
                          <div onClick={() => setPredictive(!predictive)} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: predictive ? 'var(--primary)' : 'var(--surface-3)' }}>
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${predictive ? 'translate-x-4' : ''}`}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CloudRain size={14} style={{ color: 'var(--foreground)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Weather Impact Data</span>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Factor local climate into predictions</p>
                          </div>
                          <div onClick={() => setWeather(!weather)} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: weather ? 'var(--primary)' : 'var(--surface-3)' }}>
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${weather ? 'translate-x-4' : ''}`}></div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-2">
                            <Gauge size={14} style={{ color: 'var(--foreground)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Anomaly Sensitivity</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setSensitivity('low')} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: sensitivity === 'low' ? 'var(--primary)' : 'var(--border)', color: sensitivity === 'low' ? 'var(--primary)' : 'var(--muted-foreground)', background: sensitivity === 'low' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>Low</button>
                            <button onClick={() => setSensitivity('normal')} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: sensitivity === 'normal' ? 'var(--primary)' : 'var(--border)', color: sensitivity === 'normal' ? 'var(--primary)' : 'var(--muted-foreground)', background: sensitivity === 'normal' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>Normal</button>
                            <button onClick={() => setSensitivity('high')} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: sensitivity === 'high' ? 'var(--primary)' : 'var(--border)', color: sensitivity === 'high' ? 'var(--primary)' : 'var(--muted-foreground)', background: sensitivity === 'high' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>High</button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* CONTROL ROOM / ACCESSIBILITY TAB */}
                    {settingsTab === 'accessibility' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Eye size={14} style={{ color: 'var(--foreground)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Colorblind Mode</span>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Shift density palette to Blue/Orange</p>
                          </div>
                          <div onClick={() => setColorblind(!colorblind)} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: colorblind ? 'var(--primary)' : 'var(--surface-3)' }}>
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${colorblind ? 'translate-x-4' : ''}`}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Moon size={14} style={{ color: 'var(--foreground)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Night Vision UI</span>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Ultra-dark mode for night shifts</p>
                          </div>
                          <div onClick={() => setNightVision(!nightVision)} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: nightVision ? 'var(--primary)' : 'var(--surface-3)' }}>
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${nightVision ? 'translate-x-4' : ''}`}></div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-2">
                            <LayoutGrid size={14} style={{ color: 'var(--foreground)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Grid Density</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setGridDensity('comfortable')} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: gridDensity === 'comfortable' ? 'var(--primary)' : 'var(--border)', color: gridDensity === 'comfortable' ? 'var(--primary)' : 'var(--muted-foreground)', background: gridDensity === 'comfortable' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>Comfortable</button>
                            <button onClick={() => setGridDensity('compact')} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: gridDensity === 'compact' ? 'var(--primary)' : 'var(--border)', color: gridDensity === 'compact' ? 'var(--primary)' : 'var(--muted-foreground)', background: gridDensity === 'compact' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>Compact View</button>
                          </div>
                        </div>
                      </>
                    )}

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
