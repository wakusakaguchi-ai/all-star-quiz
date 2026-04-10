import { kv } from '@vercel/kv'
import type { RoomState } from '@/lib/types'

type Ctx = { params: Promise<{ roomCode: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { roomCode } = await params
  const state = await kv.get<RoomState>(`room:${roomCode}`)
  if (!state) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(state)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { roomCode } = await params
  const body = await req.json() as { action: 'start' | 'reveal'; correctAnswer?: string }

  const state = await kv.get<RoomState>(`room:${roomCode}`)
  if (!state) return Response.json({ error: 'not found' }, { status: 404 })

  if (body.action === 'start') {
    state.session.status = 'voting'
    state.session.round_number += 1
    state.session.correct_answer = null
    state.votes = {}
  }

  if (body.action === 'reveal' && body.correctAnswer) {
    state.session.status = 'revealed'
    state.session.correct_answer = body.correctAnswer
    // 正解者に100点加算
    for (const [participantId, choice] of Object.entries(state.votes)) {
      if (choice === body.correctAnswer) {
        const p = state.participants.find(p => p.id === participantId)
        if (p) p.score += 100
      }
    }
  }

  if (body.action === 'start' && state.session.status === 'revealed') {
    // 「次の問題」ボタン用
    state.session.status = 'voting'
    state.session.round_number += 1
    state.session.correct_answer = null
    state.votes = {}
  }

  await kv.set(`room:${roomCode}`, state)
  return Response.json(state)
}
