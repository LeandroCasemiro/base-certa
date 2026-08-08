import { DifficultyLevel, GameMode, Question, TabuadaConfig } from './types'
import { QUESTIONS_PER_ROUND } from './constants'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randIntExcluding(min: number, max: number, excluded: number[]): number {
  let val: number
  do {
    val = randInt(min, max)
  } while (excluded.includes(val))
  return val
}

function formatNumber(n: number): string {
  if (n < 0) return `(${n})`
  return String(n)
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dedupExcluding(candidates: number[], exclude: number): number[] {
  const set = new Set<number>()
  for (const c of candidates) {
    if (c !== exclude) set.add(c)
  }
  return Array.from(set)
}

// Fills up to `needed` distinct wrong-answer values around `correct`, avoiding
// anything already in `avoid`. Used to top off whatever the confusable pool
// (plausible-mistake candidates) didn't cover. `avoidUnitsDigit`, quando
// passado, impede que o preenchimento genérico bata por acaso o mesmo
// algarismo da unidade — sem isso, o Desafiador às vezes tinha 3 alternativas
// com a mesma unidade em vez de exatamente 2, por coincidência aleatória.
function genericDistractors(
  correct: number,
  spread: number,
  needed: number,
  avoid: Set<number>,
  avoidUnitsDigit: number | null = null
): number[] {
  const found = new Set<number>()
  let attempts = 0
  const forbiddenDigit = avoidUnitsDigit !== null ? Math.abs(avoidUnitsDigit % 10) : null

  function isAllowed(candidate: number): boolean {
    if (avoid.has(candidate)) return false
    if (forbiddenDigit !== null && Math.abs(candidate % 10) === forbiddenDigit) return false
    return true
  }

  while (found.size < needed && attempts < 200) {
    attempts++
    const offset = randIntExcluding(-spread, spread, [0])
    const candidate = correct + offset
    if (isAllowed(candidate)) found.add(candidate)
  }

  let step = 1
  while (found.size < needed && step < 200) {
    for (const sign of [1, -1]) {
      if (found.size >= needed) break
      const candidate = correct + sign * step
      if (isAllowed(candidate)) found.add(candidate)
    }
    step++
  }

  return Array.from(found).slice(0, needed)
}

// correct + múltiplo de 10 sempre termina no mesmo algarismo da unidade —
// garante `count` alternativas erradas distintas que não dá pra descartar só
// olhando o último dígito da resposta certa. `allowNegative` evita distratores
// negativos em modos que só trabalham com resultados positivos.
function sameUnitsDigitDistractors(
  correct: number,
  avoid: Set<number>,
  count: number,
  allowNegative: boolean
): number[] {
  const found: number[] = []
  for (let k = 1; k <= 40 && found.length < count; k++) {
    for (const sign of [1, -1]) {
      if (found.length >= count) break
      const candidate = correct + sign * k * 10
      if (candidate === correct) continue
      if (!allowNegative && candidate < 0) continue
      if (avoid.has(candidate)) continue
      found.push(candidate)
      avoid.add(candidate)
    }
  }
  return found
}

// Builds the 4 multiple-choice options for a question. `confusable` is a list
// of plausible-mistake values (already ordered by priority — most important
// first), pre-shuffled by the caller when order shouldn't matter. `confusableCount`
// (from getConfusableCount) decides how many of the 3 wrong answers come from
// that list versus a generic nearby-number fallback — this is what makes
// higher difficulty levels actually harder to eliminate by guesswork.
// `allowNegativeDistractors` should be false for modes whose results are
// always non-negative (basic-*, tabuada) — só os modos de Inteiros usam true.
function pickOptions(
  correct: number,
  confusable: number[],
  spread: number,
  confusableCount: number,
  allowNegativeDistractors: boolean
): number[] {
  const wrong: number[] = []
  const avoid = new Set<number>([correct])

  // Desafiador: 1 opção errada com a mesma unidade da certa (2 das 4 no total).
  // Expert: as 3 opções erradas com a mesma unidade (4 das 4) — nenhum atalho
  // de "olhar o último dígito" sobra. Nos dois casos, prioriza candidatos de
  // erro plausível que já batem essa unidade por coincidência; só completa
  // com ±10k mecânico quando falta.
  const sameUnitsCount = confusableCount >= 3 ? 3 : confusableCount >= 2 ? 1 : 0
  if (sameUnitsCount > 0) {
    const matching = dedupExcluding(confusable, correct).filter(
      (c) => Math.abs(c % 10) === Math.abs(correct % 10) && !avoid.has(c)
    )
    for (const c of matching) {
      if (wrong.length >= sameUnitsCount) break
      wrong.push(c)
      avoid.add(c)
    }
    if (wrong.length < sameUnitsCount) {
      wrong.push(...sameUnitsDigitDistractors(correct, avoid, sameUnitsCount - wrong.length, allowNegativeDistractors))
    }
  }

  // No Desafiador (sameUnitsCount === 1), trava o restante do preenchimento pra
  // não bater a mesma unidade por acaso — garante EXATAMENTE 2 das 4 (não 3).
  // No Expert essa trava nunca entra em ação (wrong já está cheio nesse ponto).
  const capSameUnits = sameUnitsCount > 0 && sameUnitsCount < 3
  const deduped = dedupExcluding(confusable, correct).filter(
    (c) => !avoid.has(c) && (!capSameUnits || Math.abs(c % 10) !== Math.abs(correct % 10))
  )
  for (const c of deduped) {
    if (wrong.length >= confusableCount) break
    wrong.push(c)
    avoid.add(c)
  }

  const remaining = 3 - wrong.length
  const generic = remaining > 0 ? genericDistractors(correct, spread, remaining, avoid, capSameUnits ? correct : null) : []
  return shuffleArray([correct, ...wrong, ...generic])
}

// How many of the 3 wrong answers should be "plausible mistakes" (close to
// the real answer) instead of generic nearby numbers. Beginner stays light
// (easy to eliminate by rough estimate); Expert is all plausible mistakes,
// so getting it right requires real calculation/recall, not guessing.
function getConfusableCount(level: DifficultyLevel): number {
  if (level === 'beginner') return 1
  if (level === 'intermediate') return 2
  return 3
}

// Integers: the single most common real mistake is getting the magnitude
// right but the sign wrong. Pin it first so it's always included once the
// level asks for at least 1 confusable option.
function withSignFlip(correct: number, rest: number[]): number[] {
  const list: number[] = []
  if (correct !== 0) list.push(-correct)
  list.push(...shuffleArray(rest))
  return list
}

function buildAddConfusable(a: number, b: number, correct: number): number[] {
  return shuffleArray([correct + 1, correct - 1, correct + 10, correct - 10, a + (b + 1), a + (b - 1), (a + 1) + b, (a - 1) + b])
}

function buildSubConfusable(a: number, b: number, correct: number): number[] {
  return shuffleArray([correct + 1, correct - 1, correct + 10, correct - 10, a - (b + 1), a - (b - 1)])
}

function buildMulConfusable(a: number, b: number, correct: number): number[] {
  return shuffleArray([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, correct + a, correct - a, correct + b, correct - b])
}

function buildDivConfusable(quociente: number): number[] {
  return shuffleArray([quociente + 1, quociente - 1, quociente + 2, quociente - 2])
}

// Ranges per difficulty
type Range = { min: number; max: number }

// O piso sobe estritamente acima do teto do nível anterior — sem isso, uma
// conta fácil do Iniciante (ex: 6×5) podia sortear de novo no Expert, porque
// os ranges antigos só cresciam o teto e nunca o piso (mesmo defeito que a
// Tabuada tinha antes de "número escolhido × 101-999").
function getBasicAddRange(level: DifficultyLevel): Range {
  if (level === 'beginner') return { min: 1, max: 10 }
  if (level === 'intermediate') return { min: 11, max: 35 }
  return { min: 36, max: 99 }
}

// `minSubtrahend` evita que o `b` (o que é subtraído) fique pequeno demais
// mesmo com `a` grande — sem isso, "80 − 5" passava por Expert só porque
// o 80 é grande, apesar de subtrair 5 ser tão fácil quanto no Iniciante.
function getBasicSubRange(level: DifficultyLevel): Range & { minSubtrahend: number } {
  if (level === 'beginner') return { min: 2, max: 15, minSubtrahend: 1 }
  if (level === 'intermediate') return { min: 16, max: 50, minSubtrahend: 6 }
  return { min: 51, max: 100, minSubtrahend: 16 }
}

function getBasicMulRange(level: DifficultyLevel): { a: Range; b: Range } {
  if (level === 'beginner') return { a: { min: 2, max: 5 }, b: { min: 2, max: 5 } }
  if (level === 'intermediate') return { a: { min: 2, max: 12 }, b: { min: 6, max: 20 } }
  return { a: { min: 2, max: 15 }, b: { min: 21, max: 50 } }
}

function getBasicDivRange(level: DifficultyLevel): { q: Range; d: Range } {
  if (level === 'beginner') return { q: { min: 1, max: 5 }, d: { min: 2, max: 5 } }
  if (level === 'intermediate') return { q: { min: 6, max: 15 }, d: { min: 6, max: 10 } }
  return { q: { min: 16, max: 30 }, d: { min: 11, max: 20 } }
}

// O nível escala o MULTIPLICADOR (o "vezes X"), não o produto — pra qualquer
// tabuada escolhida (mesmo uma pequena, tipo a do 6) ter um Expert de verdade:
// Iniciante 1–10 (tabuada clássica), Desafiador 11–100, Expert 101–999
// (ex: 6×11, 6×138 — vai além do que normalmente se decora de cor).
const TABUADA_CHOSEN_NUMBER_MAX = 12 // "qual tabuada" — sempre 1 a 12, não escala por nível

function getTabuadaRange(level: DifficultyLevel): Range {
  if (level === 'beginner') return { min: 1, max: 10 }
  if (level === 'intermediate') return { min: 11, max: 100 }
  return { min: 101, max: 999 }
}

// Banda de magnitude (valor absoluto) — o piso sobe por nível, igual às faixas
// acima. randIntBand sorteia dentro dessa banda e decide o sinal por conta
// própria, então já garante o zero excluído (min >= 1 em todo nível).
function getIntMagnitudeRange(level: DifficultyLevel): Range {
  if (level === 'beginner') return { min: 1, max: 5 }
  if (level === 'intermediate') return { min: 6, max: 15 }
  return { min: 16, max: 30 }
}

function randIntBand(min: number, max: number): number {
  const magnitude = randInt(min, max)
  return Math.random() < 0.5 ? magnitude : -magnitude
}

function getSpread(level: DifficultyLevel, base: number): number {
  if (level === 'beginner') return Math.max(3, Math.floor(base * 0.3))
  if (level === 'intermediate') return Math.max(5, Math.floor(base * 0.25))
  return Math.max(8, Math.floor(base * 0.2))
}

function explainIntAdd(a: number, b: number, correct: number): string {
  if (a >= 0 && b >= 0)
    return `Dois positivos: some normalmente. ${a} + ${b} = ${correct}.`
  if (a < 0 && b < 0)
    return `Dois negativos: some os valores e mantenha o sinal. ${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(correct)}, com sinal negativo = ${correct}.`
  const bigger = Math.abs(a) >= Math.abs(b) ? a : b
  const smaller = Math.abs(a) < Math.abs(b) ? a : b
  const sign = bigger < 0 ? 'negativo' : 'positivo'
  return `Sinais diferentes: ${Math.abs(bigger)} − ${Math.abs(smaller)} = ${Math.abs(correct)}, sinal do maior valor (${sign}) = ${correct}.`
}

function explainIntMul(a: number, b: number, correct: number): string {
  const sameSign = (a > 0 && b > 0) || (a < 0 && b < 0)
  if (sameSign)
    return `Sinais iguais → resultado positivo: ${Math.abs(a)} × ${Math.abs(b)} = ${correct}.`
  return `Sinais diferentes → resultado negativo: ${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(correct)}, com sinal negativo = ${correct}.`
}

function generateQuestion(mode: GameMode, level: DifficultyLevel): Question {
  const confusableCount = getConfusableCount(level)

  switch (mode) {
    case 'basic-add': {
      const r = getBasicAddRange(level)
      const a = randInt(r.min, r.max)
      const b = randInt(r.min, r.max)
      const correct = a + b
      return {
        text: `${a} + ${b} = ?`,
        correct,
        options: pickOptions(correct, buildAddConfusable(a, b, correct), getSpread(level, correct), confusableCount, false),
        explanation: `Some ${a} com ${b}: ${a} + ${b} = ${correct}.`,
      }
    }
    case 'basic-sub': {
      const r = getBasicSubRange(level)
      const a = randInt(r.min, r.max)
      const b = randInt(r.minSubtrahend, a - 1)
      const correct = a - b
      return {
        text: `${a} − ${b} = ?`,
        correct,
        options: pickOptions(correct, buildSubConfusable(a, b, correct), getSpread(level, correct), confusableCount, false),
        explanation: `Retire ${b} de ${a}: ${a} − ${b} = ${correct}.`,
      }
    }
    case 'basic-mul': {
      const r = getBasicMulRange(level)
      const a = randInt(r.a.min, r.a.max)
      const b = randInt(r.b.min, r.b.max)
      const correct = a * b
      return {
        text: `${a} × ${b} = ?`,
        correct,
        options: pickOptions(correct, buildMulConfusable(a, b, correct), getSpread(level, correct), confusableCount, false),
        explanation: `${a} grupos de ${b}: ${a} × ${b} = ${correct}. Lembre: ${b} × ${a} também vale ${correct}.`,
      }
    }
    case 'basic-div': {
      const r = getBasicDivRange(level)
      const quociente = randInt(r.q.min, r.q.max)
      const divisor = randInt(r.d.min, r.d.max)
      const dividendo = quociente * divisor
      return {
        text: `${dividendo} ÷ ${divisor} = ?`,
        correct: quociente,
        options: pickOptions(quociente, buildDivConfusable(quociente), getSpread(level, quociente), confusableCount, false),
        explanation: `${divisor} × ${quociente} = ${dividendo}, então ${dividendo} ÷ ${divisor} = ${quociente}.`,
      }
    }
    case 'tabuada': {
      const a = randInt(1, TABUADA_CHOSEN_NUMBER_MAX)
      const r = getTabuadaRange(level)
      const b = randInt(r.min, r.max)
      const correct = a * b
      return {
        text: `${a} × ${b} = ?`,
        correct,
        options: pickOptions(correct, buildMulConfusable(a, b, correct), getSpread(level, correct), confusableCount, false),
        explanation: `Tabuada do ${a}: ${a} × ${b} = ${correct}. Grave este resultado!`,
      }
    }
    case 'int-add': {
      const r = getIntMagnitudeRange(level)
      const a = randIntBand(r.min, r.max)
      const b = randIntBand(r.min, r.max)
      const correct = a + b
      return {
        text: `${formatNumber(a)} + ${formatNumber(b)} = ?`,
        correct,
        options: pickOptions(
          correct,
          withSignFlip(correct, buildAddConfusable(a, b, correct)),
          getSpread(level, Math.abs(correct) + 3),
          confusableCount,
          true
        ),
        explanation: explainIntAdd(a, b, correct),
      }
    }
    case 'int-sub': {
      const r = getIntMagnitudeRange(level)
      const a = randIntBand(r.min, r.max)
      const b = randIntBand(r.min, r.max)
      const correct = a - b
      const negB = -b
      return {
        text: `${formatNumber(a)} − ${formatNumber(b)} = ?`,
        correct,
        options: pickOptions(
          correct,
          withSignFlip(correct, buildSubConfusable(a, b, correct)),
          getSpread(level, Math.abs(correct) + 3),
          confusableCount,
          true
        ),
        explanation: `Subtrair ${formatNumber(b)} é somar ${formatNumber(negB)}: ${formatNumber(a)} + ${formatNumber(negB)} = ${correct}.`,
      }
    }
    case 'int-mul': {
      const r = getIntMagnitudeRange(level)
      const a = randIntBand(r.min, r.max)
      const b = randIntBand(r.min, r.max)
      const correct = a * b
      return {
        text: `${formatNumber(a)} × ${formatNumber(b)} = ?`,
        correct,
        options: pickOptions(
          correct,
          withSignFlip(correct, buildMulConfusable(a, b, correct)),
          getSpread(level, Math.abs(correct) + 5),
          confusableCount,
          true
        ),
        explanation: explainIntMul(a, b, correct),
      }
    }
    case 'int-div': {
      const r = getIntMagnitudeRange(level)
      const quociente = randIntBand(r.min, r.max)
      const divisor = randIntBand(r.min, r.max)
      const dividendo = quociente * divisor
      const sameSign = (quociente > 0 && divisor > 0) || (quociente < 0 && divisor < 0)
      const signRule = sameSign ? 'Sinais iguais → resultado positivo.' : 'Sinais diferentes → resultado negativo.'
      return {
        text: `${formatNumber(dividendo)} ÷ ${formatNumber(divisor)} = ?`,
        correct: quociente,
        options: pickOptions(
          quociente,
          withSignFlip(quociente, buildDivConfusable(quociente)),
          getSpread(level, Math.abs(quociente) + 3),
          confusableCount,
          true
        ),
        explanation: `${signRule} ${formatNumber(divisor)} × ${quociente} = ${dividendo}, então o resultado é ${quociente}.`,
      }
    }
  }
}

type FocusOp = 'add' | 'sub' | 'mul' | 'div'

// "Fact family" question for a fixed tabuada number N: draws a random partner
// b (same per-level range as the regular Tabuada mode) and asks a fact
// related to N × b — either the multiplication/division pair alone, or all
// 4 operations when `family` is on. Every explanation ties back to the
// multiplication fact so the connection between operations is explicit.
function generateFocusedTabuadaQuestion(n: number, level: DifficultyLevel, family: boolean): Question {
  const partnerRange = getTabuadaRange(level)
  const b = randInt(partnerRange.min, partnerRange.max)
  const confusableCount = getConfusableCount(level)
  const product = n * b
  const sum = n + b

  const ops: FocusOp[] = family ? ['add', 'sub', 'mul', 'div'] : ['mul']
  const op = ops[randInt(0, ops.length - 1)]

  switch (op) {
    case 'add': {
      const flip = Math.random() < 0.5
      return {
        text: flip ? `${b} + ${n} = ?` : `${n} + ${b} = ?`,
        correct: sum,
        options: pickOptions(sum, buildAddConfusable(n, b, sum), getSpread(level, sum), confusableCount, false),
        explanation: `Isso vem da tabuada do ${n}: ${n} × ${b} = ${product}. Aqui é a soma relacionada: ${n} + ${b} = ${sum}.`,
      }
    }
    case 'sub': {
      const subtractN = Math.random() < 0.5
      const subtracted = subtractN ? n : b
      const correct = subtractN ? b : n
      return {
        text: `${sum} − ${subtracted} = ?`,
        correct,
        options: pickOptions(correct, buildSubConfusable(sum, subtracted, correct), getSpread(level, correct), confusableCount, false),
        explanation: `Isso vem da tabuada do ${n}: ${n} × ${b} = ${product}. Aqui é a subtração relacionada: ${sum} − ${subtracted} = ${correct}.`,
      }
    }
    case 'mul': {
      const flip = Math.random() < 0.5
      return {
        text: flip ? `${b} × ${n} = ?` : `${n} × ${b} = ?`,
        correct: product,
        options: pickOptions(product, buildMulConfusable(n, b, product), getSpread(level, product), confusableCount, false),
        explanation: `Tabuada do ${n}: ${n} × ${b} = ${product}. Grave este resultado!`,
      }
    }
    case 'div': {
      const divideByN = Math.random() < 0.5
      const divisor = divideByN ? n : b
      const correct = divideByN ? b : n
      return {
        text: `${product} ÷ ${divisor} = ?`,
        correct,
        options: pickOptions(correct, buildDivConfusable(correct), getSpread(level, correct), confusableCount, false),
        explanation: `Isso vem da tabuada do ${n}: ${n} × ${b} = ${product}, então ${product} ÷ ${divisor} = ${correct}.`,
      }
    }
  }
}

export function generateSession(mode: GameMode, level: DifficultyLevel, tabuadaConfig?: TabuadaConfig): Question[] {
  const questions: Question[] = []
  const seen = new Set<string>()
  const focusNumber = mode === 'tabuada' ? tabuadaConfig?.focusNumber ?? null : null

  let attempts = 0
  while (questions.length < QUESTIONS_PER_ROUND && attempts < 300) {
    attempts++
    const q = focusNumber
      ? generateFocusedTabuadaQuestion(focusNumber, level, tabuadaConfig?.family ?? false)
      : generateQuestion(mode, level)
    if (!seen.has(q.text)) {
      seen.add(q.text)
      questions.push(q)
    }
  }

  return questions
}
