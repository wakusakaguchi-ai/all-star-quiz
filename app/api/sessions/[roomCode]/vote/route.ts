import { kv } from '@vercel/kv'
import type { RoomState } from '@/lib/types'

type Ctx = { params: Promise<{ roomCode: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { roomCode } = await params
  const { participantId, choice } = await req.json() as { participantId: string; choice: string }

  const state = await kv.get<RoomState>(`room:${roomCode}`)
  if (!state) return Response.json({ error: 'not found' }, { status: 404 })
  if (state.session.status !== 'voting') return Response.json({ error: 'not voting' }, { status: 400 })
  if (state.votes[participantId]) return Response.json({ error: 'already voted' }, { status: 400 })

  state.votes[participantId] = choice
  await kv.set(`room:${roomCode}`, state)
  return Response.json({ ok: true })
}
