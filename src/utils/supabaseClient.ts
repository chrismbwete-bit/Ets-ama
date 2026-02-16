import { createClient } from '@supabase/supabase-js';

// Utilisez des strings vides par défaut pour éviter que le build plante 
// si les variables ne sont pas encore détectées
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
