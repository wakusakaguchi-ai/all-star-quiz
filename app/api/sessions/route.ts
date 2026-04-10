import { kv } from '@vercel/kv'
import type { Session, RoomState } from '@/lib/types'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST() {
  const roomCode = generateRoomCode()
  const session: Session = { status: 'waiting', round_number: 0, correct_answer: null }
  const state: RoomState = { session, participants: [], votes: {} }
  await kv.set(`room:${roomCode}`, state)
  return Response.json({ roomCode })
}
