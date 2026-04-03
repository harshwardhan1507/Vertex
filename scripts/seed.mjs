import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env.local manually (no dotenv needed) ─────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
const envVars = {}
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

console.log(`\n🔗 Connecting to: ${supabaseUrl}\n`)

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── Helpers ──────────────────────────────────────────────

async function createDemoUser(email, name, role) {
  console.log(`   Creating ${role}: ${email}...`)

  // Try creating via Auth Admin API
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: name, role }
  })

  if (authErr) {
    if (authErr.message.includes('already been registered') || authErr.message.includes('already registered')) {
      console.log(`   ↳ ${email} already exists, fetching...`)
      const { data: existing } = await supabase.from('users').select('*').eq('email', email).single()
      if (existing) {
        await supabase.from('users').update({ role, name }).eq('id', existing.id)
        await supabase.auth.admin.updateUserById(existing.id, {
          user_metadata: { full_name: name, role }
        })
        return existing
      }
      console.error(`   ✗ Could not fetch existing user ${email}`)
      return null
    }
    console.error(`   ✗ Auth error for ${email}:`, authErr.message)
    return null
  }

  // Wait for the DB trigger to create the public.users row
  await new Promise(r => setTimeout(r, 1500))

  // Fetch the inserted row
  const { data: newUser } = await supabase.from('users').select('*').eq('email', email).single()

  if (newUser) {
    await supabase.from('users').update({ role }).eq('id', newUser.id)
    console.log(`   ✓ ${name} (${role}) → ${newUser.id}`)
    return newUser
  }

  // If trigger didn't fire, manually insert
  if (authData?.user) {
    const { data: manualUser, error: insertErr } = await supabase.from('users').upsert({
      id: authData.user.id,
      name,
      email,
      role
    }).select().single()
    if (manualUser) {
      console.log(`   ✓ ${name} (${role}) → ${manualUser.id} [manual insert]`)
      await supabase.from('participation_scores').upsert({ user_id: manualUser.id })
      return manualUser
    }
    console.error(`   ✗ Manual insert failed:`, insertErr?.message)
  }

  return null
}

// ── Main Seed ────────────────────────────────────────────

async function seed() {
  console.log('🌱 Vertex Seed — Starting...\n')

  // ─── Step 1: Create Demo Users ──────────────
  console.log('👤 Step 1/5 — Creating demo accounts...')
  const admin     = await createDemoUser('admin@vertex.com',     'College Admin',    'admin')
  const organizer = await createDemoUser('organizer@vertex.com', 'Club President',   'organizer')
  const student1  = await createDemoUser('student1@vertex.com',  'Alex Hacker',      'student')
  const student2  = await createDemoUser('student2@vertex.com',  'Sam Designer',     'student')
  const student3  = await createDemoUser('student3@vertex.com',  'Priya Sharma',     'student')

  if (!admin || !organizer || !student1) {
    console.error('\n❌ Failed to create essential users. Aborting.')
    console.error('   Make sure you ran schema.sql in the Supabase SQL Editor first!')
    process.exit(1)
  }
  console.log('')

  // ─── Step 2: Create Club ────────────────────
  console.log('🏛️  Step 2/5 — Creating club...')
  const clubId = '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b'
  const { error: clubErr } = await supabase.from('clubs').upsert({
    id: clubId,
    name: 'SRM Tech Society',
    description: 'The premier technical club of SRM Haryana focusing on AI, Cloud, and Open Source development. We host the biggest hackathons on campus.',
    organizer_id: organizer.id,
    category: 'tech',
    logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200&h=200'
  })
  if (clubErr) console.error('   ✗ Club error:', clubErr.message)
  else console.log('   ✓ SRM Tech Society created\n')

  // ─── Step 3: Create Events ─────────────────
  console.log('📅 Step 3/5 — Seeding events...')
  const now = new Date()
  const tomorrow       = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
  const in3Days        = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const nextWeek       = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in2Weeks       = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const lastMonth      = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const threeDaysAgo   = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const events = [
    {
      id: 'e1000000-0000-0000-0000-000000000001',
      title: 'Global Azure Cloud Summit 2026',
      description: 'Join us for an immersive full-day bootcamp on scaling applications using Microsoft Azure. Topics include serverless functions, Cosmos DB, and AKS. Bring your laptops — hands-on labs included!',
      club_id: clubId,
      start_time: nextWeek.toISOString(),
      end_time: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      venue: 'TP Ganesan Auditorium',
      category: 'tech',
      max_capacity: 500,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e2000000-0000-0000-0000-000000000002',
      title: 'Intro to Machine Learning',
      description: 'A beginner-friendly hands-on session using Python, Pandas, and Scikit-learn. No prior ML experience required. You\'ll build your first classifier by the end of the workshop!',
      club_id: clubId,
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      venue: 'Block 2, Room 404',
      category: 'workshop',
      max_capacity: 100,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e3000000-0000-0000-0000-000000000003',
      title: 'HackSRM V1.0 — 24hr Hackathon',
      description: 'Our flagship 24-hour hackathon! 800 participants, 50+ mentors, ₹2L in prizes. Build something amazing from scratch and pitch it to industry judges.',
      club_id: clubId,
      start_time: lastMonth.toISOString(),
      end_time: new Date(lastMonth.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Main Campus Atrium',
      category: 'tech',
      max_capacity: 800,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e4000000-0000-0000-0000-000000000004',
      title: 'UI/UX Design Sprint Workshop',
      description: 'Learn Figma, design systems, and user research in this intensive 3-hour workshop. We\'ll redesign a real campus app together. Great for beginners!',
      club_id: clubId,
      start_time: in2Weeks.toISOString(),
      end_time: new Date(in2Weeks.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      venue: 'Design Lab, Block 5',
      category: 'workshop',
      max_capacity: 60,
      status: 'pending',
      banner_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e5000000-0000-0000-0000-000000000005',
      title: 'Open Source Contribution Night',
      description: 'An evening dedicated to contributing to open source projects. Maintainers from popular repos will guide you through your first PR. Free pizza!',
      club_id: clubId,
      start_time: threeDaysAgo.toISOString(),
      end_time: new Date(threeDaysAgo.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      venue: 'Computer Lab 3, Block 1',
      category: 'tech',
      max_capacity: 40,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'e6000000-0000-0000-0000-000000000006',
      title: 'Campus Cultural Fest — Resonance 2026',
      description: 'The biggest cultural extravaganza of the year! Music, dance, drama, art exhibitions, and more. Three days of non-stop celebration.',
      club_id: clubId,
      start_time: in3Days.toISOString(),
      end_time: new Date(in3Days.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      venue: 'Open Air Theatre',
      category: 'cultural',
      max_capacity: 2000,
      status: 'approved',
      banner_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200'
    }
  ]

  for (const evt of events) {
    const { error } = await supabase.from('events').upsert(evt)
    if (error) console.error(`   ✗ Event "${evt.title}":`, error.message)
    else console.log(`   ✓ ${evt.title} [${evt.status}]`)
  }
  console.log('')

  // ─── Step 4: Create Registrations ──────────
  console.log('📝 Step 4/5 — Creating mock registrations...')
  const regs = [
    // ML workshop (tomorrow)
    { event_id: 'e2000000-0000-0000-0000-000000000002', user_id: student1.id },
    { event_id: 'e2000000-0000-0000-0000-000000000002', user_id: student2?.id },
    { event_id: 'e2000000-0000-0000-0000-000000000002', user_id: student3?.id },
    // Azure Summit (next week)
    { event_id: 'e1000000-0000-0000-0000-000000000001', user_id: student1.id },
    { event_id: 'e1000000-0000-0000-0000-000000000001', user_id: student3?.id },
    // Cultural Fest (3 days)
    { event_id: 'e6000000-0000-0000-0000-000000000006', user_id: student1.id },
    { event_id: 'e6000000-0000-0000-0000-000000000006', user_id: student2?.id },
    // Past hackathon
    { event_id: 'e3000000-0000-0000-0000-000000000003', user_id: student1.id, attended: true },
    { event_id: 'e3000000-0000-0000-0000-000000000003', user_id: student2?.id, attended: true },
    // Past open source night
    { event_id: 'e5000000-0000-0000-0000-000000000005', user_id: student1.id, attended: true },
    { event_id: 'e5000000-0000-0000-0000-000000000005', user_id: student2?.id, attended: true },
    { event_id: 'e5000000-0000-0000-0000-000000000005', user_id: student3?.id },
  ].filter(r => r.user_id)

  for (const reg of regs) {
    const { error } = await supabase.from('registrations').upsert(reg, { onConflict: 'event_id,user_id' })
    if (error) console.error(`   ✗ Registration:`, error.message)
  }
  console.log(`   ✓ ${regs.length} registrations created\n`)

  // ─── Step 5: Participation Scores ──────────
  console.log('🏆 Step 5/5 — Setting participation scores...')
  const scores = [
    { user_id: student1.id, total_score: 420, events_attended: 8, volunteer_count: 5, certificates_earned: 3, grade: 'A' },
    { user_id: student2?.id, total_score: 350, events_attended: 6, volunteer_count: 2, certificates_earned: 2, grade: 'B' },
    { user_id: student3?.id, total_score: 180, events_attended: 3, volunteer_count: 1, certificates_earned: 1, grade: 'C' },
  ].filter(s => s.user_id)

  for (const score of scores) {
    const { error } = await supabase.from('participation_scores')
      .update(score)
      .eq('user_id', score.user_id)
    if (error) console.error(`   ✗ Score for ${score.user_id}:`, error.message)
  }
  console.log('   ✓ Participation scores updated\n')

  // ─── Summary ───────────────────────────────
  console.log('═'.repeat(50))
  console.log('  🎉 Seed complete! Here are your demo accounts:')
  console.log('═'.repeat(50))
  console.log('  🎓 Student   → student1@vertex.com / password123')
  console.log('  🎯 Organizer → organizer@vertex.com / password123')
  console.log('  🛡️  Admin     → admin@vertex.com / password123')
  console.log('═'.repeat(50))
  console.log(`  📅 ${events.length} events created (${events.filter(e => e.status === 'approved').length} approved, ${events.filter(e => e.status === 'pending').length} pending)`)
  console.log(`  📝 ${regs.length} registrations`)
  console.log(`  🏆 ${scores.length} participation scores`)
  console.log('═'.repeat(50))
  console.log('\n  Run: npm run dev')
  console.log('')
}

seed().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
