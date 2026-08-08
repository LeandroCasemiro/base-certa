'use client'

import { useState } from 'react'
import { TabuadaConfig } from '@/lib/types'
import { TABUADA_NUMBERS } from '@/lib/constants'

interface TabuadaSetupScreenProps {
  onContinue: (config: TabuadaConfig) => void
  onBack: () => void
}

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
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div>
          <button
            onClick={onBack}
            className="text-muted hover:text-soft text-sm font-medium transition-colors mb-4 block"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-heading font-black text-ink">Tabuada</h1>
          <p className="text-sm text-muted mt-1">Escolha o que treinar</p>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted mb-3 px-1">
            Qual tabuada?
          </h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSelectNumber(null)}
              className={`w-full rounded-xl px-5 py-3 text-sm font-bold border-2 transition-all active:scale-95 ${
                selectedNumber === null
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-border text-soft hover:border-secondary'
              }`}
            >
              Todas as tabuadas
            </button>
            <div className="grid grid-cols-4 gap-2">
              {TABUADA_NUMBERS.map((n) => (
                <button
                  key={n}
                  onClick={() => handleSelectNumber(n)}
                  className={`aspect-square rounded-xl text-lg font-bold border-2 transition-all active:scale-95 ${
                    selectedNumber === n
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-border text-soft hover:border-secondary'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedNumber !== null && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted mb-3 px-1">
              Como treinar o {selectedNumber}?
            </h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setFamily(false)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all active:scale-95 ${
                  !family ? 'border-primary bg-bg-d' : 'border-border bg-white hover:border-border-strong'
                }`}
              >
                <p className="text-sm font-bold text-ink">Só multiplicação</p>
                <p className="text-xs text-muted mt-1">
                  {selectedNumber} × 1, {selectedNumber} × 2... como a tabuada tradicional
                </p>
              </button>
              <button
                onClick={() => setFamily(true)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all active:scale-95 ${
                  family ? 'border-primary bg-bg-d' : 'border-border bg-white hover:border-border-strong'
                }`}
              >
                <p className="text-sm font-bold text-ink">Família completa (+, −, × e ÷)</p>
                <p className="text-xs text-muted mt-1">
                  Mistura soma, subtração, multiplicação e divisão, tudo envolvendo o {selectedNumber}
                </p>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-hover active:scale-95 transition-all"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
