import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwlacbyaiahtukgcrebn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGFjYnlhaWFodHVrZ2NyZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjc2NjcsImV4cCI6MjA5ODY0MzY2N30.Cb5ymdjTpj_zgMh7d95erxYDR-Yls1z4W9S4bSHpCsA';

export const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Seed data for offline / quota-exceeded fallback ──
const SEED_DATA = [
  {
    id: crypto.randomUUID(),
    title: 'Llama 3.1 70B Fine-Tuning Compute',
    description: 'Rent 8x H100 GPUs on Lambda Labs for Sharia compliance alignment training.',
    requested_by: 'dev_sami@mal.ai',
    amount: 8500,
    status: 'pending',
    category: 'budget',
    decision_reason: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    decided_at: null,
    decided_by: null,
  },
  {
    id: crypto.randomUUID(),
    title: 'Production Database RLS Override Token',
    description: 'Need temporary write access to legacy watchlists table for hot-fix debugging.',
    requested_by: 'dev_sami@mal.ai',
    amount: 0,
    status: 'pending',
    category: 'access',
    decision_reason: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    decided_at: null,
    decided_by: null,
  },
  {
    id: crypto.randomUUID(),
    title: 'LME API Commodity Broker Keys',
    description: 'Monthly sandbox credits to test our automated metal purchasing rails.',
    requested_by: 'dev_sami@mal.ai',
    amount: 12000,
    status: 'approved',
    category: 'budget',
    decision_reason: 'Approved for Q3 sandbox testing campaigns.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    decided_at: new Date(Date.now() - 43200000).toISOString(),
    decided_by: 'lead_fatima@mal.ai',
  },
  {
    id: crypto.randomUUID(),
    title: 'iPad Pro for UI/UX Prototyping',
    description: 'Required for testing Apple pencil gesture flows on the retail bank dashboard.',
    requested_by: 'dev_sami@mal.ai',
    amount: 4500,
    status: 'rejected',
    category: 'hardware',
    decision_reason: 'Outside standard device procurement limits. Please request standard laptop hardware.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    decided_at: new Date(Date.now() - 100000000).toISOString(),
    decided_by: 'lead_fatima@mal.ai',
  },
];

const STORAGE_KEY = 'mal_requests_local';

function getLocalData(): any[] {
  if (typeof window === 'undefined') return SEED_DATA;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_DATA;
  }
}

function saveLocalData(data: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Resilient data layer: tries Supabase first, falls back to localStorage ──

let _offline: boolean | null = null;

async function isOffline(): Promise<boolean> {
  if (_offline !== null) return _offline;
  try {
    const { error } = await supabaseClient
      .from('mal_requests')
      .select('id', { count: 'exact', head: true });
    _offline = !!error;
  } catch {
    _offline = true;
  }
  return _offline;
}

export const db = {
  async fetchAll() {
    if (await isOffline()) {
      const data = getLocalData();
      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { data, error: null };
    }
    return supabaseClient
      .from('mal_requests')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async insert(row: Record<string, any>) {
    if (await isOffline()) {
      const newRow = {
        ...row,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        decided_at: null,
        decided_by: null,
        decision_reason: null,
      };
      const data = getLocalData();
      data.unshift(newRow);
      saveLocalData(data);
      return { error: null };
    }
    return supabaseClient.from('mal_requests').insert([row]);
  },

  async update(id: string, fields: Record<string, any>) {
    if (await isOffline()) {
      const data = getLocalData();
      const idx = data.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        data[idx] = { ...data[idx], ...fields };
        saveLocalData(data);
      }
      return { error: null };
    }
    return supabaseClient.from('mal_requests').update(fields).eq('id', id);
  },
};

// re-export for backward compat
export const supabase = supabaseClient;
