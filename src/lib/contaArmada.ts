// Conta armada para a caixa "Entenda o erro": a conta montada como no
// caderno, mais o passo a passo embaixo (opção B aprovada pelo Leandro em
// 01/11/2026). O jeito de falar é o dele: "desce o 6, sobe o 5".
//
// Só aparece quando ajuda: conta de um algarismo só (7 × 8, 5 + 3) continua
// só com a frase de hoje.

export type CellTone = 'normal' | 'small' | 'struck' | 'zero' | 'result' | 'op'

export interface Cell {
  text: string
  tone: CellTone
}

// Uma linha da conta. `cells` tem sempre `cols` posições, alinhadas à direita.
// `rule` é o traço da conta; `ruleFrom`/`ruleTo` limitam o traço a um trecho
// (usado na divisão, onde o traço fica só embaixo da subtração).
export interface Row {
  op: string
  cells: Cell[]
  kind: 'small' | 'num' | 'rule'
  ruleFrom?: number
  ruleTo?: number
}

export interface Armada {
  kind: 'vertical' | 'chave'
  cols: number
  rows: Row[]
  divisor?: string
  quotient?: string
  steps: string[]
}

const blank = (): Cell => ({ text: '', tone: 'normal' })

function digitsOf(n: number): number[] {
  return String(n).split('').map(Number)
}

// Linha com o número `n` alinhado à direita em `cols` colunas.
function numRow(n: number | string, cols: number, op = '', tone: CellTone = 'normal'): Row {
  const s = String(n)
  const cells: Cell[] = Array.from({ length: cols }, blank)
  for (let i = 0; i < s.length; i++) cells[cols - s.length + i] = { text: s[i], tone }
  return { op, cells, kind: 'num' }
}

function ruleRow(cols: number): Row {
  return { op: '', cells: Array.from({ length: cols }, blank), kind: 'rule' }
}

function vezes(n: number): string {
  return n === 1 ? 'vez' : 'vezes'
}

// ---------------------------------------------------------------- adição

export function armarAdicao(a: number, b: number): Armada | null {
  if (Math.max(a, b) < 11) return null
  const total = a + b
  const cols = String(total).length
  const da = digitsOf(a).reverse()
  const db = digitsOf(b).reverse()
  const width = Math.max(da.length, db.length)

  const carries: Cell[] = Array.from({ length: cols }, blank)
  const steps: string[] = []
  let carry = 0
  for (let i = 0; i < width; i++) {
    const parts: number[] = []
    if (carry) parts.push(carry)
    if (i < da.length) parts.push(da[i])
    if (i < db.length) parts.push(db[i])
    const s = parts.reduce((x, y) => x + y, 0)
    const expr = parts.length > 1 ? `${parts.join(' + ')} = ${s}` : `Desce o ${s}`
    const last = i === width - 1
    if (s >= 10 && !last) {
      const sobe = Math.floor(s / 10)
      steps.push(`${expr}: desce o ${s % 10}, sobe o ${sobe}`)
      carries[cols - 2 - i] = { text: String(sobe), tone: 'small' }
      carry = sobe
    } else {
      steps.push(expr)
      carry = 0
    }
  }

  const rows: Row[] = []
  if (carries.some((c) => c.text)) rows.push({ op: '', cells: carries, kind: 'small' })
  rows.push(numRow(a, cols), numRow(b, cols, '+'), ruleRow(cols), numRow(total, cols, '', 'result'))
  return { kind: 'vertical', cols, rows, steps }
}

// ------------------------------------------------------------- subtração

export function armarSubtracao(a: number, b: number): Armada | null {
  if (a < 11 || b < 0 || b > a) return null
  const result = a - b
  const da = digitsOf(a).reverse()
  const db = digitsOf(b).reverse()
  const cols = da.length
  const work = [...da]
  const changed = new Array(cols).fill(false)
  const steps: string[] = []

  for (let i = 0; i < cols; i++) {
    const bd = i < db.length ? db[i] : null
    const before = work[i]
    const prefix: string[] = []
    if (before !== da[i]) prefix.push(`O ${da[i]} emprestou 1 e ficou ${before}.`)

    if (bd !== null && work[i] < bd) {
      // pega 1 emprestado da casa ao lado; se ela for 0, o empréstimo vem de mais longe
      let j = i + 1
      while (work[j] === 0) j++
      const lender = work[j]
      const zeros = j - i - 1
      work[j] -= 1
      changed[j] = true
      for (let k = j - 1; k > i; k--) {
        work[k] = 9
        changed[k] = true
      }
      work[i] += 10
      changed[i] = true
      const r = work[i] - bd
      const empresta =
        zeros === 0
          ? `Do ${before} não dá para tirar ${bd}: o ${lender} empresta 1.`
          : zeros === 1
            ? `Do ${before} não dá para tirar ${bd}, e o 0 do lado não tem para emprestar. O ${lender} empresta 1, e o 0 vira 9.`
            : `Do ${before} não dá para tirar ${bd}, e os zeros do lado não têm para emprestar. O ${lender} empresta 1, e cada 0 vira 9.`
      steps.push([...prefix, empresta, `${work[i]} − ${bd} = ${r}`].join(' '))
    } else if (bd !== null) {
      steps.push([...prefix, `${work[i]} − ${bd} = ${work[i] - bd}`].join(' '))
    } else if (i < cols - 1 || work[i] > 0) {
      steps.push([...prefix, `Desce o ${work[i]}`].join(' '))
    }
  }

  const top: Row = { op: '', cells: [], kind: 'num' }
  const small: Row = { op: '', cells: [], kind: 'small' }
  for (let col = 0; col < cols; col++) {
    const i = cols - 1 - col
    const isChanged = changed[i]
    top.cells.push({ text: String(da[i]), tone: isChanged ? 'struck' : 'normal' })
    small.cells.push(isChanged ? { text: String(work[i]), tone: 'small' } : blank())
  }

  const rows: Row[] = []
  if (changed.some(Boolean)) rows.push(small)
  rows.push(top, numRow(b, cols, '−'), ruleRow(cols), numRow(result, cols, '', 'result'))
  return { kind: 'vertical', cols, rows, steps }
}

// --------------------------------------------------------- multiplicação

export function armarMultiplicacao(x: number, y: number): Armada | null {
  const top = Math.max(x, y)
  const bottom = Math.min(x, y)
  if (top < 11 || bottom < 2) return null
  return bottom < 10 ? multiplicarPorUmAlgarismo(top, bottom) : multiplicarPorVarios(top, bottom)
}

function multiplicarPorUmAlgarismo(top: number, d: number): Armada {
  const result = top * d
  const cols = String(result).length
  const dt = digitsOf(top).reverse()
  const carries: Cell[] = Array.from({ length: cols }, blank)
  const steps: string[] = []
  let carry = 0
  for (let i = 0; i < dt.length; i++) {
    const p = d * dt[i] + carry
    const expr = `${d} × ${dt[i]}${carry ? ` + ${carry}` : ''} = ${p}`
    const last = i === dt.length - 1
    if (p >= 10 && !last) {
      const sobe = Math.floor(p / 10)
      steps.push(`${expr}: desce o ${p % 10}, sobe o ${sobe}`)
      carries[cols - 2 - i] = { text: String(sobe), tone: 'small' }
      carry = sobe
    } else {
      steps.push(expr)
      carry = 0
    }
  }
  const rows: Row[] = []
  if (carries.some((c) => c.text)) rows.push({ op: '', cells: carries, kind: 'small' })
  rows.push(numRow(top, cols), numRow(d, cols, '×'), ruleRow(cols), numRow(result, cols, '', 'result'))
  return { kind: 'vertical', cols, rows, steps }
}

function multiplicarPorVarios(top: number, bottom: number): Armada {
  const result = top * bottom
  const cols = String(result).length
  const db = digitsOf(bottom).reverse()
  const partials: { value: number; zeros: number }[] = []
  const steps: string[] = []
  db.forEach((dk, k) => {
    if (dk === 0) return
    const mult = dk * 10 ** k
    const value = top * mult
    partials.push({ value, zeros: k })
    steps.push(`${mult} × ${top} = ${value}`)
  })

  const rows: Row[] = [numRow(top, cols), numRow(bottom, cols, '×'), ruleRow(cols)]
  if (partials.length > 1) {
    partials.forEach((p, idx) => {
      const row = numRow(p.value, cols, idx === 0 ? '' : '+')
      // os zeros do fim (a "casa pulada") ficam mais claros, como no caderno
      for (let z = 0; z < p.zeros; z++) row.cells[cols - 1 - z].tone = 'zero'
      rows.push(row)
    })
    rows.push(ruleRow(cols))
    steps.push(`${partials.map((p) => p.value).join(' + ')} = ${result}`)
  }
  rows.push(numRow(result, cols, '', 'result'))
  return { kind: 'vertical', cols, rows, steps }
}

// --------------------------------------------------------------- divisão

export function armarDivisao(dividendo: number, divisor: number): Armada | null {
  if (divisor < 1 || dividendo % divisor !== 0) return null
  const quociente = dividendo / divisor
  if (quociente < 10 && dividendo < 100) return null

  const D = digitsOf(dividendo)
  const cols = D.length
  const rows: Row[] = [numRow(dividendo, cols)]
  const steps: string[] = []

  // primeiro pedaço: pega algarismos até o divisor caber
  let i = 0
  let cur = 0
  while (i < cols) {
    cur = cur * 10 + D[i]
    i++
    if (cur >= divisor) break
  }
  let end = i - 1 // coluna do último algarismo do pedaço atual
  let quotient = ''
  let prefix = ''
  let remainderRow: Row | null = null

  for (;;) {
    const q = Math.floor(cur / divisor)
    const p = q * divisor
    const r = cur - p
    quotient += String(q)

    if (q === 0) {
      steps.push(`${prefix}O ${divisor} não cabe no ${cur}: põe 0 no resultado.`)
    } else {
      steps.push(`${prefix}O ${divisor} cabe ${q} ${vezes(q)} no ${cur}: ${q} × ${divisor} = ${p}, sobra ${r}.`)
      const sub: Row = { op: '', cells: Array.from({ length: cols }, blank), kind: 'num' }
      const ps = String(p)
      for (let k = 0; k < ps.length; k++) sub.cells[end - ps.length + 1 + k] = { text: ps[k], tone: 'normal' }
      // o sinal de menos fica colado na frente do número
      const opCol = end - ps.length
      if (opCol >= 0) sub.cells[opCol] = { text: '−', tone: 'op' }
      else sub.op = '−'
      rows.push(sub)
      rows.push({
        op: '',
        cells: Array.from({ length: cols }, blank),
        kind: 'rule',
        ruleFrom: Math.max(0, end - String(cur).length + 1),
        ruleTo: end,
      })
      remainderRow = { op: '', cells: Array.from({ length: cols }, blank), kind: 'num' }
      if (r > 0 || i >= cols) {
        const rs = String(r)
        for (let k = 0; k < rs.length; k++) remainderRow.cells[end - rs.length + 1 + k] = { text: rs[k], tone: 'normal' }
      }
      rows.push(remainderRow)
    }

    if (i >= cols) break
    // desce o próximo algarismo
    const next = D[i]
    if (remainderRow) remainderRow.cells[i] = { text: String(next), tone: 'normal' }
    prefix = `Desce o ${next}. `
    cur = r * 10 + next
    end = i
    i++
  }

  return { kind: 'chave', cols, rows, divisor: String(divisor), quotient: String(Number(quotient)), steps }
}
