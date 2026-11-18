import { DifficultyLevel, GameMode, HistoryEntry, TabuadaConfig } from './types'

const KEY = 'base-certa-history'
const UNLOCK_KEY = 'base-certa-unlocked'

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === 'true'
  } catch {
    return false
  }
}

export function setUnlocked(): void {
  try {
    localStorage.setItem(UNLOCK_KEY, 'true')
  } catch {
    // silently fail if storage is unavailable
  }
}

export function tabuadaVariantKey(config?: TabuadaConfig | null): string | undefined {
  if (!config || !config.focusNumber) return undefined
  return `n${config.focusNumber}-${config.family ? 'family' : 'mult'}`
}

function makeKey(mode: GameMode, level: DifficultyLevel, variant?: string): string {
  return variant ? `${mode}__${level}__${variant}` : `${mode}__${level}`
}

export function saveResult(mode: GameMode, level: DifficultyLevel, score: number, variant?: string): void {
  try {
    const history = loadHistory()
    history.unshift({ mode, level, score, date: new Date().toISOString(), variant })
    localStorage.setItem(KEY, JSON.stringify(history.slice(0, 100)))
  } catch {
    // silently fail if storage is unavailable
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

// Melhor resultado ANTES da rodada que acabou de ser salva (a mais recente do histórico).
// Serve para a tela de resultado dizer "Novo recorde" só quando a pessoa realmente superou
// o próprio melhor. Retorna null na primeira rodada daquele modo e nível.
export function getPreviousBest(mode: GameMode, level: DifficultyLevel, variant?: string): number | null {
  const key = makeKey(mode, level, variant)
  const history = loadHistory().filter((e) => makeKey(e.mode, e.level, e.variant) === key)
  const previous = history.slice(1)
  if (previous.length === 0) return null
  return Math.max(...previous.map((e) => e.score))
}

export function getBestScore(mode: GameMode, level: DifficultyLevel, variant?: string): number | null {
  const key = makeKey(mode, level, variant)
  const history = loadHistory().filter((e) => makeKey(e.mode, e.level, e.variant) === key)
  if (history.length === 0) return null
  return Math.max(...history.map((e) => e.score))
}

// ---- Cadeado dos níveis (18/11/2026) ----
// O contato do quiz fica guardado no aparelho para o "Quero ser avisado"
// não pedir o e-mail de novo. Quem fez o quiz antes desta versão não tem
// o contato guardado: nesse caso a janela do cadeado pede o e-mail.
const CONTATO_KEY = 'base-certa-contato'
const LISTA_KEY = 'base-certa-lista-espera'

export interface Contato {
  nome: string
  email: string
  celular: string
}

export function saveContato(c: Contato): void {
  try {
    localStorage.setItem(CONTATO_KEY, JSON.stringify(c))
  } catch {
    // silently fail if storage is unavailable
  }
}

export function getContato(): Contato | null {
  try {
    const raw = localStorage.getItem(CONTATO_KEY)
    return raw ? (JSON.parse(raw) as Contato) : null
  } catch {
    return null
  }
}

// O pai já pediu aviso para este item? (ex.: "niveis" ou "inteiros")
export function isNaLista(item: string): boolean {
  try {
    const raw = localStorage.getItem(LISTA_KEY)
    return raw ? (JSON.parse(raw) as string[]).includes(item) : false
  } catch {
    return false
  }
}

export function marcarNaLista(item: string): void {
  try {
    const raw = localStorage.getItem(LISTA_KEY)
    const lista = raw ? (JSON.parse(raw) as string[]) : []
    if (!lista.includes(item)) lista.push(item)
    localStorage.setItem(LISTA_KEY, JSON.stringify(lista))
  } catch {
    // silently fail if storage is unavailable
  }
}