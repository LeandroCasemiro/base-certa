'use client'

import { GameMode } from '@/lib/types'
import { MODE_GROUPS } from '@/lib/constants'

interface HomeScreenProps {
  onSelectMode: (mode: GameMode) => void
}

// Cor do ícone de cada operação (cores dos pilares MOVIDO — ver globals.css)
const OP_COLOR: Record<string, string> = {
  add: 'bg-op-add',
  sub: 'bg-op-sub',
  mul: 'bg-op-mul',
  div: 'bg-op-div',
}

function opColor(mode: GameMode): string {
  const op = mode.split('-')[1]
  return OP_COLOR[op] ?? 'bg-ink'
}

export default function HomeScreen({ onSelectMode }: HomeScreenProps) {
  const basic = MODE_GROUPS.find((g) => g.id === 'basic')!
  const integers = MODE_GROUPS.find((g) => g.id === 'integers')!
  const basicOps = basic.modes.filter((m) => m.id !== 'tabuada')

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col flex-1">
        <div className="mb-6">
          <h1 className="text-3xl min-[380px]:text-4xl font-heading font-black text-ink tracking-tight">Aprenda a Tabuada</h1>
          <p className="text-soft text-base mt-1">O básico da matemática bem feito.</p>
        </div>

        {/* Tabuada em destaque */}
        <button
          onClick={() => onSelectMode('tabuada')}
          className="w-full bg-ink text-bg rounded-xl px-5 py-5 flex items-center gap-4 text-left transition-transform active:scale-[0.98] hover:opacity-95"
        >
          <span className="w-14 h-14 rounded-2xl bg-bg text-ink grid place-items-center text-3xl font-bold leading-none">
            ×
          </span>
          <span className="flex flex-col">
            <span className="font-heading font-black text-xl">Tabuada</span>
            <span className="text-sm text-[#cfc8b6]">Uma por vez ou todas juntas</span>
          </span>
          <span className="ml-auto text-2xl">→</span>
        </button>

        <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-muted mt-7 mb-3 px-1">
          {basic.label}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {basicOps.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className="bg-card border-2 border-line rounded-xl p-4 flex flex-col items-start gap-3 text-left transition-all hover:border-ink active:scale-[0.97]"
            >
              <span className={`w-10 h-10 rounded-xl ${opColor(m.id)} text-white grid place-items-center text-2xl font-semibold leading-none`}>
                {m.icon}
              </span>
              <span className="text-base font-semibold text-ink">{m.label}</span>
            </button>
          ))}
        </div>

        <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-muted mt-7 mb-3 px-1">
          {integers.label}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {integers.modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className="bg-card border-2 border-line rounded-xl px-3 py-3 flex items-center gap-3 text-left transition-all hover:border-ink active:scale-[0.97]"
            >
              <span className={`w-8 h-8 shrink-0 rounded-lg ${opColor(m.id)} text-white grid place-items-center text-lg font-semibold leading-none`}>
                {m.icon}
              </span>
              <span className="min-w-0 text-sm max-[359px]:text-xs font-semibold text-ink">{m.label}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-auto pt-10">Uma ferramenta Pai MOVIDO</p>
      </div>
    </div>
  )
}
