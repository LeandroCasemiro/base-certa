'use client'

import { useEffect, useState } from 'react'
import { DifficultyLevel, GameMode } from '@/lib/types'
import { DIFFICULTY_LEVELS, QUESTIONS_PER_ROUND } from '@/lib/constants'
import { getBestScore } from '@/lib/storage'
import { getGroupName, getModeName } from '@/lib/labels'

interface DifficultyScreenProps {
  mode: GameMode
  onSelectLevel: (level: DifficultyLevel) => void
  onBack: () => void
  titleOverride?: string
  variant?: string
}

// Etiqueta de cada nível: do mais leve ao mais pesado
const LEVEL_BADGE: Record<string, string> = {
  green: 'bg-success-bg text-success',
  blue: 'bg-bg-d text-primary',
  navy: 'bg-ink text-bg',
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
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 pt-6 pb-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div>
          <button onClick={onBack} className="text-soft hover:text-ink text-sm font-medium transition-colors mb-5 block">
            ← Voltar
          </button>
          <h1 className="text-3xl font-heading font-black text-ink tracking-tight">{titleOverride ?? getModeName(mode)}</h1>
          <p className="text-sm text-soft mt-1">
            {titleOverride ? 'Escolha o nível' : `${getGroupName(mode)} · Escolha o nível`}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {DIFFICULTY_LEVELS.map((lvl) => {
            const best = bestScores[lvl.id]
            const isPerfect = best === QUESTIONS_PER_ROUND

            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className="w-full bg-card border-2 border-line rounded-xl px-5 py-5 flex items-center justify-between text-left transition-all hover:border-ink active:scale-[0.98]"
              >
                <div className="flex flex-col items-start gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_BADGE[lvl.color]}`}>{lvl.label}</span>
                  <span className="text-sm text-soft">{lvl.description}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {best !== null ? (
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-heading font-black ${isPerfect ? 'text-success' : 'text-ink'}`}>
                        {best}/{QUESTIONS_PER_ROUND}
                      </span>
                      <span className={`text-xs font-medium ${isPerfect ? 'text-success' : 'text-muted'}`}>
                        {isPerfect ? 'Perfeito' : 'seu melhor'}
                      </span>
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
