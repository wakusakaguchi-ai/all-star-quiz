'use client'

import { useEffect, useState, use, useCallback } from 'react'
import type { RoomState, Participant } from '@/lib/types'

type Props = { params: Promise<{ roomCode: string }> }

const CHOICE_COLORS: Record<string, string> = {
  A: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
  B: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
  C: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
  D: 'bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600',
}

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
      // ラウンドが変わったら自分の回答をリセット
      if (prev && prev.session.round_number !== newState.session.round_number) {
        setMyChoice(null)
      }
      return newState
    })
    // 自分のスコアを最新に同期
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
      <main className="min-h-screen bg-gradient-to-br from-red-600 to-yellow-400 flex items-center justify-center">
        <p className="text-white text-xl">読込中...</p>
      </main>
    )
  }

  if (!participant) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-600 to-yellow-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-black text-center text-red-600 mb-1">🎉 参加</h1>
          <p className="text-center text-gray-400 text-sm mb-6">ルーム: <span className="font-mono font-bold text-black">{roomCode}</span></p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
            placeholder="あなたの名前"
            maxLength={20}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-center focus:outline-none focus:border-red-400 mb-4"
            autoFocus
          />
          <button
            onClick={joinRoom}
            disabled={loading || !name.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition"
          >
            参加する
          </button>
          {error && <p className="text-red-500 text-center mt-3 text-sm">{error}</p>}
        </div>
      </main>
    )
  }

  const { session } = state

  if (session.status === 'waiting') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-600 to-yellow-400 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="text-4xl mb-4">⏳</p>
          <h2 className="text-2xl font-black mb-2">待機中</h2>
          <p className="opacity-80">ホストが問題を出すまで待ってください</p>
          <p className="mt-4 text-sm opacity-70">こんにちは、{participant.name}さん！</p>
          {participant.score > 0 && (
            <p className="mt-2 text-xl font-black">現在の得点: {participant.score}pt</p>
          )}
        </div>
      </main>
    )
  }

  if (session.status === 'voting') {
    return (
      <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-center mb-2">
          <p className="text-white text-lg font-bold">{participant.name}</p>
          <p className="text-gray-400 text-sm">第{session.round_number}問</p>
        </div>
        {myChoice ? (
          <div className="text-center">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-white text-2xl font-black">{myChoice} を選択しました！</p>
            <p className="text-gray-500 text-sm mt-3">正解発表を待っています...</p>
          </div>
        ) : (
          <>
            <p className="text-white text-lg">答えを選んでください</p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {Object.entries(CHOICE_COLORS).map(([choice, cls]) => (
                <button
                  key={choice}
                  onClick={() => vote(choice)}
                  className={`${cls} text-white font-black text-5xl h-32 rounded-2xl transition shadow-lg`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    )
  }

  const isCorrect = myChoice === session.correct_answer
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: isCorrect ? '#166534' : '#7f1d1d' }}
    >
      <div className="text-center text-white">
        <p className="text-7xl mb-4">{isCorrect ? '🎉' : '😢'}</p>
        <h2 className="text-3xl font-black mb-2">{isCorrect ? '正解！' : '不正解...'}</h2>
        <p className="text-xl opacity-80">
          正解: <span className="font-black text-yellow-300">{session.correct_answer}</span>
        </p>
        {myChoice && <p className="text-sm opacity-70 mt-1">あなたの回答: {myChoice}</p>}
        <div className="mt-6 bg-white bg-opacity-20 rounded-2xl px-8 py-4">
          <p className="text-sm opacity-80">現在の得点</p>
          <p className="text-4xl font-black">{participant.score}pt</p>
        </div>
        <p className="mt-6 text-sm opacity-60">次の問題を待っています...</p>
      </div>
    </main>
  )
}
