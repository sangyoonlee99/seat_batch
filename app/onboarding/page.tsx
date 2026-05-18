'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateProfile, null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', user.id)
        .single()
      if (profile?.is_onboarded) {
        router.replace('/main')
      }
    })
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">프로필 설정</h1>
          <p className="mt-1 text-sm text-gray-500">
            스터디 참여를 위한 정보를 입력해주세요
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="이름을 입력하세요"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* 성별 */}
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-sm font-medium text-gray-700">성별</legend>
            <div className="flex gap-3">
              {[
                { label: '남', value: 'MALE' },
                { label: '여', value: 'FEMALE' },
              ].map(({ label, value }) => (
                <label
                  key={value}
                  className="flex flex-1 cursor-pointer items-center justify-center rounded-md border border-gray-300 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-gray-900 has-[:checked]:bg-gray-900 has-[:checked]:text-white"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    required
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 영어 실력 */}
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-sm font-medium text-gray-700">영어 회화 실력</legend>
            <div className="flex gap-3">
              {[
                { label: '상', value: 'HIGH' },
                { label: '중', value: 'MIDDLE' },
                { label: '하', value: 'LOW' },
              ].map(({ label, value }) => (
                <label
                  key={value}
                  className="flex flex-1 cursor-pointer items-center justify-center rounded-md border border-gray-300 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-gray-900 has-[:checked]:bg-gray-900 has-[:checked]:text-white"
                >
                  <input
                    type="radio"
                    name="english_level"
                    value={value}
                    required
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? '저장 중...' : '시작하기'}
          </Button>
        </form>
      </div>
    </main>
  )
}
