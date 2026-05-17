import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">대시보드</h1>
          <LogoutButton />
        </div>
        <p className="text-gray-500">
          안녕하세요,{' '}
          <span className="font-medium text-gray-800">{user.email}</span>님
        </p>
      </div>
    </main>
  )
}
