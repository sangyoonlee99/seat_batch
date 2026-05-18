'use client'

import { useState, useTransition } from 'react'
import { assignTeams, swapTeams } from '@/app/actions/assignTeams'
import { Button } from '@/components/ui/button'
import type { Session, SeatAssignmentWithProfile } from '@/types/database'

interface Props {
  session: Session | null
  assignments: SeatAssignmentWithProfile[]
  isAdmin: boolean
  currentUserId: string
}

export default function SeatLayoutView({
  session,
  assignments,
  isAdmin,
  currentUserId,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [sessionName, setSessionName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const teamMap = new Map<number, SeatAssignmentWithProfile[]>()
  for (const a of assignments) {
    const members = teamMap.get(a.team_number) ?? []
    members.push(a)
    teamMap.set(a.team_number, members)
  }
  const teamNumbers = [...teamMap.keys()].sort((a, b) => a - b)

  const defaultSessionName = `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 모임`

  const handleAssign = () => {
    setError(null)
    startTransition(async () => {
      const result = await assignTeams(sessionName.trim() || defaultSessionName)
      if ('error' in result) setError(result.error)
    })
  }

  const handleSelect = (userId: string) => {
    setSelected((prev) => {
      if (prev.includes(userId)) return prev.filter((id) => id !== userId)
      if (prev.length >= 2) return [prev[1], userId]
      return [...prev, userId]
    })
  }

  const handleSwap = () => {
    if (!session || selected.length !== 2) return
    setError(null)
    startTransition(async () => {
      const result = await swapTeams(session.id, selected[0], selected[1])
      if ('error' in result) setError(result.error)
      else setSelected([])
    })
  }

  const levelLabel = (level: string | null) =>
    level === 'HIGH' ? '상' : level === 'MIDDLE' ? '중' : '하'

  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">자리 배치도</h2>
        {session && (
          <p className="mt-0.5 text-sm text-gray-500">{session.name}</p>
        )}
      </div>

      {isAdmin && (
        <div className="mb-6 rounded-xl border border-dashed border-gray-300 p-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">새 자리 배치</p>
          <input
            type="text"
            placeholder={defaultSessionName}
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <Button onClick={handleAssign} disabled={isPending}>
            {isPending ? '배치 중...' : '자리 배치하기'}
          </Button>
          {selected.length === 2 && (
            <Button variant="secondary" onClick={handleSwap} disabled={isPending}>
              선택한 두 사람 자리 바꾸기
            </Button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {teamNumbers.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          <p className="text-sm">아직 자리 배치가 없습니다.</p>
          {isAdmin && (
            <p className="mt-1 text-sm">위에서 새 자리 배치를 실행하세요.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teamNumbers.map((teamNumber) => {
          const members = teamMap.get(teamNumber) ?? []
          return (
            <div key={teamNumber} className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                팀 {teamNumber}
              </h3>
              <div className="flex flex-col gap-2">
                {members.map((m) => {
                  const isCurrentUser = m.user_id === currentUserId
                  const isSelected = selected.includes(m.user_id)
                  return (
                    <div
                      key={m.id}
                      onClick={() => isAdmin && handleSelect(m.user_id)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        isCurrentUser
                          ? 'bg-gray-900 text-white'
                          : isSelected
                          ? 'bg-blue-100 text-blue-900 cursor-pointer ring-2 ring-blue-400'
                          : isAdmin
                          ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{m.profiles.name}</span>
                      <span className="text-xs opacity-60">
                        {m.profiles.gender === 'MALE' ? '남' : '여'} ·{' '}
                        {levelLabel(m.profiles.english_level)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
