# Supabase Setup Guide

This guide will help you connect your API Keys dashboard to a Supabase database.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name your project
   - Set a database password (save this securely!)
   - Choose a region close to you
4. Wait for the project to be created (takes a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 3: Create the Database Table

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql` file
4. Click **Run** to execute the SQL
5. You should see a success message

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your_project_url_here` with your Project URL from Step 2
- `your_anon_key_here` with your anon/public key from Step 2

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Step 5: Restart Your Development Server

After creating/updating `.env.local`:

```bash
npm run dev
```

## Step 6: Test the Integration

1. Navigate to `/dashboard` in your app
2. Try creating a new API key
3. Check your Supabase dashboard → **Table Editor** → **api_keys** to see the data

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after creating/updating `.env.local`

### Error: "relation 'api_keys' does not exist"
- Make sure you ran the SQL schema in Step 3
- Check the Supabase SQL Editor to verify the table was created

### Error: "new row violates row-level security policy"
- The SQL schema includes RLS (Row Level Security) policies
- Make sure you ran the complete SQL from `supabase-schema.sql`
- If you want to disable RLS for development, you can run:
  ```sql
  ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
  ```

### Data not appearing
- Check the browser console for errors
- Verify your Supabase credentials are correct
- Check the Supabase dashboard → **Table Editor** to see if data is being saved

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `anon` key is safe to use in client-side code, but consider implementing authentication for production
- For production, implement proper user authentication and update RLS policies to restrict access

## Next Steps

- Add user authentication (Supabase Auth)
- Implement proper RLS policies based on user IDs
- Add API rate limiting
- Add key expiration dates
- Add usage tracking

