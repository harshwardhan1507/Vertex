import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log("Starting seed process...")

  // 1. Fetch the first user to make them an admin/organizer
  const { data: users, error: userError } = await supabase.from('users').select('*').limit(1)
  if (userError || !users?.length) {
    console.error("No users found. Please sign up a user in the auth UI first.")
    process.exit(1)
  }

  const owner = users[0]
  console.log(`Setting ${owner.email} (${owner.id}) as an organizer...`)

  // Ensure role is organizer so they can see the dashboard properly
  await supabase.from('users').update({ role: 'organizer' }).eq('id', owner.id)

  // 2. Create a Tech Club
  const clubId = '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b' // UUID hardcoded for idempotency
  console.log("Upserting Campus Tech Club...")
  
  const { error: clubError } = await supabase.from('clubs').upsert({
    id: clubId,
    name: 'SRM Tech Society',
    description: 'The premier technical club of SRM Haryana focusing on AI, Cloud, and Open Source development. We host the biggest hackathons on campus.',
    organizer_id: owner.id,
    logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200&h=200'
  })
  
  if (clubError) console.error("Club Error:", clubError)

  // 3. Create 3 events
  console.log("Upserting events...")
  const now = new Date()
  const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const events = [
    {
      id: 'e1000000-0000-0000-0000-000000000001',
      title: 'Global Azure Cloud Summit 2026',
      description: 'Join us for an immersive full-day bootcamp on scaling applications using Microsoft Azure. Bring your laptops!',
      club_id: clubId,
      start_time: nextWeek.toISOString(),
      venue: 'TP Ganesan Auditorium',
      category: 'tech',
      max_capacity: 500,
      vscore_reward: 50,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e2000000-0000-0000-0000-000000000002',
      title: 'Intro to Machine Learning',
      description: 'A beginner friendly hands-on session using Python, Pandas, and Scikit-learn. No prior ML experience required.',
      club_id: clubId,
      start_time: tmrw.toISOString(),
      venue: 'Block 2, Room 404',
      category: 'workshop',
      max_capacity: 100,
      vscore_reward: 20,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e3000000-0000-0000-0000-000000000003',
      title: 'HackSRM V1.0',
      description: 'Our flagship 24-hour hackathon. See what the brightest minds built last month.',
      club_id: clubId,
      start_time: lastMonth.toISOString(),
      venue: 'Main Campus Atrium',
      category: 'tech',
      max_capacity: 800,
      vscore_reward: 100,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200'
    }
  ]

  for (const e of events) {
    const { error } = await supabase.from('events').upsert(e)
    if (error) console.error("Event error:", error)
  }

  console.log("Seed complete! You can now view the student and organizer dashboards.")
}

seed()
