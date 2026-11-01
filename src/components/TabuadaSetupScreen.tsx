'use client'

import { useState } from 'react'
import { TabuadaConfig } from '@/lib/types'
import { TABUADA_NUMBERS } from '@/lib/constants'

interface TabuadaSetupScreenProps {
  onContinue: (config: TabuadaConfig) => void
  onBack: () => void
}

// Marcado = azul claro ("onde você está"); não marcado = creme claro
const SELECTED = 'bg-bg-d border-secondary text-ink'
const IDLE = 'bg-card border-line text-ink hover:border-ink'

export default function TabuadaSetupScreen({ onContinue, onBack }: TabuadaSetupScreenProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [family, setFamily] = useState(false)

  function handleSelectNumber(n: number | null) {
    setSelectedNumber(n)
    if (n === null) setFamily(false)
  }

  function handleContinue() {
    onContinue({ focusNumber: selectedNumber, family: selectedNumber !== null && family })
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 pt-6 pb-8">
      <div className="w-full max-w-md flex flex-col flex-1 gap-6">
        <div>
          <button onClick={onBack} className="text-soft hover:text-ink text-sm font-medium transition-colors mb-5 block">
            ← Voltar
          </button>
          <h1 className="text-3xl font-heading font-black text-ink tracking-tight">Tabuada</h1>
          <p className="text-sm text-soft mt-1">Escolha o que treinar</p>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-muted mb-3 px-1">Qual tabuada?</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSelectNumber(null)}
              className={`w-full rounded-xl px-5 py-3.5 text-base font-bold border-2 transition-all active:scale-[0.98] ${
                selectedNumber === null ? SELECTED : IDLE
              }`}
            >
              Todas as tabuadas
            </button>
            <div className="grid grid-cols-4 gap-2">
              {TABUADA_NUMBERS.map((n) => (
                <button
                  key={n}
                  onClick={() => handleSelectNumber(n)}
                  className={`aspect-square rounded-xl text-2xl font-heading font-black border-2 transition-all active:scale-95 ${
                    selectedNumber === n ? SELECTED : IDLE
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedNumber !== null && (
          <div className="anim-rise">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-muted mb-3 px-1">
              Como treinar o {selectedNumber}?
            </h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setFamily(false)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all active:scale-[0.98] ${!family ? SELECTED : IDLE}`}
              >
                <p className="text-sm font-bold text-ink">Só multiplicação</p>
                <p className="text-xs text-soft mt-1">
                  {selectedNumber} × 1, {selectedNumber} × 2... como a tabuada tradicional
                </p>
              </button>
              <button
                onClick={() => setFamily(true)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all active:scale-[0.98] ${family ? SELECTED : IDLE}`}
              >
                <p className="text-sm font-bold text-ink">Família completa (+, −, × e ÷)</p>
                <p className="text-xs text-soft mt-1">
                  Mistura soma, subtração, multiplicação e divisão, tudo envolvendo o {selectedNumber}
                </p>
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={handleContinue}
            className="w-full h-14 rounded-xl bg-ink text-bg font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  )
}
