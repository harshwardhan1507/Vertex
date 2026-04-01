'use client'

import { FileText, Download, Clock } from 'lucide-react'

export default function ODLettersPage() {
  const odLetters: any[] = [] // Placeholder for future DB fetch

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative z-10 w-full">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2">On-Duty Letters</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Download official OD letters for events you attended during class hours.</p>
      </div>

      {odLetters.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--color-border-subtle)] rounded-full flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-[var(--color-text-main)] font-medium mb-1 text-lg">No OD Letters Generated</h3>
          <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto mb-6">
            When you check into approved campus events that overlap with your academic schedule, your OD letters will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Future mapping of OD Letters */}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-[1.5rem] p-6 flex gap-4 mt-8">
        <Clock className="w-6 h-6 text-[var(--color-primary)] shrink-0" />
        <div>
          <h4 className="font-bold text-[var(--color-text-main)] mb-1">How OD Letters Work</h4>
          <p className="text-sm text-[var(--color-text-muted)]">
            Registrations that overlap with standard block hours (9:00 AM - 4:00 PM) will automatically trigger an OD request to your HOD upon successful QR check-in at the venue.
          </p>
        </div>
      </div>

    </div>
  )
}
