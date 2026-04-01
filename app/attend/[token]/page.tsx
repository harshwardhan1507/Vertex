'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2, CheckCircle2, XCircle, Calendar, Ticket } from 'lucide-react'
import Link from 'next/link'

export default function AttendVerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  // As per Next 15 App router unwrap pattern
  const { token } = use(params)
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'not_registered' | 'unauthenticated'>('verifying')
  const [message, setMessage] = useState('Verifying your attendance...')
  const [eventId, setEventId] = useState(token) // Assuming token = event_id for V1

  useEffect(() => {
    async function verifyAttendance() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus('unauthenticated')
        setMessage('You must be logged in to mark attendance.')
        router.push(`/login?next=/attend/${token}`)
        return
      }

      // Check registration
      const { data: registration } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', token)
        .eq('user_id', user.id)
        .single()

      if (!registration) {
        setStatus('not_registered')
        setMessage("You are not registered for this event yet.")
        return
      }

      if (registration.attended) {
        setStatus('success')
        setMessage("Attendance already recorded! Enjoy the event.")
        return
      }

      // If registered but not attended, insert into attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert([{ event_id: token, user_id: user.id, qr_token: token }])

      if (attendanceError && attendanceError.code !== '23505') { // Ignore unique violation if scanned twice rapidly
        setStatus('error')
        setMessage('Failed to mark attendance. Please try scanning again.')
        return
      }

      // Update registration as attended
      await supabase
        .from('registrations')
        .update({ attended: true })
        .eq('id', registration.id)

      // Bump VScore (using a simple update, normally handled by an edge function or DB trigger for security)
      // Since users table enforces RLS, `update` their own vscore
      const { data: userData } = await supabase.from('users').select('vscore').eq('id', user.id).single()
      if (userData) {
        await supabase.from('users').update({ vscore: (userData.vscore || 0) + 10 }).eq('id', user.id)
      }

      setStatus('success')
      setMessage('Attendance successful! +10 VScore awarded.')
    }

    verifyAttendance()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)] text-[var(--color-text-main)]">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Dynamic backdrop glow based on status */}
        <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${
          status === 'verifying' ? 'bg-violet-600/20' :
          status === 'success' ? 'bg-emerald-600/20' : 
          'bg-rose-600/20'
        }`} />
        
        <div className="flex flex-col items-center text-center relative z-10">
          {status === 'verifying' && (
            <>
              <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">Verifying Ticket</h1>
              <p className="text-[var(--color-text-muted)] text-sm">Please wait while we confirm your registration...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-emerald-500">Checked In!</h1>
              <p className="text-emerald-500/80 font-medium text-sm mb-8">{message}</p>
              
              <Link href="/dashboard" className="w-full flex justify-center py-3.5 bg-[var(--color-border-subtle)] hover:bg-[var(--color-border-hover)] border border-[var(--color-border-subtle)] rounded-xl transition-colors font-semibold text-[var(--color-text-main)]">
                Go to Dashboard
              </Link>
            </>
          )}

          {status === 'not_registered' && (
            <>
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <Ticket className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">No Ticket Found</h1>
              <p className="text-[var(--color-text-muted)] text-sm mb-8">{message}</p>
              
              <Link href={`/events/${eventId}`} className="w-full flex justify-center py-3.5 btn-gradient rounded-xl transition-colors font-medium mb-3 shadow-lg shadow-[var(--color-primary)]/20 text-white">
                Register for Event
              </Link>
              <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                Back to Dashboard
              </Link>
            </>
          )}

          {(status === 'error' || status === 'unauthenticated') && (
            <>
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <XCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">Check-in Failed</h1>
              <p className="text-[var(--color-text-muted)] text-sm mb-8">{message}</p>
              
              {status === 'unauthenticated' ? (
                 <Link href={`/login?next=/attend/${eventId}`} className="w-full flex justify-center py-3.5 btn-gradient rounded-xl transition-colors font-medium text-white">
                   Log in
                 </Link>
              ) : (
                <button onClick={() => window.location.reload()} className="w-full flex justify-center py-3.5 bg-[var(--color-border-subtle)] hover:bg-[var(--color-border-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] rounded-xl transition-colors font-medium mb-3">
                  Try Again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
