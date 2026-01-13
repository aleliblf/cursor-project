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
  usage?: number;
  max_limit?: number;
  created_at: string;
  updated_at?: string;
}
