'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Users, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchClubs() {
      const supabase = createClient()
      const { data } = await supabase
        .from('clubs')
        .select(`
          id, name, description, logo_url,
          events (id)
        `)
      
      if (data) setClubs(data)
      setLoading(false)
    }

    fetchClubs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">Campus Clubs</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1 max-w-md">Discover student organizations, technical chapters, and cultural clubs.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {filteredClubs.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--color-border-subtle)] rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-[var(--color-text-main)] font-medium mb-1">No clubs found</h3>
          <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto">
            {search ? 'Try a different search term.' : 'There are no active clubs right now.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <Link 
              key={club.id}
              href={`/clubs/${club.id}`}
              className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] p-6 flex flex-col hover:border-[var(--color-border-hover)] hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-border-subtle)] flex items-center justify-center text-xl font-bold text-[var(--color-text-muted)] overflow-hidden shrink-0 border border-[var(--color-border-subtle)] group-hover:border-[var(--color-primary)]/30 transition-colors">
                  {club.logo_url ? <img src={club.logo_url} alt="" className="w-full h-full object-cover" /> : club.name[0]}
                </div>
                <div className="pt-1">
                  <h3 className="font-headline font-bold text-lg text-[var(--color-text-main)] leading-tight group-hover:text-[var(--color-primary)] transition-colors">{club.name}</h3>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium mt-1 uppercase tracking-wider">
                    {club.events?.[0]?.count || club.events?.length || 0} Events Hosted
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-6 flex-1">
                {club.description || 'No description provided for this club.'}
              </p>
              
              <div className="mt-auto">
                <div className="w-full py-2.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-background)] text-center text-sm font-semibold text-[var(--color-text-main)] group-hover:bg-[var(--color-primary)] group-hover:border-[var(--color-primary)] group-hover:text-white transition-all shadow-sm">
                  View Club
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
