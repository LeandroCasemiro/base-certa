import { DifficultyLevel, GameMode, HistoryEntry, TabuadaConfig } from './types'

const KEY = 'base-certa-history'

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

export function getBestScore(mode: GameMode, level: DifficultyLevel, variant?: string): number | null {
  const key = makeKey(mode, level, variant)
  const history = loadHistory().filter((e) => makeKey(e.mode, e.level, e.variant) === key)
  if (history.length === 0) return null
  return Math.max(...history.map((e) => e.score))
}
