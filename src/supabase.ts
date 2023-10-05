import {createClient} from "@supabase/supabase-js";

const SUPABASE_URL = 'https://hrrxcvkspmstdrfcqxsh.supabase.co';
const SUPABSE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycnhjdmtzcG1zdGRyZmNxeHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYyODk1MzIsImV4cCI6MjAxMTg2NTUzMn0.c6ttSUImiUqawruGMuD6_sr6bxQg91mVcs0ahRc3jko';

export const supabase = createClient(SUPABASE_URL, SUPABSE_ANON_KEY)
