'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, ChevronDown, ChevronUp, X, Settings2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Venue, getDensityLevel, checkIsOpen } from './venueData';
import { loadVenues, saveVenues } from './mockDb';
import SearchAndGPS from './SearchAndGPS';
import SummaryKPIRow from './SummaryKPIRow';
import VenueGrid from './VenueGrid';
import LiveTickerBar from './LiveTickerBar';
import AdminPanel from './AdminPanel';
import DashboardTopbar from './DashboardTopbar';

export interface AppSettings {
  timeShift: number; 
  colorblind: boolean;
  nightVision: boolean;
  gridDensity: 'comfortable' | 'compact';
  deviceView: 'mobile' | 'tablet' | 'desktop';
  autoPilot: boolean;
}

function fluctuateCount(current: number, max: number, delta: number): number {
  const noise = Math.floor((Math.random() - 0.45) * delta);
  const next = current + noise;
  return Math.max(0, Math.min(max, next));
}

export default function DashboardClient() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(3);
  const [lastRefresh, setLastRefresh] = useState('');
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
  const [showAdmin, setShowAdmin] = useState(false);
  const [filterHighRisk, setFilterHighRisk] = useState(false);
  
  // AI Actions State
  const [showProtocols, setShowProtocols] = useState(false);
  
  const prevHighRisk = useRef<string[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    timeShift: 0, 
    colorblind: false,
    nightVision: false,
    gridDensity: 'comfortable',
    deviceView: 'desktop',
    autoPilot: false, 
  });

  useEffect(() => {
    setVenues(loadVenues());
    setLastRefresh(new Date().toLocaleTimeString('en-US', { hour12: false }));
  }, []);

  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistVenues = useCallback((updated: Venue[]) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => saveVenues(updated), 500);
  }, []);

  useEffect(() => {
    if (!isSimulating || venues.length === 0) return;

    const interval = setInterval(() => {
      setVenues(prev => {
        const updated = prev.map(v => {
          const now = new Date().toLocaleTimeString('en-US', { hour12: false });
          const isOpen = checkIsOpen(v.openHours);
          if (!isOpen) return { ...v, presentCount: 0, waitingCount: 0, lastUpdated: now };
          const newPresent = fluctuateCount(v.presentCount, v.maxCapacity, 18);
          const newWaiting = fluctuateCount(v.waitingCount, Math.floor(v.maxCapacity * 0.3), 8);
          return { ...v, presentCount: newPresent, waitingCount: newWaiting, lastUpdated: now };
        });

        const highRiskNow = updated.filter(v => ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity))).map(v => v.id);
        const newlyHigh = highRiskNow.filter(id => !prevHighRisk.current.includes(id));
        newlyHigh.forEach(id => {
          const v = updated.find(x => x
