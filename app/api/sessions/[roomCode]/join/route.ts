import { kv } from '@vercel/kv'
import type { RoomState, Participant } from '@/lib/types'

type Ctx = { params: Promise<{ roomCode: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { roomCode } = await params
  const { name } = await req.json() as { name: string }

  const state = await kv.get<RoomState>(`room:${roomCode}`)
  if (!state) return Response.json({ error: 'not found' }, { status: 404 })

  const participant: Participant = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 20),
    score: 0,
  }
  state.participants.push(participant)
  await kv.set(`room:${roomCode}`, state)
  return Response.json({ participant })
}
