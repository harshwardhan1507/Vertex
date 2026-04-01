'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import type { User, ParticipationScore } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [score, setScore] = useState<ParticipationScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const [userRes, scoreRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('participation_scores').select('*').eq('user_id', authUser.id).single()
      ])

      if (userRes.data) setUser(userRes.data as unknown as User)
      if (scoreRes.data) setScore(scoreRes.data as unknown as ParticipationScore)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  const userName = user?.name?.split(' ')[0] || 'Student'
  const totalScore = score?.total_score || 0
  const attendanceVal = score ? Math.min(100, Math.round((score.events_attended / Math.max(1, score.events_attended + score.no_shows)) * 100)) : 0
  const volunteerVal = score ? Math.min(100, Math.round((score.volunteer_count / 10) * 100)) : 0
  
  let grade = 'E'
  if (totalScore > 350) grade = 'A'
  else if (totalScore > 250) grade = 'B'
  else if (totalScore > 150) grade = 'C'
  else if (totalScore > 50) grade = 'D'

  const rank = score ? Math.ceil((1 - (score.percentile / 100)) * 100) : '--'

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 lg:pb-0">
      
      {/* HEADER / TOPBAR */}
      <div className="mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl lg:text-[24px] tracking-tight">
            Good morning, {userName} 👋
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1 lg:mt-2">
             3 events this week · Your VScore moved up 12 points
          </p>
        </div>
        
        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-border-hover)] transition-colors text-[var(--color-primary)] shadow-sm">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-border-hover)] transition-colors text-amber-500 shadow-sm relative">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            <div className="absolute top-0.5 right-1 w-[8px] h-[8px] bg-red-500 rounded-full border-[2px] border-[var(--color-surface)]" />
          </div>
          <Link href="/events" className="btn-gradient flex items-center gap-1.5 px-[18px] py-[9px] rounded-full text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(45,108,255,0.35)] hover:-translate-y-[1px] transition-all ml-2">
            + Register for Event
          </Link>
        </div>
      </div>

      {/* STATS (Desktop Only) */}
      <div className="hidden lg:grid grid-cols-4 gap-4 mb-7">
        <div className="bg-card-grad border border-[var(--color-border-subtle)] rounded-xl lg:rounded-[14px] p-5 relative overflow-hidden transition-all hover:border-[var(--color-border-hover)] hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
          <div className="text-[22px] mb-3">🎯</div>
          <div className="font-headline text-[28px] font-extrabold leading-none mb-1 tracking-[-0.03em]">{score?.events_attended || 0}</div>
          <div className="text-[12px] text-[var(--color-text-muted)]">Events Attended</div>
          <div className="absolute top-5 right-5 text-[11px] font-semibold text-[var(--color-success)] bg-[rgba(34,211,165,0.1)] px-2 py-[3px] rounded-full">
            +3 this sem
          </div>
        </div>
        <div className="bg-card-grad border border-[var(--color-border-subtle)] rounded-[14px] p-5 relative overflow-hidden transition-all hover:border-[var(--color-border-hover)] hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent2)] to-[#0099ff]" />
          <div className="text-[22px] mb-3">🎓</div>
          <div className="font-headline text-[28px] font-extrabold leading-none mb-1 tracking-[-0.03em]">{score?.certificates_earned || 0}</div>
          <div className="text-[12px] text-[var(--color-text-muted)]">Certificates Earned</div>
          <div className="absolute top-5 right-5 text-[11px] font-semibold text-[var(--color-success)] bg-[rgba(34,211,165,0.1)] px-2 py-[3px] rounded-full">
            +2 this sem
          </div>
        </div>
        <div className="bg-card-grad border border-[var(--color-border-subtle)] rounded-[14px] p-5 relative overflow-hidden transition-all hover:border-[var(--color-border-hover)] hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-[#ff6b6b]" />
          <div className="text-[22px] mb-3">🙋</div>
          <div className="font-headline text-[28px] font-extrabold leading-none mb-1 tracking-[-0.03em]">{score?.volunteer_count || 0}</div>
          <div className="text-[12px] text-[var(--color-text-muted)]">Volunteer Sessions</div>
          <div className="absolute top-5 right-5 text-[11px] font-semibold text-[var(--color-success)] bg-[rgba(34,211,165,0.1)] px-2 py-[3px] rounded-full">
            +1 this sem
          </div>
        </div>
        <div className="bg-card-grad border border-[var(--color-border-subtle)] rounded-[14px] p-5 relative overflow-hidden transition-all hover:border-[var(--color-border-hover)] hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-warning)] to-[#ff9f45]" />
          <div className="text-[22px] mb-3">🏛️</div>
          <div className="font-headline text-[28px] font-extrabold leading-none mb-1 tracking-[-0.03em]">3</div>
          <div className="text-[12px] text-[var(--color-text-muted)]">Clubs Following</div>
          <div className="absolute top-5 right-5 text-[11px] font-semibold text-[var(--color-success)] bg-[rgba(34,211,165,0.1)] px-2 py-[3px] rounded-full">
            Active
          </div>
        </div>
      </div>

      {/* VSCORE CARD / BANNER Responsive Block */}
      <section className="mb-8 relative z-10 w-full">
        {/* Mobile VScore */}
        <div className="lg:hidden vscore-banner-bg rounded-[1.5rem] p-6 border border-[var(--color-border-subtle)] relative shadow-lg shadow-[var(--color-primary)]/5">
          <div className="flex items-center gap-6 relative z-10">
            {/* Mobile Progress Circle */}
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="vscore-grad-mob" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)"/>
                    <stop offset="100%" stopColor="var(--color-accent)"/>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" fill="transparent" r="42" stroke="var(--color-border-subtle)" strokeWidth="10"/>
                <circle cx="50" cy="50" fill="transparent" r="42" stroke="url(#vscore-grad-mob)" strokeDasharray="263.89" strokeDashoffset={`${263.89 - (263.89 * attendanceVal / 100)}`} strokeLinecap="round" strokeWidth="10"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-headline text-[38px] leading-none mb-1 font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]">{grade}</div>
                <div className="text-[9px] font-bold tracking-[0.08em] text-[var(--color-primary)] uppercase">VSCORE</div>
              </div>
            </div>
            
            {/* Mobile Stats Right */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-baseline gap-1 break-all">
                  <span className="text-xl font-bold text-[var(--color-text-main)]">{totalScore} <span className="text-sm font-normal text-[var(--color-text-muted)]">/ 400</span></span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Top {rank}% of campus</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium text-[var(--color-text-muted)]">
                    <span>Attendance</span>
                    <span>{attendanceVal}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" style={{ width: `${attendanceVal}%`}}/>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium text-[var(--color-text-muted)]">
                    <span>Volunteer</span>
                    <span>{volunteerVal}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-accent)] rounded-full shadow-[0_0_8px_rgba(192,132,252,0.4)]" style={{ width: `${volunteerVal}%`}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between relative z-10 w-full gap-2 border-t border-[var(--color-border-subtle)] pt-4">
            <div className="bg-[var(--color-border-subtle)] px-4 py-2 rounded-xl border border-[var(--color-border-subtle)]">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Next: <span className="text-[var(--color-text-main)]">{(Math.ceil(totalScore / 50) + 1) * 50} pts</span></span>
            </div>
            <Link href="/events" className="btn-gradient px-6 py-2.5 rounded-xl text-white font-bold text-xs whitespace-nowrap shadow-lg shadow-purple-500/25">Register</Link>
          </div>
        </div>

        {/* Desktop VScore Horizontal Banner */}
        <div className="hidden lg:flex vscore-banner-bg border border-[rgba(124,92,252,0.3)] rounded-2xl p-6 lg:p-6 lg:px-7 items-center gap-6 lg:gap-7 relative overflow-hidden shadow-xl shadow-[rgba(124,92,252,0.05)]">
          <div className="absolute top-[-50%] right-[-5%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(124,92,252,0.15)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative w-[90px] h-[90px] flex-shrink-0">
            <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
              <circle cx="45" cy="45" r="38" fill="none" stroke="url(#desktop-grad)" strokeWidth="7" strokeDasharray="239" strokeDashoffset={`${239 - (239 * attendanceVal / 100)}`} strokeLinecap="round"/>
              <defs>
                <linearGradient id="desktop-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-accent)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-headline text-[28px] font-extrabold leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-[#c4b5fd]">{grade}</div>
              <div className="text-[9px] text-[var(--color-text-muted)] tracking-[0.08em] mt-[2px]">VSCORE</div>
            </div>
          </div>

          <div className="flex-1">
            <div className="font-headline text-[16px] font-bold text-[var(--color-text-main)] mb-1">Highly Active — {totalScore} / 400 pts</div>
            <div className="text-[12px] text-[var(--color-text-muted)] mb-[14px]">Top {rank}% of campus · Sem {user?.semester || 1}, 2025</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-[10px] text-[11px]">
                <div className="text-[var(--color-text-muted)] w-[70px]">Attendance</div>
                <div className="flex-1 h-1 bg-[var(--color-border-subtle)] rounded overflow-hidden">
                  <div className="h-full rounded bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" style={{ width: `${attendanceVal}%` }} />
                </div>
                <div className="font-medium text-[var(--color-text-main)] w-[28px] text-right">{attendanceVal}%</div>
              </div>
              <div className="flex items-center gap-[10px] text-[11px]">
                <div className="text-[var(--color-text-muted)] w-[70px]">Volunteer</div>
                <div className="flex-1 h-1 bg-[var(--color-border-subtle)] rounded overflow-hidden">
                  <div className="h-full rounded bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" style={{ width: `${volunteerVal}%` }} />
                </div>
                <div className="font-medium text-[var(--color-text-main)] w-[28px] text-right">{volunteerVal}%</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 lg:py-4 lg:px-6 bg-[rgba(124,92,252,0.1)] border border-[rgba(124,92,252,0.2)] rounded-xl flex-shrink-0">
            <div className="font-headline text-[32px] font-extrabold text-[var(--color-primary)] leading-none">#{rank === '--' ? '--' : rank}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] tracking-[0.06em]">CAMPUS RANK</div>
            <div className="text-[11px] text-[var(--color-success)] font-medium">↑ 4 this week</div>
          </div>
        </div>
      </section>

      {/* DASHBOARD CONTENT GRID (Desktop grid Layout / Mobile Flex-col) */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        
        {/* LEFT COLUMN: EVENTS */}
        <div className="mb-8 lg:mb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div className="font-headline font-bold text-lg text-[var(--color-text-main)] flex items-center gap-2">
              Upcoming Events 
              <span className="bg-[rgba(124,92,252,0.15)] text-[var(--color-primary)] text-[11px] font-semibold px-2 py-0.5 rounded-full">12 open</span>
            </div>
            <button className="text-[var(--color-primary)] text-xs font-bold hover:opacity-70 transition-opacity">View all →</button>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 lg:mb-4">
            <button className="px-3.5 lg:px-[14px] py-1.5 lg:py-[6px] bg-[rgba(124,92,252,0.15)] border border-[rgba(124,92,252,0.4)] rounded-full text-[12px] font-medium text-[var(--color-primary)]">All</button>
            <button className="px-3.5 lg:px-[14px] py-1.5 lg:py-[6px] bg-transparent border border-[var(--color-border-subtle)] rounded-full text-[12px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-hover)] hover:text-[var(--color-text-main)] transition-colors">Tech</button>
            <button className="px-3.5 lg:px-[14px] py-1.5 lg:py-[6px] bg-transparent border border-[var(--color-border-subtle)] rounded-full text-[12px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-hover)] hover:text-[var(--color-text-main)] transition-colors">Cultural</button>
            <button className="px-3.5 lg:px-[14px] py-1.5 lg:py-[6px] bg-transparent border border-[var(--color-border-subtle)] rounded-full text-[12px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-hover)] hover:text-[var(--color-text-main)] transition-colors">Sports</button>
          </div>

          {/* Event Cards List */}
          <div className="space-y-3">
            {[1, 2, 3].map((i, index) => {
              const isFirst = index === 0;
              return (
              <div key={i} className={`group ${isFirst ? 'nebula-card border-[rgba(124,92,252,0.3)] shadow-[0_10px_40px_rgba(124,92,252,0.1)]' : 'card-grad'} border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] border rounded-2xl lg:rounded-[14px] p-[18px] lg:px-5 flex gap-4 items-start cursor-pointer hover:translate-x-1 transition-all`}>
                <div className={`flex flex-col items-center justify-center w-[54px] h-[58px] ${isFirst ? 'bg-[var(--color-surface)] shadow-sm border border-[var(--color-border-subtle)]' : 'bg-[var(--color-border-subtle)] border border-[var(--color-border-subtle)]'} rounded-[12px] flex-shrink-0`}>
                  <div className={`font-headline text-[22px] font-extrabold leading-none ${isFirst ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'} text-center w-full mt-1`}>0{i+1}</div>
                  <div className={`text-[10px] ${isFirst ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'} tracking-[0.06em] mt-0.5 uppercase text-center w-full font-bold`}>Apr</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-headline text-[15px] lg:text-[16px] font-bold ${isFirst ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-main)]'} mb-1.5 truncate`}>
                    SRM Builds {i}.0 — 24Hr Hackathon
                  </h3>
                  <div className={`flex flex-col gap-1 text-[12px] ${isFirst ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text-muted)]'} mb-3 lg:mb-0`}>
                    <span className="flex items-center gap-1.5">
                       <span className="material-symbols-outlined text-[14px]">location_on</span>
                       Auditorium A
                    </span>
                    <span className="flex items-center gap-1.5">
                       <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                       10:00 AM
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0 relative z-10 mt-1">
                  <button className={`px-[16px] py-[8px] rounded-lg text-[12px] font-bold border-none ${isFirst ? 'bg-[var(--color-primary)] text-white shadow-[0_4px_16px_rgba(124,92,252,0.4)] hover:bg-[#6c4be0]' : 'bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:bg-[var(--color-border-hover)] shadow-sm hover:scale-[1.03]'} transition-all`}>
                    Register
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* RIGHT COLUMN: Reminders & Extra */}
        <div className="flex flex-col gap-5 lg:gap-5">
          
          {/* Mobile Reminders Header (differs from Desktop design slightly for responsiveness) */}
          <div className="lg:hidden flex items-center justify-between mb-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h2 className="font-headline font-bold text-lg">Reminders</h2>
            </div>
            <button className="text-[var(--color-text-muted)]">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <div className="lg:card-grad lg:border lg:border-[var(--color-border-subtle)] lg:rounded-[14px] lg:p-5">
            <div className="hidden lg:flex items-center justify-between mb-3">
              <div className="font-headline font-bold text-[14px] text-[var(--color-text-main)]">🔔 Reminders</div>
            </div>

            <div className="flex flex-col gap-3 lg:gap-0 lg:divide-y divide-[var(--color-border-subtle)]">
              {/* Reminder 1 */}
              <div className="flex items-center gap-3 lg:gap-3 p-4 lg:p-0 lg:py-2.5 bg-[var(--color-surface)] lg:bg-transparent rounded-2xl lg:rounded-none border border-[var(--color-border-subtle)] lg:border-none">
                <div className="hidden lg:block w-2 h-2 rounded-full flex-shrink-0 bg-[var(--color-warning)]" />
                <div className="lg:hidden w-10 h-10 bg-[var(--color-warning)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[var(--color-warning)] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold lg:font-semibold text-sm lg:text-[12px] truncate text-[var(--color-text-main)]">SRM Builds — <span className="lg:hidden text-[var(--color-text-muted)] font-normal">Tomorrow</span></h4>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">UI/UX Bootcamp - Apr 5</p>
                </div>
                <div className="hidden lg:block text-[9px] font-bold px-[7px] py-0.5 rounded-full bg-[rgba(245,166,35,0.15)] text-[var(--color-warning)] flex-shrink-0">
                  Tomorrow
                </div>
                <span className="lg:hidden material-symbols-outlined text-[var(--color-text-muted)] text-[20px]">chevron_right</span>
              </div>

              {/* Reminder 2 */}
              <div className="flex items-center gap-3 lg:gap-3 p-4 lg:p-0 lg:py-2.5 bg-[var(--color-surface)] lg:bg-transparent rounded-2xl lg:rounded-none border border-[var(--color-border-subtle)] lg:border-none">
                <div className="hidden lg:block w-2 h-2 rounded-full flex-shrink-0 bg-[var(--color-primary)]" />
                <div className="lg:hidden w-10 h-10 bg-[var(--color-primary)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold lg:font-semibold text-sm lg:text-[12px] truncate text-[var(--color-text-main)]">UI/UX Bootcamp — <span className="lg:hidden text-[var(--color-text-muted)] font-normal">Apr 5</span></h4>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Lab Block 3</p>
                </div>
                <div className="hidden lg:block text-[9px] font-bold px-[7px] py-0.5 rounded-full bg-[rgba(124,92,252,0.15)] text-[#a78bfa] flex-shrink-0">
                  Apr 5
                </div>
                <span className="lg:hidden material-symbols-outlined text-[var(--color-text-muted)] text-[20px]">chevron_right</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block panel-card bg-card-grad border border-[var(--color-border-subtle)] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-headline font-bold text-[14px] text-[var(--color-text-main)]">🎓 Recent Certificates</div>
              <div className="text-[12px] text-[var(--color-primary)] cursor-pointer font-medium hover:opacity-70">All →</div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border-subtle)] cursor-pointer hover:pl-1 transition-all">
                <div className="w-9 h-9 rounded-lg bg-[rgba(124,92,252,0.15)] flex items-center justify-center text-[16px] flex-shrink-0">🏆</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--color-text-main)] truncate">SRM Builds 7.0</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Mar 15, 2025 · Tech Club</div>
                </div>
                <div className="text-[14px] text-[var(--color-text-dim)] hover:text-[var(--color-primary)] transition-colors">⬇</div>
              </div>
              <div className="flex items-center gap-3 py-2.5 cursor-pointer hover:pl-1 transition-all">
                <div className="w-9 h-9 rounded-lg bg-[rgba(240,89,218,0.12)] flex items-center justify-center text-[16px] flex-shrink-0">🎨</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--color-text-main)] truncate">Design-a-Tee Contest</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Feb 28, 2025 · Studio</div>
                </div>
                <div className="text-[14px] text-[var(--color-text-dim)] hover:text-[var(--color-primary)] transition-colors">⬇</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    
    </div>
  )
}