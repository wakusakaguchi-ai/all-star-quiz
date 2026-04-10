export type Session = {
  status: 'waiting' | 'voting' | 'revealed'
  round_number: number
  correct_answer: string | null
}

export type Participant = {
  id: string
  name: string
  score: number
}

export type RoomState = {
  session: Session
  participants: Participant[]
  votes: Record<string, string> // participantId -> choice
}
