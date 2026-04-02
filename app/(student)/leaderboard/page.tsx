'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Trophy, Medal, Star, Sparkles, Loader2 } from 'lucide-react'
import type { User } from '@/types'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('participation_scores')
        .select(`
          total_score,
          users!inner (
            id,
            name,
            avatar_url,
            role
          )
        `)
        .eq('users.role', 'student')
        .order('total_score', { ascending: false })
        .limit(50)

      if (data) {
        // Map it back to a flat array that the UI expects
        const mappedLeaders = data.map((item: any) => ({
          ...item.users,
          vscore: item.total_score
        }))
        setLeaders(mappedLeaders)
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  const topThree = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--color-primary)]/20 blur-3xl rounded-full" />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-xl mb-6 relative">
          <Trophy className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-3">Campus Leaderboard</h1>
        <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
          The most active students at SRM. Attend events, represent clubs, and climb the ranks.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto relative z-10">
        
        {/* Rank 2 - Silver */}
        {topThree[1] && (
          <div className="md:order-1 transform md:translate-y-8">
             <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 text-center flex flex-col items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-slate-300 to-slate-400" />
               <div className="w-20 h-20 rounded-full border-4 border-slate-300 p-1 mb-4 shadow-[0_0_20px_rgba(148,163,184,0.2)]">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                    {topThree[1].avatar_url ? <img src={topThree[1].avatar_url} className="w-full h-full object-cover"/> : topThree[1].name[0]}
                  </div>
               </div>
               <Medal className="w-6 h-6 text-slate-400 mb-2 drop-shadow-sm" />
               <div className="text-lg font-bold text-[var(--color-text-main)] truncate w-full">{topThree[1].name}</div>
               <div className="text-[var(--color-primary)] font-extrabold mt-1 text-xl flex items-center gap-1">
                 {topThree[1].vscore || 0} <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">pts</span>
               </div>
             </div>
          </div>
        )}

        {/* Rank 1 - Gold */}
        {topThree[0] && (
          <div className="md:order-2 transform md:-translate-y-4">
             <div className="bg-[var(--color-surface)] border border-amber-500/30 rounded-3xl p-8 text-center flex flex-col items-center relative overflow-hidden group shadow-[0_10px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-transform z-20">
               <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
               <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-amber-400 to-yellow-500" />
               
               <div className="w-28 h-28 rounded-full border-4 border-amber-400 p-1.5 mb-5 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg animate-bounce">👑</div>
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-white overflow-hidden relative">
                    {topThree[0].avatar_url ? <img src={topThree[0].avatar_url} className="w-full h-full object-cover"/> : topThree[0].name[0]}
                  </div>
               </div>
               <div className="text-xl font-extrabold text-[var(--color-text-main)] truncate w-full group-hover:text-amber-500 transition-colors">{topThree[0].name}</div>
               <div className="text-amber-500 font-extrabold mt-2 text-2xl flex items-center gap-1 drop-shadow-md">
                 <Sparkles className="w-4 h-4 fill-amber-500" />
                 {topThree[0].vscore || 0} <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">pts</span>
               </div>
             </div>
          </div>
        )}

        {/* Rank 3 - Bronze */}
        {topThree[2] && (
          <div className="md:order-3 transform md:translate-y-12">
             <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl p-6 text-center flex flex-col items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />
               <div className="w-16 h-16 rounded-full border-4 border-orange-400/80 p-1 mb-4 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                    {topThree[2].avatar_url ? <img src={topThree[2].avatar_url} className="w-full h-full object-cover"/> : topThree[2].name[0]}
                  </div>
               </div>
               <Medal className="w-5 h-5 text-orange-500 mb-2" />
               <div className="text-base font-bold text-[var(--color-text-main)] truncate w-full">{topThree[2].name}</div>
               <div className="text-[var(--color-primary)] font-extrabold mt-1 text-lg flex items-center gap-1">
                 {topThree[2].vscore || 0} <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">pts</span>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Ranks 4-50 */}
      {rest.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden mt-12 shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
            <h3 className="font-bold text-[var(--color-text-main)] text-sm uppercase tracking-widest flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--color-primary)]" />
              Top 50 Campus Rankings
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {rest.map((user, index) => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-border-subtle)]/30 transition-colors group">
                <div className="w-8 text-center font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors">
                  #{index + 4}
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-border-subtle)] flex items-center justify-center text-sm font-bold text-[var(--color-text-main)] overflow-hidden shrink-0">
                  {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--color-text-main)] truncate">{user.name}</div>
                </div>
                <div className="font-bold text-[var(--color-primary)] flex items-center gap-1">
                  {user.vscore || 0} <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
