'use client'

import { useState } from 'react'
import { DifficultyLevel, GameMode, TabuadaConfig } from '@/lib/types'
import { tabuadaVariantKey } from '@/lib/storage'
import { useGameSession } from '@/hooks/useGameSession'
import HomeScreen from '@/components/HomeScreen'
import TabuadaSetupScreen from '@/components/TabuadaSetupScreen'
import DifficultyScreen from '@/components/DifficultyScreen'
import GameScreen from '@/components/GameScreen'
import ResultScreen from '@/components/ResultScreen'

type Screen = 'home' | 'tabuada-setup' | 'difficulty' | 'game' | 'result'

function getTabuadaLabel(config: TabuadaConfig | null): string | undefined {
  if (!config || !config.focusNumber) return undefined
  return `Tabuada do ${config.focusNumber} · ${config.family ? 'Família completa' : 'Só multiplicação'}`
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [tabuadaConfig, setTabuadaConfig] = useState<TabuadaConfig | null>(null)

  const {
    mode,
    level,
    currentIndex,
    score,
    feedback,
    selectedOption,
    finished,
    currentQuestion,
    startGame,
    selectOption,
    nextQuestion,
    resetGame,
  } = useGameSession()

  function handleSelectMode(m: GameMode) {
    setSelectedMode(m)
    setTabuadaConfig(null)
    setScreen(m === 'tabuada' ? 'tabuada-setup' : 'difficulty')
  }

  function handleTabuadaSetup(config: TabuadaConfig) {
    setTabuadaConfig(config)
    setScreen('difficulty')
  }

  function handleSelectLevel(l: DifficultyLevel) {
    startGame(selectedMode!, l, selectedMode === 'tabuada' ? tabuadaConfig ?? undefined : undefined)
    setScreen('game')
  }

  function handleBackFromDifficulty() {
    setScreen(selectedMode === 'tabuada' ? 'tabuada-setup' : 'home')
  }

  function handleHome() {
    resetGame()
    setSelectedMode(null)
    setTabuadaConfig(null)
    setScreen('home')
  }

  function handlePlayAgain() {
    if (mode && level) {
      startGame(mode, level, mode === 'tabuada' ? tabuadaConfig ?? undefined : undefined)
      setScreen('game')
    }
  }

  const tabuadaLabel = getTabuadaLabel(tabuadaConfig)
  const tabuadaVariant = tabuadaVariantKey(selectedMode === 'tabuada' ? tabuadaConfig : undefined)

  // Transition to result when game finishes
  if (screen === 'game' && finished) {
    return (
      <ResultScreen
        mode={mode!}
        level={level!}
        score={score}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
        titleOverride={mode === 'tabuada' ? tabuadaLabel : undefined}
        variant={mode === 'tabuada' ? tabuadaVariant : undefined}
      />
    )
  }

  if (screen === 'home') {
    return <HomeScreen onSelectMode={handleSelectMode} />
  }

  if (screen === 'tabuada-setup') {
    return <TabuadaSetupScreen onContinue={handleTabuadaSetup} onBack={() => setScreen('home')} />
  }

  if (screen === 'difficulty' && selectedMode) {
    return (
      <DifficultyScreen
        mode={selectedMode}
        onSelectLevel={handleSelectLevel}
        onBack={handleBackFromDifficulty}
        titleOverride={tabuadaLabel}
        variant={tabuadaVariant}
      />
    )
  }

  if (screen === 'game' && currentQuestion) {
    return (
      <GameScreen
        question={currentQuestion}
        currentIndex={currentIndex}
        score={score}
        feedback={feedback}
        selectedOption={selectedOption}
        onSelect={selectOption}
        onNext={nextQuestion}
        onHome={handleHome}
      />
    )
  }

  return null
}
