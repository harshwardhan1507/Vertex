'use client'

import { Award, Medal, CheckCircle2 } from 'lucide-react'

export default function CertificatesPage() {
  const certificates: any[] = [] // Future fetched data

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative z-10 w-full">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-2">My Certificates</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Official documentation of your achievements and participation.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center shadow-sm">
           <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-500">
             <Award className="w-6 h-6" />
           </div>
           <h3 className="text-[var(--color-text-main)] font-medium mb-1 text-lg">Your Trophy Room is Empty</h3>
           <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto mb-6">
             Attend workshops, compete in hackathons, and become an organizer to unlock verified campus certificates.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Certificate Map */}
        </div>
      )}

      {/* Verification Notice */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[1.5rem] p-6 flex gap-4 mt-8">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <h4 className="font-bold text-[var(--color-text-main)] mb-1">Blockchain Verified</h4>
          <p className="text-sm text-[var(--color-text-muted)]">
             All certificates issued through Vertex Campus OS are mathematically signed and verifiable by prospective employers using your unique Certificate ID.
          </p>
        </div>
      </div>

    </div>
  )
}
