'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Calendar, Users, Target, ArrowRight, Loader2, Plus, QrCode } from 'lucide-react'
import Link from 'next/link'
import type { Event, Registration } from '@/types'

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0, upcomingEvents: 0 })
  const [recentRegs, setRecentRegs] = useState<any[]>([])
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get the club owned by this user
      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('organizer_id', user.id)
        .single()
        
      if (clubData) {
        setClub(clubData)
        
        // 2. Get Events for this club
        const { data: events } = await supabase
          .from('events')
          .select('id, start_time')
          .eq('club_id', clubData.id)
          
        const eventIds = events?.map(e => e.id) || []
        const now = new Date()
        const upcomingCount = events?.filter(e => new Date(e.start_time) > now).length || 0

        // 3. Get Attendance for these events
        let attendeesCount = 0
        let recent: any[] = []

        if (eventIds.length > 0) {
          const { count } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .in('event_id', eventIds)
            
          attendeesCount = count || 0

          // Fetch recent registrations
          const { data: regs } = await supabase
            .from('registrations')
            .select(`
              created_at,
              users (name, email),
              events (title)
            `)
            .in('event_id', eventIds)
            .order('created_at', { ascending: false })
            .limit(5)
            
          if (regs) recent = regs
        }

        setStats({
          totalEvents: events?.length || 0,
          totalAttendees: attendeesCount,
          upcomingEvents: upcomingCount
        })
        setRecentRegs(recent)
      }
      
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative z-10 w-full">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2">Organizer Dashboard</h1>
          {club ? (
             <p className="text-[var(--color-text-muted)] text-sm">Managing events for <span className="font-bold text-[var(--color-text-main)]">{club.name}</span></p>
          ) : (
             <p className="text-amber-500 text-sm font-medium">You don't have a club assigned. Contact an administrator.</p>
          )}
        </div>
        
        {club && (
          <div className="flex flex-wrap items-center gap-3">
             <Link href="/organizer/events/new" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
               <Plus className="w-4 h-4" /> New Event
             </Link>
             <Link href="/organizer/scanner" className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-sm font-bold rounded-xl transition-colors">
               <QrCode className="w-4 h-4" /> Live Scanner
             </Link>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      {club && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <Calendar className="w-24 h-24 text-[var(--color-text-main)]" />
             </div>
             <p className="text-[var(--color-text-muted)] text-sm font-bold tracking-widest uppercase mb-2">Total Events</p>
             <h3 className="text-4xl font-extrabold text-[var(--color-text-main)]">{stats.totalEvents}</h3>
           </div>
           
           <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <Users className="w-24 h-24 text-[var(--color-text-main)]" />
             </div>
             <p className="text-[var(--color-text-muted)] text-sm font-bold tracking-widest uppercase mb-2">Total Attendees</p>
             <h3 className="text-4xl font-extrabold text-[var(--color-text-main)]">{stats.totalAttendees}</h3>
           </div>
           
           <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[1.5rem] p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
               <Target className="w-24 h-24 text-emerald-500" />
             </div>
             <p className="text-emerald-500/80 text-sm font-bold tracking-widest uppercase mb-2">Upcoming Events</p>
             <h3 className="text-4xl font-extrabold text-emerald-500">{stats.upcomingEvents}</h3>
           </div>
        </div>
      )}

      {/* Recent Registrations Table */}
      {club && recentRegs.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/50 flex items-center justify-between">
            <h3 className="font-bold text-[var(--color-text-main)]">Recent Ticket Sales</h3>
            <Link href="/organizer/events" className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-background)]/30">
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Event</th>
                  <th className="px-6 py-3 font-semibold">Time Registered</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentRegs.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-border-subtle)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text-main)]">{reg.users.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{reg.users.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--color-text-main)]">{reg.events.title}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] text-xs">
                      {new Date(reg.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
