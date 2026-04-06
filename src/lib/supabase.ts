import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We use a placeholder if keys are missing to prevent immediate crash, 
// but we'll check these in the UI to show a setup guide.
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Expose supabase to window for debugging and manual scripts
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

export { isConfigured };
