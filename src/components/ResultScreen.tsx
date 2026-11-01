'use client'

import { DifficultyLevel, GameMode } from '@/lib/types'
import { getPreviousBest } from '@/lib/storage'
import { QUESTIONS_PER_ROUND } from '@/lib/constants'
import { getRoundLabel } from '@/lib/labels'
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

function getEncouragementMessage(score: number): string {
  if (score === QUESTIONS_PER_ROUND) return 'Perfeito. Sem nenhum erro.'
  if (score >= 8) return 'Muito bem. Você está quase lá.'
  if (score >= 6) return 'Bom resultado. Continue praticando.'
  if (score >= 4) return 'Foi um bom treino. Tente de novo.'
  return 'Não desanima. Cada tentativa é aprendizado.'
}

export default function ResultScreen({ mode, level, score, onPlayAgain, onHome, titleOverride, variant }: ResultScreenProps) {
  const errors = QUESTIONS_PER_ROUND - score
  const message = getEncouragementMessage(score)
  const [previousBest, setPreviousBest] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setPreviousBest(getPreviousBest(mode, level, variant))
    setLoaded(true)
  }, [mode, level, variant])

  const isNewBest = previousBest !== null && score > previousBest

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 pt-6 pb-8">
      <div className="w-full max-w-md flex flex-col flex-1">
        <p className="text-sm text-soft">{getRoundLabel(mode, level, titleOverride)}</p>

        <div className="flex flex-col items-center mt-8">
          {isNewBest && (
            <span className="anim-pop bg-gold text-ink rounded-full px-4 py-1.5 text-sm font-bold mb-4">
              Novo recorde
            </span>
          )}
          <p className="font-heading font-black text-ink leading-none">
            <span className="text-8xl">{score}</span>
            <span className="text-4xl text-muted">/{QUESTIONS_PER_ROUND}</span>
          </p>
          <p className="mt-4 text-lg font-semibold text-ink text-center">{message}</p>
          {loaded && previousBest !== null && (
            <p className="mt-1 text-sm text-soft text-center">
              {isNewBest
                ? `Seu melhor neste nível era ${previousBest}.`
                : `Seu melhor neste nível: ${previousBest}/${QUESTIONS_PER_ROUND}.`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="bg-success-bg rounded-xl p-4 text-center">
            <p className="text-3xl font-heading font-black text-success">{score}</p>
            <p className="text-sm text-success font-semibold mt-1">Acertos</p>
          </div>
          <div className="bg-error-bg rounded-xl p-4 text-center">
            <p className="text-3xl font-heading font-black text-error">{errors}</p>
            <p className="text-sm text-error font-semibold mt-1">Erros</p>
          </div>
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full h-14 rounded-xl bg-ink text-bg font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Jogar novamente
          </button>
          <button
            onClick={onHome}
            className="w-full h-14 rounded-xl border-2 border-ink text-ink font-bold text-base hover:bg-paper-dark active:scale-[0.98] transition-all"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  )
}
