const expressions = [
  {
    phrase: 'Break a leg!',
    meaning: '행운을 빌어요!',
    explanation:
      "공연 전에 배우에게 행운을 빌 때 쓰는 표현입니다. 직역하면 '다리가 부러져라'지만 실제로는 긍정적인 의미로 사용됩니다.",
    example: '"You have a big presentation today. Break a leg!"',
  },
]

export default function TodaysExpression() {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const expr = expressions[0]

  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">오늘의 표현</h2>
        <p className="mt-0.5 text-sm text-gray-500">{today}</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
            오늘의 표현
          </p>
          <p className="text-2xl font-semibold text-gray-900">{expr.phrase}</p>
          <p className="mt-1 text-base text-gray-600">{expr.meaning}</p>
        </div>

        <hr className="border-gray-100" />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
            설명
          </p>
          <p className="text-sm text-gray-600">{expr.explanation}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
            예문
          </p>
          <p className="text-sm italic text-gray-700">{expr.example}</p>
        </div>
      </div>
    </div>
  )
}
