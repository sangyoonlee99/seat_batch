'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EnglishLevel } from '@/types/database'

interface OnboardedProfile {
  id: string
  name: string
  gender: 'MALE' | 'FEMALE'
  english_level: EnglishLevel
}

function interleaveGenders(profiles: OnboardedProfile[]): OnboardedProfile[] {
  const males = profiles.filter((p) => p.gender === 'MALE')
  const females = profiles.filter((p) => p.gender === 'FEMALE')
  const longer = males.length >= females.length ? males : females
  const shorter = males.length >= females.length ? females : males

  const result: OnboardedProfile[] = []
  for (let i = 0; i < longer.length; i++) {
    result.push(longer[i])
    if (i < shorter.length) result.push(shorter[i])
  }
  return result
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function buildTeams(profiles: OnboardedProfile[]): OnboardedProfile[][] {
  const n = profiles.length
  if (n === 0) return []
  if (n <= 3) return [profiles]

  const remainder = n % 4

  if (remainder === 0) {
    return chunkArray(profiles, 4)
  }

  if (remainder === 3) {
    // e.g. 7→[4,3], 11→[4,4,3]
    const full = chunkArray(profiles.slice(0, n - 3), 4)
    full.push(profiles.slice(n - 3))
    return full
  }

  if (remainder === 1) {
    // e.g. 5→[5], 9→[4,5]
    if (n === 5) return [profiles]
    const full = chunkArray(profiles.slice(0, n - 5), 4)
    full.push(profiles.slice(n - 5))
    return full
  }

  // remainder === 2
  if (n === 6) return [profiles.slice(0, 3), profiles.slice(3)]
  // e.g. 10→[4,3,3], 14→[4,4,3,3]
  const full = chunkArray(profiles.slice(0, n - 6), 4)
  full.push(profiles.slice(n - 6, n - 3))
  full.push(profiles.slice(n - 3))
  return full
}

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'ADMIN'
}

export async function assignTeams(sessionName: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  if (!(await verifyAdmin(supabase, user.id))) {
    return { error: '관리자만 자리 배치를 할 수 있습니다.' }
  }

  const { data: members, error: fetchError } = await supabase
    .from('profiles')
    .select('id, name, gender, english_level')
    .eq('is_onboarded', true)
    .not('name', 'is', null)
    .not('gender', 'is', null)
    .not('english_level', 'is', null)

  if (fetchError || !members || members.length === 0) {
    return { error: '참여 멤버가 없습니다.' }
  }

  const byLevel: Record<EnglishLevel, OnboardedProfile[]> = {
    HIGH: [],
    MIDDLE: [],
    LOW: [],
  }
  for (const m of members as OnboardedProfile[]) {
    byLevel[m.english_level].push(m)
  }

  const interleaved: OnboardedProfile[] = [
    ...interleaveGenders(byLevel.HIGH),
    ...interleaveGenders(byLevel.MIDDLE),
    ...interleaveGenders(byLevel.LOW),
  ]

  const teams = buildTeams(interleaved)

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({ name: sessionName, created_by: user.id })
    .select('id')
    .single()

  if (sessionError || !session) {
    return { error: '세션 생성에 실패했습니다.' }
  }

  const assignments = teams.flatMap((team, idx) =>
    team.map((member) => ({
      session_id: session.id,
      user_id: member.id,
      team_number: idx + 1,
    }))
  )

  const { error: insertError } = await supabase
    .from('seat_assignments')
    .insert(assignments)

  if (insertError) {
    return { error: '자리 배치 저장에 실패했습니다.' }
  }

  revalidatePath('/main/seats')
  return { success: true, sessionId: session.id }
}

export async function swapTeams(
  sessionId: string,
  userIdA: string,
  userIdB: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  if (!(await verifyAdmin(supabase, user.id))) {
    return { error: '관리자만 자리를 변경할 수 있습니다.' }
  }

  const { data: rows } = await supabase
    .from('seat_assignments')
    .select('id, user_id, team_number')
    .eq('session_id', sessionId)
    .in('user_id', [userIdA, userIdB])

  if (!rows || rows.length !== 2) {
    return { error: '배치 정보를 찾을 수 없습니다.' }
  }

  const rowA = rows.find((r) => r.user_id === userIdA)!
  const rowB = rows.find((r) => r.user_id === userIdB)!

  await supabase
    .from('seat_assignments')
    .update({ team_number: rowB.team_number })
    .eq('id', rowA.id)

  await supabase
    .from('seat_assignments')
    .update({ team_number: rowA.team_number })
    .eq('id', rowB.id)

  revalidatePath('/main/seats')
  return { success: true }
}
