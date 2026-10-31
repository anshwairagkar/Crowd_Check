'use client';

import React, { useState } from 'react';
import { Venue } from './venueData';
import { createVenue } from './mockDb';
import {
  X, Plus, Pencil, Trash2, Save, Building2, ChevronDown, Check,
} from 'lucide-react';

interface AdminPanelProps {
  venues: Venue[];
  onAdd: (venue: Venue) => void;
  onUpdate: (venue: Venue) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Food & Dining', 'Hospitality', 'Retail', 'Transport Hub', 'Cultural',
  'Healthcare', 'Education', 'Entertainment', 'Government', 'Traffic Intersection',
  'Other',
];

interface FormState {
  name: string;
  category: string;
  address: string;
  maxCapacity: string;
  floor: string;
  openHours: string;
  cameraCount: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  category: 'Hospitality',
  address: '',
  maxCapacity: '200',
  floor: '',
  openHours: '09:00 – 21:00',
  cameraCount: '4',
};

function venueToForm(v: Venue): FormState {
  return {
    name: v.name,
    category: v.category,
    address: v.address,
    maxCapacity: String(v.maxCapacity),
    floor: v.floor || '',
    openHours: v.openHours,
    cameraCount: String(v.cameraCount),
  };
}

function validateForm(f: FormState): string | null {
  if (!f.name.trim()) return 'Venue name is required.';
  if (!f.address.trim()) return 'Address is required.';
  const cap = parseInt(f.maxCapacity, 10);
  if (isNaN(cap) || cap < 1) return 'Max capacity must be a positive number.';
  const cams = parseInt(f.cameraCount, 10);
  if (isNaN(cams) || cams < 0) return 'Camera count must be 0 or more.';
  return null;
}

function FormField({
  label, value, onChange, type = 'text', placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
        {label}{required && <span style={{ color: 'var(--density-high)' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
        style={{
          background: 'var(--surface-3)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      />
    </div>
  );
}

function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
        Category <span style={{ color: 'var(--density-high)' }}>*</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={{
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c} style={{ background: 'var(--surface-2)' }}>{c}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
      </div>
    </div>
  );
}

export default function AdminPanel({ venues, onAdd, onUpdate, onDelete, onClose }: AdminPanelProps) {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const setField = (key: keyof FormState) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  function startAdd() {
    setForm(EMPTY_FORM);
    setError(null);
    setMode('add');
  }

  function startEdit(venue: Venue) {
    setForm(venueToForm(venue));
    setEditingId(venue.id);
    setError(null);
    setMode('edit');
  }

  function handleSave() {
    const err = validateForm(form);
    if (err) { setError(err); return; }
    setError(null);

    if (mode === 'add') {
      const newVenue = createVenue(
        form.name.trim(),
        form.category,
        form.address.trim(),
        parseInt(form.maxCapacity, 10),
        form.floor.trim(),
        form.openHours.trim(),
        parseInt(form.cameraCount, 10),
      );
      onAdd(newVenue);
    } else if (mode === 'edit' && editingId) {
      const existing = venues.find(v => v.id === editingId);
      if (existing) {
        onUpdate({
          ...existing,
          name: form.name.trim(),
          category: form.category,
          address: form.address.trim(),
          maxCapacity: parseInt(form.maxCapacity, 10),
          floor: form.floor.trim() || undefined,
          openHours: form.openHours.trim(),
          cameraCount: parseInt(form.cameraCount, 10),
        });
      }
    }

    setSaved(true);
    setTimeout(() => { setSaved(false); setMode('list'); }, 800);
  }

  function handleDelete(id: string) {
    onDelete(id);
    setConfirmDelete(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border"
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
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}
            >
              <Building2 size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                {mode === 'list' ? 'Venue Management' : mode === 'add' ? 'Add New Venue' : 'Edit Venue'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {mode === 'list' ? `${venues.length} venue${venues.length !== 1 ? 's' : ''} configured` : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'list' && (
              <button
                onClick={startAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--primary)', border: '1px solid rgba(34,211,238,0.2)' }}
              >
                <Plus size={13} /> Add Venue
              </button>
            )}
            <button
              onClick={mode === 'list' ? onClose : () => setMode('list')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X size={18} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>
        </div>

        {/* List mode */}
        {mode === 'list' && (
          <div className="p-6 space-y-3">
            {venues.length === 0 && (
              <div className="text-center py-12">
                <Building2 size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No venues yet. Add your first venue above.</p>
              </div>
            )}
            {venues.map(venue => (
              <div
                key={venue.id}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ background: 'var(--surface-3)', borderColor: 'var(--border)' }}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(34,211,238,0.08)', color: 'var(--primary)' }}
                    >
                      {venue.category}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {venue.cameraCount} cams
                    </span>
                  </div>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{venue.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    Cap: {venue.maxCapacity.toLocaleString()} · {venue.openHours}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(venue)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label={`Edit ${venue.name}`}
                  >
                    <Pencil size={14} style={{ color: 'var(--primary)' }} />
                  </button>
                  {confirmDelete === venue.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(venue.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2.5 py-1 rounded-lg text-xs transition-colors hover:bg-white/5"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(venue.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      aria-label={`Delete ${venue.name}`}
                    >
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit form */}
        {(mode === 'add' || mode === 'edit') && (
          <div className="p-6 space-y-4">
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
              >
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Venue Name" value={form.name} onChange={setField('name')} placeholder="e.g. Grand Plaza Hotel Lobby" required />
              </div>
              <CategorySelect value={form.category} onChange={setField('category')} />
              <FormField label="Floor / Level" value={form.floor} onChange={setField('floor')} placeholder="e.g. Ground Floor" />
              <div className="sm:col-span-2">
                <FormField label="Address" value={form.address} onChange={setField('address')} placeholder="e.g. 500 Grand Plaza Ave, New York" required />
              </div>
              <FormField label="Max Capacity" value={form.maxCapacity} onChange={setField('maxCapacity')} type="number" placeholder="200" required />
              <FormField label="Camera Count" value={form.cameraCount} onChange={setField('cameraCount')} type="number" placeholder="4" />
              <div className="sm:col-span-2">
                <FormField label="Open Hours" value={form.openHours} onChange={setField('openHours')} placeholder="09:00 – 21:00" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setMode('list')}
                className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: saved ? 'rgba(34,197,94,0.15)' : 'rgba(34,211,238,0.15)',
                  color: saved ? '#22c55e' : 'var(--primary)',
                  border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : 'rgba(34,211,238,0.25)'}`,
                }}
              >
                {saved ? <Check size={14} /> : <Save size={14} />}
                {saved ? 'Saved!' : mode === 'add' ? 'Add Venue' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
