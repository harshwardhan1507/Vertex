'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Building2, 
  Users, 
  CalendarCheck,
  CalendarClock,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar
} from 'lucide-react'
import type { Event } from '@/types'

// Setup Extended typing since we grab club joins
type AdminEvent = Event & { club: { name: string, logo_url: string } }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    clubs: 0,
    approvedEvents: 0
  })
  const [pendingEvents, setPendingEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadDashboard = async () => {
    const supabase = createClient()
    
    // Quick and dirty stats via exact count
    const [{ count: studentCount }, { count: clubCount }, { count: eventCount }, { data: pendingData }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('events').select('*, club:clubs(name, logo_url)').eq('status', 'pending').order('created_at', { ascending: true })
    ])

    setStats({
      students: studentCount || 0,
      clubs: clubCount || 0,
      approvedEvents: eventCount || 0
    })

    if (pendingData) {
      setPendingEvents(pendingData as unknown as AdminEvent[])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleDecision = async (eventId: string, decision: 'approved' | 'rejected') => {
    setProcessingId(eventId)
    const supabase = createClient()
    const { error } = await supabase
      .from('events')
      .update({ status: decision })
      .eq('id', eventId)

    if (!error) {
      // Remove it locally without fetching all of them again
      setPendingEvents(prev => prev.filter(e => e.id !== eventId))
      if (decision === 'approved') {
        setStats(s => ({ ...s, approvedEvents: s.approvedEvents + 1 }))
      }
    } else {
      alert("Failed to update status: " + error.message)
    }
    setProcessingId(null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl w-full mx-auto pb-10 flex-1">
      
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">System Overview</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Monitor campus metrics and approve pending club events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-center">Active</span>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold text-[var(--color-text-main)] mb-1">{stats.students}</div>
            <div className="text-sm font-semibold text-[var(--color-text-muted)]">Registered Students</div>
          </div>
          <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold text-[var(--color-text-main)] mb-1">{stats.clubs}</div>
            <div className="text-sm font-semibold text-[var(--color-text-muted)]">Official Clubs</div>
          </div>
          <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold text-[var(--color-text-main)] mb-1">{stats.approvedEvents}</div>
            <div className="text-sm font-semibold text-[var(--color-text-muted)]">Approved Events</div>
          </div>
          <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden mt-8">
        <div className="p-6 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">Approval Queue</h2>
          <span className="ml-2 bg-rose-500/10 text-rose-500 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> {pendingEvents.length} Pending
          </span>
        </div>
        
        {pendingEvents.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 opacity-50" />
            <p className="font-semibold text-[var(--color-text-main)] mb-1">Queue is Clear</p>
            <p className="text-sm">There are no events waiting for approval.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {pendingEvents.map(event => (
              <div key={event.id} className="p-6 hover:bg-[var(--color-background)]/50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-border-subtle)] overflow-hidden shrink-0 border border-[var(--color-border-subtle)]">
                  {event.club?.logo_url ? <img src={event.club.logo_url} className="w-full h-full object-cover"/> : null}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-rose-500 tracking-wider uppercase mb-1">{event.club?.name || 'Unknown Club'}</div>
                  <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2 truncate">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {new Date(event.start_time).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {event.venue}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
                  <button 
                    disabled={processingId === event.id}
                    onClick={() => handleDecision(event.id, 'rejected')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                     <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    disabled={processingId === event.id}
                    onClick={() => handleDecision(event.id, 'approved')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {processingId === event.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
