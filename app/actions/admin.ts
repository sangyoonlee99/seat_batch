'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types/database'

export async function updateMemberRole(
  targetUserId: string,
  newRole: UserRole
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  if (user.id === targetUserId) return { error: '본인의 역할은 변경할 수 없습니다.' }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'ADMIN') return { error: '관리자만 역할을 변경할 수 있습니다.' }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId)

  if (error) return { error: '역할 변경에 실패했습니다.' }

  revalidatePath('/main/admin')
  return {}
}
