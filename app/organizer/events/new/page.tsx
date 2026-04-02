'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Calendar as CalendarIcon, MapPin, Image as ImageIcon, FileText, AlignLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const { data: club } = await supabase
        .from('clubs')
        .select('id')
        .eq('organizer_id', user.id)
        .single()

      if (!club) throw new Error("No club associated with your organizer account.")

      const startTimeStr = formData.get('start_time') as string
      let endTimeStr = formData.get('end_time') as string
      if (!endTimeStr) {
        // Auto default to 2 hours runtime if not provided implicitly
        const end = new Date(startTimeStr)
        end.setHours(end.getHours() + 2)
        // Format to correct ISO without Z so postgres handles it easily locally
        endTimeStr = end.toISOString()
      }

      const payload = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        start_time: startTimeStr,
        end_time: endTimeStr,
        venue: formData.get('venue') as string,
        max_capacity: parseInt(formData.get('max_capacity') as string) || 100,
        club_id: club.id,
        status: 'approved', // Auto-approve for demo
        banner_url: formData.get('banner_url') as string || null
      }

      const { error: insertError } = await supabase
        .from('events')
        .insert([payload])

      if (insertError) throw insertError

      router.push('/organizer/events')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create event.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6 relative z-10 w-full">
      
      <Link href="/organizer/events" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Events</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">Create New Event</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Publish a new event, competition, or workshop to the student portal.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[2rem] p-6 text-[var(--color-text-main)] md:p-10 space-y-8 shadow-sm">
        
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <h3 className="font-bold border-b border-[var(--color-border-subtle)] pb-2 text-emerald-500">Core Details</h3>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-text-muted)]" /> Event Title *
            </label>
            <input required name="title" type="text" placeholder="e.g. Intro to Machine Learning Workshop" 
              className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-[var(--color-text-muted)]" /> Description
            </label>
            <textarea required name="description" rows={4} placeholder="Describe what the event is about..." 
               className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Category *</label>
              <select required name="category" defaultValue="tech" className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="tech">Tech / Hackathon</option>
                <option value="cultural">Cultural / Arts</option>
                <option value="workshop">Workshop / Seminar</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-sm font-bold flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-[var(--color-text-muted)]" /> Banner Image URL
               </label>
               <input name="banner_url" type="url" placeholder="https://... [optional]" 
                 className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
               />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-2">
          <h3 className="font-bold border-b border-[var(--color-border-subtle)] pb-2 text-emerald-500">Logistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="text-sm font-bold flex items-center gap-2">
                 <CalendarIcon className="w-4 h-4 text-[var(--color-text-muted)]" /> Start Date & Time *
               </label>
               <input required name="start_time" type="datetime-local" 
                 className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
               />
            </div>
            
            <div className="space-y-1.5">
               <label className="text-sm font-bold flex items-center gap-2">
                 <CalendarIcon className="w-4 h-4 text-[var(--color-text-muted)]" /> End Date & Time *
               </label>
               <input required name="end_time" type="datetime-local" 
                 className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="text-sm font-bold flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" /> Venue Location *
               </label>
               <input required name="venue" type="text" placeholder="e.g. TP Ganesan Auditorium" 
                 className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
               />
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-sm font-bold flex items-center gap-2">
               <Users className="w-4 h-4 text-[var(--color-text-muted)]" /> Max Capacity
             </label>
             <input required name="max_capacity" type="number" min="1" defaultValue="100"
               className="w-full md:w-[calc(50%-12px)] bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
             />
             <p className="text-xs text-[var(--color-text-muted)] mt-1">Registrations will automatically close when this limit is reached.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--color-border-subtle)] flex gap-4">
          <Link href="/organizer/events" className="px-6 py-3.5 rounded-xl font-bold bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:bg-[var(--color-border-subtle)] transition-colors">
             Cancel
          </Link>
          <button disabled={loading} type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 flex justify-center items-center">
             {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publish Event'}
          </button>
        </div>

      </form>
    </div>
  )
}
