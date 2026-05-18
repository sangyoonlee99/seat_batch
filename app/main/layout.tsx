import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarded, role')
    .eq('id', user.id)
    .single()

  if (!profile?.is_onboarded) {
    redirect('/onboarding')
  }

  const isAdmin = profile.role === 'ADMIN'

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
