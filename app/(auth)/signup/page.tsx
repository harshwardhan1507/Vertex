'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'organizer'>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

async function handleSignup(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { data, error } = await signUpWithEmail(email, password, name)

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  if (data.session) {
    router.push('/dashboard')
    router.refresh()
  } else {
    setError('Something went wrong. Try again.')
    setLoading(false)
  }
}

  async function handleGoogle() {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 justify-center">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-violet-500/30">
          V
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">
          Vertex
        </span>
      </div>

      {/* Card */}
      <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-1">Create account</h1>
        <p className="text-sm text-white/40 mb-6">
          Join your campus on Vertex
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/8 border border-white/[0.07] hover:border-white/15 text-white text-sm font-medium rounded-xl px-4 py-3 transition-all mb-4 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.51.85 3.59l2.68-2.07z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9l2.85 2.07c.63-1.89 2.39-3.29 4.47-3.29z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/[0.06]"></div>
          <span className="text-xs text-white/25">or</span>
          <div className="flex-1 h-px bg-white/[0.06]"></div>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              role === 'student'
                ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60'
            }`}
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => setRole('organizer')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              role === 'organizer'
                ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60'
            }`}
          >
            🎯 Organizer
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Harshwardhan Singh"
              required
              className="w-full bg-white/[0.04] border border-white/[0.07] hover:border-white/15 focus:border-violet-500/50 focus:outline-none text-white text-sm rounded-xl px-4 py-3 transition-all placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@srmuh.edu.in"
              required
              className="w-full bg-white/[0.04] border border-white/[0.07] hover:border-white/15 focus:border-violet-500/50 focus:outline-none text-white text-sm rounded-xl px-4 py-3 transition-all placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/[0.04] border border-white/[0.07] hover:border-white/15 focus:border-violet-500/50 focus:outline-none text-white text-sm rounded-xl px-4 py-3 transition-all placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl px-4 py-3 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-white/30 text-center mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-white/20 mt-6">
        SRM University Haryana · Powered by Vertex
      </p>
    </div>
  )
}