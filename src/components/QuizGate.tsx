'use client'

import { useState } from 'react'
import ProgressBar from './ProgressBar'
import { setUnlocked } from '@/lib/storage'
import {
  QUIZ_QUESTIONS,
  QuizAnswers,
  buildStartAdvice,
  formatPhone,
  isValidEmail,
  isValidPhone,
  parentTrainsToo,
  sendToSheet,
} from '@/lib/quiz'
import {
  DIAGNOSTICO_URL,
  INSTAGRAM_URL,
  PRIVACY_URL,
  WHATSAPP_MESSAGE,
  WHATSAPP_NUMBER,
  WHATSAPP_VIDEO_ENABLED,
} from '@/lib/constants'

interface QuizGateProps {
  onUnlock: () => void
}

// intro → pergunta 0..9 → contato → resultado
type Step = { kind: 'intro' } | { kind: 'question'; index: number } | { kind: 'contact' } | { kind: 'result' }

const TOTAL = QUIZ_QUESTIONS.length

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-5 pt-6 pb-4">
      <div className="w-full max-w-md flex flex-col flex-1">{children}</div>
    </div>
  )
}

// Botão principal preso no rodapé da tela: em celular pequeno o texto rola por trás
// e o botão continua visível.
const BOTTOM_BAR = 'sticky bottom-0 mt-auto -mx-5 px-5 pt-6 pb-4 bg-gradient-to-t from-bg from-70% to-transparent'

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', disabled, ...rest } = props
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`w-full h-14 rounded-xl text-base font-bold transition-all ${
        disabled ? 'bg-paper-dark text-muted cursor-not-allowed' : 'bg-ink text-bg hover:opacity-90 active:scale-[0.98]'
      } ${className}`}
    />
  )
}

export default function QuizGate({ onUnlock }: QuizGateProps) {
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [answers, setAnswers] = useState<QuizAnswers>({})

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [celular, setCelular] = useState('')
  const [aceite, setAceite] = useState(false)
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)

  // ---------- Abertura ----------
  if (step.kind === 'intro') {
    return (
      <Screen>
        <h1 className="text-3xl min-[380px]:text-4xl font-heading font-black text-ink tracking-tight mt-4">Aprenda a Tabuada</h1>
        <p className="text-soft mt-1">O básico da matemática bem feito.</p>

        {/* Fato confirmado pelo Leandro em 01/11/2026: fez o app para a filha aprender a tabuada,
            dentro de um combinado de tempo útil na tela; depois abriu para outras famílias. */}
        <div className="mt-6 flex flex-col gap-4 text-base min-[380px]:text-lg leading-relaxed text-ink">
          <p>Oi, eu sou o Leandro Casemiro.</p>
          <p>Sou professor de matemática da rede estadual do Rio desde 2008. E sou pai.</p>
          <p>
            Fiz este app para a minha filha aprender a tabuada. Ela adora ficar no celular, então fiz um combinado com
            ela de ter um tempo útil na tela.
          </p>
          <p>
            Depois resolvi abrir o app para outras famílias. Sem a tabuada, aprender matemática fica mais difícil.
          </p>
        </div>

        <div className="mt-6 border-t-2 border-line pt-5 flex flex-col gap-2 text-base min-[380px]:text-lg leading-relaxed text-ink">
          <p>Antes de abrir, me conta um pouco sobre vocês.</p>
          <p className="text-soft text-base">
            São 10 perguntas rápidas. No final, eu te digo por onde seu filho pode começar.
          </p>
        </div>

        <div className={BOTTOM_BAR}>
          <PrimaryButton onClick={() => setStep({ kind: 'question', index: 0 })}>Começar →</PrimaryButton>
        </div>
      </Screen>
    )
  }

  // ---------- Perguntas ----------
  if (step.kind === 'question') {
    const q = QUIZ_QUESTIONS[step.index]
    const selected = answers[q.id]
    const goBack = () =>
      setStep(step.index === 0 ? { kind: 'intro' } : { kind: 'question', index: step.index - 1 })
    const goNext = () =>
      setStep(step.index === TOTAL - 1 ? { kind: 'contact' } : { kind: 'question', index: step.index + 1 })

    return (
      <Screen>
        <div className="flex items-center justify-between h-8">
          <button onClick={goBack} aria-label="Voltar" className="text-soft hover:text-ink text-xl px-1">
            ←
          </button>
          <span className="text-xs font-semibold text-muted">
            {step.index + 1} de {TOTAL}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar current={step.index} total={TOTAL} />
        </div>

        <div key={q.id} className="anim-rise">
          <h1 className="mt-7 text-2xl font-heading font-black text-ink leading-tight">{q.text}</h1>
          {q.helper && <p className="mt-2 text-sm text-soft">{q.helper}</p>}

          <div className="mt-6 flex flex-col gap-2.5">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                className={`w-full text-left rounded-xl border-2 px-4 py-3.5 text-base transition-all active:scale-[0.99] ${
                  selected === opt
                    ? 'bg-bg-d border-secondary font-semibold text-ink'
                    : 'bg-card border-line text-ink hover:border-ink'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className={BOTTOM_BAR}>
          <PrimaryButton onClick={goNext} disabled={!selected}>
            Continuar →
          </PrimaryButton>
        </div>
      </Screen>
    )
  }

  // ---------- Contato ----------
  if (step.kind === 'contact') {
    const nomeOk = nome.trim().length >= 2
    const emailOk = isValidEmail(email)
    const celOk = isValidPhone(celular)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setTried(true)
      if (!nomeOk || !emailOk || !celOk || sending) return
      setSending(true)
      await sendToSheet({ nome, email, celular, aceite, answers, resultado: buildStartAdvice(answers).join(' ') })
      setUnlocked()
      setSending(false)
      setStep({ kind: 'result' })
    }

    const field =
      'w-full rounded-xl border-2 bg-card px-4 py-3.5 text-base text-ink outline-none transition-colors focus:border-secondary'
    const errorText = 'mt-1.5 text-sm text-error'

    return (
      <Screen>
        <div className="flex items-center h-8">
          <button
            onClick={() => setStep({ kind: 'question', index: TOTAL - 1 })}
            aria-label="Voltar"
            className="text-soft hover:text-ink text-xl px-1"
          >
            ←
          </button>
        </div>
        <div className="mt-3">
          <ProgressBar current={TOTAL} total={TOTAL} />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 anim-rise">
          <h1 className="mt-7 text-2xl font-heading font-black text-ink leading-tight">
            Pronto. Me diz para onde eu mando as novidades do app.
          </h1>

          <div className="mt-6 flex flex-col gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Seu nome</span>
              <input
                type="text"
                autoComplete="given-name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={`${field} mt-1.5 ${tried && !nomeOk ? 'border-error' : 'border-line'}`}
              />
              {tried && !nomeOk && <p className={errorText}>Escreve seu nome, por favor.</p>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">E-mail</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${field} mt-1.5 ${tried && !emailOk ? 'border-error' : 'border-line'}`}
              />
              {tried && !emailOk && <p className={errorText}>Confere o e-mail. Parece que falta alguma coisa.</p>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Celular com DDD (WhatsApp)</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="(21) 99999-9999"
                value={celular}
                onChange={(e) => setCelular(formatPhone(e.target.value))}
                className={`${field} mt-1.5 placeholder:text-muted/60 ${tried && !celOk ? 'border-error' : 'border-line'}`}
              />
              {tried && !celOk ? (
                <p className={errorText}>Confere o número: DDD e mais 9 dígitos.</p>
              ) : (
                <p className="mt-1.5 text-sm text-soft">É por aqui que eu te aviso quando sair treino novo no app.</p>
              )}
            </label>

            <label className="flex items-start gap-3 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-1 w-5 h-5 accent-ink shrink-0"
              />
              <span className="text-sm text-soft leading-relaxed">
                Aceito receber mensagens do Pai MOVIDO por e-mail e WhatsApp.{' '}
                <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline text-ink">
                  Política de privacidade
                </a>
              </span>
            </label>
          </div>

          <div className={BOTTOM_BAR}>
            <PrimaryButton type="submit" disabled={sending}>
              {sending ? 'Enviando...' : 'Ver o resultado →'}
            </PrimaryButton>
          </div>
        </form>
      </Screen>
    )
  }

  // ---------- Resultado ----------
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <Screen>
      <div className="anim-rise flex flex-col flex-1">
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-muted">Por onde começar</p>
        <div className="mt-3 flex flex-col gap-3">
          {buildStartAdvice(answers).map((t, i) => (
            <p key={i} className={i === 0 ? 'text-xl leading-snug font-semibold text-ink' : 'text-base leading-relaxed text-ink'}>
              {t}
            </p>
          ))}
        </div>

        {parentTrainsToo(answers) && (
          <p className="mt-4 rounded-xl bg-bg-d px-4 py-3 text-base text-ink leading-relaxed">
            E se a sua tabuada também ficou lá atrás, treina junto. Começa pelo mesmo número que ele.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton onClick={onUnlock}>Abrir o app →</PrimaryButton>

          {WHATSAPP_VIDEO_ENABLED && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl border-2 border-ink px-4 py-3.5 text-center text-ink hover:bg-paper-dark transition-colors"
            >
              <span className="block font-bold">Me chama no WhatsApp</span>
              <span className="block text-sm text-soft mt-0.5">
                Quer ver como treinar a tabuada junto com o seu filho? Me chama que eu te mando um vídeo curto.
              </span>
            </a>
          )}
        </div>

        <div className="mt-10 border-t-2 border-line pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">Quem fez este app</p>
          <p className="mt-3 text-base leading-relaxed text-ink">Além de professor, eu cuido do Pai MOVIDO.</p>
          <p className="mt-3 text-base leading-relaxed text-ink">
            É um trabalho com pais que perceberam que só sustentar e cobrar não basta. Eles querem sair do automático na
            própria vida. E o filho aprende vendo.
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink">
            Quer saber em que ponto você está? Faça o Diagnóstico MOVIDO. É gratuito e tem 8 perguntas.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={DIAGNOSTICO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl border-2 border-ink grid place-items-center font-bold text-ink hover:bg-paper-dark transition-colors"
            >
              Fazer o diagnóstico
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm text-soft underline py-2"
            >
              Me siga no Instagram @euleandrocasemiro
            </a>
          </div>
        </div>
      </div>
    </Screen>
  )
}
