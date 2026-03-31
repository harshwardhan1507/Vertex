import { createBrowserClient } from '@supabase/ssr'

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })
  return { data, error }
}

export async function signInWithEmail(
  email: string,
  password: string
) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}