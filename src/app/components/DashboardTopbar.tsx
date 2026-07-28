import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Activity, Bell, Settings, Shield } from 'lucide-react';

interface DashboardTopbarProps {
  onOpenAlerts?: () => void;
  onOpenShield?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export default function DashboardTopbar({
  onOpenAlerts,
  onOpenShield,
  onOpenSettings,
  onOpenProfile,
}: DashboardTopbarProps) {
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
                CrowdCheck
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
            {/* Bell / Alerts Button */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-95 cursor-pointer"
              aria-label="Alerts"
            >
              <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--density-high)' }}
              />
            </button>

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

            {/* User Profile Area */}
            <button
              onClick={onOpenProfile}
              className="ml-2 flex items-center gap-2 pl-3 border-l hover:opacity-80 cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
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
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
