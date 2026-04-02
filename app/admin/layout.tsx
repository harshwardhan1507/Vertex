'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  CheckCircle,
  Database,
  Users,
  LogOut,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Admin Home', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Events Queue', href: '/admin/dashboard', icon: CheckCircle }, // Keeping it simple on one page for now
    { label: 'College Roster', href: '/admin/users', icon: Users },
    { label: 'System Logs', href: '/admin/logs', icon: Database },
  ]

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden font-sans">
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--color-surface)] border-b border-[var(--color-border-subtle)] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <span className="font-headline font-extrabold text-[var(--color-text-main)] tracking-tight">GateKeeper</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-[var(--color-text-main)] p-2">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border-subtle)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 hidden lg:flex items-center gap-2.5 px-6 border-b border-[var(--color-border-subtle)] mb-4">
          <ShieldAlert className="w-7 h-7 text-rose-500" />
          <span className="font-headline font-extrabold text-xl text-[var(--color-text-main)] tracking-tight">GateKeeper</span>
        </div>

        <div className="flex-1 overflow-y-auto pt-20 lg:pt-2 px-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Admin Control</div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-rose-500/10 text-rose-500 shadow-sm border border-rose-500/20' 
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-main)] border border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto bg-[var(--color-background)] pt-16 lg:pt-0">
        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto backdrop-blur-3xl min-h-full pb-24 lg:pb-10 flex flex-col">
          {children}
        </div>
      </main>
      
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
