'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Sparkles, Trophy, Star, Target, Loader2, ArrowUpRight } from 'lucide-react'
import type { User } from '@/types'

export default function VscorePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        if (data) setUser(data as User)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  const vscore = user?.vscore || 0
  
  // Calculate Tier
  let tier = 'Bronze'
  let tierColor = 'text-orange-500'
  let tierGr = 'from-orange-500/20 to-orange-400/5'
  let nextTier = 100
  let progress = (vscore / nextTier) * 100

  if (vscore >= 600) {
    tier = 'Platinum'
    tierColor = 'text-cyan-400'
    tierGr = 'from-cyan-400/20 to-blue-500/5'
    nextTier = 1000
    progress = 100
  } else if (vscore >= 300) {
    tier = 'Gold'
    tierColor = 'text-amber-400'
    tierGr = 'from-amber-400/20 to-yellow-500/5'
    nextTier = 600
    progress = ((vscore - 300) / 300) * 100
  } else if (vscore >= 100) {
    tier = 'Silver'
    tierColor = 'text-slate-300'
    tierGr = 'from-slate-300/20 to-slate-400/5'
    nextTier = 300
    progress = ((vscore - 100) / 200) * 100
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Banner */}
      <div className={`relative overflow-hidden rounded-[2rem] border border-[var(--color-border-subtle)] bg-gradient-to-br ${tierGr} p-8 md:p-12 shadow-lg shadow-[var(--color-primary)]/5`}>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Trophy className={`w-48 h-48 ${tierColor}`} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-background)]/50 border border-[var(--color-border-subtle)] mb-6 backdrop-blur-md">
            <Sparkles className={`w-4 h-4 ${tierColor}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${tierColor}`}>{tier} Tier</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2">
            {vscore} <span className="text-2xl md:text-3xl text-[var(--color-text-muted)] uppercase tracking-widest font-bold">pts</span>
          </h1>
          <p className="text-[var(--color-text-main)] text-lg max-w-md opacity-90 font-medium">
            Your Campus Engagement Score. 
            Keep attending events to unlock the next prestige tier!
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 max-w-md">
            <div className="flex justify-between text-sm font-bold text-[var(--color-text-main)] mb-2">
              <span>{tier}</span>
              <span>{vscore >= 600 ? 'Max Tier!' : `${nextTier} pts`}</span>
            </div>
            <div className="h-3 w-full bg-[var(--color-background)]/50 rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
              <div 
                className={`h-full ${tierColor.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* How to Earn */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[2rem] p-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-border-subtle)] flex items-center justify-center mb-6">
            <Target className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-main)] mb-6">How to Earn</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎟️</span>
                <span className="font-bold text-[var(--color-text-main)]">Attend an Event</span>
              </div>
              <span className="font-extrabold text-[var(--color-primary)]">+10 pts</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <span className="font-bold text-[var(--color-text-main)]">Win a Hackathon</span>
              </div>
              <span className="font-extrabold text-[var(--color-primary)]">+50 pts</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎪</span>
                <span className="font-bold text-[var(--color-text-main)]">Organize an Event</span>
              </div>
              <span className="font-extrabold text-[var(--color-primary)]">+100 pts</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-[var(--color-text-main)]">Join a Club</span>
              </div>
              <span className="font-extrabold text-[var(--color-primary)]">+25 pts</span>
            </div>
          </div>
        </div>

        {/* Perks & Benefits */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[2rem] p-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-border-subtle)] flex items-center justify-center mb-6">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-main)] mb-6">Tier Perks</h2>
          
          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-slate-300/30">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300" />
              <h3 className="font-bold text-[var(--color-text-main)] mb-1">Silver (100+ pts)</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Priority registration for high-demand campus events before general students.</p>
            </div>
            
            <div className="relative pl-6 border-l-2 border-amber-400/30">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="font-bold text-[var(--color-text-main)] mb-1">Gold (300+ pts)</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Exclusive access to premium seating at cultural fests and guest lectures.</p>
            </div>

            <div className="relative pl-6 border-l-2 border-cyan-400/30">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-cyan-400" />
              <h3 className="font-bold text-[var(--color-text-main)] mb-1">Platinum (600+ pts)</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Direct invites to selective workshops, hackathons, and placement mixers.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
