'use client'

import { useEffect, useState, use, useCallback } from 'react'
import type { RoomState } from '@/lib/types'
import VoteBarChart from '@/components/VoteBarChart'
import Ranking from '@/components/Ranking'

type Props = { params: Promise<{ roomCode: string }> }

const STARS = [
  { top: '3%',  left: '2%',  size: '2rem',   rot: '20deg',  opacity: 0.7 },
  { top: '8%',  left: '12%', size: '1rem',    rot: '-10deg', opacity: 0.45 },
  { top: '2%',  left: '28%', size: '1.5rem',  rot: '45deg',  opacity: 0.6 },
  { top: '14%', left: '42%', size: '0.9rem',  rot: '0deg',   opacity: 0.4 },
  { top: '4%',  left: '58%', size: '1.8rem',  rot: '-20deg', opacity: 0.65 },
  { top: '10%', left: '73%', size: '1rem',    rot: '30deg',  opacity: 0.5 },
  { top: '2%',  left: '88%', size: '1.6rem',  rot: '-45deg', opacity: 0.6 },
  { top: '22%', left: '96%', size: '2rem',    rot: '15deg',  opacity: 0.5 },
  { top: '38%', left: '1%',  size: '1.2rem',  rot: '-30deg', opacity: 0.45 },
  { top: '55%', left: '97%', size: '1.5rem',  rot: '25deg',  opacity: 0.5 },
  { top: '68%', left: '4%',  size: '1rem',    rot: '-15deg', opacity: 0.6 },
  { top: '78%', left: '91%', size: '1.8rem',  rot: '40deg',  opacity: 0.45 },
  { top: '85%', left: '7%',  size: '1.5rem',  rot: '-25deg', opacity: 0.55 },
  { top: '91%', left: '83%', size: '1rem',    rot: '10deg',  opacity: 0.6 },
  { top: '93%', left: '48%', size: '2rem',    rot: '-35deg', opacity: 0.4 },
  { top: '47%', left: '50%', size: '0.8rem',  rot: '60deg',  opacity: 0.3 },
]

export default function DisplayPage({ params }: Props) {
  const { roomCode } = use(params)
  const [state, setState] = useState<RoomState | null>(null)
  const [rankingOpen, setRankingOpen] = useState(false)

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #7DD3FC 0%, #38BDF8 45%, #0284C7 100%)' }}
      >
        <p className="text-white text-2xl font-bold drop-shadow">読込中...</p>
      </div>
    )
  }

  const { session, participants, votes } = state
  const voteCounts = Object.values(votes).reduce<Record<string, number>>((acc, choice) => {
    acc[choice] = (acc[choice] ?? 0) + 1
    return acc
  }, {})

  return (
    <main
      className="min-h-screen text-white flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #7DD3FC 0%, #38BDF8 45%, #0284C7 100%)' }}
    >
      {/* 丸い装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-56 h-56 rounded-full bg-white/10" style={{ top: '-8%', left: '8%' }} />
        <div className="absolute w-36 h-36 rounded-full bg-white/10" style={{ top: '18%', left: '82%' }} />
        <div className="absolute w-72 h-72 rounded-full bg-white/10" style={{ bottom: '-12%', left: '28%' }} />
        <div className="absolute w-28 h-28 rounded-full bg-white/10" style={{ top: '55%', left: '3%' }} />
        <div className="absolute w-44 h-44 rounded-full bg-white/10" style={{ top: '38%', right: '1%' }} />
        <div className="absolute w-20 h-20 rounded-full bg-white/15" style={{ top: '72%', left: '60%' }} />
      </div>

      {/* 星の装飾 */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute text-white"
            style={{ top: s.top, left: s.left, fontSize: s.size, opacity: s.opacity, transform: `rotate(${s.rot})` }}
          >
            ★
          </span>
        ))}
      </div>

      {/* ヘッダー */}
      <div className="relative bg-blue-900/75 backdrop-blur-sm px-8 py-4 flex items-center justify-between border-b-4 border-yellow-400">
        <h1 className="text-2xl font-black text-yellow-300 drop-shadow-lg tracking-wide">
          ✨ D2C感謝祭 集計
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">ルーム</span>
          <span className="bg-yellow-400 text-blue-900 font-mono font-black text-xl px-4 py-1 rounded-lg tracking-widest shadow">
            {roomCode}
          </span>
          <span className="text-sm bg-white text-blue-900 font-bold px-3 py-1 rounded-full shadow">
            👥 {participants.length}名
          </span>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative flex-1 flex flex-col items-center p-8 gap-8">
        {session.status === 'waiting' && (
          <div className="text-center">
            <p className="text-6xl mb-6">📱</p>
            <h2 className="text-4xl font-black mb-4 drop-shadow-lg">QRコードを読み取って参加！</h2>
            <p className="text-2xl text-white/80">
              ルームコード:{' '}
              <span className="font-mono font-black text-yellow-300 text-3xl drop-shadow">{roomCode}</span>
            </p>
            {participants.length > 0 && (
              <div className="mt-8">
                <p className="text-white/70 mb-3">参加者 ({participants.length}名)</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {participants.map(p => (
                    <span key={p.id} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-bold border border-white/30">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {session.status === 'voting' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <span className="bg-green-400 text-green-900 px-4 py-1 rounded-full text-sm font-black shadow">
                投票中
              </span>
              <h2 className="text-3xl font-black mt-3 drop-shadow-lg">第{session.round_number}問</h2>
              <p className="text-white/70 mt-1">
                {Object.keys(votes).length} / {participants.length} 名が回答
              </p>
            </div>
            <div className="bg-white/25 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg">
              <VoteBarChart counts={voteCounts} correctAnswer={null} total={Object.keys(votes).length} />
            </div>
          </div>
        )}

        {session.status === 'revealed' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <p className="text-5xl mb-2">🎉</p>
              <h2 className="text-3xl font-black drop-shadow-lg">
                正解: <span className="text-yellow-300">{session.correct_answer}</span>
              </h2>
              <p className="text-white/70 mt-1">
                {Object.values(votes).filter(c => c === session.correct_answer).length}名正解！
              </p>
            </div>
            <div className="bg-white/25 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg">
              <VoteBarChart counts={voteCounts} correctAnswer={session.correct_answer} total={Object.keys(votes).length} />
            </div>
          </div>
        )}

        {participants.length > 0 && (
          <div className="w-full max-w-2xl bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/30 shadow-lg">
            <button
              onClick={() => setRankingOpen(o => !o)}
              className="w-full flex items-center justify-between px-6 py-4 text-white font-bold text-xl hover:bg-white/10 transition"
            >
              <span>🏆 ランキング</span>
              <span className="text-lg">{rankingOpen ? '▲' : '▼'}</span>
            </button>
            {rankingOpen && (
              <div className="px-6 pb-6">
                <Ranking participants={participants} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
