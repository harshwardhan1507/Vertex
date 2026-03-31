'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
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
    { href: '/dashboard', icon: '⬡', label: 'Dashboard' },
    { href: '/events', icon: '◈', label: 'Events' },
    { href: '/clubs', icon: '◉', label: 'Clubs' },
    { href: '/registrations', icon: '◎', label: 'My Registrations' },
    { href: '/certificates', icon: '❐', label: 'Certificates' },
    { href: '/od-letters', icon: '☰', label: 'OD Letters' },
    { href: '/leaderboard', icon: '⬢', label: 'Leaderboard' },
    { href: '/vscore', icon: '◷', label: 'VScore' },
  ]

  return (
    <div className="flex min-h-screen bg-[#08080f]">
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-[#0f0f1a] border-r border-white/[0.07] flex flex-col fixed left-0 top-0 bottom-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.07]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-violet-500/30">
            V
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Vertex
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                pathname === item.href
                  ? 'bg-violet-500/15 text-violet-300 font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {pathname === item.href && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-violet-500 rounded-r" />
              )}
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || 'Loading...'}
              </div>
              <div className="text-[10px] text-white/30">
                {user?.branch || 'Student'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-white/20 hover:text-white/60 transition-colors text-xs"
              title="Sign out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}