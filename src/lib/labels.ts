import { DifficultyLevel, GameMode } from './types'
import { DIFFICULTY_LEVELS, MODE_GROUPS } from './constants'

export function getModeName(mode: GameMode): string {
  for (const group of MODE_GROUPS) {
    const found = group.modes.find((m) => m.id === mode)
    if (found) return found.label
  }
  return mode
}

export function getGroupName(mode: GameMode): string {
  for (const group of MODE_GROUPS) {
    if (group.modes.find((m) => m.id === mode)) return group.label
  }
  return ''
}

export function getLevelLabel(level: DifficultyLevel): string {
  return DIFFICULTY_LEVELS.find((l) => l.id === level)?.label ?? level
}

// Nome curto da rodada, ex.: "Multiplicação · Iniciante" ou "Inteiros: Adição · Expert"
export function getRoundLabel(mode: GameMode, level: DifficultyLevel, titleOverride?: string): string {
  const name = titleOverride ?? (mode.startsWith('int-') ? `Inteiros: ${getModeName(mode)}` : getModeName(mode))
  return `${name} · ${getLevelLabel(level)}`
}
