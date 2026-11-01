// Barra em segmentos: um por pergunta.
// Verde = acertou · terracota = errou · azul claro = pergunta atual · creme escuro = ainda não chegou.
// Sem `results`, os segmentos já passados ficam pretos (uso no quiz).

interface ProgressBarProps {
  current: number // índice da pergunta atual (0 = primeira)
  total: number
  results?: ('correct' | 'wrong')[]
}

export default function ProgressBar({ current, total, results }: ProgressBarProps) {
  return (
    <div className="flex gap-1 w-full" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        let color = 'bg-paper-dark'
        const r = results?.[i]
        if (r === 'correct') color = 'bg-success'
        else if (r === 'wrong') color = 'bg-error'
        else if (i === current) color = 'bg-secondary'
        else if (!results && i < current) color = 'bg-ink'
        return <span key={i} className={`flex-1 h-2 rounded-full transition-colors duration-300 ${color}`} />
      })}
    </div>
  )
}
