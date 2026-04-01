'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import type { User } from '@/types'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (data) setUser(data)
    }

    getUser()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: 'home', iconDesk: '⬡', label: 'Dashboard' },
    { href: '/events', icon: 'event_note', iconDesk: '◈', label: 'Events' },
    { href: '/clubs', icon: 'groups', iconDesk: '◉', label: 'Clubs' },
    { href: '/registrations', icon: 'confirmation_number', iconDesk: '◎', label: 'My Registrations' },
  ]

  const docsItems = [
    { href: '/certificates', iconDesk: '❐', label: 'Certificates' },
    { href: '/od-letters', iconDesk: '☰', label: 'OD Letters' },
  ]

  const campusItems = [
    { href: '/leaderboard', iconDesk: '⬢', label: 'Leaderboard' },
    { href: '/vscore', iconDesk: '◷', label: 'VScore' },
  ]

  return (
    <div className="flex min-h-screen relative z-10 w-full font-body">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-[240px] min-h-screen bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] flex-col py-6 fixed left-0 top-0 bottom-0 z-[100]">
        
        {/* Logo */}
        <div className="px-6 mb-7 flex items-center gap-2.5 pb-7 border-b border-[var(--color-sidebar-border)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center font-headline font-extrabold text-sm text-[var(--color-sidebar-text)] shadow-[0_0_16px_rgba(124,92,252,0.5)]">
            V
          </div>
          <span className="font-headline font-extrabold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-sidebar-text)] to-[#c4b5fd]">Vertex</span>
        </div>

        {/* Nav Sections */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-3">
          <div className="mb-2">
            <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-sidebar-text-muted)] px-3 mb-1.5">Main</div>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-all relative ${pathname === item.href ? 'bg-[rgba(124,92,252,0.15)] text-[#c4b5fd] font-medium' : 'text-[var(--color-sidebar-text-muted)] hover:bg-white/5 hover:text-[var(--color-sidebar-text)]'}`}>
                {pathname === item.href && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--color-primary)] rounded-r-sm" />
                )}
                <span className="text-[15px] w-[18px] text-center">{item.iconDesk}</span> 
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 mb-2">
            <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-sidebar-text-muted)] px-3 mb-1.5">Documents</div>
            {docsItems.map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-all relative ${pathname === item.href ? 'bg-[rgba(124,92,252,0.15)] text-[#c4b5fd] font-medium' : 'text-[var(--color-sidebar-text-muted)] hover:bg-white/5 hover:text-[var(--color-sidebar-text)]'}`}>
                {pathname === item.href && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--color-primary)] rounded-r-sm" />
                )}
                <span className="text-[15px] w-[18px] text-center">{item.iconDesk}</span> 
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-sidebar-text-muted)] px-3 mb-1.5">Campus</div>
            {campusItems.map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-all relative ${pathname === item.href ? 'bg-[rgba(124,92,252,0.15)] text-[#c4b5fd] font-medium' : 'text-[var(--color-sidebar-text-muted)] hover:bg-white/5 hover:text-[var(--color-sidebar-text)]'}`}>
                {pathname === item.href && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--color-primary)] rounded-r-sm" />
                )}
                <span className="text-[15px] w-[18px] text-center">{item.iconDesk}</span> 
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* User Card & Settings */}
        <div className="px-3 mt-auto pt-4 border-t border-[var(--color-sidebar-border)] space-y-2">
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="w-full flex items-center p-2.5 rounded-xl bg-white/[0.03] border border-[var(--color-sidebar-border)] hover:bg-white/[0.06] transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mr-2.5">
              <span className="material-symbols-outlined text-[16px] text-[var(--color-sidebar-text)] group-hover:text-amber-400 transition-colors" style={{ fontVariationSettings: theme === 'light' ? "'FILL' 1" : "'FILL' 0" }}>
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div className="text-xs font-semibold text-[color:var(--color-sidebar-text)]">
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </div>
          </button>

          <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-[var(--color-sidebar-border)] hover:bg-white/[0.06] transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-xs font-bold text-[var(--color-sidebar-text)] uppercase flex-shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[color:var(--color-sidebar-text)] truncate">{user?.name || 'Student'}</div>
              <div className="text-[10px] text-[var(--color-sidebar-text-muted)] truncate group-hover:text-rose-400 transition-colors">Sign Out</div>
            </div>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER (md & below only) */}
      <header className="lg:hidden absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-50 bg-[var(--color-background)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
            <span className="material-symbols-outlined text-white font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>vignette</span>
          </div>
          <span className="font-headline font-bold text-[22px] tracking-tight text-[var(--color-text-main)]">Vertex</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Switch Pill */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center rounded-full p-1 gap-1 border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-sm transition-colors"
          >
            <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all ${theme === 'light' ? 'bg-[var(--color-background)] shadow-sm' : ''}`}>
               <span className="material-symbols-outlined text-[16px] text-amber-400" style={{ fontVariationSettings: theme === 'light' ? "'FILL' 1" : "'FILL' 0" }}>light_mode</span>
            </div>
            <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-[var(--color-border-subtle)] shadow-sm' : ''}`}>
               <span className="material-symbols-outlined text-[15px] text-[#A78BFA]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>dark_mode</span>
            </div>
          </button>
          <button onClick={handleSignOut} className="p-1.5 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {/* On mobile: padding top accounts for header, padding bottom accounts for nav bar */}
      <main className="flex-1 lg:ml-[240px] px-6 pt-28 pb-32 lg:p-9 lg:pb-12 min-h-screen">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-[var(--color-surface)]/90 backdrop-blur-2xl border-t border-[var(--color-border-subtle)] flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/dashboard' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/dashboard">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/events' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/events">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/events' ? { fontVariationSettings: "'FILL' 1" } : {}}>event_note</span>
          <span className="text-[10px] font-medium">Events</span>
        </Link>
        
        {/* SCAN BUTTON (FAB) */}
        <Link href="/dashboard" className="w-14 h-14 bg-[var(--color-primary)] rounded-3xl -mt-10 shadow-[0_8px_20px_rgba(124,92,252,0.3)] flex items-center justify-center border-[5px] border-[var(--color-background)] active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-white text-[28px] font-bold">add</span>
        </Link>
        
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/leaderboard' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/leaderboard">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/leaderboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>emoji_events</span>
          <span className="text-[10px] font-medium">Leaderboard</span>
        </Link>
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/profile' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/dashboard">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person_outline</span>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
      
    </div>
  )
}