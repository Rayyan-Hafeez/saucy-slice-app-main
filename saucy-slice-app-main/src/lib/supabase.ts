import { createClient } from '@supabase/supabase-js';

// Replace the placeholder strings below with your actual keys from the Supabase dashboard
const supabaseUrl = 'https://ozohdzcllyctfspjytxq.supabase.co';
const supabaseKey = 'sb_publishable_MdyHwQitzlzsyEerMPfp5w_INrEGnS2';

export const supabase = createClient(supabaseUrl, supabaseKey);