import { createClient } from '@supabase/supabase-js';

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  usage?: number;
  limit?: number;
  error?: string;
}

/**
 * Checks and increments API key usage for rate limiting
 * @param apiKey - The API key to check
 * @returns RateLimitResult indicating if the request is allowed
 */
export async function checkAndIncrementRateLimit(apiKey: string): Promise<RateLimitResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      allowed: false,
      error: 'Server configuration error'
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          // @ts-ignore
          agent: undefined
        });
      }
    }
  });

  try {
    // Fetch the API key data
    const { data: apiKeyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, usage, max_limit, is_active')
      .eq('key', apiKey.trim())
      .single();

    if (fetchError || !apiKeyData) {
      return {
        allowed: false,
        error: 'Invalid API key'
      };
    }

    // Check if API key is active
    if (apiKeyData.is_active === false) {
      return {
        allowed: false,
        error: 'API key is inactive'
      };
    }

    const currentUsage = apiKeyData.usage || 0;
    const limit = apiKeyData.max_limit || 1000; // Default limit of 1000 if not set

    // Check if usage exceeds limit
    if (currentUsage >= limit) {
      return {
        allowed: false,
        usage: currentUsage,
        limit: limit,
        error: 'Rate limit exceeded'
      };
    }

    // Increment usage
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ usage: currentUsage + 1 })
      .eq('id', apiKeyData.id);

    if (updateError) {
      console.error('Failed to increment usage:', updateError);
      // Allow the request even if increment fails (to avoid blocking users due to DB issues)
      return {
        allowed: true,
        usage: currentUsage,
        limit: limit
      };
    }

    return {
      allowed: true,
      usage: currentUsage + 1,
      limit: limit
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      allowed: false,
      error: 'Rate limit check failed'
    };
  }
}
