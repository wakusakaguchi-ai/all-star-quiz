'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import type { RoomState } from '@/lib/types'
import VoteBarChart from '@/components/VoteBarChart'
import Ranking from '@/components/Ranking'

type Props = { params: Promise<{ roomCode: string }> }

export default function HostPage({ params }: Props) {
  const { roomCode } = use(params)
  const router = useRouter()
  const [state, setState] = useState<RoomState | null>(null)
  const [loading, setLoading] = useState(false)
  const [joinUrl, setJoinUrl] = useState('')

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${roomCode}`)
  }, [roomCode])

  const poll = useCallback(async () => {
    const res = await fetch(`/api/sessions/${roomCode}`)
    if (!res.ok) { router.push('/'); return }
    setState(await res.json())
  }, [roomCode, router])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [poll])

  async function startVoting() {
    setLoading(true)
    const res = await fetch(`/api/sessions/${roomCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' }),
    })
    setState(await res.json())
    setLoading(false)
  }

  async function revealAnswer(answer: 'A' | 'B' | 'C' | 'D') {
    setLoading(true)
    const res = await fetch(`/api/sessions/${roomCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reveal', correctAnswer: answer }),
    })
    setState(await res.json())
    setLoading(false)
  }

  async function resetGame() {
    if (!confirm('全参加者・スコア・投票をリセットしますか？')) return
    setLoading(true)
    const res = await fetch(`/api/sessions/${roomCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    })
    setState(await res.json())
    setLoading(false)
  }

  if (!state) return <div className="min-h-screen flex items-center justify-center">読込中...</div>

  const { session, participants, votes } = state
  const voteCounts = Object.values(votes).reduce<Record<string, number>>((acc, choice) => {
    acc[choice] = (acc[choice] ?? 0) + 1
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-red-600">🎉 ホスト画面</h1>
          <div className="flex gap-2 items-center">
            <span className="bg-red-100 text-red-700 font-mono font-black text-xl px-4 py-1 rounded-lg tracking-widest">
              {roomCode}
            </span>
            <a
              href={`/display/${roomCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-600"
            >
              大画面表示
            </a>
            <button
              onClick={resetGame}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white text-sm px-3 py-1 rounded-lg transition"
            >
              🔄 リセット
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="font-bold text-gray-700 mb-3">参加用QRコード</h2>
            {joinUrl && (
              <div className="flex flex-col items-center gap-2">
                <QRCode value={joinUrl} size={160} />
                <p className="text-xs text-gray-400 break-all">{joinUrl}</p>
              </div>
            )}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-600 text-sm mb-2">参加者 ({participants.length}名)</h3>
              <div className="flex flex-wrap gap-1">
                {participants.map(p => (
                  <span key={p.id} className="bg-gray-100 text-gray-900 text-sm px-2 py-1 rounded-full">{p.name}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-4">
            <h2 className="font-bold text-gray-700">操作パネル</h2>
            <div className="text-sm text-gray-500">
              状態: <span className="font-bold text-black">
                {session.status === 'waiting' ? '待機中' : session.status === 'voting' ? '投票中' : '正解発表済み'}
              </span>
              {session.round_number > 0 && ` / 第${session.round_number}問`}
            </div>

            {(session.status === 'waiting' || session.status === 'revealed') && (
              <button
                onClick={startVoting}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition"
              >
                {session.status === 'revealed' ? '▶ 次の問題' : '▶ 投票開始'}
              </button>
            )}

            {session.status === 'voting' && (
              <div>
                <p className="text-sm text-gray-500 mb-3">正解を選んで発表:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map(choice => (
                    <button
                      key={choice}
                      onClick={() => revealAnswer(choice)}
                      disabled={loading}
                      className="py-4 rounded-xl font-black text-2xl text-white transition disabled:opacity-50"
                      style={{ backgroundColor: { A: '#ef4444', B: '#3b82f6', C: '#22c55e', D: '#f59e0b' }[choice] }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {session.status === 'revealed' && (
              <p className="text-center font-bold text-green-600">正解: {session.correct_answer} 🎉</p>
            )}
          </div>
        </div>

        {session.status !== 'waiting' && (
          <div className="bg-white rounded-2xl p-5 shadow mt-4">
            <h2 className="font-bold text-gray-700 mb-3">
              {session.status === 'voting' ? '投票状況（2秒更新）' : '投票結果'}
            </h2>
            <VoteBarChart
              counts={voteCounts}
              correctAnswer={session.status === 'revealed' ? session.correct_answer : null}
              total={Object.keys(votes).length}
            />
          </div>
        )}

        {participants.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow mt-4">
            <h2 className="font-bold text-gray-700 mb-3">ランキング</h2>
            <Ranking participants={participants} />
          </div>
        )}
      </div>
    </main>
  )
}
