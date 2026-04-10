'use client'

import type { Participant } from '@/lib/types'

type Props = {
  participants: Participant[]
}

const medals = ['🥇', '🥈', '🥉']

export default function Ranking({ participants }: Props) {
  const sorted = [...participants].sort((a, b) => b.score - a.score)

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {sorted.map((p, i) => (
        <div
          key={p.id}
          className={`flex items-center justify-between px-4 py-3 rounded-xl ${
            i === 0
              ? 'bg-yellow-100 border-2 border-yellow-400'
              : i === 1
              ? 'bg-gray-100 border border-gray-300'
              : i === 2
              ? 'bg-orange-50 border border-orange-300'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl w-8 text-center text-gray-900">{medals[i] ?? `${i + 1}`}</span>
            <span className="font-bold text-lg text-gray-900">{p.name}</span>
          </div>
          <span className="font-black text-2xl text-red-600">{p.score}pt</span>
        </div>
      ))}
    </div>
  )
}
