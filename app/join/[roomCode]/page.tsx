'use client'

import { useEffect, useState, use, useCallback } from 'react'
import type { RoomState, Participant } from '@/lib/types'

type Props = { params: Promise<{ roomCode: string }> }

const CHOICES = [
  { key: 'A', num: '①', bg: '#e03030', shadow: '#8b0000' },
  { key: 'B', num: '②', bg: '#1a6fd4', shadow: '#0a3a7a' },
  { key: 'C', num: '③', bg: '#1a9e3a', shadow: '#0a5a1a' },
  { key: 'D', num: '④', bg: '#d4a000', shadow: '#7a5a00' },
]

export default function JoinPage({ params }: Props) {
  const { roomCode } = use(params)
  const [state, setState] = useState<RoomState | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [name, setName] = useState('')
  const [myChoice, setMyChoice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const poll = useCallback(async () => {
    const res = await fetch(`/api/sessions/${roomCode}`)
    if (!res.ok) return
    const newState: RoomState = await res.json()
    setState(prev => {
      if (prev && prev.session.round_number !== newState.session.round_number) {
        setMyChoice(null)
      }
      return newState
    })
    if (participant) {
      const updated = newState.participants.find(p => p.id === participant.id)
      if (updated) setParticipant(updated)
    }
  }, [roomCode, participant])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [poll])

  async function joinRoom() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/${roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName }),
    })
    if (!res.ok) { setError('参加に失敗しました'); setLoading(false); return }
    const { participant: p } = await res.json()
    setParticipant(p)
    setLoading(false)
  }

  async function vote(choice: string) {
    if (!participant || myChoice) return
    setMyChoice(choice)
    const res = await fetch(`/api/sessions/${roomCode}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: participant.id, choice }),
    })
    if (!res.ok) setMyChoice(null)
  }

  if (!state) {
    return (
      <main className="tv-bg min-h-screen flex items-center justify-center">
        <p className="text-white text-xl font-bold">読込中...</p>
      </main>
    )
  }

  // 名前入力画面
  if (!participant) {
    return (
      <main className="tv-bg min-h-screen flex items-center justify-center p-4">
        <div style={{
          background: 'linear-gradient(180deg, #1a2a8a 0%, #0d1a60 100%)',
          border: '2px solid rgba(100,150,255,0.5)',
          borderRadius: 24,
          padding: 32,
          width: '100%',
          maxWidth: 360,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          <h1 className="text-white text-center font-black text-2xl mb-1">🎉 オールスター感謝祭</h1>
          <p className="text-center mb-6" style={{ color: '#aac0ff', fontSize: 14 }}>
            ルーム: <span className="font-mono font-black text-white">{roomCode}</span>
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
            placeholder="あなたの名前"
            maxLength={20}
            className="w-full rounded-full px-4 py-3 text-lg text-center font-bold mb-4 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(150,180,255,0.5)' }}
            autoFocus
          />
          <button
            onClick={joinRoom}
            disabled={loading || !name.trim()}
            className="w-full rounded-full py-4 font-black text-white text-lg transition"
            style={{ background: loading || !name.trim() ? '#555' : 'linear-gradient(180deg, #e03030 0%, #a00000 100%)', boxShadow: '0 4px 15px rgba(200,0,0,0.4)' }}
          >
            参加する！
          </button>
          {error && <p className="text-red-400 text-center mt-3 text-sm">{error}</p>}
        </div>
      </main>
    )
  }

  const { session } = state

  // 待機中
  if (session.status === 'waiting') {
    return (
      <main className="tv-bg min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="text-5xl mb-4 sparkle-text">⭐</p>
          <h2 className="text-2xl font-black mb-2">待機中...</h2>
          <p style={{ color: '#aac0ff' }}>問題が出るまで待ってね！</p>
          <p className="mt-4 font-bold">{participant.name} さん</p>
          {participant.score > 0 && (
            <div className="mt-4 rounded-2xl px-6 py-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <p style={{ color: '#aac0ff', fontSize: 12 }}>現在の得点</p>
              <p className="text-3xl font-black text-yellow-300">{participant.score}pt</p>
            </div>
          )}
        </div>
      </main>
    )
  }

  // 投票中
  if (session.status === 'voting') {
    return (
      <main className="tv-bg min-h-screen flex flex-col items-center justify-center p-5 gap-5">
        <div className="text-center">
          <p style={{ color: '#aac0ff', fontSize: 14 }}>第{session.round_number}問 / {participant.name}</p>
        </div>

        {myChoice ? (
          <div className="text-center">
            <p className="text-6xl mb-4">✅</p>
            <p className="text-white text-2xl font-black">
              {CHOICES.find(c => c.key === myChoice)?.num} を選択！
            </p>
            <p className="mt-3" style={{ color: '#aac0ff' }}>正解発表を待っています...</p>
          </div>
        ) : (
          <>
            <p className="text-white font-black text-xl">答えを選んでください！</p>
            <div className="w-full max-w-sm flex flex-col gap-3">
              {CHOICES.map(c => (
                <button
                  key={c.key}
                  onClick={() => vote(c.key)}
                  className="choice-btn"
                >
                  <span
                    className="choice-badge"
                    style={{ background: `linear-gradient(180deg, ${c.bg} 0%, ${c.shadow} 100%)` }}
                  >
                    {c.num}
                  </span>
                  <span className="text-xl font-black">{c.key}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    )
  }

  // 正解発表
  const isCorrect = myChoice === session.correct_answer
  const correctChoice = CHOICES.find(c => c.key === session.correct_answer)

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: isCorrect ? 'linear-gradient(160deg, #0a4a1a, #1a8a3a)' : 'linear-gradient(160deg, #4a0a0a, #8a1a1a)' }}
    >
      <div className="text-center text-white">
        <p className="text-7xl mb-4">{isCorrect ? '🎉' : '😢'}</p>
        <h2 className="text-3xl font-black mb-3">{isCorrect ? '正解！' : '不正解...'}</h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>正解:</span>
          <span
            className="choice-badge"
            style={{ background: `linear-gradient(180deg, ${correctChoice?.bg} 0%, ${correctChoice?.shadow} 100%)`, width: 40, height: 40, fontSize: '1.1rem' }}
          >
            {correctChoice?.num}
          </span>
        </div>
        {myChoice && !isCorrect && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            あなたの回答: {CHOICES.find(c => c.key === myChoice)?.num}
          </p>
        )}
        <div className="mt-6 rounded-2xl px-8 py-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: 13, opacity: 0.8 }}>現在の得点</p>
          <p className="text-4xl font-black text-yellow-300">{participant.score}pt</p>
        </div>
        <p className="mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>次の問題を待っています...</p>
      </div>
    </main>
  )
}
