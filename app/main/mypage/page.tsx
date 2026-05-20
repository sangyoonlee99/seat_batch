import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyPageView from '@/components/MyPageView'

export default async function MyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, gender, english_level')
    .eq('id', user.id)
    .single()

  return <MyPageView profile={profile} />
}
