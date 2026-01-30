// 1. Import createClient directly from the Supabase ESM (module) CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 2. Your URL and Key
const SUPABASE_URL = 'https://wasnboxwjazwnsqxeobs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc25ib3h3amF6d25zcXhlb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDQ0NzAsImV4cCI6MjA3NDYyMDQ3MH0.1QUxkabTQesXHKm4zLUJWD0ElXG1At_HmtbzkN5JuIc';

// 3. Create and EXPORT the client as a named variable.
// This is what your other files (auth.js, dashboard.js, projects.js)
// will import using: import { supabase } from './supabase-client.js'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);