const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://javtroneunhzvoqswzuw.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function fixClub() {
  console.log('Finding newest organizer account...');
  const { data: users, error: ue } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'organizer')
    .order('created_at', { ascending: false })
    .limit(1);

  if (ue) {
    console.error('Error fetching users:', ue);
    return;
  }

  if (!users || users.length === 0) {
    console.error('No organizer accounts found! You need to create an organizer account first.');
    return;
  }

  const user = users[0];
  console.log(`Found organizer: ${user.name} (${user.email})`);

  console.log('Assigning SRM Tech Society to this organizer...');
  
  // Create or update the club
  const clubId = '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b';
  const { data: club, error: ce } = await supabase
    .from('clubs')
    .upsert({
      id: clubId,
      name: 'SRM Tech Society',
      description: 'The premier technical club of SRM Haryana focusing on AI, Cloud, and Open Source development. We host the biggest hackathons on campus.',
      organizer_id: user.id,
      category: 'tech',
      logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200&h=200'
    }, { onConflict: 'id' })
    .select()
    .single();

  if (ce) {
    console.error('Error upserting club:', ce);
    return;
  }
  
  console.log('Success! Club assigned:', club.name);
  
  // Make sure we have some events too so the dashboard isn't completely empty
  const events = [
    {
      id: 'e1000000-0000-0000-0000-000000000001',
      title: 'Global Azure Cloud Summit 2026',
      description: 'Join us for an immersive full-day bootcamp on scaling applications using Microsoft Azure. Bring your laptops!',
      club_id: clubId,
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 7.25 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'TP Ganesan Auditorium',
      category: 'tech',
      max_capacity: 500,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e2000000-0000-0000-0000-000000000002',
      title: 'Intro to Machine Learning',
      description: 'A beginner friendly hands-on session using Python, Pandas, and Scikit-learn. No prior ML experience required.',
      club_id: clubId,
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 1.15 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Block 2, Room 404',
      category: 'workshop',
      max_capacity: 100,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1200'
    }
  ];
  
  const { error: evErr } = await supabase.from('events').upsert(events, { onConflict: 'id' });
  if (evErr) {
    console.error('Error inserting events:', evErr);
  } else {
    console.log('Inserted demo events automatically!');
  }
}

fixClub();
