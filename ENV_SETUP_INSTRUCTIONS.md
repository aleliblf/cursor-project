# How to Set Up Your Supabase Environment Variables

## Quick Fix for the Current Error

Your `.env.local` file currently has placeholder values. You need to replace them with your actual Supabase credentials.

## Step-by-Step Instructions

### 1. Get Your Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com) and sign in
2. Select your project (or create a new one if you haven't)
3. Click on **Settings** (gear icon) in the left sidebar
4. Click on **API** in the settings menu
5. You'll see two values you need:

   **a) Project URL:**
   - Look for "Project URL" section
   - Copy the URL (it looks like: `https://abcdefghijklmnop.supabase.co`)
   
   **b) anon public key:**
   - Look for "Project API keys" section
   - Find the key labeled "anon" or "public"
   - Click the eye icon or copy button to reveal it
   - Copy the entire key (it's a long string starting with `eyJ...`)

### 2. Update Your .env.local File

1. Open `.env.local` file in your project root (`c:\cursor_course\cursor-project\.env.local`)
2. Replace the placeholder values:

   **Before (WRONG):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   **After (CORRECT):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
   ```

   ⚠️ **Important:** 
   - Replace `abcdefghijklmnop` with your actual project reference
   - Replace the entire `eyJ...` string with your actual anon key
   - Make sure there are NO spaces around the `=` sign
   - Make sure the URL starts with `https://`

### 3. Restart Your Development Server

After saving `.env.local`:

1. Stop your current dev server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### 4. Verify It Works

- Navigate to `/dashboard` in your browser
- The error should be gone
- You should see the dashboard loading (or an empty state if no keys exist)

## Example of a Valid .env.local File

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xyz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz
```

## Troubleshooting

### Still Getting "Invalid URL" Error?
- ✅ Make sure the URL starts with `https://`
- ✅ Make sure there are no extra spaces or quotes around the values
- ✅ Make sure you copied the entire URL and key (they're long!)
- ✅ Restart your dev server after making changes

### Can't Find Your Supabase Project?
- Create a new project at [https://app.supabase.com](https://app.supabase.com)
- Wait for it to finish setting up (takes 1-2 minutes)
- Then follow the steps above to get your credentials

### Need to Create the Database Table?
- After setting up your credentials, make sure you've run the SQL schema
- See `SUPABASE_SETUP.md` for instructions on creating the `api_keys` table

