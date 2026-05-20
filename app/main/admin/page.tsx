import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminView from '@/components/AdminView'
import type { Profile } from '@/types/database'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') redirect('/main')

  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, gender, english_level, role, is_onboarded, created_at')
    .order('is_onboarded', { ascending: false })
    .order('created_at', { ascending: true })

  return <AdminView members={(members as Profile[]) ?? []} currentUserId={user.id} />
}
