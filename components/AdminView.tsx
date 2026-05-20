'use client'

import { useTransition } from 'react'
import { updateMemberRole } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types/database'

interface Props {
  members: Profile[]
  currentUserId: string
}

const levelLabel = (level: string | null) =>
  level === 'HIGH' ? '상' : level === 'MIDDLE' ? '중' : '하'

function MemberRow({
  member,
  currentUserId,
}: {
  member: Profile
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition()
  const isSelf = member.id === currentUserId
  const isAdmin = member.role === 'ADMIN'

  const handleToggle = () => {
    startTransition(async () => {
      await updateMemberRole(member.id, isAdmin ? 'MEMBER' : 'ADMIN')
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-gray-900">
          {member.name}
          {isSelf && <span className="ml-1.5 text-xs text-gray-400">(나)</span>}
        </span>
        <span className="text-xs text-gray-400">
          {member.gender === 'MALE' ? '남' : '여'} · {levelLabel(member.english_level)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isAdmin ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isAdmin ? '관리자' : '멤버'}
        </span>
        {!isSelf && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? '...' : isAdmin ? '멤버로' : '관리자로'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function AdminView({ members, currentUserId }: Props) {
  const onboarded = members.filter((m) => m.is_onboarded)
  const pending = members.filter((m) => !m.is_onboarded)

  return (
    <div className="px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">관리자</h2>

      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          전체 멤버 <span className="font-normal text-gray-400">({onboarded.length}명)</span>
        </h3>
        {onboarded.length === 0 ? (
          <p className="text-sm text-gray-400">온보딩을 완료한 멤버가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {onboarded.map((m) => (
              <MemberRow key={m.id} member={m} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          온보딩 미완료{' '}
          <span className="font-normal text-gray-400">({pending.length}명)</span>
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">모든 멤버가 온보딩을 완료했습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm"
              >
                <span className="text-gray-500">미완료 사용자</span>
                <span className="text-xs text-gray-400">
                  {new Date(m.created_at).toLocaleDateString('ko-KR')} 가입
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
