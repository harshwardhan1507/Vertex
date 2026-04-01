'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import { Calendar, Users, MapPin, ArrowLeft, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/types'

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [club, setClub] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClub() {
      const supabase = createClient()
      
      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single()
        
      if (clubData) setClub(clubData)

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', id)
        .order('start_time', { ascending: true })

      if (eventData) setEvents(eventData as unknown as Event[])

      setLoading(false)
    }

    fetchClub()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="text-center py-20 text-[var(--color-text-main)]">Club not found.</div>
    )
  }

  const upcomingEvents = events.filter(e => new Date(e.start_time) >= new Date())
  const pastEvents = events.filter(e => new Date(e.start_time) < new Date())

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full">
      
      {/* Back Button */}
      <Link href="/clubs" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Directory</span>
      </Link>

      {/* Club Banner Header */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[2rem] overflow-hidden relative shadow-sm">
        <div className="h-32 md:h-48 w-full bg-[var(--color-border-subtle)] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20" />
        </div>
        
        <div className="px-6 md:px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-[var(--color-surface)] border-4 border-[var(--color-surface)] shadow-lg -mt-14 relative z-10 overflow-hidden flex items-center justify-center text-4xl font-bold text-[var(--color-text-muted)] shrink-0">
               {club.logo_url ? <img src={club.logo_url} alt="" className="w-full h-full object-cover" /> : club.name[0]}
            </div>
            
            <div className="flex-1 mt-2 md:mt-4">
               <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2 leading-tight flex items-center gap-2">
                 {club.name}
               </h1>
               <p className="text-[var(--color-text-muted)] text-base leading-relaxed max-w-2xl opacity-90">
                 {club.description || 'This club is dedicated to improving the student experience at SRM.'}
               </p>
               
               <div className="flex items-center gap-6 mt-6 border-t border-[var(--color-border-subtle)] pt-6">
                 <div>
                   <div className="text-2xl font-extrabold text-[var(--color-primary)] leading-none">{events.length}</div>
                   <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] mt-1">Total Events</div>
                 </div>
                 <div className="w-px h-8 bg-[var(--color-border-subtle)]" />
                 <div>
                   <div className="text-2xl font-extrabold text-[var(--color-text-main)] leading-none">{upcomingEvents.length}</div>
                   <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] mt-1">Upcoming</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-extrabold text-[var(--color-text-main)] tracking-tight flex items-center gap-2">
           <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
           Upcoming Club Events
        </h2>
        
        {upcomingEvents.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-[1.5rem] p-10 text-center">
             <div className="text-[var(--color-text-muted)] text-sm">{club.name} doesn't have any upcoming events right now.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {upcomingEvents.map(event => (
               <Link 
                 key={event.id}
                 href={`/events/${event.id}`}
                 className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-5 flex flex-col group hover:border-[var(--color-primary)]/40 hover:-translate-y-1 transition-all"
               >
                 <h3 className="font-headline text-lg font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors mb-2 line-clamp-1">{event.title}</h3>
                 <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(event.start_time).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.venue}</span>
                 </div>
                 
                 <div className="mt-auto pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                   <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] px-2 py-1 bg-[var(--color-primary)]/10 rounded-md">
                     {event.category}
                   </div>
                   <div className="text-[var(--color-primary)] text-sm font-semibold flex items-center gap-1 group-hover:opacity-80 transition-opacity">
                     Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </div>
                 </div>
               </Link>
             ))}
          </div>
        )}
      </div>

    </div>
  )
}
