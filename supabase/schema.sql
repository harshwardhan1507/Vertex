-- ─────────────────────────────────────────────
-- CLEANUP (Drop existing tables and types to rebuild)
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.participation_scores CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.club_followers CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS event_category CASCADE;

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_category AS ENUM ('tech', 'cultural', 'workshop', 'sports', 'other');

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'student',
  avatar_url TEXT,
  roll_number TEXT,
  branch TEXT,
  semester INTEGER,
  professor_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CLUBS
-- ─────────────────────────────────────────────
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  category TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  category event_category DEFAULT 'other',
  venue TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  banner_url TEXT,
  max_capacity INTEGER DEFAULT 100,
  status event_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- REGISTRATIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  od_sent BOOLEAN DEFAULT false,
  od_letter_url TEXT,
  UNIQUE(event_id, user_id)
);

-- ─────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  qr_token TEXT NOT NULL,
  UNIQUE(event_id, user_id)
);

-- ─────────────────────────────────────────────
-- CERTIFICATES
-- ─────────────────────────────────────────────
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  certificate_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT true
);

-- ─────────────────────────────────────────────
-- CLUB FOLLOWERS
-- ─────────────────────────────────────────────
CREATE TABLE public.club_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('reminder_1day', 'reminder_1hr', 'custom', 'announcement')),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- PARTICIPATION SCORES
-- ─────────────────────────────────────────────
CREATE TABLE public.participation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  semester INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  events_organized INTEGER DEFAULT 0,
  volunteer_count INTEGER DEFAULT 0,
  certificates_earned INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  grade TEXT DEFAULT 'E',
  percentile FLOAT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TRIGGER: AUTO CREATE USER + SCORE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );

  INSERT INTO public.participation_scores (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ENABLE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participation_scores ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can view all users"
ON public.users FOR SELECT USING (true);

CREATE POLICY "Users update own profile"
ON public.users FOR UPDATE USING (auth.uid() = id);

-- EVENTS
CREATE POLICY "Anyone can view approved events"
ON public.events FOR SELECT USING (status = 'approved');

CREATE POLICY "Organizers/Admin manage events"
ON public.events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('organizer', 'admin')
  )
);

-- CLUBS
CREATE POLICY "Clubs visible to all"
ON public.clubs FOR SELECT USING (true);

CREATE POLICY "Organizers/Admin manage clubs"
ON public.clubs FOR ALL USING (
  organizer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- REGISTRATIONS
CREATE POLICY "Users view own registrations, organizers view their event registrations"
ON public.registrations FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND (
      EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = e.club_id AND c.organizer_id = auth.uid()) 
      OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    )
  )
);

CREATE POLICY "Users register themselves"
ON public.registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update registrations (attendance/OD)"
ON public.registrations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND (
      EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = e.club_id AND c.organizer_id = auth.uid()) 
      OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    )
  )
);

-- ATTENDANCE
CREATE POLICY "Users view own attendance, organizers view their event attendance"
ON public.attendance FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND (
      EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = e.club_id AND c.organizer_id = auth.uid()) 
      OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    )
  )
);

CREATE POLICY "Users mark attendance"
ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CERTIFICATES
CREATE POLICY "Users view own certificates, organizers view their event certificates"
ON public.certificates FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND (
      EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = e.club_id AND c.organizer_id = auth.uid()) 
      OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    )
  )
);

CREATE POLICY "Organizers/Admins can issue certs"
  ON public.certificates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
  );

-- NOTIFICATIONS
CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- FOLLOWERS
CREATE POLICY "Users manage own follows"
ON public.club_followers FOR ALL USING (auth.uid() = user_id);

-- SCORES
CREATE POLICY "Users view own score"
ON public.participation_scores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins/system can update scores"
ON public.participation_scores FOR UPDATE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
