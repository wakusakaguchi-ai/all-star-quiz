'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createRoom() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/sessions', { method: 'POST' })
    if (!res.ok) { setError('ルーム作成に失敗しました'); setLoading(false); return }
    const { roomCode } = await res.json()
    router.push(`/host/${roomCode}`)
  }

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/${code}`)
    if (!res.ok) { setError('ルームが見つかりません'); setLoading(false); return }
    router.push(`/join/${code}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-600 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-2 text-red-600">
          🎉 オールスター感謝祭
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">4択クイズ 集計アプリ</p>

        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg mb-6 transition"
        >
          🏠 新しいゲームを作成
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-400">または参加する</span>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
            placeholder="ルームコード"
            maxLength={4}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-xl font-mono uppercase text-center tracking-widest focus:outline-none focus:border-red-400"
          />
          <button
            onClick={joinRoom}
            disabled={loading || !joinCode}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold px-5 rounded-xl transition"
          >
            参加
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-3 text-sm">{error}</p>}
      </div>
    </main>
  )
}
