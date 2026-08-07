export type GameMode =
  | 'basic-add'
  | 'basic-sub'
  | 'basic-mul'
  | 'basic-div'
  | 'tabuada'
  | 'int-add'
  | 'int-sub'
  | 'int-mul'
  | 'int-div'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert'

export interface TabuadaConfig {
  focusNumber: number | null
  family: boolean
}

export interface DifficultyConfig {
  id: DifficultyLevel
  label: string
  description: string
  color: string
}

export interface ModeConfig {
  id: GameMode
  label: string
  icon: string
}

export interface ModeGroup {
  id: string
  label: string
  modes: ModeConfig[]
}

export interface Question {
  text: string
  options: number[]
  correct: number
  explanation: string
}

export type FeedbackState = 'idle' | 'correct' | 'wrong'

export interface HistoryEntry {
  mode: GameMode
  level: DifficultyLevel
  score: number
  date: string
  variant?: string
}
