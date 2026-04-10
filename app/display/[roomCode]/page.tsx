'use client'

import { useEffect, useState, use, useCallback } from 'react'
import type { RoomState } from '@/lib/types'
import VoteBarChart from '@/components/VoteBarChart'
import Ranking from '@/components/Ranking'

type Props = { params: Promise<{ roomCode: string }> }

export default function DisplayPage({ params }: Props) {
  const { roomCode } = use(params)
  const [state, setState] = useState<RoomState | null>(null)

  const poll = useCallback(async () => {
    const res = await fetch(`/api/sessions/${roomCode}`)
    if (res.ok) setState(await res.json())
  }, [roomCode])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [poll])

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-2xl">読込中...</p>
      </div>
    )
  }

  const { session, participants, votes } = state
  const voteCounts = Object.values(votes).reduce<Record<string, number>>((acc, choice) => {
    acc[choice] = (acc[choice] ?? 0) + 1
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-red-700 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">🎉 オールスター感謝祭 集計</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70">ルーム</span>
          <span className="bg-white text-red-700 font-mono font-black text-xl px-4 py-1 rounded-lg tracking-widest">
            {roomCode}
          </span>
          <span className="text-sm bg-white text-red-700 font-bold px-3 py-1 rounded-full">
            👥 {participants.length}名
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {session.status === 'waiting' && (
          <div className="text-center">
            <p className="text-6xl mb-6">📱</p>
            <h2 className="text-4xl font-black mb-4">QRコードを読み取って参加！</h2>
            <p className="text-2xl text-gray-400">ルームコード: <span className="font-mono font-black text-white text-3xl">{roomCode}</span></p>
            {participants.length > 0 && (
              <div className="mt-8">
                <p className="text-gray-400 mb-3">参加者 ({participants.length}名)</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {participants.map(p => (
                    <span key={p.id} className="bg-white bg-opacity-10 px-4 py-2 rounded-full text-lg">{p.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {session.status === 'voting' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">投票中</span>
              <h2 className="text-3xl font-black mt-2">第{session.round_number}問</h2>
              <p className="text-gray-400 mt-1">{Object.keys(votes).length} / {participants.length} 名が回答</p>
            </div>
            <VoteBarChart counts={voteCounts} correctAnswer={null} total={Object.keys(votes).length} />
          </div>
        )}

        {session.status === 'revealed' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <p className="text-5xl mb-2">🎉</p>
              <h2 className="text-3xl font-black">
                正解: <span className="text-yellow-300">{session.correct_answer}</span>
              </h2>
              <p className="text-gray-400 mt-1">
                {Object.values(votes).filter(c => c === session.correct_answer).length}名正解！
              </p>
            </div>
            <VoteBarChart counts={voteCounts} correctAnswer={session.correct_answer} total={Object.keys(votes).length} />
            <div className="mt-8">
              <h3 className="text-xl font-bold text-center mb-4">ランキング</h3>
              <Ranking participants={participants} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
