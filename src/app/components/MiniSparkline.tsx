'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

interface MiniSparklineProps {
  venueId: string;
  presentCount: number;
  maxCapacity: number;
}

interface DataPoint {
  t: number;
  v: number;
}

// Seed initial history with static values derived from index — no Math.random() in render
function buildInitialHistory(presentCount: number, maxCapacity: number): DataPoint[] {
  const offsets = [0.92, 0.88, 0.94, 0.87, 0.91, 0.96, 0.89, 0.93, 0.97, 0.95];
  return offsets.map((factor, i) => ({
    t: i,
    v: Math.round(presentCount * factor),
  }));
}

export default function MiniSparkline({ venueId, presentCount, maxCapacity }: MiniSparklineProps) {
  const [history, setHistory] = useState<DataPoint[]>(() =>
    buildInitialHistory(presentCount, maxCapacity)
  );
  const counterRef = useRef(10);

  useEffect(() => {
    setHistory(prev => {
      const next = [...prev.slice(-9), { t: counterRef.current, v: presentCount }];
      counterRef.current += 1;
      return next;
    });
  }, [presentCount]);

  const pct = Math.round((presentCount / maxCapacity) * 100);
  const strokeColor = pct > 85 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#22c55e';
  const fillId = `spark-fill-${venueId}`;

  return (
    <div style={{ height: 36 }}>
      <ResponsiveContainer width="100%" height={36}>
        <AreaChart data={history} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${fillId})`}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  className="text-xs px-2 py-1 rounded border"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {payload[0].value} people
                </div>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
