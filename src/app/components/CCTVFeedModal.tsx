// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Venue, getDensityLevel, DensityLevel, checkIsOpen } from './venueData';
// import { X, Camera, Wifi, WifiOff, RefreshCw, Maximize2, AlertTriangle } from 'lucide-react';

// interface CCTVFeedModalProps {
//   venue: Venue;
//   onClose: () => void;
// }

// interface CameraFeed {
//   id: number;
//   label: string;
//   zone: string;
//   status: 'online' | 'offline' | 'degraded';
//   detectedCount: number;
//   motionLevel: number; // 0-100
// }

// const BUILDING_ZONES = [
//   'Main Entrance', 'Exit Gate', 'Central Hall', 'North Wing',
//   'South Wing', 'Elevator Lobby', 'Emergency Exit', 'Parking Level',
//   'Rooftop Access', 'Service Corridor', 'VIP Area', 'Loading Bay',
//   'Reception Desk', 'Waiting Area', 'Concourse A', 'Concourse B',
// ];

// const TRAFFIC_ZONES = [
//   'North Crosswalk', 'South Crosswalk', 'East Crosswalk', 'West Crosswalk',
//   'Northbound Lane', 'Southbound Lane', 'Eastbound Lane', 'Westbound Lane',
//   'Pedestrian Island', 'Left Turn Signal', 'Right Turn Signal', 'Bus Stop Zone'
// ];

// function generateCameras(venue: Venue, isOpen: boolean): CameraFeed[] {
//   const count = venue.cameraCount;
//   // Choose the right list of names based on the category
//   const zones = venue.category === 'Traffic Intersection' ? TRAFFIC_ZONES : BUILDING_ZONES;

//   return Array.from({ length: count }, (_, i) => {
//     const baseName = zones[i % zones.length];
//     const cycle = Math.floor(i / zones.length);
//     const finalZoneName = cycle === 0 ? baseName : `${baseName} ${cycle + 1}`;

//     return {
//       id: i + 1,
//       label: `CAM-${String(i + 1).padStart(2, '0')}`,
//       zone: finalZoneName,
//       status: !isOpen ? 'offline' : (Math.random() > 0.1 ? 'online' : Math.random() > 0.5 ? 'degraded' : 'offline'),
//       detectedCount: !isOpen ? 0 : Math.floor((venue.presentCount / count) * (0.5 + Math.random())),
//       motionLevel: !isOpen ? 0 : Math.floor(Math.random() * 100),
//     };
//   });
// }

// const DENSITY_COLORS: Record<DensityLevel, string> = {
//   LOW: '#22c55e',
//   MEDIUM: '#f59e0b',
//   HIGH: '#ef4444',
//   CRITICAL: '#dc2626',
// };

// function SimulatedCameraView({
//   camera,
//   venue,
//   isFullscreen,
// }: {
//   camera: CameraFeed;
//   venue: Venue;
//   isFullscreen: boolean;
// }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const animRef = useRef<number>(0);
//   const dotsRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }[]>([]);
//   const frameRef = useRef(0);

//   const level = getDensityLevel(venue.presentCount, venue.maxCapacity);
//   const densityColor = DENSITY_COLORS[level];

//   useEffect(() => {
//     if (camera.status === 'offline') return;
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const W = canvas.width;
//     const H = canvas.height;

//     // Initialize dots (simulated people)
//     const dotCount = Math.max(3, Math.floor(camera.detectedCount * 0.6));
//     dotsRef.current = Array.from({ length: dotCount }, () => ({
//       x: Math.random() * W,
//       y: Math.random() * H,
//       vx: (Math.random() - 0.5) * 0.6,
//       vy: (Math.random() - 0.5) * 0.4,
//       size: 3 + Math.random() * 3,
//       opacity: 0.7 + Math.random() * 0.3,
//     }));

//     function draw() {
//       if (!ctx || !canvas) return;
//       frameRef.current++;

//       // Dark background with slight green tint (night vision)
//       ctx.fillStyle = 'rgba(0, 8, 4, 0.85)';
//       ctx.fillRect(0, 0, W, H);

//       // Grid overlay
//       ctx.strokeStyle = 'rgba(0, 255, 80, 0.04)';
//       ctx.lineWidth = 0.5;
//       for (let x = 0; x < W; x += 20) {
//         ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
//       }
//       for (let y = 0; y < H; y += 20) {
//         ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
//       }

//       // Scan line
//       const scanY = ((frameRef.current * 1.5) % (H + 20)) - 10;
//       const scanGrad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
//       scanGrad.addColorStop(0, 'transparent');
//       scanGrad.addColorStop(0.5, 'rgba(0, 255, 80, 0.08)');
//       scanGrad.addColorStop(1, 'transparent');
//       ctx.fillStyle = scanGrad;
//       ctx.fillRect(0, scanY - 8, W, 16);

//       // Move and draw dots (people)
//       dotsRef.current.forEach(dot => {
//         dot.x += dot.vx;
//         dot.y += dot.vy;
//         if (dot.x < 0 || dot.x > W) dot.vx *= -1;
//         if (dot.y < 0 || dot.y > H) dot.vy *= -1;

//         // Detection box
//         ctx.strokeStyle = `rgba(0, 255, 80, ${dot.opacity * 0.6})`;
//         ctx.lineWidth = 0.8;
//         ctx.strokeRect(dot.x - dot.size * 2, dot.y - dot.size * 3, dot.size * 4, dot.size * 6);

//         // Person dot
//         ctx.beginPath();
//         ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(0, 255, 80, ${dot.opacity})`;
//         ctx.fill();
//       });

//       // Corner brackets (CCTV aesthetic)
//       const bSize = 12;
//       ctx.strokeStyle = 'rgba(0, 255, 80, 0.5)';
//       ctx.lineWidth = 1.5;
//       [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy]) => {
//         const sx = cx === 0 ? 1 : -1;
//         const sy = cy === 0 ? 1 : -1;
//         ctx.beginPath();
//         ctx.moveTo(cx + sx * bSize, cy);
//         ctx.lineTo(cx, cy);
//         ctx.lineTo(cx, cy + sy * bSize);
//         ctx.stroke();
//       });

//       // Noise overlay
//       if (camera.status === 'degraded') {
//         for (let i = 0; i < 80; i++) {
//           const nx = Math.random() * W;
//           const ny = Math.random() * H;
//           ctx.fillStyle = `rgba(0, 255, 80, ${Math.random() * 0.15})`;
//           ctx.fillRect(nx, ny, Math.random() * 3, 1);
//         }
//       }

//       animRef.current = requestAnimationFrame(draw);
//     }

//     animRef.current = requestAnimationFrame(draw);
//     return () => cancelAnimationFrame(animRef.current);
//   }, [camera, venue.presentCount]);

//   if (camera.status === 'offline') {
//     return (
//       <div
//         className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-lg"
//         style={{ background: '#050505', border: '1px solid rgba(239,68,68,0.2)' }}
//       >
//         <WifiOff size={20} style={{ color: '#ef4444' }} />
//         <span className="text-xs font-mono" style={{ color: '#ef4444' }}>SIGNAL LOST</span>
//         <span className="text-xs" style={{ color: '#64748b' }}>{camera.label}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,255,80,0.15)' }}>
//       <canvas
//         ref={canvasRef}
//         width={isFullscreen ? 480 : 240}
//         height={isFullscreen ? 270 : 135}
//         className="w-full h-full"
//         style={{ imageRendering: 'pixelated' }}
//       />
//       {/* HUD overlay */}
//       <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
//         <span className="w-1.5 h-1.5 rounded-full live-pulse" style={{ background: '#22c55e' }} />
//         <span className="text-xs font-mono" style={{ color: 'rgba(0,255,80,0.9)', fontSize: '9px' }}>{camera.label}</span>
//       </div>
//       <div className="absolute top-1.5 right-1.5">
//         <span className="text-xs font-mono" style={{ color: 'rgba(0,255,80,0.7)', fontSize: '9px' }}>
//           {camera.status === 'degraded' ? '⚠ DEGRADED' : 'REC ●'}
//         </span>
//       </div>
//       <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
//         <span className="text-xs font-mono" style={{ color: 'rgba(0,255,80,0.7)', fontSize: '9px' }}>{camera.zone}</span>
//         <span className="text-xs font-mono" style={{ color: densityColor, fontSize: '9px' }}>
//           {camera.detectedCount} detected
//         </span>
//       </div>
//     </div>
//   );
// }

// export default function CCTVFeedModal({ venue, onClose }: CCTVFeedModalProps) {
//   const isOpen = checkIsOpen(venue.openHours);
//   const [cameras, setCameras] = useState<CameraFeed[]>(() => generateCameras(venue, isOpen));
//   const [fullscreenCam, setFullscreenCam] = useState<number | null>(null);

//   // Periodically update detected counts ONLY if the venue is open
//   useEffect(() => {
//     if (!isOpen) return; // Do not run simulation if closed
    
//     const interval = setInterval(() => {
//       setCameras(prev => prev.map(cam => ({
//         ...cam,
//         detectedCount: Math.max(0, cam.detectedCount + Math.floor((Math.random() - 0.5) * 4)),
//         motionLevel: Math.min(100, Math.max(0, cam.motionLevel + Math.floor((Math.random() - 0.5) * 10))),
//       })));
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [isOpen]);

//   const onlineCams = cameras.filter(c => c.status !== 'offline').length;
//   const fullscreenCamera = fullscreenCam !== null ? cameras.find(c => c.id === fullscreenCam) : null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
//       onClick={e => { if (e.target === e.currentTarget) onClose(); }}
//     >
//       <div
//         className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border"
//         style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
//       >
//         {/* Header */}
//         <div
//           className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
//           style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
//         >
//           <div className="flex items-center gap-3">
//             <div
//               className="w-9 h-9 rounded-xl flex items-center justify-center"
//               style={{ background: 'rgba(0,255,80,0.08)', border: '1px solid rgba(0,255,80,0.2)' }}
//             >
//               <Camera size={16} style={{ color: '#22c55e' }} />
//             </div>
//             <div>
//               <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
//                 CCTV Feeds — {venue.name}
//               </h2>
//               <div className="flex items-center gap-3 mt-0.5">
//                 <span className="flex items-center gap-1 text-xs" style={{ color: onlineCams > 0 ? '#22c55e' : '#ef4444' }}>
//                   {onlineCams > 0 ? <Wifi size={10} /> : <WifiOff size={10} />}
//                   {onlineCams}/{cameras.length} online
//                 </span>
//                 <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
//                   {isOpen ? venue.presentCount : 0} people detected
//                 </span>
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-white/5 transition-colors"
//             aria-label="Close CCTV modal"
//           >
//             <X size={18} style={{ color: 'var(--muted-foreground)' }} />
//           </button>
//         </div>

//         {/* Fullscreen view */}
//         {fullscreenCamera && (
//           <div className="px-6 pt-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
//                 {fullscreenCamera.label} — {fullscreenCamera.zone}
//               </span>
//               <button
//                 onClick={() => setFullscreenCam(null)}
//                 className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
//                 style={{ color: 'var(--muted-foreground)' }}
//               >
//                 <RefreshCw size={11} /> Exit fullscreen
//               </button>
//             </div>
//             <div style={{ height: '270px' }}>
//               <SimulatedCameraView camera={fullscreenCamera} venue={venue} isFullscreen />
//             </div>
//           </div>
//         )}

//         {/* Camera grid */}
//         <div className="p-6">
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//             {cameras.map(cam => (
//               <div key={cam.id} className="space-y-1.5">
//                 <div
//                   className="relative cursor-pointer group"
//                   style={{ height: '135px' }}
//                   onClick={() => setFullscreenCam(cam.id === fullscreenCam ? null : cam.id)}
//                 >
//                   <SimulatedCameraView camera={cam} venue={venue} isFullscreen={false} />
//                   {cam.status !== 'offline' && (
//                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}>
//                       <Maximize2 size={16} style={{ color: 'white' }} />
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex items-center justify-between px-0.5">
//                   <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
//                     {cam.zone}
//                   </span>
//                   <div className="flex items-center gap-1">
//                     {cam.status === 'degraded' && <AlertTriangle size={9} style={{ color: '#f59e0b' }} />}
//                     <span
//                       className="w-1.5 h-1.5 rounded-full"
//                       style={{ background: cam.status === 'online' ? '#22c55e' : cam.status === 'degraded' ? '#f59e0b' : '#ef4444' }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// Trying ... below

'use client';

import React, { useEffect, useState } from 'react';
import { X, Video, Activity, AlertCircle } from 'lucide-react';
import { Venue } from './venueData';

interface CCTVFeedModalProps {
  venue: Venue;
  onClose: () => void;
}

export default function CCTVFeedModal({ venue, onClose }: CCTVFeedModalProps) {
  const [time, setTime] = useState('');

  // Live clock for the CCTV overlay
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-[#060c18] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Video size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live AI Feed: {venue.name}</h3>
              <p className="text-xs text-gray-400">Camera Network 1 — Node Active</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* The CCTV Feed Screen */}
        <div className="relative w-full aspect-video bg-[#02040a] overflow-hidden group">
          
          {/* SIMULATED BACKGROUND: Dark grid instead of a video to prevent broken links */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px' 
            }}
          />

          {/* CCTV Overlay UI */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 font-mono text-xs font-bold tracking-widest">REC</span>
          </div>
          
          <div className="absolute top-4 right-4 text-white font-mono text-xs opacity-70">
            {new Date().toISOString().split('T')[0]} {time}
          </div>

          <div className="absolute bottom-4 left-4 text-cyan-400 font-mono text-[10px] uppercase opacity-70">
            AI VISION MODEL v2.4 <br/>
            TRACKING ACTIVE
          </div>

          {/* 🔴 THE COMPUTER VISION ILLUSION (ANIMATED BOXES) 🔴 */}
          <style>{`
            @keyframes track1 {
              0% { top: 30%; left: 20%; width: 45px; height: 90px; }
              33% { top: 32%; left: 35%; width: 50px; height: 95px; }
              66% { top: 28%; left: 55%; width: 40px; height: 85px; }
              100% { top: 30%; left: 20%; width: 45px; height: 90px; }
            }
            @keyframes track2 {
              0% { top: 50%; left: 70%; width: 60px; height: 120px; }
              50% { top: 55%; left: 60%; width: 65px; height: 125px; }
              100% { top: 50%; left: 70%; width: 60px; height: 120px; }
            }
            @keyframes track3 {
              0% { top: 40%; left: 45%; width: 35px; height: 75px; opacity: 1; }
              40% { top: 40%; left: 48%; width: 35px; height: 75px; opacity: 1; }
              50% { opacity: 0; }
              90% { opacity: 0; }
              100% { top: 40%; left: 45%; width: 35px; height: 75px; opacity: 1; }
            }
            .ai-box {
              position: absolute;
              border: 1.5px solid #22c55e;
              background: rgba(34, 197, 94, 0.05);
              box-shadow: 0 0 10px rgba(34, 197, 94, 0.3) inset;
              transition: all 0.1s linear;
            }
            .ai-label {
              position: absolute;
              top: -16px;
              left: -1.5px;
              background: #22c55e;
              color: #000;
              font-size: 8px;
              font-family: monospace;
              padding: 2px 4px;
              font-weight: bold;
              white-space: nowrap;
            }
          `}</style>

          {/* Bounding Box 1 */}
          <div className="ai-box" style={{ animation: 'track1 12s infinite ease-in-out' }}>
            <div className="ai-label">PERSON: 98%</div>
          </div>

          {/* Bounding Box 2 */}
          <div className="ai-box" style={{ animation: 'track2 8s infinite ease-in-out', borderColor: '#3b82f6', background: 'rgba(59,130,246,0.05)' }}>
            <div className="ai-label" style={{ background: '#3b82f6', color: 'white' }}>PERSON: 94%</div>
          </div>

          {/* Bounding Box 3 (Appears and disappears) */}
          <div className="ai-box" style={{ animation: 'track3 6s infinite ease-in-out' }}>
            <div className="ai-label">PERSON: 82%</div>
            {/* Center target crosshair inside box */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 border border-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/5 border-t border-white/10 text-white">
          <div className="p-3 flex items-center justify-center gap-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-xs font-medium">Tracking: Nominal</span>
          </div>
          <div className="p-3 flex items-center justify-center gap-2">
            <AlertCircle size={14} className="text-amber-400" />
            <span className="text-xs font-medium">Anomalies: 0</span>
          </div>
          <div className="p-3 flex items-center justify-center gap-2 text-gray-400">
            <span className="text-xs font-mono">FRAME: 144.29.01</span>
          </div>
        </div>

      </div>
    </div>
  );
}
