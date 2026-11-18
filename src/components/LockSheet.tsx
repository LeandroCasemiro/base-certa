'use client'

import { useState } from 'react'
import { getContato, isNaLista, marcarNaLista } from '@/lib/storage'
import { isValidEmail, sendWaitlist } from '@/lib/quiz'

// Janela que sobe quando o filho (ou o pai) toca num item com cadeado.
// Prévia aprovada em 18/11/2026: PLANEJAMENTO/12-PREVIA-CADEADO.png
// Não cobra nada e não promete data: só guarda o pedido de aviso na planilha.

export type ItemTravado = 'niveis' | 'inteiros'

const TEXTO: Record<ItemTravado, { titulo: string; corpo: string }> = {
  niveis: {
    titulo: 'Desafiador e Expert estão chegando',
    corpo: 'Quando seu filho dominar o Iniciante, esses níveis levam o treino para números maiores.',
  },
  inteiros: {
    titulo: 'Números Inteiros está chegando',
    corpo: 'Quando seu filho dominar as Operações Básicas, as contas com números negativos são o próximo passo.',
  },
}

interface LockSheetProps {
  item: ItemTravado
  // o que o pai tocou, para a planilha (ex.: "Multiplicação · Desafiador")
  quis: string
  onClose: () => void
}

export default function LockSheet({ item, quis, onClose }: LockSheetProps) {
  const contato = getContato()
  const [email, setEmail] = useState(contato?.email ?? '')
  const [feito, setFeito] = useState(isNaLista(item))
  const [enviando, setEnviando] = useState(false)
  const [tentou, setTentou] = useState(false)
  const emailOk = isValidEmail(email)

  async function avisar() {
    setTentou(true)
    if (!emailOk || enviando) return
    setEnviando(true)
    await sendWaitlist({ nome: contato?.nome ?? '', email, celular: contato?.celular ?? '', quis })
    marcarNaLista(item)
    setEnviando(false)
    setFeito(true)
  }

  const t = TEXTO[item]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-ink/55" />
      <div className="anim-rise relative w-full max-w-md bg-bg rounded-t-[22px] px-6 pt-6 pb-7">
        <div className="text-3xl" aria-hidden>
          🔒
        </div>
        <h2 className="mt-2 text-2xl font-heading font-black text-ink leading-tight">{t.titulo}</h2>
        <p className="mt-3 text-base leading-relaxed text-soft">{t.corpo}</p>

        {feito ? (
          <>
            <div className="mt-5 rounded-xl bg-success-bg text-success px-4 py-3.5 font-semibold leading-snug">
              ✓ Pronto. Você está na lista e vai ser avisado quando abrir.
            </div>
            <button onClick={onClose} className="mt-4 w-full h-14 rounded-xl bg-ink text-bg font-bold active:scale-[0.98]">
              Voltar ao treino
            </button>
          </>
        ) : (
          <>
            {contato?.email ? (
              <p className="mt-3 text-base leading-relaxed text-soft">
                Toque abaixo e eu te aviso no e-mail que você deixou no quiz assim que abrir.
              </p>
            ) : (
              <div className="mt-3">
                <p className="text-base leading-relaxed text-soft">Deixe seu e-mail e eu te aviso assim que abrir.</p>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`mt-3 w-full rounded-xl border-2 bg-card px-4 py-3.5 text-base text-ink outline-none focus:border-secondary ${
                    tentou && !emailOk ? 'border-error' : 'border-line'
                  }`}
                />
                {tentou && !emailOk && (
                  <p className="mt-1.5 text-sm text-error">Confere o e-mail. Parece que falta alguma coisa.</p>
                )}
              </div>
            )}
            <button
              onClick={avisar}
              disabled={enviando}
              className="mt-5 w-full h-14 rounded-xl bg-ink text-bg font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {enviando ? 'Enviando…' : 'Quero ser avisado'}
            </button>
            <button onClick={onClose} className="mt-1 w-full py-3 text-sm font-semibold text-soft">
              Agora não
            </button>
          </>
        )}
      </div>
    </div>
  )
}
