const { createClient } = require('@supabase/supabase-js');
const url = 'https://javtroneunhzvoqswzuw.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdnRyb25ldW5oenZvcXN3enV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2NjAzMCwiZXhwIjoyMDkwMzQyMDMwfQ.CbsHdbeqQMxR6BkmR87JKXavveU8MkOYGHOq0wN31R0';
const supabase = createClient(url, key);

async function check() {
  const { data: users, error: ue } = await supabase.from('users').select('*').limit(1);
  console.log('Users table check:', { ue: ue?.message || ue, count: users?.length });

  const { data: ps, error: pe } = await supabase.from('participation_scores').select('*').limit(1);
  console.log('Scores table check:', { pe: pe?.message || pe, count: ps?.length });
  
  const email = 'test' + Date.now() + '@srmuh.edu.in';
  console.log('Attempting signup...');
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    user_metadata: { full_name: 'Test', role: 'student' }
  });
  console.log('Signup Result:', error ? error.message : 'Success ' + data.user.id);
}

check();
