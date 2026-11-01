'use client'

import type { Armada, Cell, Row } from '@/lib/contaArmada'

const COL = 22 // largura de cada algarismo, em px
const OP = 22 // coluna do sinal (+ − ×)

const toneClass: Record<Cell['tone'], string> = {
  normal: 'text-ink',
  small: 'text-op-div',
  struck: 'text-muted line-through decoration-2',
  zero: 'text-muted opacity-60',
  result: 'text-success',
  op: 'text-soft',
}

function Grid({ rows, cols }: { rows: Row[]; cols: number }) {
  const template = `${OP}px repeat(${cols}, ${COL}px)`
  return (
    <div className="font-heading font-black tabular-nums" aria-hidden="true">
      {rows.map((row, r) => {
        if (row.kind === 'rule') {
          const from = row.ruleFrom ?? -1
          const to = row.ruleTo ?? cols - 1
          return (
            <div key={r} className="grid" style={{ gridTemplateColumns: template }}>
              <div
                className="border-t-[2.5px] border-ink my-1"
                style={{ gridColumn: `${from + 2} / ${to + 3}` }}
              />
            </div>
          )
        }
        const small = row.kind === 'small'
        return (
          <div
            key={r}
            className={`grid text-center ${small ? 'text-[11px] font-body font-bold leading-none h-3.5' : 'text-2xl leading-tight'}`}
            style={{ gridTemplateColumns: template }}
          >
            <span className="text-soft">{row.op}</span>
            {row.cells.map((c, i) => (
              <span key={i} className={toneClass[c.tone]}>
                {c.text}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function ContaArmada({ armada }: { armada: Armada }) {
  return (
    <div className="mt-3">
      <div className="flex justify-center rounded-lg bg-card border-2 border-line px-4 py-3">
        {armada.kind === 'vertical' ? (
          <Grid rows={armada.rows} cols={armada.cols} />
        ) : (
          <div className="flex items-start">
            <Grid rows={armada.rows} cols={armada.cols} />
            <div className="font-heading font-black tabular-nums text-2xl leading-tight ml-1" aria-hidden="true">
              <div className="border-l-[2.5px] border-b-[2.5px] border-ink pl-2 pr-1">{armada.divisor}</div>
              <div className="pl-2.5 text-success">{armada.quotient}</div>
            </div>
          </div>
        )}
      </div>
      <ol className="mt-3 space-y-1 text-sm text-ink leading-snug">
        {armada.steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
