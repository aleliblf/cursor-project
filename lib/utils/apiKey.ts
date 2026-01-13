/**
 * Generate a new API key with the format: leli_<random>
 */
export function generateApiKey(): string {
  return `leli_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}
