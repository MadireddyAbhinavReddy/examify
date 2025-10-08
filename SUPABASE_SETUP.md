# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose organization and fill project details
5. Wait for project to be created

## Step 2: Get Project Credentials
1. Go to Project Settings → API
2. Copy your **Project URL**
3. Copy your **anon/public key**

## Step 3: Update Environment Variables
1. Open `.env.local` file
2. Replace the placeholder values:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the SQL

## Step 5: Install Dependencies
```bash
npm install @supabase/supabase-js
```

## Step 6: Deploy to Vercel
1. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `REACT_APP_SUPABASE_URL`
   - Add `REACT_APP_SUPABASE_ANON_KEY`
2. Redeploy your app

## 🎉 You're Done!
Your app now uses Supabase for:
- ✅ PDF file storage
- ✅ Answer key storage
- ✅ Paper metadata
- ✅ Cross-device access

## 🔒 Security Notes
- Current setup allows public access (good for demo)
- For production, consider adding user authentication
- You can restrict access using Row Level Security (RLS)

## 📱 Features Now Available
- Papers persist across devices
- No localStorage limitations
- Reliable file storage
- Real-time capabilities (if needed later)