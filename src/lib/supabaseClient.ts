
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Ensure environment variables are not undefined during build or runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is not defined. Please set NEXT_PUBLIC_SUPABASE_URL in your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase anon key is not defined. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.");
}

// Define a generic type for your database schema if you have one, otherwise use `any`
// For better type safety, you can generate types from your Supabase schema:
// See: https://supabase.com/docs/guides/database/api/generating-types
// export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
// export type Database = { public: { Tables: { notes: { Row: { id: number; title: string | null; content: string | null; created_at: string; } } } } }

// Use `any` if you don't have schema types yet. Replace `any` with `Database` once types are generated.
export const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseAnonKey);
