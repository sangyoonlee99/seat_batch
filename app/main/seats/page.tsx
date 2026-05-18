import { createClient } from '@/lib/supabase/server'
import SeatLayoutView from '@/components/SeatLayoutView'
import type { Session, SeatAssignmentWithProfile } from '@/types/database'

export default async function SeatsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'ADMIN'

  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, created_at, created_by')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let assignments: SeatAssignmentWithProfile[] = []
  if (session) {
    const { data } = await supabase
      .from('seat_assignments')
      .select('id, session_id, user_id, team_number, profiles(id, name, gender, english_level)')
      .eq('session_id', session.id)
      .order('team_number')

    assignments = (data as SeatAssignmentWithProfile[]) ?? []
  }

  return (
    <SeatLayoutView
      session={session as Session | null}
      assignments={assignments}
      isAdmin={isAdmin}
      currentUserId={user.id}
    />
  )
}
