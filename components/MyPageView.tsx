'use client'

import { useActionState } from 'react'
import { updateMyProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/LogoutButton'
import type { Gender, EnglishLevel } from '@/types/database'

interface Props {
  profile: {
    name: string | null
    gender: Gender | null
    english_level: EnglishLevel | null
  } | null
}

export default function MyPageView({ profile }: Props) {
  const [state, formAction, isPending] = useActionState(updateMyProfile, null)

  return (
    <div className="px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">마이페이지</h2>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={profile?.name ?? ''}
            placeholder="이름을 입력하세요"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

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
                  defaultChecked={profile?.gender === value}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

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
                  defaultChecked={profile?.english_level === value}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-600">저장됐습니다.</p>}

        <Button type="submit" disabled={isPending} className="mt-2">
          {isPending ? '저장 중...' : '저장하기'}
        </Button>
      </form>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <LogoutButton />
      </div>
    </div>
  )
}
