'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Calendar, MapPin, Loader2, ArrowLeft, Ticket, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import type { Event, Registration } from '@/types'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Next 15+ App Router unwrap params
  const { id } = use(params)
  
  const [event, setEvent] = useState<Event | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // Get Event Details
      const { data: eventData } = await supabase
        .from('events')
        .select('*, club:clubs(name, logo_url, description)')
        .eq('id', id)
        .single()
        
      if (eventData) setEvent(eventData as unknown as Event)

      // Get user's registration for this event
      if (user && eventData) {
        const { data: regData } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single()
          
        if (regData) setRegistration(regData as Registration)
      }

      setLoading(false)
    }
    loadData()
  }, [id])

  async function handleRegister() {
    if (!userId || !event || registration) return
    setRegistering(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('registrations')
      .insert([
        { event_id: event.id, user_id: userId }
      ])
      .select()
      .single()

    if (error) {
      alert('Error registering: ' + error.message)
    } else {
      setRegistration(data as Registration)
    }
    setRegistering(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )

  if (!event) return (
    <div className="text-center py-20 text-[var(--color-text-main)]">Event not found.</div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Back Button */}
      <Link href="/events" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Pass</span>
      </Link>

      {/* Banner */}
      <div className="relative h-48 md:h-72 w-full rounded-3xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
        {event.banner_url ? (
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/60 to-indigo-950/80 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/10" />
          </div>
        )}
        <div className="absolute top-4 left-4 bg-[var(--color-surface)]/80 backdrop-blur-md text-[var(--color-text-main)] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] shadow-sm">
          {event.category}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-4">{event.title}</h1>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-border-subtle)] border border-[var(--color-border-subtle)] overflow-hidden flex items-center justify-center">
                {event.club?.logo_url ? (
                  <img src={event.club.logo_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-[var(--color-text-muted)] font-bold">C</span>
                )}
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-muted)] font-medium tracking-wide uppercase">Organized by</div>
                <div className="text-sm text-[var(--color-text-main)] font-semibold">{event.club?.name || 'Unknown Club'}</div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-violet max-w-none text-[var(--color-text-main)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">About this Event</h3>
            <p className="whitespace-pre-wrap leading-relaxed opacity-90">{event.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Sidebar Info & Ticket */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-primary)]/20 transition-all pointer-events-none" />
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-main)]">Date & Time</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">
                    {new Date(event.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    <br />
                    {new Date(event.start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-main)]">Location</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">
                    {event.venue}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
              {registration ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <CheckSquare className="w-8 h-8 text-emerald-400 mb-2" />
                    <span className="font-bold text-emerald-400">You're Going!</span>
                    <span className="text-xs text-emerald-400/70 mt-1">Ticket Confirmed</span>
                  </div>
                  {registration.attended ? (
                     <div className="text-center text-xs text-[var(--color-primary)] font-medium border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 rounded-xl p-3">
                         ✓ Marked Attended
                     </div>
                  ) : (
                     <div className="text-center text-xs text-[var(--color-text-muted)]">
                         Scan QR code at the event to mark attendance
                     </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                  {registering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" /> Get Ticket
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
