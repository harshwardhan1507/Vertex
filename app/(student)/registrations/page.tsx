'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Ticket, Calendar, MapPin, Clock, CheckCircle2, QrCode, X, Loader2 } from 'lucide-react'
import type { Registration, Event } from '@/types'
import Link from 'next/link'

type RegistrationWithEvent = Registration & { event: Event }

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedTicket, setSelectedTicket] = useState<RegistrationWithEvent | null>(null)

  useEffect(() => {
    async function fetchRegistrations() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('registrations')
        .select(`*, event:events(*)`)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false })

      if (data) {
        setRegistrations(data as unknown as RegistrationWithEvent[])
      }
      setLoading(false)
    }

    fetchRegistrations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  const now = new Date()
  const upcoming = registrations.filter(r => new Date(r.event.start_time) >= now)
  const past = registrations.filter(r => new Date(r.event.start_time) < now)

  const activeData = activeTab === 'upcoming' ? upcoming : past

  const categoryTag: Record<string, string> = {
    tech: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    cultural: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    workshop: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    sports: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    other: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative z-10 w-full">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2">My Tickets</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Access your event passes and view your attendance history.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[var(--color-border-subtle)]/50 rounded-xl w-fit border border-[var(--color-border-subtle)]">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upcoming' ? 'bg-[var(--color-surface)] text-[var(--color-text-main)] shadow-sm border border-[var(--color-border-subtle)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-transparent'}`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'past' ? 'bg-[var(--color-surface)] text-[var(--color-text-main)] shadow-sm border border-[var(--color-border-subtle)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-transparent'}`}
        >
          Past Events ({past.length})
        </button>
      </div>

      {/* Content */}
      {activeData.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--color-border-subtle)] rounded-full flex items-center justify-center mb-4">
            <Ticket className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-[var(--color-text-main)] font-medium mb-1">No {activeTab} registrations</h3>
          <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto mb-6">
            {activeTab === 'upcoming' 
              ? 'You haven\'t secured any tickets yet. Explore the campus events to get started!'
              : 'You haven\'t attended any events yet.'}
          </p>
          <Link href="/events" className="btn-gradient px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 transition-transform">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeData.map(reg => (
            <div key={reg.id} className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] overflow-hidden flex flex-col group hover:border-[var(--color-border-hover)] transition-colors">
              <div className="relative h-32 w-full bg-[var(--color-border-subtle)] border-b border-[var(--color-border-subtle)]">
                {reg.event.banner_url ? (
                  <img src={reg.event.banner_url} alt={reg.event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[var(--color-text-muted)]" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md bg-[var(--color-surface)]/80 ${categoryTag[reg.event.category] || categoryTag.other}`}>
                    {reg.event.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col relative z-20">
                <Link href={`/events/${reg.event_id}`} className="font-headline text-lg font-bold text-[var(--color-text-main)] mb-3 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                  {reg.event.title}
                </Link>

                <div className="space-y-2 mt-auto text-sm text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(reg.event.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{reg.event.venue}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)]">
                  {activeTab === 'upcoming' ? (
                     <button 
                       onClick={() => setSelectedTicket(reg)}
                       className="w-full flex justify-center py-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-bold text-sm rounded-xl transition-colors border border-[var(--color-primary)]/20 gap-2 items-center"
                     >
                       <QrCode className="w-4 h-4" /> View Ticket
                     </button>
                  ) : (
                     <div className={`p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border ${reg.attended ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[var(--color-border-subtle)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]'}`}>
                       {reg.attended ? (
                         <><CheckCircle2 className="w-4 h-4" /> Attended! (+10 VScore)</>
                       ) : (
                         <><X className="w-4 h-4" /> Missed Event</>
                       )}
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--color-background)] rounded-[2rem] border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="p-8 text-center border-b border-dashed border-[var(--color-border-subtle)] relative bg-[var(--color-surface)]">
              {/* Ticket cutouts */}
              <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[var(--color-background)] border-r border-t border-[var(--color-border-subtle)] rotate-45" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[var(--color-background)] border-l border-t border-[var(--color-border-subtle)] -rotate-45" />
              
              <div className="font-bold text-[var(--color-primary)] tracking-widest text-[10px] uppercase mb-2">Event Pass</div>
              <h2 className="text-xl font-extrabold text-[var(--color-text-main)] mb-1 leading-tight">{selectedTicket.event.title}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{new Date(selectedTicket.event.start_time).toLocaleDateString()}</p>
            </div>
            
            <div className="p-8 bg-[var(--color-background)] flex flex-col items-center relative">
              <div className="bg-white p-4 rounded-2xl mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTicket.event_id}`} 
                  alt="QR Code" 
                  className="w-48 h-48"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] text-center max-w-[200px]">
                Scan this code at the venue entry gate to verify your attendance & earn VScore.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
