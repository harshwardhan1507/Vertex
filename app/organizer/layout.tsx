'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import type { User } from '@/types'

export default function OrganizerLayout({
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

      if (data) {
        // Enforce Organizer Role
        if (data.role !== 'organizer' && data.role !== 'admin') {
           router.push('/dashboard') // kick them back to student dashboard
           return
        }
        setUser(data)
      }
    }

    getUser()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/organizer/dashboard', iconDesk: '⬡', label: 'Overview' },
    { href: '/organizer/events', iconDesk: '◈', label: 'Manage Events' },
    { href: '/organizer/attendees', iconDesk: '◉', label: 'Roster / Attendees' },
  ]

  const toolItems = [
    { href: '/organizer/scanner', iconDesk: '◷', label: 'QR Scanner' },
  ]

  return (
    <div className="flex min-h-screen relative z-10 w-full font-body">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-[240px] min-h-screen bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] flex-col py-6 fixed left-0 top-0 bottom-0 z-[100]">
        
        {/* Logo */}
        <div className="px-6 mb-7 flex items-center justify-between pb-7 border-b border-[var(--color-sidebar-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-headline font-extrabold text-sm text-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.3)]">
              V
            </div>
            <span className="font-headline font-extrabold text-lg tracking-wide text-[var(--color-sidebar-text)]">Organizer</span>
          </div>
        </div>

        {/* Nav Sections */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-3">
          <div className="mb-2">
            <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-sidebar-text-muted)] px-3 mb-1.5 bg-gradient-to-r from-emerald-500/20 to-transparent inline-block rounded-r-full py-0.5 text-emerald-400">Management</div>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-all relative ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'bg-emerald-500/15 text-emerald-400 font-medium' : 'text-[var(--color-sidebar-text-muted)] hover:bg-white/5 hover:text-[var(--color-sidebar-text)]'}`}>
                {(pathname === item.href || pathname.startsWith(item.href + '/')) && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-emerald-500 rounded-r-sm shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
                <span className="text-[15px] w-[18px] text-center">{item.iconDesk}</span> 
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-sidebar-text-muted)] px-3 mb-1.5">Live Tools</div>
            {toolItems.map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-all relative ${pathname === item.href ? 'bg-emerald-500/15 text-emerald-400 font-medium' : 'text-[var(--color-sidebar-text-muted)] hover:bg-white/5 hover:text-[var(--color-sidebar-text)]'}`}>
                {pathname === item.href && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-emerald-500 rounded-r-sm shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
              {user?.name?.[0] || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[color:var(--color-sidebar-text)] truncate">{user?.name || 'Organizer'}</div>
              <div className="text-[10px] text-[var(--color-sidebar-text-muted)] truncate group-hover:text-rose-400 transition-colors">Sign Out</div>
            </div>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="lg:hidden absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-50 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)]">
            <span className="font-headline font-bold text-emerald-500">V</span>
          </div>
          <span className="font-headline font-bold text-[20px] tracking-tight text-[var(--color-text-main)]">Organizer</span>
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
      <main className="flex-1 lg:ml-[240px] px-6 pt-28 pb-32 lg:p-10 lg:pb-12 min-h-screen">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-[var(--color-surface)]/90 backdrop-blur-2xl border-t border-[var(--color-border-subtle)] flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/organizer/dashboard' ? 'text-emerald-500' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/organizer/dashboard">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/organizer/dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          <span className="text-[10px] font-bold">Overview</span>
        </Link>
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/organizer/events' ? 'text-emerald-500' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/organizer/events">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/organizer/events' ? { fontVariationSettings: "'FILL' 1" } : {}}>event_note</span>
          <span className="text-[10px] font-medium">Events</span>
        </Link>
        
        {/* FAB */}
        <Link href="/organizer/events/new" className="w-14 h-14 bg-emerald-500 rounded-3xl -mt-10 shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center border-[5px] border-[var(--color-background)] active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-white text-[28px] font-bold">add</span>
        </Link>
        
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/organizer/scanner' ? 'text-emerald-500' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/organizer/scanner">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/organizer/scanner' ? { fontVariationSettings: "'FILL' 1" } : {}}>qr_code_scanner</span>
          <span className="text-[10px] font-medium">Scanner</span>
        </Link>
        <Link className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/organizer/settings' ? 'text-emerald-500' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`} href="/organizer/settings">
          <span className="material-symbols-outlined text-[24px]" style={pathname === '/organizer/settings' ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
          <span className="text-[10px] font-medium">Config</span>
        </Link>
      </nav>
      
    </div>
  )
}
