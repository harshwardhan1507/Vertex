'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Calendar, QrCode, ArrowRight, Loader2, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/types'

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: club } = await supabase
        .from('clubs')
        .select('id')
        .eq('organizer_id', user.id)
        .single()

      if (club) {
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('club_id', club.id)
          .order('start_time', { ascending: false })
          
        if (data) setEvents(data as Event[])
      }
      setLoading(false)
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6 relative z-10 w-full">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">Manage Events</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Create, update, and manage your club's events and ticketing.</p>
        </div>
        
        <Link href="/organizer/events/new" className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap">
          <Plus className="w-5 h-5" /> Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--color-border-subtle)] rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-[var(--color-text-main)] font-medium mb-1">No events published</h3>
          <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto mb-6">
            You haven't hosted any events yet! Create your first event to start accepting registrations and scanning tickets.
          </p>
          <Link href="/organizer/events/new" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isUpcoming = new Date(event.start_time) > new Date()
            
            return (
              <div key={event.id} className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] overflow-hidden flex flex-col group hover:border-[var(--color-border-hover)] transition-colors">
                <div className="relative h-32 w-full bg-[var(--color-border-subtle)] border-b border-[var(--color-border-subtle)]">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md bg-[var(--color-surface)]/80 ${isUpcoming ? 'text-emerald-500 border-emerald-500/30' : 'text-[var(--color-text-muted)] border-[var(--color-border-subtle)]'}`}>
                      {isUpcoming ? 'Live' : 'Past'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col relative z-20">
                  <h3 className="font-headline text-lg font-bold text-[var(--color-text-main)] mb-1 leading-tight line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="text-xs text-[var(--color-text-muted)] mb-4">{new Date(event.start_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>

                  <div className="mt-auto pt-4 border-t border-[var(--color-border-subtle)] grid grid-cols-2 gap-2">
                     <Link 
                       href={`/organizer/events/${event.id}/qr`}
                       className="flex items-center justify-center gap-1.5 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:text-emerald-500 hover:border-emerald-500/50 font-semibold text-xs rounded-xl transition-colors"
                     >
                       <QrCode className="w-4 h-4" /> Scanner
                     </Link>
                     <Link 
                       href={`/organizer/events/${event.id}`}
                       className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-semibold text-xs rounded-xl transition-colors"
                     >
                       Manage <ArrowRight className="w-4 h-4" />
                     </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
