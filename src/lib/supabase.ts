import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gaimzlapsruxtrnydkab.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaW16bGFwc3J1eHRybnlka2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTgyMDMsImV4cCI6MjA5NzY5NDIwM30.rdYGvnqg9oqx4DKrlxm0JwgSj8niceNq1MjLHNs3_D8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
