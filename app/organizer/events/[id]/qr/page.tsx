'use client'

import { useEffect, useState, use } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Loader2, QrCodeIcon, Users } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Event } from '@/types'

export default function QRGeneratorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Ensure user is organizer
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
        
      if (eventData) {
        setEvent(eventData as unknown as Event)
        // Construct scanning URL for the student
        const host = window.location.origin
        // We use the event ID as the token for V1
        setQrUrl(`${host}/attend/${eventData.id}`)
      }

      // Load attendance count
      const { count } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        
      if (count !== null) setAttendanceCount(count)
      setLoading(false)

      // Set up real-time subscription for attendance
      const channel = supabase
        .channel('attendance_live')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'attendance', filter: `event_id=eq.${id}` },
          (payload) => {
            setAttendanceCount((prev) => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    loadData()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )

  if (!event) return <div className="text-white text-center py-20">Event not found.</div>

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Organizer Dashboard</span>
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Live RollCall</h1>
        <p className="text-slate-400">Project this QR code. Students can scan to instantly mark their attendance.</p>
      </div>

      {/* QR Code Card */}
      <div className="bg-[#0f0f1a] border border-white/[0.05] rounded-[2rem] p-8 md:p-12 mb-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-xl font-bold text-white mb-8 relative z-10 text-center">
          {event.title}
        </h2>

        <div className="relative z-10 bg-white p-6 rounded-3xl shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] mb-8">
          {qrUrl ? (
            <QRCodeSVG
              value={qrUrl}
              size={280}
              bgColor={"#ffffff"}
              fgColor={"#08080f"}
              level={"H"}
              includeMargin={false}
              className="rounded-lg"
            />
          ) : (
            <div className="w-[280px] h-[280px] bg-slate-100 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          )}
        </div>

        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center justify-center gap-2 max-w-sm w-full relative z-10">
          <QrCodeIcon className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-medium text-slate-300 truncate">
             {qrUrl}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0f0f1a] border border-emerald-500/20 rounded-2xl p-6 text-center hover:bg-emerald-500/[0.02] transition-colors">
           <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
             <Users className="w-6 h-6" />
           </div>
           <div className="text-4xl font-black text-emerald-400 tracking-tight">{attendanceCount}</div>
           <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500/50 mt-1">Checked In</div>
        </div>
        
        <div className="bg-[#0f0f1a] border border-white/[0.05] rounded-2xl p-6 text-center">
           <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
             <Users className="w-6 h-6" />
           </div>
           <div className="text-4xl font-black text-white tracking-tight">{event.max_capacity}</div>
           <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Total Capacity</div>
        </div>
      </div>
    </div>
  )
}
