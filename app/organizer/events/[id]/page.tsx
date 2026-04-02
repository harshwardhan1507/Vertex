'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Users, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

type Attendee = {
  id: string
  user_id: string
  attended: boolean
  registered_at: string
  user: {
    name: string
    email: string
    avatar_url: string | null
  }
}

export default function OrganizerEventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<any>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEventData() {
      const supabase = createClient()
      
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
        
      if (eventData) setEvent(eventData)

      const { data: regData } = await supabase
        .from('registrations')
        .select('id, user_id, attended, registered_at, user:users(name, email, avatar_url)')
        .eq('event_id', id)
        .order('registered_at', { ascending: false })

      if (regData) setAttendees(regData as unknown as Attendee[])
      
      setLoading(false)
    }

    loadEventData()
  }, [id])

  if (loading) {
    return (
       <div className="flex justify-center py-20">
         <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
       </div>
    )
  }

  if (!event) {
    return <div className="text-center py-20">Event not found.</div>
  }

  const attendedCount = attendees.filter(a => a.attended).length

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6 relative z-10 w-full max-w-5xl mx-auto">
      
      <Link href="/organizer/events" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Events</span>
      </Link>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 md:p-8 flex items-start justify-between flex-wrap gap-4 shadow-sm">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">{event.category}</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2">{event.title}</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{new Date(event.start_time).toLocaleString()} • {event.venue}</p>
        </div>
        
        <div className="bg-[var(--color-background)] border border-[var(--color-border-subtle)] px-6 py-3 rounded-2xl text-center">
           <div className={`text-sm font-bold uppercase tracking-widest ${event.status === 'approved' ? 'text-emerald-500' : event.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
             {event.status}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[var(--color-text-main)] leading-none">{attendees.length}</div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] mt-1">Total Registrations</div>
          </div>
        </div>
        
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[var(--color-text-main)] leading-none">{attendedCount}</div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] mt-1">Checked In</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden mt-8 shadow-sm">
        <div className="p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">Registration List</h2>
        </div>
        
        {attendees.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-muted)] text-sm">
            No students have registered for this event yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {attendees.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-border-subtle)]/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[var(--color-border-subtle)] flex items-center justify-center text-sm font-bold text-[var(--color-text-main)] overflow-hidden shrink-0 border border-[var(--color-border-subtle)]">
                  {a.user.avatar_url ? <img src={a.user.avatar_url} className="w-full h-full object-cover"/> : a.user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--color-text-main)] truncate">{a.user.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)] truncate">{a.user.email}</div>
                </div>
                
                <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] w-40 shrink-0">
                   <Clock className="w-3.5 h-3.5" /> {new Date(a.registered_at).toLocaleDateString()}
                </div>

                <div className="shrink-0 w-28 text-right">
                  {a.attended ? (
                     <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                       <CheckCircle className="w-3 h-3" /> In
                     </span>
                  ) : (
                     <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                       Registered
                     </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
