-- DEMO DATA SEED SCRIPT FOR VERTEX
-- Execute this directly in the Supabase SQL Editor

-- 1. Elevate your first registered user to 'organizer' so you can test the dashboard
UPDATE public.users 
SET role = 'organizer' 
WHERE email = (SELECT email FROM public.users ORDER BY created_at ASC LIMIT 1);

-- 2. Create the SRM Tech Society Club assigned to your Organizer account
INSERT INTO public.clubs (id, name, description, organizer_id, logo_url)
VALUES (
  '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b',
  'SRM Tech Society',
  'The premier technical club of SRM Haryana focusing on AI, Cloud, and Open Source development. We host the biggest hackathons on campus.',
  (SELECT id FROM public.users WHERE role = 'organizer' ORDER BY created_at ASC LIMIT 1),
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200&h=200'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert 3 Distinct Events (Past, Tomorrow, Next Week)
INSERT INTO public.events (id, title, description, club_id, start_time, end_time, venue, category, max_capacity, status, banner_url)
VALUES 
(
  'e1000000-0000-0000-0000-000000000001',
  'Global Azure Cloud Summit 2026',
  'Join us for an immersive full-day bootcamp on scaling applications using Microsoft Azure. Bring your laptops!',
  '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '6 hours',
  'TP Ganesan Auditorium',
  'tech',
  500,
  'approved',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
),
(
  'e2000000-0000-0000-0000-000000000002',
  'Intro to Machine Learning',
  'A beginner friendly hands-on session using Python, Pandas, and Scikit-learn. No prior ML experience required.',
  '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '3 hours',
  'Block 2, Room 404',
  'workshop',
  100,
  'approved',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1200'
),
(
  'e3000000-0000-0000-0000-000000000003',
  'HackSRM V1.0',
  'Our flagship 24-hour hackathon. See what the brightest minds built last month.',
  '7d2ac8d2-43bb-4d76-9388-7e1082c5f94b',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '29 days',
  'Main Campus Atrium',
  'tech',
  800,
  'approved',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200'
) ON CONFLICT (id) DO NOTHING;
