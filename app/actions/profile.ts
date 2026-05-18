'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Gender, EnglishLevel } from '@/types/database'

export async function updateProfile(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = (formData.get('name') as string)?.trim()
  const gender = formData.get('gender') as Gender
  const english_level = formData.get('english_level') as EnglishLevel

  if (!name) {
    return { error: '이름을 입력해주세요.' }
  }
  if (!['MALE', 'FEMALE'].includes(gender)) {
    return { error: '성별을 선택해주세요.' }
  }
  if (!['HIGH', 'MIDDLE', 'LOW'].includes(english_level)) {
    return { error: '영어 실력을 선택해주세요.' }
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    gender,
    english_level,
    is_onboarded: true,
  })

  if (error) {
    return { error: '저장 중 오류가 발생했습니다. 다시 시도해주세요.' }
  }

  redirect('/main')
}
