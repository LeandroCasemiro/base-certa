'use client'

import { useState } from 'react'
import { ACCESS_PASSWORD } from '@/lib/constants'
import { setUnlocked } from '@/lib/storage'

interface PasswordGateProps {
  onUnlock: () => void
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = value.trim().toLowerCase().replace(/\s+/g, '')
    if (normalized === ACCESS_PASSWORD) {
      setUnlocked()
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-3xl font-heading font-black text-primary mb-2">Base Certa</h1>
          <p className="text-soft text-sm">Digite o código de acesso pra entrar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            placeholder="Código de acesso"
            autoFocus
            className={`w-full text-center rounded-xl border-2 px-5 py-4 text-base font-semibold outline-none transition-all ${
              error
                ? 'border-error/50 bg-error/10 text-error'
                : 'border-border bg-white text-ink focus:border-primary'
            }`}
          />
          {error && <p className="text-sm text-error font-medium">Código incorreto. Tenta de novo.</p>}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-hover active:scale-95 transition-all"
          >
            Entrar
          </button>
        </form>

        <p className="text-xs text-muted">Uma ferramenta Pai MOVIDO</p>
      </div>
    </div>
  )
}
