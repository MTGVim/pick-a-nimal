import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckgondufuzmoivajyjnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZ29uZHVmdXptb2l2YWp5am53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDEyMTgsImV4cCI6MjA1MzQ3NzIxOH0.Wyk_bS5LhTIdq4zMLJN3fVILcucUO502XVwX9UwCjhA';
export const supabase = createClient(supabaseUrl, supabaseKey);