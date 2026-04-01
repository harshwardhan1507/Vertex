'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Calendar, Search, MapPin, Loader2, ArrowRight } from 'lucide-react'
import type { Event } from '@/types'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient()
      const { data } = await supabase
        .from('events')
        .select(`*, club:clubs(name, logo_url)`)
        .eq('status', 'approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      if (data) setEvents(data as unknown as Event[])
      setLoading(false)
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    (e.club && e.club.name.toLowerCase().includes(search.toLowerCase()))
  )

  const categoryTag: Record<string, string> = {
    tech: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cultural: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    workshop: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    sports: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">EventPass</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-md">Discover what's happening on campus. Register for events to earn VScore.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search events or clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--color-border-subtle)] rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-[var(--color-text-main)] font-medium mb-1">No events found</h3>
          <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto">
            {search ? 'Try adjusting your search terms.' : 'There are no upcoming events approved yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEvents.map(event => (
            <Link 
              key={event.id}
              href={`/events/${event.id}`}
              className="group flex flex-col bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden hover:border-[var(--color-primary)]/30 hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-all"
            >
              {/* Image Header */}
              <div className="h-40 relative bg-slate-800">
                {event.banner_url ? (
                  <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1040]/50 to-indigo-950/80 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-white/10" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md ${categoryTag[event.category] || categoryTag.other}`}>
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                    {event.club?.logo_url && <img src={event.club.logo_url} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <span className="text-xs font-medium text-slate-400 truncate">{event.club?.name || 'Unknown Club'}</span>
                </div>

                <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                  {event.title}
                </h3>
                
                <div className="mt-auto space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{new Date(event.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {event.max_capacity} Seats Left
                  </span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] group-hover:opacity-80 transition-opacity">
                    Tickets <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
