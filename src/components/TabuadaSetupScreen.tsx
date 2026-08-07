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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div>
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors mb-4 block"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-extrabold text-slate-800">Tabuada</h1>
          <p className="text-sm text-slate-400 mt-1">Escolha o que treinar</p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
            Qual tabuada?
          </h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSelectNumber(null)}
              className={`w-full rounded-xl px-5 py-3 text-sm font-bold border-2 transition-all active:scale-95 ${
                selectedNumber === null
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
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
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
              Como treinar o {selectedNumber}?
            </h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setFamily(false)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all active:scale-95 ${
                  !family ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-bold text-slate-700">Só multiplicação</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedNumber} × 1, {selectedNumber} × 2... como a tabuada tradicional
                </p>
              </button>
              <button
                onClick={() => setFamily(true)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all active:scale-95 ${
                  family ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-bold text-slate-700">Família completa (+, −, × e ÷)</p>
                <p className="text-xs text-slate-400 mt-1">
                  Mistura soma, subtração, multiplicação e divisão, tudo envolvendo o {selectedNumber}
                </p>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 active:scale-95 transition-all"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
