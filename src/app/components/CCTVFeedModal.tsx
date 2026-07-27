'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Venue, getDensityLevel, DensityLevel } from './venueData';
import { X, Camera, Wifi, WifiOff, RefreshCw, Maximize2, AlertTriangle } from 'lucide-react';

interface CCTVFeedModalProps {
  venue: Venue;
  onClose: () => void;
}

interface CameraFeed {
  id: number;
  label: string;
  zone: string;
  status: 'online' | 'offline' | 'degraded';
  detectedCount: number;
  motionLevel: number; // 0-100
}

const ZONE_NAMES = [
  'Main Entrance', 'Exit Gate', 'Central Hall', 'North Wing',
  'South Wing', 'Elevator Lobby', 'Emergency Exit', 'Parking Level',
  'Rooftop Access', 'Service Corridor', 'VIP Area', 'Loading Bay',
  'Reception Desk', 'Waiting Area', 'Concourse A', 'Concourse B',
];

function generateCameras(venue: Venue): CameraFeed[] {
  const count = Math.min(venue.cameraCount, 8);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: `CAM-${String(i + 1).padStart(2, '0')}`,
    zone: ZONE_NAMES[i % ZONE_NAMES.length],
    status: Math.random() > 0.1 ? 'online' : Math.random() > 0.5 ? 'degraded' : 'offline',
    detectedCount: Math.floor((venue.presentCount / count) * (0.5 + Math.random())),
    motionLevel: Math.floor(Math.random() * 100),
  }));
}

const DENSITY_COLORS: Record<DensityLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#dc2626',
};

function SimulatedCameraView({
  camera,
  venue,
  isFullscreen,
}: {
  camera: CameraFeed;
  venue: Venue;
  isFullscreen: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dotsRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }[]>([]);
  const frameRef = useRef(0);

  const level = getDensityLevel(venue.presentCount, venue.maxCapacity);
  const densityColor = DENSITY_COLORS[level];

  useEffect(() => {
    if (camera.status === 'offline') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Initialize dots (simulated people)
    const dotCount = Math.max(3, Math.floor(camera.detectedCount * 0.6));
    dotsRef.current = Array.from({ length: dotCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.4,
      size: 3 + Math.random() * 3,
      opacity: 0.7 + Math.random() * 0.3,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      frameRef.current++;

      // Dark background with slight green tint (night vision)
      ctx.fillStyle = 'rgba(0, 8, 4, 0.85)';
      ctx.fillRect(0, 0, W, H);

      // Grid overlay
      ctx.strokeStyle = 'rgba(0, 255, 80, 0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Scan line
      const scanY = ((frameRef.current * 1.5) % (H + 20)) - 10;
      const scanGrad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, 'rgba(0, 255, 80, 0.08)');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 8, W, 16);

      // Move and draw dots (people)
      dotsRef.current.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > W) dot.vx *= -1;
        if (dot.y < 0 || dot.y > H) dot.vy *= -1;

        // Detection box
        ctx.strokeStyle = `rgba(0, 255, 80, ${dot.opacity * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(dot.x - dot.size * 2, dot.y - dot.size * 3, dot.size * 4, dot.size * 6);

        // Person dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 80, ${dot.opacity})`;
        ctx.fill();
      });

      // Corner brackets (CCTV aesthetic)
      const bSize = 12;
      ctx.strokeStyle = 'rgba(0, 255, 80, 0.5)';
      ctx.lineWidth = 1.5;
      [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy]) => {
        const sx = cx === 0 ? 1 : -1;
        const sy = cy === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx + sx * bSize, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + sy * bSize);
        ctx.stroke();
      });

      // Noise overlay
      if (camera.status === 'degraded') {
        for (let i = 0; i < 80; i++) {
          const nx = Math.random() * W;
          const ny = Math.random() * H;
          ctx.fillStyle = `rgba(0, 255, 80, ${Math.random() * 0.15})`;
          ctx.fillRect(nx, ny, Math.random() * 3, 1);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [camera, venue.presentCount]);

  if (camera.status === 'offline') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-lg"
        style={{ background: '#050505', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <WifiOff size={20} style={{ color: '#ef4444' }} />
        <span className="text-xs font-mono" style={{ color: '#ef4444' }}>SIGNAL LOST</span>
        <span className="text-xs" style={{ color: '#64748b' }}>{camera.label}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,255,80,0.15)' }}>
      <canvas
        ref={canvasRef}
        width={isFullscreen ? 480 : 240}
        height={isFullscreen ? 270 : 135}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* HUD overlay */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full live-pulse" style={{ background: '#22c55e' }} />
        <span className="text-xs font-mono" style={{ color: 'rgba(0,255,80,0.9)', fontSize: '9px' }}>{camera.label}</span>
      </div>
      <div className="absolute top-1.5 right-1.5">
        <span className="text-xs font-mono" style={{ color: 'rgba(0,255,80,0.7)', fontSize: '9px' }}>
          {camera.status === 'degraded' ? '⚠ DEGRADED' : 'REC ●'}
        </span>
      </div>
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: 'rgba(0,255,80,0.7)', fontSize: '9px' }}>{camera.zone}</span>
        <span className="text-xs font-mono" style={{ color: densityColor, fontSize: '9px' }}>
          {camera.detectedCount} detected
        </span>
      </div>
    </div>
  );
}

export default function CCTVFeedModal({ venue, onClose }: CCTVFeedModalProps) {
  const [cameras, setCameras] = useState<CameraFeed[]>(() => generateCameras(venue));
  const [fullscreenCam, setFullscreenCam] = useState<number | null>(null);

  // Periodically update detected counts
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev => prev.map(cam => ({
        ...cam,
        detectedCount: Math.max(0, cam.detectedCount + Math.floor((Math.random() - 0.5) * 4)),
        motionLevel: Math.min(100, Math.max(0, cam.motionLevel + Math.floor((Math.random() - 0.5) * 10))),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const level = getDensityLevel(venue.presentCount, venue.maxCapacity);
  const onlineCams = cameras.filter(c => c.status !== 'offline').length;

  const fullscreenCamera = fullscreenCam !== null ? cameras.find(c => c.id === fullscreenCam) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,80,0.08)', border: '1px solid rgba(0,255,80,0.2)' }}
            >
              <Camera size={16} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                CCTV Feeds — {venue.name}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                  <Wifi size={10} />
                  {onlineCams}/{cameras.length} online
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {venue.presentCount} people detected
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close CCTV modal"
          >
            <X size={18} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* Fullscreen view */}
        {fullscreenCamera && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {fullscreenCamera.label} — {fullscreenCamera.zone}
              </span>
              <button
                onClick={() => setFullscreenCam(null)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <RefreshCw size={11} /> Exit fullscreen
              </button>
            </div>
            <div style={{ height: '270px' }}>
              <SimulatedCameraView camera={fullscreenCamera} venue={venue} isFullscreen />
            </div>
          </div>
        )}

        {/* Camera grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cameras.map(cam => (
              <div key={cam.id} className="space-y-1.5">
                <div
                  className="relative cursor-pointer group"
                  style={{ height: '135px' }}
                  onClick={() => setFullscreenCam(cam.id === fullscreenCam ? null : cam.id)}
                >
                  <SimulatedCameraView camera={cam} venue={venue} isFullscreen={false} />
                  {cam.status !== 'offline' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <Maximize2 size={16} style={{ color: 'white' }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    {cam.zone}
                  </span>
                  <div className="flex items-center gap-1">
                    {cam.status === 'degraded' && <AlertTriangle size={9} style={{ color: '#f59e0b' }} />}
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: cam.status === 'online' ? '#22c55e' : cam.status === 'degraded' ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
