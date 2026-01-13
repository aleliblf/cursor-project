import { createClient } from '@supabase/supabase-js';
import https from 'https';

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

// Create HTTPS agent for server-side operations to handle SSL certificates
const createSupabaseClient = () => {
  // Check if we're on the server (Node.js environment)
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    // Server-side: Use HTTPS agent to bypass SSL certificate issues
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // @ts-ignore
            agent: url.toString().startsWith('https') ? httpsAgent : undefined,
          });
        }
      }
    });
  } else {
    // Client-side: Use default fetch (browser handles SSL)
    return createClient(supabaseUrl, supabaseAnonKey);
  }
};

export const supabase = createSupabaseClient();

