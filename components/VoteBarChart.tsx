'use client'

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from 'recharts'

const COLORS: Record<string, string> = {
  A: '#ef4444',
  B: '#3b82f6',
  C: '#22c55e',
  D: '#f59e0b',
}

type Props = {
  counts: Record<string, number>
  correctAnswer?: string | null
  total: number
}

export default function VoteBarChart({ counts, correctAnswer, total }: Props) {
  const data = ['A', 'B', 'C', 'D'].map(choice => ({
    choice,
    count: counts[choice] ?? 0,
  }))

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="choice" tick={{ fontSize: 20, fontWeight: 700 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            <LabelList dataKey="count" position="top" style={{ fontSize: 16, fontWeight: 700 }} />
            {data.map(entry => (
              <Cell
                key={entry.choice}
                fill={
                  correctAnswer
                    ? entry.choice === correctAnswer
                      ? '#22c55e'
                      : '#d1d5db'
                    : COLORS[entry.choice]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-gray-500 text-sm mt-1">投票数: {total}</p>
    </div>
  )
}
