import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwlacbyaiahtukgcrebn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGFjYnlhaWFodHVrZ2NyZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjc2NjcsImV4cCI6MjA5ODY0MzY2N30.Cb5ymdjTpj_zgMh7d95erxYDR-Yls1z4W9S4bSHpCsA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
