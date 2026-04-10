'use client'

import { useEffect, useState, use, useCallback } from 'react'
import type { RoomState } from '@/lib/types'
import Ranking from '@/components/Ranking'

type Props = { params: Promise<{ roomCode: string }> }

const CHOICES = [
  { key: 'A', num: '①', bg: '#e03030', shadow: '#8b0000' },
  { key: 'B', num: '②', bg: '#1a6fd4', shadow: '#0a3a7a' },
  { key: 'C', num: '③', bg: '#1a9e3a', shadow: '#0a5a1a' },
  { key: 'D', num: '④', bg: '#d4a000', shadow: '#7a5a00' },
]

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
      <div className="tv-bg min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl font-bold">読込中...</p>
      </div>
    )
  }

  const { session, participants, votes } = state
  const voteCounts = Object.values(votes).reduce<Record<string, number>>((acc, choice) => {
    acc[choice] = (acc[choice] ?? 0) + 1
    return acc
  }, {})
  const totalVotes = Object.keys(votes).length
  const maxCount = Math.max(...CHOICES.map(c => voteCounts[c.key] ?? 0), 1)

  return (
    <main className="tv-bg min-h-screen text-white flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-8 py-4" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '2px solid rgba(100,150,255,0.3)' }}>
        <h1 className="text-2xl font-black" style={{ textShadow: '0 0 20px rgba(100,150,255,0.8)' }}>
          🌟 オールスター感謝祭
        </h1>
        <div className="flex items-center gap-4">
          <span style={{ color: '#aac0ff', fontSize: 14 }}>ルーム</span>
          <span className="font-mono font-black text-xl px-4 py-1 rounded-lg tracking-widest" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            {roomCode}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(255,255,255,0.15)' }}>
            👥 {participants.length}名
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* 待機中 */}
        {session.status === 'waiting' && (
          <div className="text-center">
            <p className="text-7xl mb-6 sparkle-text">🌟</p>
            <h2 className="text-5xl font-black mb-4" style={{ textShadow: '0 0 30px rgba(100,150,255,0.9)' }}>
              QRコードで参加！
            </h2>
            <p className="text-2xl" style={{ color: '#aac0ff' }}>
              ルームコード: <span className="font-mono font-black text-white text-3xl">{roomCode}</span>
            </p>
            {participants.length > 0 && (
              <div className="mt-8">
                <p className="mb-3" style={{ color: '#aac0ff' }}>参加者 ({participants.length}名)</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {participants.map(p => (
                    <span key={p.id} className="px-4 py-2 rounded-full text-lg font-bold" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 投票中・結果 */}
        {session.status !== 'waiting' && (
          <div className="w-full max-w-3xl">
            {session.status === 'voting' && (
              <div className="text-center mb-8">
                <span className="px-4 py-1 rounded-full text-sm font-bold" style={{ background: '#22c55e' }}>投票中</span>
                <h2 className="text-4xl font-black mt-2">第{session.round_number}問</h2>
                <p style={{ color: '#aac0ff', marginTop: 4 }}>{totalVotes} / {participants.length} 名が回答</p>
              </div>
            )}
            {session.status === 'revealed' && (
              <div className="text-center mb-8">
                <p className="text-5xl mb-2">🎉</p>
                <h2 className="text-4xl font-black">
                  正解: <span className="text-yellow-300">{CHOICES.find(c => c.key === session.correct_answer)?.num}</span>
                </h2>
                <p style={{ color: '#aac0ff', marginTop: 4 }}>
                  {Object.values(votes).filter(c => c === session.correct_answer).length}名正解！
                </p>
              </div>
            )}

            {/* バーグラフ */}
            <div className="flex gap-4 items-end justify-center" style={{ height: 200 }}>
              {CHOICES.map(c => {
                const count = voteCounts[c.key] ?? 0
                const pct = Math.round((count / totalVotes) * 100) || 0
                const barH = totalVotes > 0 ? Math.max((count / maxCount) * 160, count > 0 ? 20 : 0) : 0
                const isCorrect = session.status === 'revealed' && c.key === session.correct_answer
                return (
                  <div key={c.key} className="flex flex-col items-center gap-2 flex-1">
                    <span className="font-black text-xl text-yellow-300">{count > 0 ? `${pct}%` : ''}</span>
                    <div
                      className="w-full rounded-t-xl transition-all duration-500"
                      style={{
                        height: barH,
                        background: isCorrect
                          ? 'linear-gradient(180deg, #22ff88 0%, #00aa44 100%)'
                          : session.status === 'revealed'
                          ? 'rgba(255,255,255,0.2)'
                          : `linear-gradient(180deg, ${c.bg} 0%, ${c.shadow} 100%)`,
                        boxShadow: count > 0 ? `0 0 20px ${c.bg}66` : 'none',
                      }}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="choice-badge"
                        style={{ background: `linear-gradient(180deg, ${c.bg} 0%, ${c.shadow} 100%)`, width: 40, height: 40, fontSize: '1.1rem' }}
                      >
                        {c.num}
                      </span>
                      <span className="font-black text-xl">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ランキング */}
            {session.status === 'revealed' && participants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-black text-center mb-4" style={{ color: '#aac0ff' }}>ランキング</h3>
                <Ranking participants={participants} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
