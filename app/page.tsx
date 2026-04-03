import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import WelcomePage from '@/components/WelcomePage'

export default async function Home() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Fetch role from the database
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = dbUser?.role || user.user_metadata?.role || 'student'

    if (role === 'admin') {
      redirect('/admin/dashboard')
    } else if (role === 'organizer') {
      redirect('/organizer/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  return <WelcomePage />
}
