'use client'

import { FeedbackState, Question } from '@/lib/types'
import OptionButton from './OptionButton'
import ProgressBar from './ProgressBar'
import ContaArmada from './ContaArmada'
import { QUESTIONS_PER_ROUND } from '@/lib/constants'

interface GameScreenProps {
  question: Question
  currentIndex: number
  feedback: FeedbackState
  selectedOption: number | null
  results: ('correct' | 'wrong')[]
  streak: number
  roundLabel: string
  onSelect: (value: number) => void
  onNext: () => void
  onHome: () => void
}

// A partir de quantos acertos seguidos o contador aparece
const STREAK_MIN = 3

function questionSize(text: string): string {
  if (text.length <= 7) return 'text-6xl'
  if (text.length <= 11) return 'text-5xl'
  return 'text-4xl'
}

export default function GameScreen({
  question,
  currentIndex,
  feedback,
  selectedOption,
  results,
  streak,
  roundLabel,
  onSelect,
  onNext,
  onHome,
}: GameScreenProps) {
  const isLast = currentIndex === QUESTIONS_PER_ROUND - 1
  // "7 × 8 = ?" vira "7 × 8" na tela, com o número grande
  const text = question.text.replace(/\s*=\s*\?\s*$/, '')

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 pt-6 pb-8">
      <div className="w-full max-w-md flex flex-col flex-1">
        {/* Topo */}
        <div className="flex items-center justify-between h-8">
          <button
            onClick={onHome}
            aria-label="Sair da rodada"
            className="text-soft hover:text-ink text-2xl leading-none px-1 transition-colors"
          >
            ×
          </button>
          {streak >= STREAK_MIN && (
            <span key={streak} className="anim-pop bg-gold text-ink rounded-full px-3 py-1 text-xs font-bold">
              {streak} seguidas
            </span>
          )}
        </div>

        <div className="mt-3">
          <ProgressBar current={currentIndex} total={QUESTIONS_PER_ROUND} results={results} />
          <p className="text-xs text-muted mt-2">
            Pergunta {currentIndex + 1} de {QUESTIONS_PER_ROUND}
          </p>
        </div>

        {/* Pergunta */}
        <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.15em] text-muted">{roundLabel}</p>
        <p className={`mt-2 mb-8 text-center font-heading font-black text-ink tracking-tight ${questionSize(text)}`}>
          {text}
        </p>

        {/* Opções */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <OptionButton
              key={opt}
              value={opt}
              feedback={feedback}
              isSelected={selectedOption === opt}
              isCorrect={opt === question.correct}
              onClick={onSelect}
            />
          ))}
        </div>

        {/* Retorno */}
        {feedback === 'correct' && (
          <div className="anim-rise mt-5 rounded-xl bg-success-bg text-success font-semibold text-center px-4 py-3">
            Isso. Mais uma pra conta.
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="anim-rise mt-5 rounded-xl bg-paper-dark border-2 border-line px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-error mb-1">Entenda o erro</p>
            <p className="text-sm text-ink leading-relaxed">{question.explanation}</p>
            {question.armada && <ContaArmada armada={question.armada} />}
          </div>
        )}

        {/* Próxima */}
        <div className="mt-auto pt-6">
          <button
            onClick={onNext}
            disabled={feedback === 'idle'}
            className={`w-full h-14 rounded-xl text-base font-bold transition-all ${
              feedback === 'idle'
                ? 'bg-paper-dark text-muted cursor-not-allowed'
                : 'bg-ink text-bg hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            {isLast ? 'Ver resultado' : 'Próxima →'}
          </button>
        </div>
      </div>
    </div>
  )
}
