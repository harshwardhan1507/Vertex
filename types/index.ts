export type UserRole = 'student' | 'organizer' | 'admin'

export type EventStatus = 'pending' | 'approved' | 'rejected'

export type EventCategory = 'tech' | 'cultural' | 'workshop' | 'sports' | 'other'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
  roll_number?: string
  branch?: string
  semester?: number
  professor_email?: string
  vscore?: number
  created_at: string
}

export interface Club {
  id: string
  name: string
  description: string
  logo_url?: string
  organizer_id: string
  category: string
  social_links?: {
    instagram?: string
    linkedin?: string
    website?: string
  }
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  club_id: string
  club?: Club
  category: EventCategory
  venue: string
  start_time: string
  end_time: string
  banner_url?: string
  max_capacity: number
  status: EventStatus
  created_at: string
}

export interface Registration {
  id: string
  event_id: string
  event?: Event
  user_id: string
  user?: User
  registered_at: string
  attended: boolean
  od_sent: boolean
  od_letter_url?: string
}

export interface Certificate {
  id: string
  registration_id: string
  event_id: string
  user_id: string
  certificate_url: string
  issued_at: string
  is_verified: boolean
}

export interface ParticipationScore {
  id: string
  user_id: string
  semester: number
  total_score: number
  events_attended: number
  events_organized: number
  volunteer_count: number
  certificates_earned: number
  no_shows: number
  grade: string
  percentile: number
  last_updated: string
}