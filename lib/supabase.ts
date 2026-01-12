import { createClient } from '@supabase/supabase-js';

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrlRaw || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrlRaw) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  throw new Error(
    `Missing Supabase environment variables: ${missingVars.join(', ')}\n\n` +
    `Create a .env.local in the project root with:\n` +
    `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n` +
    `Get values from Supabase dashboard → Settings → API`
  );
}

let supabaseUrl: string;
try {
  const parsed = new URL(supabaseUrlRaw);
  if (!/^https:/.test(parsed.protocol)) {
    throw new Error('Supabase URL must start with https://');
  }
  supabaseUrl = parsed.toString();
} catch (err: any) {
  throw new Error(
    `Invalid Supabase URL: ${supabaseUrlRaw}\n` +
    `Error: ${err?.message || 'Must be a valid https URL'}\n\n` +
    `Make sure NEXT_PUBLIC_SUPABASE_URL looks like: https://your-project.supabase.co`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

