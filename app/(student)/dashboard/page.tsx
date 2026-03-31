'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User, Event, Registration, ParticipationScore } from '@/types'

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [score, setScore] = useState<ParticipationScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      // Get upcoming approved events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*, club:clubs(name, logo_url)')
        .eq('status', 'approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4)

      // Get user registrations
      const { data: regData } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', authUser.id)

      // Get participation score
      const { data: scoreData } = await supabase
        .from('participation_scores')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (userData) setUser(userData)
      if (eventsData) setEvents(eventsData)
      if (regData) setRegistrations(regData)
      if (scoreData) setScore(scoreData)

      setLoading(false)
    }

    loadDashboard()
  }, [router])

  const registeredEventIds = registrations.map(r => r.event_id)

  function getGradeColor(grade: string) {
    const colors: Record<string, string> = {
      S: 'text-yellow-400',
      A: 'text-violet-400',
      B: 'text-blue-400',
      C: 'text-green-400',
      D: 'text-orange-400',
      E: 'text-white/40',
    }
    return colors[grade] || 'text-white/40'
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const categoryTag: Record<string, string> = {
    tech: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    cultural: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
    workshop: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    sports: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
    other: 'bg-white/10 text-white/50 border-white/10',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white/30 text-sm">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {events.length} upcoming events · Your VScore is{' '}
            <span className={getGradeColor(score?.grade || 'E')}>
              Grade {score?.grade || 'E'}
            </span>
          </p>
        </div>
        <button
          onClick={() => router.push('/events')}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-all shadow-lg shadow-violet-500/25"
        >
          Browse Events →
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: '🎯', value: score?.events_attended || 0, label: 'Events Attended' },
          { icon: '🎓', value: score?.certificates_earned || 0, label: 'Certificates' },
          { icon: '🙋', value: score?.volunteer_count || 0, label: 'Volunteer Sessions' },
          { icon: '📋', value: registrations.length, label: 'Registrations' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-5 hover:border-white/15 transition-all"
          >
            <div className="text-2xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold text-white tracking-tight mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* VScore Banner */}
      <div className="bg-gradient-to-r from-[#1a1040] via-[#0f0f1a] to-[#1a0a2e] border border-violet-500/20 rounded-2xl p-6 mb-6 flex items-center gap-6">
        {/* Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="url(#vgrad)" strokeWidth="6"
              strokeDasharray="201"
              strokeDashoffset={201 - (201 * (score?.total_score || 0)) / 400}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="vgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c5cfc" />
                <stop offset="100%" stopColor="#f059da" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getGradeColor(score?.grade || 'E')}`}>
              {score?.grade || 'E'}
            </span>
            <span className="text-[9px] text-white/30 tracking-wider">VSCORE</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="text-base font-bold text-white mb-1">
            {score?.total_score || 0} / 400 pts
          </div>
          <div className="text-xs text-white/40 mb-3">
            Top {score?.percentile || 0}% of campus
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Attendance', value: score?.events_attended || 0, max: 20 },
              { label: 'Volunteer', value: score?.volunteer_count || 0, max: 10 },
              { label: 'Organized', value: score?.events_organized || 0, max: 5 },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-2 text-xs">
                <span className="text-white/40 w-16">{bar.label}</span>
                <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                    style={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-white/60 w-4 text-right">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rank */}
        <div className="flex flex-col items-center gap-1 px-5 py-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <div className="text-3xl font-bold text-violet-400">
            #{score ? Math.ceil((1 - score.percentile / 100) * 100) : '--'}
          </div>
          <div className="text-[10px] text-white/30 tracking-wider">CAMPUS RANK</div>
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Upcoming Events
            <span className="bg-violet-500/15 text-violet-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              {events.length} open
            </span>
          </h2>
          <button
            onClick={() => router.push('/events')}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all →
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-10 text-center">
            <div className="text-3xl mb-3">📭</div>
            <div className="text-sm text-white/40">No upcoming events right now</div>
            <div className="text-xs text-white/20 mt-1">Check back soon</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => {
              const { day, month, time } = formatDate(event.start_time)
              const isRegistered = registeredEventIds.includes(event.id)

              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:translate-x-1 ${
                    isRegistered
                      ? 'bg-violet-500/[0.05] border-violet-500/20'
                      : 'bg-[#0f0f1a] border-white/[0.07] hover:border-white/15'
                  }`}
                >
                  {/* Date */}
                  <div className="flex flex-col items-center justify-center w-12 h-14 bg-white/[0.04] border border-white/[0.07] rounded-xl flex-shrink-0">
                    <span className="text-xl font-bold text-white leading-none">{day}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{month}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryTag[event.category]}`}>
                        {event.category}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white truncate">{event.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      <span>🏛️ {event.venue}</span>
                      <span>⏰ {time}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {isRegistered ? (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                        ✓ Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}