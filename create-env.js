// Helper script to create .env.local file
// Run with: node create-env.js

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Configuration
# Get these values from your Supabase project settings: https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping creation.');
  console.log('   If you want to update it, please edit it manually.');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file!');
  console.log('📝 Please edit .env.local and add your Supabase credentials:');
  console.log('   1. Go to https://app.supabase.com/project/_/settings/api');
  console.log('   2. Copy your Project URL and anon/public key');
  console.log('   3. Replace the placeholder values in .env.local');
  console.log('   4. Restart your dev server (npm run dev)');
}

