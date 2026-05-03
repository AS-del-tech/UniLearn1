import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Publishable (anon) key client — safe for both client and server use.
// No service role key is required anywhere in this project.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
