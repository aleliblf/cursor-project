import { supabase } from '@/lib/supabase';

/**
 * API Key interface matching database schema
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  user_id?: string;
  description?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Input type for creating/updating API keys
 */
export interface ApiKeyInput {
  name: string;
  key: string;
}

/**
 * Generate a new API key with the format: leli_<random>
 */
export function generateApiKey(): string {
  return `leli_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Load all API keys from the database, ordered by creation date
 */
export async function loadApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to load API keys');
  }

  // Return data as-is since it matches the ApiKey interface
  return data || [];
}

/**
 * Create a new API key in the database
 */
export async function createApiKey(input: ApiKeyInput): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .insert([
      {
        name: input.name,
        key: input.key,
      },
    ]);

  if (error) {
    throw new Error(error.message || 'Failed to create API key');
  }
}

/**
 * Update an existing API key
 */
export async function updateApiKey(id: string, input: ApiKeyInput): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({
      name: input.name,
      key: input.key,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to update API key');
  }
}

/**
 * Delete an API key by ID
 */
export async function deleteApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete API key');
  }
}

/**
 * Validate if an API key exists in the database
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id')
    .eq('key', apiKey.trim())
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Get API key details by key string
 */
export async function getApiKeyByKey(apiKey: string): Promise<ApiKey | null> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey.trim())
    .single();

  if (error || !data) {
    return null;
  }

  // Return data as-is since it matches the ApiKey interface
  return data;
}
