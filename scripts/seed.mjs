import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function getOrCreateUser(email, name, role) {
  // Check if exists
  let { data: users, error: fetchErr } = await supabase.from('users').select('*').eq('email', email)
  if (users && users.length > 0) {
    if (users[0].role !== role) {
      await supabase.from('users').update({ role }).eq('id', users[0].id)
    }
    return users[0]
  }

  // Use Auth Admin API to create user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: name, role: role }
  })

  if (authErr && !authErr.message.includes('already registered')) {
    console.error(`Error creating ${email}:`, authErr)
    return null
  }

  // Fetch it from public.users (trigger handled insertion)
  // Wait a split second for trigger to finish
  await new Promise(r => setTimeout(r, 500))
  let { data: freshUser } = await supabase.from('users').select('*').eq('email', email).single()
  
  if (freshUser) {
     // Ensure role is forced
     await supabase.from('users').update({ role }).eq('id', freshUser.id)
     return freshUser
  }
  return null
}

async function seed() {
  console.log("Starting advanced seed process...")

  // 1. Create essential users
  console.log("Setting up users...")
  const adminUser = await getOrCreateUser('admin@vertex.com', 'College Admin', 'admin')
  const organizerUser = await getOrCreateUser('organizer@vertex.com', 'Club President', 'organizer')
  const student1 = await getOrCreateUser('student1@vertex.com', 'Alex Hacker', 'student')
  const student2 = await getOrCreateUser('student2@vertex.com', 'Sam Designer', 'student')

  if (!adminUser || !organizerUser || !student1 || !student2) {
    console.error("Failed to setup base users.")
    process.exit(1)
  }
  console.log("Users created successfully.")

  // Also make the first registered real user an admin so the user testing this has access.
  const { data: realUsers } = await supabase.from('users').select('*').limit(1)
  if (realUsers && realUsers.length > 0) {
    await supabase.from('users').update({ role: 'admin' }).eq('id', realUsers[0].id)
    console.log(`Granted Admin role to ${realUsers[0].email} for local testing.`)
  }

  // 2. Create a Club
  console.log("Creating/Upserting Campus Tech Club...")
  const clubId = '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b'
  await supabase.from('clubs').upsert({
    id: clubId,
    name: 'SRM Tech Society',
    description: 'The premier technical club of the campus.',
    organizer_id: organizerUser.id,
    category: 'tech',
    logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200&h=200'
  })

  // 3. Create Events (2 Pending for Admin Review, 2 Approved)
  console.log("Seeding Events...")
  const now = new Date()
  const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const events = [
    {
      id: 'e1000000-0000-0000-0000-000000000001',
      title: 'Global Azure Cloud Summit 2026',
      description: 'Pending approval test.',
      club_id: clubId,
      start_time: nextWeek.toISOString(),
      end_time: new Date(nextWeek.getTime() + 2*60*60*1000).toISOString(),
      venue: 'Auditorium',
      category: 'tech',
      status: 'pending' // Admin sees this
    },
    {
      id: 'e2000000-0000-0000-0000-000000000002',
      title: 'Intro to Machine Learning',
      description: 'Already approved.',
      club_id: clubId,
      start_time: tmrw.toISOString(),
      end_time: new Date(tmrw.getTime() + 2*60*60*1000).toISOString(),
      venue: 'Block 2',
      category: 'workshop',
      status: 'approved', // Student sees this
      banner_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e3000000-0000-0000-0000-000000000003',
      title: 'HackSRM V1.0',
      description: 'Another pending one.',
      club_id: clubId,
      start_time: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 12*60*60*1000).toISOString(),
      venue: 'Main Campus Atrium',
      category: 'tech',
      status: 'pending'
    }
  ]

  for (const e of events) {
    await supabase.from('events').upsert(e)
  }

  // 4. Update Participation Scores for Leaderboard Mock
  console.log("Mocking student participation scores...")
  await supabase.from('participation_scores').update({ total_score: 420, events_attended: 8, volunteer_count: 5 }).eq('user_id', student1.id)
  await supabase.from('participation_scores').update({ total_score: 350, events_attended: 6, volunteer_count: 2 }).eq('user_id', student2.id)

  // 5. Create some mock registrations for the Organizer view
  console.log("Mocking registrations...")
  await supabase.from('registrations').upsert({ event_id: 'e2000000-0000-0000-0000-000000000002', user_id: student1.id }, { onConflict: 'event_id,user_id' })
  await supabase.from('registrations').upsert({ event_id: 'e2000000-0000-0000-0000-000000000002', user_id: student2.id }, { onConflict: 'event_id,user_id' })

  console.log("Seed complete! Run your dev server and check it out.")
}

seed()
