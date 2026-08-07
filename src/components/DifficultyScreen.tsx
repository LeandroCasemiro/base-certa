'use client'

import { useEffect, useState } from 'react'
import { DifficultyLevel, GameMode } from '@/lib/types'
import { DIFFICULTY_LEVELS, MODE_GROUPS } from '@/lib/constants'
import { getBestScore } from '@/lib/storage'
import { QUESTIONS_PER_ROUND } from '@/lib/constants'

interface DifficultyScreenProps {
  mode: GameMode
  onSelectLevel: (level: DifficultyLevel) => void
  onBack: () => void
  titleOverride?: string
  variant?: string
}

function getModeName(mode: GameMode): string {
  for (const group of MODE_GROUPS) {
    const found = group.modes.find((m) => m.id === mode)
    if (found) return found.label
  }
  return mode
}

function getGroupName(mode: GameMode): string {
  for (const group of MODE_GROUPS) {
    if (group.modes.find((m) => m.id === mode)) return group.label
  }
  return ''
}

const colorMap: Record<string, { card: string; badge: string; button: string }> = {
  green: {
    card: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    badge: 'bg-green-100 text-green-700',
    button: 'bg-green-500 hover:bg-green-600 text-white',
  },
  blue: {
    card: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  purple: {
    card: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
    button: 'bg-purple-500 hover:bg-purple-600 text-white',
  },
}

export default function DifficultyScreen({ mode, onSelectLevel, onBack, titleOverride, variant }: DifficultyScreenProps) {
  const [bestScores, setBestScores] = useState<Record<DifficultyLevel, number | null>>({
    beginner: null,
    intermediate: null,
    expert: null,
  })

  useEffect(() => {
    setBestScores({
      beginner: getBestScore(mode, 'beginner', variant),
      intermediate: getBestScore(mode, 'intermediate', variant),
      expert: getBestScore(mode, 'expert', variant),
    })
  }, [mode, variant])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div>
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors mb-4 block"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-extrabold text-slate-800">{titleOverride ?? getModeName(mode)}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {titleOverride ? 'Escolha o nível' : `${getGroupName(mode)} — Escolha o nível`}
          </p>
        </div>

        {/* Level cards */}
        <div className="flex flex-col gap-3">
          {DIFFICULTY_LEVELS.map((lvl) => {
            const colors = colorMap[lvl.color]
            const best = bestScores[lvl.id]
            const isPerfect = best === QUESTIONS_PER_ROUND

            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={`w-full bg-white border-2 rounded-xl px-5 py-5 flex items-center justify-between transition-all active:scale-95 ${colors.card}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                    {lvl.label}
                  </span>
                  <span className="text-sm text-slate-500">{lvl.description}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {best !== null ? (
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold ${isPerfect ? 'text-green-600' : 'text-slate-600'}`}>
                        {best}/{QUESTIONS_PER_ROUND}
                      </span>
                      {isPerfect && (
                        <span className="text-xs text-green-500 font-medium">Perfeito!</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">Novo</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
