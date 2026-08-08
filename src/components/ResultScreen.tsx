'use client'

import { DifficultyLevel, GameMode } from '@/lib/types'
import { getBestScore } from '@/lib/storage'
import { DIFFICULTY_LEVELS, MODE_GROUPS, QUESTIONS_PER_ROUND } from '@/lib/constants'
import { useEffect, useState } from 'react'

interface ResultScreenProps {
  mode: GameMode
  level: DifficultyLevel
  score: number
  onPlayAgain: () => void
  onHome: () => void
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

function getLevelLabel(level: DifficultyLevel): string {
  return DIFFICULTY_LEVELS.find((l) => l.id === level)?.label ?? level
}

function getEncouragementMessage(score: number): string {
  if (score === QUESTIONS_PER_ROUND) return 'Perfeito! Sem nenhum erro!'
  if (score >= 8) return 'Muito bem! Você está quase lá!'
  if (score >= 6) return 'Bom resultado! Continue praticando.'
  if (score >= 4) return 'Ainda bem que você praticou. Tente de novo!'
  return 'Não desanima! Cada tentativa é aprendizado.'
}

export default function ResultScreen({ mode, level, score, onPlayAgain, onHome, titleOverride, variant }: ResultScreenProps) {
  const errors = QUESTIONS_PER_ROUND - score
  const message = getEncouragementMessage(score)
  const [bestScore, setBestScore] = useState<number | null>(null)

  useEffect(() => {
    setBestScore(getBestScore(mode, level, variant))
  }, [mode, level, variant])

  const isNewBest = bestScore !== null && score >= bestScore

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-black text-ink mb-1">Resultado</h1>
          <p className="text-sm text-muted">
            {titleOverride ?? getModeName(mode)} · {getLevelLabel(level)}
          </p>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-xl border-2 border-border p-8 text-center flex flex-col gap-2">
          <span className="text-6xl font-heading font-black text-primary">
            {score}/{QUESTIONS_PER_ROUND}
          </span>
          <p className="text-soft text-sm font-medium">{message}</p>
          {isNewBest && (
            <span className="text-xs font-bold text-success uppercase tracking-wider mt-1">
              Novo recorde neste nível!
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-success/10 border-2 border-success/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-black text-success">{score}</p>
            <p className="text-xs text-success font-medium mt-1">Acertos</p>
          </div>
          <div className="bg-error/10 border-2 border-error/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-black text-error">{errors}</p>
            <p className="text-xs text-error font-medium mt-1">Erros</p>
          </div>
        </div>

        {bestScore !== null && !isNewBest && (
          <p className="text-center text-xs text-muted">
            Seu melhor neste nível: <span className="font-bold">{bestScore}/10</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-hover active:scale-95 transition-all"
          >
            Jogar novamente
          </button>
          <button
            onClick={onHome}
            className="w-full py-4 rounded-xl bg-white border-2 border-border text-soft font-bold text-base hover:border-border-strong active:scale-95 transition-all"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  )
}
