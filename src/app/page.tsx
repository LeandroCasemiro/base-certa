'use client'

import { useEffect, useState } from 'react'
import { DifficultyLevel, GameMode, TabuadaConfig } from '@/lib/types'
import { isUnlocked, tabuadaVariantKey } from '@/lib/storage'
import { useGameSession } from '@/hooks/useGameSession'
import { getRoundLabel } from '@/lib/labels'
import HomeScreen from '@/components/HomeScreen'
import QuizGate from '@/components/QuizGate'
import TabuadaSetupScreen from '@/components/TabuadaSetupScreen'
import DifficultyScreen from '@/components/DifficultyScreen'
import GameScreen from '@/components/GameScreen'
import ResultScreen from '@/components/ResultScreen'
import LockSheet, { ItemTravado } from '@/components/LockSheet'
import { DIFFICULTY_LEVELS, isModoTravado, isNivelTravado } from '@/lib/constants'
import { getModeName } from '@/lib/labels'

type Screen = 'home' | 'tabuada-setup' | 'difficulty' | 'game' | 'result'

function getTabuadaLabel(config: TabuadaConfig | null): string | undefined {
  if (!config || !config.focusNumber) return undefined
  return `Tabuada do ${config.focusNumber} · ${config.family ? 'Família completa' : 'Só multiplicação'}`
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [tabuadaConfig, setTabuadaConfig] = useState<TabuadaConfig | null>(null)
  const [unlocked, setUnlockedState] = useState<boolean | null>(null)
  // Janela do cadeado: o que foi tocado e o texto que vai para a planilha
  const [travado, setTravado] = useState<{ item: ItemTravado; quis: string } | null>(null)

  useEffect(() => {
    setUnlockedState(isUnlocked())
  }, [])

  const {
    mode,
    level,
    currentIndex,
    score,
    feedback,
    results,
    streak,
    selectedOption,
    finished,
    currentQuestion,
    startGame,
    selectOption,
    nextQuestion,
    resetGame,
  } = useGameSession()

  function handleSelectMode(m: GameMode) {
    if (isModoTravado(m)) {
      setTravado({ item: 'inteiros', quis: `Inteiros: ${getModeName(m)}` })
      return
    }
    setSelectedMode(m)
    setTabuadaConfig(null)
    setScreen(m === 'tabuada' ? 'tabuada-setup' : 'difficulty')
  }

  function handleTabuadaSetup(config: TabuadaConfig) {
    setTabuadaConfig(config)
    setScreen('difficulty')
  }

  function handleSelectLevel(l: DifficultyLevel) {
    if (isNivelTravado(l)) {
      const nivel = DIFFICULTY_LEVELS.find((d) => d.id === l)?.label ?? l
      const nome = selectedMode === 'tabuada' ? getTabuadaLabel(tabuadaConfig) ?? 'Tabuada' : getModeName(selectedMode!)
      setTravado({ item: 'niveis', quis: `${nome} · ${nivel}` })
      return
    }
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

  // Evita "flash" da Home antes de saber se já tá liberado (localStorage só
  // existe no navegador, então o primeiro render do servidor não sabe ainda).
  if (unlocked === null) return null

  if (!unlocked) {
    return <QuizGate onUnlock={() => setUnlockedState(true)} />
  }

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

  const sheet = travado ? <LockSheet item={travado.item} quis={travado.quis} onClose={() => setTravado(null)} /> : null

  if (screen === 'home') {
    return (
      <>
        <HomeScreen onSelectMode={handleSelectMode} />
        {sheet}
      </>
    )
  }

  if (screen === 'tabuada-setup') {
    return <TabuadaSetupScreen onContinue={handleTabuadaSetup} onBack={() => setScreen('home')} />
  }

  if (screen === 'difficulty' && selectedMode) {
    return (
      <>
        <DifficultyScreen
          mode={selectedMode}
          onSelectLevel={handleSelectLevel}
          onBack={handleBackFromDifficulty}
          titleOverride={tabuadaLabel}
          variant={tabuadaVariant}
        />
        {sheet}
      </>
    )
  }

  if (screen === 'game' && currentQuestion) {
    return (
      <GameScreen
        question={currentQuestion}
        currentIndex={currentIndex}
        feedback={feedback}
        selectedOption={selectedOption}
        results={results}
        streak={streak}
        roundLabel={getRoundLabel(mode!, level!, mode === 'tabuada' ? tabuadaLabel : undefined)}
        onSelect={selectOption}
        onNext={nextQuestion}
        onHome={handleHome}
      />
    )
  }

  return null
}
