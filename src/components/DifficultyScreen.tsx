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

const colorMap: Record<string, { card: string; badge: string }> = {
  green: {
    card: 'border-border hover:border-success hover:bg-bg-d',
    badge: 'bg-success/10 text-success',
  },
  blue: {
    card: 'border-border hover:border-primary hover:bg-bg-d',
    badge: 'bg-primary/10 text-primary',
  },
  navy: {
    card: 'border-border hover:border-header hover:bg-bg-d',
    badge: 'bg-header/10 text-header',
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
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div>
          <button
            onClick={onBack}
            className="text-muted hover:text-soft text-sm font-medium transition-colors mb-4 block"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-heading font-black text-ink">{titleOverride ?? getModeName(mode)}</h1>
          <p className="text-sm text-muted mt-1">
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
                  <span className="text-sm text-soft">{lvl.description}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {best !== null ? (
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold ${isPerfect ? 'text-success' : 'text-soft'}`}>
                        {best}/{QUESTIONS_PER_ROUND}
                      </span>
                      {isPerfect && (
                        <span className="text-xs text-success font-medium">Perfeito!</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted">Novo</span>
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
