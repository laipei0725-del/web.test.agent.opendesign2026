import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kremauxwtwobmbjwbzzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZW1hdXh3dHdvYm1iandienpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODYxMTAsImV4cCI6MjA5OTA2MjExMH0.smMJiEQ4n7qr5tpmR54EXPPMNakt1rM1ZM-pw4s5ABw';

export const supabase = createClient(supabaseUrl, supabaseKey);
